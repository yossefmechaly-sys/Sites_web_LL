#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
export PATH=/usr/bin:/bin:/usr/sbin:/sbin
python3 - <<'EXPORT'
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import os
import pwd
import re
import tarfile

project = Path('/mnt/bigdata/laurentlevy')
assert project.is_dir()
assert (project / 'site-prod/api/contact.php').is_file()
owner = pwd.getpwnam('ubuntu')
stamp = datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')
output = Path('/home/ubuntu') / ('export-laurentlevy-github-' + stamp)
output.mkdir(mode=0o700)
archive = output / 'laurentlevy-github.tar.gz'

excluded_dirs = {'.git', '.aws', '.ssh', 'node_modules', '.next', '.cache', '.astro',
                 'coverage', 'playwright-report', 'test-results', 'backups'}
excluded_names = {'.npmrc', '.netrc', '.git-credentials', '.htpasswd',
                  'credentials', 'credentials.json', 'secrets.json', 'auth.json'}
excluded_suffixes = ('.ini', '.pem', '.ppk', '.key', '.p12', '.pfx', '.der',
                     '.db', '.sqlite', '.sqlite3', '.sql', '.log', '.bak',
                     '.zip', '.tar', '.gz', '.tgz', '.7z')
patterns = [
    rb'-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----',
    rb'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b',
    rb'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b',
]
files, skipped = [], []
def walk_error(error):
    raise error
for current, directories, names in os.walk(project, followlinks=False, onerror=walk_error):
    parent = Path(current)
    kept = []
    for name in directories:
        path = parent / name
        if name in excluded_dirs or path.is_symlink():
            skipped.append(str(path.relative_to(project)) + '/')
        else:
            kept.append(name)
    directories[:] = kept
    for name in names:
        path = parent / name
        relative = path.relative_to(project)
        lower = name.lower()
        sample = lower in ('.env.example', '.env.sample')
        private_env = (lower == '.env' or lower.startswith('.env.')) and not sample
        if (private_env or lower in excluded_names or lower.endswith(excluded_suffixes)
                or re.search(r'\.(?:db|sqlite|sqlite3)-(?:wal|shm|journal)$', lower)
                or path.is_symlink() or not path.is_file()):
            skipped.append(str(relative))
            continue
        files.append((path, 'laurentlevy/' + relative.as_posix()))

configs = {
    '/etc/apache2/sites-available/laurentlevy.conf': 'apache-http.conf',
    '/etc/apache2/sites-available/laurentlevy-le-ssl.conf': 'apache-dev-https.conf',
    '/etc/apache2/sites-available/laurentlevy-prod.conf': 'apache-prod-http.conf',
    '/etc/apache2/sites-available/laurentlevy-prod-le-ssl.conf': 'apache-prod-https.conf',
    '/etc/apache2/laurent-levy-rules.conf': 'laurent-levy-rules.conf',
    '/etc/systemd/system/apache2.service.d/laurentlevy-storage.conf':
        'apache2.service.d/laurentlevy-storage.conf',
}
for source, target in configs.items():
    path = Path(source)
    assert path.is_file() and not path.is_symlink(), source
    files.append((path, 'deployment/laurentlevy/' + target))

manifest = {'created_utc': stamp, 'project': str(project),
            'excluded_paths': sorted(skipped), 'files': []}
with tarfile.open(archive, 'x:gz') as bundle:
    for path, target in sorted(files, key=lambda item: item[1]):
        data = path.read_bytes()
        if any(re.search(pattern, data) for pattern in patterns):
            raise RuntimeError('Export arrete : valeur sensible possible dans ' + str(path))
        info = tarfile.TarInfo(target)
        info.size = len(data)
        info.mode = 0o755 if os.access(path, os.X_OK) else 0o644
        info.mtime = int(path.stat().st_mtime)
        import io
        bundle.addfile(info, io.BytesIO(data))
        manifest['files'].append({'path': target, 'bytes': len(data),
                                  'sha256': hashlib.sha256(data).hexdigest()})
    data = (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode()
    info = tarfile.TarInfo('deployment/laurentlevy/export-manifest.json')
    info.size, info.mode = len(data), 0o644
    bundle.addfile(info, io.BytesIO(data))

# Keep every attachment below the file-transfer limit used by this workspace.
outputs = [archive]
if archive.stat().st_size > 30 * 1024 * 1024:
    outputs = []
    with archive.open('rb') as stream:
        number = 1
        while data := stream.read(24 * 1024 * 1024):
            part = output / ('laurentlevy-github.tar.gz.part-%02d' % number)
            part.write_bytes(data)
            outputs.append(part)
            number += 1
    archive.unlink()
for path in [output, *outputs]:
    os.chown(path, owner.pw_uid, owner.pw_gid)
    os.chmod(path, 0o700 if path.is_dir() else 0o600)
print('EXPORT PRET :', output)
print(len(manifest['files']), 'fichiers de code et configuration ; identifiants mail exclus.')
for path in outputs:
    print(path.name, '-', path.stat().st_size, 'octets')
EXPORT
