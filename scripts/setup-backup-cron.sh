#!/bin/bash

set -e

echo "=========================================="
echo "    SETTING UP DATABASE BACKUP CRON JOB"
echo "=========================================="
echo ""

PROJECT_DIR="/var/www/chinahuib2b"
BACKUP_DIR="/var/backups"

echo "[1/4] Creating backup directory..."
mkdir -p "$BACKUP_DIR"
chown -R www-data:www-data "$BACKUP_DIR"
chmod -R 700 "$BACKUP_DIR"

echo "[2/4] Setting up log directory..."
mkdir -p "/var/log/backups"
chown -R www-data:www-data "/var/log/backups"

echo "[3/4] Installing AWS CLI for Spaces upload..."
if ! command -v aws &> /dev/null; then
  echo "      Installing AWS CLI..."
  pip install awscli --quiet
else
  echo "      AWS CLI already installed"
fi

echo "[4/4] Setting up cron job..."

CRON_JOB="0 2 * * * cd $PROJECT_DIR && npx tsx scripts/backup-db.ts >> /var/log/backups/db-backup.log 2>&1"

if ! crontab -l | grep -q "backup-db.ts"; then
  (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
  echo "      ✅ Daily backup scheduled at 2:00 AM"
else
  echo "      ⚠️  Backup cron job already exists"
fi

echo ""
echo "[5/5] Testing backup..."
cd "$PROJECT_DIR"
npx tsx scripts/backup-db.ts

echo ""
echo "=========================================="
echo "    BACKUP SETUP COMPLETED SUCCESSFULLY"
echo "=========================================="
echo ""
echo "📋 Backup Configuration:"
echo "   - Local backup: $BACKUP_DIR"
echo "   - Remote backup: DigitalOcean Spaces"
echo "   - Schedule: Daily at 2:00 AM"
echo "   - Retention: 7 days"
echo ""
echo "📝 Log file: /var/log/backups/db-backup.log"
echo ""
echo "⚠️  IMPORTANT: Ensure DO_SPACES_ACCESS_KEY and DO_SPACES_SECRET_KEY are set in .env.local"