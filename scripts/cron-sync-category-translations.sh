#!/bin/bash
#
# Daily Category Translation Sync
# Runs the category translation sync API to keep all 13 languages up to date
# Also clears the category cache so new translations are immediately visible
#
# Cron: 0 4 * * * /var/www/chinahuib2b/scripts/cron-sync-category-translations.sh >> /var/www/chinahuib2b/logs/category-sync.log 2>&1
#

set -e

# Detect environment: use /var/www/chinahuib2b in production, /home/sardenesy/projects/chinahuib2b in dev
if [ -d "/var/www/chinahuib2b" ]; then
    APP_DIR="/var/www/chinahuib2b"
else
    APP_DIR="/home/sardenesy/projects/chinahuib2b"
fi

LOG_FILE="$APP_DIR/logs/category-sync.log"
mkdir -p "$APP_DIR/logs"

echo "========================================"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting daily category translation sync"
echo "========================================"

# Read CRON_API_KEY from .env.local
if [ -f "$APP_DIR/.env.local" ]; then
    CRON_API_KEY=$(grep "^CRON_API_KEY=" "$APP_DIR/.env.local" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
fi

if [ -z "$CRON_API_KEY" ]; then
    echo "⚠️  CRON_API_KEY not found in .env.local, proceeding without auth (dev mode only)"
    AUTH_HEADER=""
else
    AUTH_HEADER="-H \"Authorization: Bearer $CRON_API_KEY\""
fi

# Detect which port the app is running on
SYNC_URL=""
for PORT in 3000 3001 3002; do
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/api/health" 2>/dev/null | grep -q "200"; then
        SYNC_URL="http://localhost:$PORT/api/categories/sync-translations"
        break
    fi
done

if [ -z "$SYNC_URL" ]; then
    echo "❌ No running app instance found on ports 3000-3002"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sync aborted"
    echo "========================================"
    echo ""
    exit 1
fi

echo "Calling sync API: $SYNC_URL"

# Call the sync API
if [ -z "$CRON_API_KEY" ]; then
    RESPONSE=$(curl -s -X POST "$SYNC_URL" -H "Content-Type: application/json" 2>&1)
else
    RESPONSE=$(curl -s -X POST "$SYNC_URL" -H "Content-Type: application/json" -H "Authorization: Bearer $CRON_API_KEY" 2>&1)
fi

echo "Response: $RESPONSE"

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Category translation sync completed successfully"

    # Extract stats
    UPDATED=$(echo "$RESPONSE" | grep -o '"updated":[0-9]*' | head -1 | cut -d':' -f2)
    SKIPPED=$(echo "$RESPONSE" | grep -o '"skipped":[0-9]*' | head -1 | cut -d':' -f2)
    FAILED=$(echo "$RESPONSE" | grep -o '"failed":[0-9]*' | head -1 | cut -d':' -f2)

    echo "   Updated: $UPDATED"
    echo "   Skipped: $SKIPPED"
    echo "   Failed:  $FAILED"

    # Clear Redis cache for categories so new translations are immediately visible
    echo "🗑️  Clearing category cache..."
    redis-cli DEL $(redis-cli KEYS "categories:tree:*") 2>/dev/null || true
    redis-cli DEL $(redis-cli KEYS "category:*") 2>/dev/null || true
    echo "   Cache cleared"
else
    echo "❌ Category translation sync failed"
    echo "   Response: $RESPONSE"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sync finished"
echo "========================================"
echo ""
