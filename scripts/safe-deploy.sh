#!/bin/bash

set -e

echo "=========================================="
echo "    SAFE DEPLOYMENT SCRIPT"
echo "=========================================="
echo ""

PROJECT_DIR="/var/www/chinahuib2b"
BACKUP_DIR="/var/backups"

cd "$PROJECT_DIR"

echo "[1/5] Pulling latest code from GitHub..."
git pull origin main

echo ""
echo "[2/5] Creating database backup..."
mkdir -p "$BACKUP_DIR"

# Read database credentials from .env.local
DATABASE_URL=$(cat .env.local | grep DATABASE_URL | sed 's/DATABASE_URL="\(.*\)"/\1/')
IFS=':@/' read -r _ user password host_port dbname <<< "$DATABASE_URL"
IFS=':' read -r host port <<< "$host_port"

BACKUP_FILE="$BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).sql"
PGPASSWORD="$password" pg_dump -U "$user" -h "$host" -p "$port" -d "$dbname" > "$BACKUP_FILE"

echo "      Backup created: $BACKUP_FILE"
echo "      Size: $(du -h "$BACKUP_FILE" | cut -f1)"

echo ""
echo "[3/5] Building project..."
npm run build

echo ""
echo "[4/5] Applying schema changes (SAFE MODE)..."
npx prisma db push

echo ""
echo "[5/5] Restarting application..."
pm2 restart chinahuib2b-next

echo ""
echo "=========================================="
echo "    DEPLOYMENT COMPLETED SUCCESSFULLY"
echo "=========================================="
echo "    Backup: $BACKUP_FILE"
echo "=========================================="
