#!/bin/bash

set -e

echo "=========================================="
echo "    STAGING DEPLOYMENT SCRIPT"
echo "=========================================="
echo ""

PROJECT_DIR="/var/www/chinahuib2b-staging"
BACKUP_DIR="/var/backups/staging"
STAGING_PORT=3001

echo "[1/6] Creating staging directory..."
mkdir -p "$PROJECT_DIR"

echo "[2/6] Cloning latest code..."
if [ -d "$PROJECT_DIR/.git" ]; then
  cd "$PROJECT_DIR"
  git pull origin main
else
  git clone https://github.com/Zhouhui-design/chinahuib2b.git "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi

echo "[3/6] Installing dependencies..."
npm install

echo "[4/6] Setting up staging environment..."
cp .env.local.example .env.local
sed -i "s/NEXTAUTH_URL=.*/NEXTAUTH_URL=https://staging.x2xhub.com/" .env.local
sed -i "s/DATABASE_URL=.*/DATABASE_URL=postgresql:\/\/expo_dev:dev123@localhost:5432\/global_expo_staging/" .env.local

echo "[5/6] Building project..."
npm run build

echo "[6/6] Starting staging server..."
pm2 stop chinahuib2b-staging 2>/dev/null || true
pm2 delete chinahuib2b-staging 2>/dev/null || true
pm2 start "npm start -- -p $STAGING_PORT" --name "chinahuib2b-staging"

echo ""
echo "=========================================="
echo "    STAGING DEPLOYMENT COMPLETED"
echo "=========================================="
echo ""
echo "🌐 Staging URL: http://localhost:$STAGING_PORT"
echo ""
echo "⚠️  IMPORTANT: Test all changes on staging before deploying to production!"