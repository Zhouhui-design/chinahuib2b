#!/bin/bash
# Enable Cloudflare Proxy for chinahuib2b.top
# Usage: ./scripts/enable-cloudflare-proxy.sh

set -e

DOMAIN="chinahuib2b.top"

echo "=========================================="
echo "Enabling Cloudflare Proxy for $DOMAIN"
echo "=========================================="
echo ""

# Check if CF_API_TOKEN is set
if [ -z "$CF_API_TOKEN" ]; then
    echo "❌ Error: CF_API_TOKEN environment variable is not set"
    echo ""
    echo "Please set your Cloudflare API Token:"
    echo "export CF_API_TOKEN='your_token_here'"
    echo ""
    exit 1
fi

# Step 1: Get Zone ID
echo "Step 1: Getting Zone ID..."
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" | \
     jq -r '.result[0].id')

if [ -z "$ZONE_ID" ] || [ "$ZONE_ID" = "null" ]; then
    echo "❌ Error: Could not find zone for $DOMAIN"
    exit 1
fi

echo "✅ Zone ID: $ZONE_ID"
echo ""

# Step 2: Get current DNS records
echo "Step 2: Checking current DNS records..."
DNS_RECORDS=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json")

echo "Current DNS Records:"
echo "$DNS_RECORDS" | jq -r '.result[] | select(.type=="A") | "  - \(.name): proxied=\(.proxied)"'
echo ""

# Step 3: Enable proxy for each A record
echo "Step 3: Enabling proxy for A records..."

for record_id in $(echo "$DNS_RECORDS" | jq -r '.result[] | select(.type=="A") | .id'); do
    record_name=$(echo "$DNS_RECORDS" | jq -r --arg id "$record_id" '.result[] | select(.id==$id) | .name')
    record_content=$(echo "$DNS_RECORDS" | jq -r --arg id "$record_id" '.result[] | select(.id==$id) | .content')
    
    echo "  Updating: $record_name ($record_content)"
    
    # Update record to enable proxy
    UPDATE_RESULT=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$record_id" \
         -H "Authorization: Bearer $CF_API_TOKEN" \
         -H "Content-Type: application/json" \
         --data "{
           \"type\": \"A\",
           \"name\": \"$record_name\",
           \"content\": \"$record_content\",
           \"proxied\": true,
           \"ttl\": 1
         }")
    
    success=$(echo "$UPDATE_RESULT" | jq -r '.success')
    if [ "$success" = "true" ]; then
        echo "  ✅ Success: $record_name is now proxied"
    else
        echo "  ❌ Failed: $record_name"
        echo "  Error: $(echo "$UPDATE_RESULT" | jq -r '.errors[0].message')"
    fi
done

echo ""

# Step 4: Verify SSL/TLS settings
echo "Step 4: Checking SSL/TLS settings..."
SSL_SETTINGS=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ssl" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json")

SSL_VALUE=$(echo "$SSL_SETTINGS" | jq -r '.result.value')
echo "Current SSL/TLS Mode: $SSL_VALUE"

if [ "$SSL_VALUE" != "full" ] && [ "$SSL_VALUE" != "full_strict" ]; then
    echo ""
    echo "⚠️  WARNING: SSL/TLS mode is not optimal!"
    echo "Recommended: Full or Full (strict)"
    echo "Current: $SSL_VALUE"
    echo ""
    echo "To change SSL mode manually:"
    echo "1. Go to https://dash.cloudflare.com/"
    echo "2. Select $DOMAIN"
    echo "3. SSL/TLS → Overview"
    echo "4. Change to 'Full (strict)'"
else
    echo "✅ SSL/TLS configuration is good"
fi

echo ""

# Step 5: Purge cache
echo "Step 5: Purging CDN cache..."
PURGE_RESULT=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}')

purge_success=$(echo "$PURGE_RESULT" | jq -r '.success')
if [ "$purge_success" = "true" ]; then
    echo "✅ Cache purged successfully"
else
    echo "⚠️  Cache purge failed (may need manual action)"
fi

echo ""
echo "=========================================="
echo "Task Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Wait 5-10 minutes for DNS propagation"
echo "2. Test with: curl -sI https://$DOMAIN/ | grep -iE 'cf-|server:'"
echo "3. Expected: cf-ray and cf-cache-status headers"
echo ""
