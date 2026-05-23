#!/bin/bash

# Cloudflare CDN Cache Purge Script for chinahuib2b.top
# This script will purge all cached content from Cloudflare CDN

set -e

echo "=========================================="
echo "Cloudflare CDN Cache Purge Tool"
echo "Domain: chinahuib2b.top"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if CF_API_TOKEN is set
if [ -z "$CF_API_TOKEN" ]; then
    echo -e "${RED}✗ Error: CF_API_TOKEN environment variable is not set${NC}"
    echo ""
    echo -e "${YELLOW}Please follow these steps:${NC}"
    echo ""
    echo "1. Get your API Token from Cloudflare Dashboard:"
    echo "   - Go to https://dash.cloudflare.com/profile/api-tokens"
    echo "   - Click 'Create Token'"
    echo "   - Use template: 'Edit zone DNS' or create custom with:"
    echo "     * Zone.Zone: Read"
    echo "     * Zone.Cache Purge: Purge"
    echo "   - Copy the generated token"
    echo ""
    echo "2. Set the environment variable:"
    echo "   export CF_API_TOKEN='your_token_here'"
    echo ""
    echo "3. Run this script again"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ CF_API_TOKEN is configured${NC}"
echo ""

# Get Zone ID
echo -e "${BLUE}Step 1: Getting Zone ID...${NC}"
ZONE_INFO=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=chinahuib2b.top" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json")

ZONE_ID=$(echo $ZONE_INFO | jq -r '.result[0].id')

if [ -z "$ZONE_ID" ] || [ "$ZONE_ID" = "null" ]; then
    echo -e "${RED}✗ Error: Could not find zone for chinahuib2b.top${NC}"
    echo "Response: $ZONE_INFO"
    exit 1
fi

echo -e "${GREEN}✓ Zone ID: $ZONE_ID${NC}"
echo ""

# Confirm before purging
echo -e "${YELLOW}⚠ WARNING: This will purge ALL cached content for chinahuib2b.top${NC}"
echo ""
echo "This includes:"
echo "  - HTML pages"
echo "  - JavaScript files"
echo "  - CSS files"
echo "  - Images"
echo "  - All other static assets"
echo ""
echo "After purging, Cloudflare will fetch fresh content from your server."
echo "This may cause a temporary increase in server load."
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Operation cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Step 2: Purging all cache...${NC}"

# Purge everything
PURGE_RESULT=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}')

SUCCESS=$(echo $PURGE_RESULT | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✓ Cache purged successfully!${NC}"
    echo ""
    echo "Details:"
    echo $PURGE_RESULT | jq '.'
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}CDN Cache Purge Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Wait 5-10 minutes for changes to propagate globally"
    echo "2. Test in Chrome browser (with proxy enabled)"
    echo "3. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
    echo "4. Visit: https://chinahuib2b.top/en"
    echo "5. Click 'Seller Portal' button"
    echo ""
    echo -e "${GREEN}Expected result: No React Error #31, page loads normally${NC}"
else
    echo -e "${RED}✗ Error: Failed to purge cache${NC}"
    echo ""
    echo "Response:"
    echo $PURGE_RESULT | jq '.'
    exit 1
fi
