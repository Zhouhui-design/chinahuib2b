#!/bin/bash

# Clear CDN and browser caches for chinahuib2b.top
# This script helps clear Cloudflare cache if you're using it

echo "======================================"
echo "🌍 Clear Cache for chinahuib2b.top"
echo "======================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found"
    exit 1
fi

# Load environment variables
source .env.local

# Check if Cloudflare credentials are configured
if [ -z "$CLOUDFLARE_API_KEY" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "⚠️  Cloudflare credentials not configured in .env.local"
    echo ""
    echo "To use this script, add the following to .env.local:"
    echo "CLOUDFLARE_API_KEY=your_api_key_here"
    echo "CLOUDFLARE_ZONE_ID_CHINAHUIB2B=your_zone_id_here"
    echo ""
    echo "You can get Zone ID from Cloudflare Dashboard:"
    echo "https://dash.cloudflare.com/ → Select domain → Overview → Zone ID"
    echo ""
    exit 1
fi

# Get Zone ID (you need to add this to .env.local)
ZONE_ID=${CLOUDFLARE_ZONE_ID_CHINAHUIB2B:-""}

if [ -z "$ZONE_ID" ]; then
    echo "⚠️  CLOUDFLARE_ZONE_ID_CHINAHUIB2B not set in .env.local"
    echo ""
    echo "Please add your Zone ID to .env.local:"
    echo "CLOUDFLARE_ZONE_ID_CHINAHUIB2B=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    echo ""
    echo "Or get it from: https://dash.cloudflare.com/"
    echo ""
    exit 1
fi

# Ask for email (Cloudflare requires email + API key)
read -p "Enter your Cloudflare email: " CF_EMAIL

if [ -z "$CF_EMAIL" ]; then
    echo "❌ Email is required"
    exit 1
fi

echo ""
echo "🗑️  Purging Cloudflare cache..."
echo "   Zone ID: $ZONE_ID"
echo "   Email: $CF_EMAIL"
echo ""

# Purge everything
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
     -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
     -H "X-Auth-Email: $CF_EMAIL" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything": true}'

echo ""
echo ""

# Check result
if [ $? -eq 0 ]; then
    echo "✅ Cache purge request sent successfully!"
    echo ""
    echo "Note: It may take a few minutes for the cache to be fully cleared."
    echo ""
    echo "Next steps:"
    echo "1. Wait 2-5 minutes"
    echo "2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)"
    echo "3. Test: https://chinahuib2b.top/seller"
else
    echo "❌ Failed to purge cache"
    echo ""
    echo "Please check:"
    echo "- API Key is correct"
    echo "- Zone ID is correct"
    echo "- Email is correct"
    echo "- Network connection"
fi

echo ""
echo "======================================"
echo "For manual cache clearing:"
echo "Dashboard: https://dash.cloudflare.com/"
echo "======================================"
