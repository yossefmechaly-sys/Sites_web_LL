#!/usr/bin/env bash
# Mise à jour du site sur le serveur après envoi d'une nouvelle version du code
# (git pull, ou archive décompressée dans /var/www/jerusalemfc). La base et les médias ne sont pas touchés.
set -euo pipefail

APP_DIR=/var/www/jerusalemfc
cd "$APP_DIR"

echo "== Sauvegarde de sécurité avant mise à jour"
./deploy/sauvegarde.sh

echo "== Dépendances"
npm ci --legacy-peer-deps --no-audit --no-fund

echo "== Build (mémoire limitée : l'instance est partagée)"
NODE_OPTIONS="--no-deprecation --max-old-space-size=1536" npx next build

echo "== Redémarrage"
pm2 reload jerusalemfc --update-env
pm2 save
echo "== OK : $(date -Is)"
