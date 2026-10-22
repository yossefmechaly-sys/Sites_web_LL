#!/usr/bin/env bash
# Sauvegarde quotidienne de la base SQLite et des médias, conservée 14 jours.
# Lancée par cron (voir crontab.txt). Nécessite le paquet « sqlite3 » (sudo apt install sqlite3).
set -euo pipefail

APP_DIR=/var/www/jerusalemfc
DEST=/var/backups/jerusalemfc
STAMP=$(date +%Y-%m-%d)
mkdir -p "$DEST"

# Copie cohérente même si le site écrit pendant la sauvegarde
sqlite3 "$APP_DIR/jerusalemfc.db" ".backup '$DEST/jerusalemfc-$STAMP.db'"
gzip -f "$DEST/jerusalemfc-$STAMP.db"

# Médias (photos envoyées depuis l'admin)
tar -czf "$DEST/media-$STAMP.tar.gz" -C "$APP_DIR" media

# Rotation : 14 jours
find "$DEST" -type f -mtime +14 -delete
echo "$(date -Is) sauvegarde OK : $(du -sh "$DEST" | cut -f1) au total"
