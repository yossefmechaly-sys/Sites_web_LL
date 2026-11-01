"""Non-sending server checks against local Apache using the real TLS names."""
from pathlib import Path
from urllib.parse import quote, urlsplit, urljoin
import subprocess
import tempfile
import re
import xml.etree.ElementTree as ET

domain = 'laurent-levy.com'
origin = 'https://' + domain
root = Path('/mnt/bigdata/laurentlevy/site-prod')
checks = 0

def get(host, route, expected=200, port=443, language=None):
    global checks
    with tempfile.TemporaryDirectory() as tmp:
        hdr, body = Path(tmp) / 'headers', Path(tmp) / 'body'
        command = ['curl', '-sS', '--noproxy', '*', '--connect-timeout', '5', '--max-time', '25',
                   '--resolve', f'{host}:{port}:127.0.0.1', '-D', str(hdr), '-o', str(body),
                   '-w', '%{http_code}']
        if language:
            command += ['-H', 'Accept-Language: ' + language]
        scheme = 'https' if port == 443 else 'http'
        command += [scheme + '://' + host + quote(route, safe='/%?=&-_.~')]
        p = subprocess.run(command, capture_output=True, text=True, check=True)
        assert int(p.stdout) == expected, (host, route, p.stdout, 'attendu', expected)
        headers, data = hdr.read_text(), body.read_bytes()
    checks += 1
    return headers, data

def destination(headers, base=origin):
    match = re.search(r'^location:\s*(.+)$', headers, re.I | re.M)
    assert match, 'Redirection sans Location'
    return urljoin(base, match[1].strip())

for lang in ('fr', 'en', 'he'):
    h, _ = get(domain, '/', 302, language=lang)
    assert destination(h) == origin + '/' + lang + '/'

pages = 0
for page in sorted(root.rglob('*.html')):
    rel = str(page.relative_to(root))
    if rel == 'index.html':
        continue
    route = '/' + rel.removesuffix('index.html') if rel.endswith('index.html') else '/' + rel
    h, data = get(domain, route)
    html = data.decode()
    assert 'https://www.laurent-levy.com/' not in html
    assert 'https://laurent-levy.tobedev.com/' not in html
    assert not re.search(r'^x-robots-tag:.*noindex', h, re.I | re.M)
    if route in ('/fr/', '/en/', '/he/'):
        assert f'href="{origin}{route}"' in html
        assert not re.search(r'<meta\s+name="robots"\s+content="[^"]*noindex', html)
    pages += 1

h, sitemap = get(domain, '/sitemap.xml')
tree = ET.fromstring(sitemap)
for element in tree.iter():
    for value in [element.text or '', *element.attrib.values()]:
        if value.startswith('https://'):
            assert urlsplit(value).hostname == domain, 'Mauvais domaine dans sitemap'
_, robots = get(domain, '/robots.txt')
assert (origin + '/sitemap.xml').encode() in robots
assert not re.search(rb'^Disallow:\s*/\s*$', robots, re.I | re.M)
for pattern in ('_astro/*.css', '_astro/*.js', '**/*.webp', '**/*.woff2', '**/*.svg'):
    asset = next(root.glob(pattern))
    get(domain, '/' + str(asset.relative_to(root)))

for port in (80, 443):
    h, _ = get('www.' + domain, '/fr/biographie/?source=verification', 301, port)
    target = destination(h)
    assert urlsplit(target).scheme == 'https'
    assert urlsplit(target).hostname in ((domain,) if port == 443 else (domain, 'www.' + domain))
    assert urlsplit(target).path == '/fr/biographie/'
    assert urlsplit(target).query == 'source=verification'
h, _ = get(domain, '/fr/', 301, port=80)
assert destination(h) == origin + '/fr/'
get(domain, '/api/contact', 405)
get(domain, '/page-inexistante-verification', 404)
get(domain, '/fr/wp-content/ancien.jpg', 410)
h, _ = get(domain, '/fr/author/verification/', 301)
assert urlsplit(destination(h)).path == '/fr/'
print(pages, 'pages et', checks, 'controles production valides ; aucun e-mail envoye.')
