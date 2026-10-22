#!/usr/bin/env bash
# Import des matchs depuis la Fédération (football.org.il), lancé par cron (voir crontab.txt).
# Écrit dans /var/log/jerusalemfc/import.log. Le cache du site est vidé à la fin (route /revalidate).
set -euo pipefail

APP_DIR=/var/www/jerusalemfc
LOCK=/tmp/jerusalemfc-import.lock

cd "$APP_DIR"
# Pas deux imports en même temps
exec 9>"$LOCK"
flock -n 9 || { echo "$(date -Is) import déjà en cours, abandon"; exit 0; }

echo "== $(date -Is) début import"
NODE_ENV=production npx --no-install cross-env NODE_OPTIONS=--no-deprecation payload run src/scripts/import-ifa.ts
echo "== $(date -Is) fin import"
