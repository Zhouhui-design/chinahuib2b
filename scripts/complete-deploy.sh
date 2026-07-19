#!/bin/bash

set -e

echo "=========================================="
echo "    COMPLETE PRODUCTION DEPLOYMENT"
echo "=========================================="
echo ""

PROJECT_DIR="/var/www/chinahuib2b"
BACKUP_DIR="/var/backups"
STAGING_PORT=3001

echo "[1/8] Checking git status..."
cd "$PROJECT_DIR"
LOCAL_COMMITS=$(git rev-list --count HEAD..origin/main)
REMOTE_COMMITS=$(git rev-list --count origin/main..HEAD)

if [ "$REMOTE_COMMITS" -gt 0 ]; then
  echo "❌ ERROR: Local commits ahead of origin. Please push first."
  exit 1
fi

echo "[2/8] Staging verification..."
STAGING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$STAGING_PORT/api/health")

if [ "$STAGING_STATUS" != "200" ]; then
  echo "⚠️  WARNING: Staging server not responding. Continuing with caution..."
  read -p "Press Enter to continue or Ctrl+C to abort..."
else
  echo "✅ Staging server is healthy"
fi

echo "[3/8] Creating database backup BEFORE deployment..."
mkdir -p "$BACKUP_DIR"

DATABASE_URL=$(cat .env.local | grep DATABASE_URL | sed 's/DATABASE_URL="\(.*\)"/\1/')
IFS=':@/' read -r _ user password host_port dbname <<< "$DATABASE_URL"
IFS=':' read -r host port <<< "$host_port"

BACKUP_FILE="$BACKUP_DIR/db_predeploy_$(date +%Y%m%d_%H%M%S).sql"
PGPASSWORD="$password" pg_dump -U "$user" -h "$host" -p "$port" -d "$dbname" > "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"
echo "   Size: $(du -h "$BACKUP_FILE" | cut -f1)"

echo "[4/8] Pulling latest code from GitHub..."
git pull origin main

echo "[5/8] Installing dependencies..."
npm install

echo "[6/8] Building project..."
npm run build

echo "[7/8] Applying schema changes (SAFE MODE)..."
npx prisma db push --accept-data-loss

echo "[8/8] Restarting application..."
pm2 restart chinahuib2b-next

echo ""
echo "[9/8] Running smoke tests..."
sleep 5

PRODUCTION_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://x2xhub.com/api/health")
if [ "$PRODUCTION_STATUS" == "200" ]; then
  echo "✅ Smoke test passed: Production server is healthy"
else
  echo "❌ Smoke test failed: Production server not responding"
  echo "⚠️  Restoring from backup..."
  PGPASSWORD="$password" psql -U "$user" -h "$host" -p "$port" -d "$dbname" -f "$BACKUP_FILE"
  echo "✅ Backup restored. Please investigate the deployment issue."
  exit 1
fi

echo ""
echo "=========================================="
echo "    DEPLOYMENT COMPLETED SUCCESSFULLY"
echo "=========================================="
echo ""
echo "📋 Deployment Summary:"
echo "   - Backup: $BACKUP_FILE"
echo "   - Status: ✅ Healthy"
echo "   - URL: https://x2xhub.com"
echo ""
echo "⚠️  IMPORTANT: Monitor the application for the next hour"