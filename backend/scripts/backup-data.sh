#!/bin/bash
# Daily backup: database dump + uploaded images (run via cron on Spaceship)
set -e

BACKUP_ROOT="${BACKUP_DIR:-/home/$(whoami)/dr-mahar-backups}"
DATA_DIR="${DATA_DIR:-/home/$(whoami)/dr-mahar-data}"
DATE=$(date +%Y%m%d_%H%M%S)
DEST="$BACKUP_ROOT/$DATE"

mkdir -p "$DEST"

if command -v mongodump >/dev/null 2>&1 && [ -n "$MONGODB_URI" ]; then
  mongodump --uri="$MONGODB_URI" --out="$DEST/mongodb"
fi

if [ -d "$DATA_DIR/uploads" ]; then
  cp -a "$DATA_DIR/uploads" "$DEST/uploads"
fi

# Keep last 14 days
find "$BACKUP_ROOT" -maxdepth 1 -type d -mtime +14 -exec rm -rf {} +

echo "Backup saved to $DEST"
