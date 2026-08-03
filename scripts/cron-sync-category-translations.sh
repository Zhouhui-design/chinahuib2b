#!/bin/bash
#
# Daily Category Translation Sync
# Runs the category translation sync script to keep all 13 languages up to date
#
# Cron: 0 4 * * * /home/sardenesy/projects/chinahuib2b/scripts/cron-sync-category-translations.sh >> /home/sardenesy/projects/chinahuib2b/logs/category-sync.log 2>&1
#

set -e

PROJECT_DIR="/home/sardenesy/projects/chinahuib2b"
PROD_DIR="/var/www/chinahuib2b"
LOG_FILE="$PROJECT_DIR/logs/category-sync.log"

echo "========================================"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting daily category translation sync"
echo "========================================"

# Run the sync via API endpoint (works in both dev and prod)
# Try production first, fall back to local dev
SYNC_URL="http://localhost:3000/api/categories/sync-translations"

# Check if production is running on port 3000
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null | grep -q "200"; then
    SYNC_URL="http://localhost:3000/api/categories/sync-translations"
elif curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null | grep -q "200"; then
    SYNC_URL="http://localhost:3001/api/categories/sync-translations"
fi

echo "Calling sync API: $SYNC_URL"

# Call the sync API
RESPONSE=$(curl -s -X POST "$SYNC_URL" -H "Content-Type: application/json" -H "Authorization: Bearer $CRON_API_KEY" 2>&1)

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
else
    echo "❌ Category translation sync failed"
    echo "   Response: $RESPONSE"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sync finished"
echo "========================================"
echo ""
