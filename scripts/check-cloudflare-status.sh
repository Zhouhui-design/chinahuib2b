#!/bin/bash
# Check Cloudflare DNS and Proxy Status
# Usage: ./check-cloudflare-status.sh

set -e

DOMAIN="chinahuib2b.top"

echo "=========================================="
echo "Cloudflare DNS & Proxy Status Check"
echo "Domain: $DOMAIN"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# Check if CF_API_TOKEN is set
if [ -z "$CF_API_TOKEN" ]; then
    echo "❌ Error: CF_API_TOKEN environment variable is not set"
    echo ""
    echo "Please set your Cloudflare API Token:"
    echo "export CF_API_TOKEN='your_token_here'"
    echo ""
    echo "You can get a token from:"
    echo "https://dash.cloudflare.com/profile/api-tokens"
    exit 1
fi

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

echo "Step 2: Checking DNS Records..."
echo ""

# Get all A records
DNS_RECORDS=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json")

echo "DNS Records:"
echo "$DNS_RECORDS" | jq -r '.result[] | select(.type=="A") | "  Name: \(.name)\n  Content: \(.content)\n  Proxied: \(.proxied)\n  Status: \(.status)\n"'

echo ""
echo "Step 3: Checking Proxy Status..."
echo ""

# Check if records are proxied
PROXIED_COUNT=$(echo "$DNS_RECORDS" | jq '[.result[] | select(.type=="A" and .proxied==true)] | length')
TOTAL_COUNT=$(echo "$DNS_RECORDS" | jq '[.result[] | select(.type=="A")] | length')

echo "Total A Records: $TOTAL_COUNT"
echo "Proxied Records: $PROXIED_COUNT"
echo ""

if [ "$PROXIED_COUNT" -eq 0 ]; then
    echo "❌ WARNING: No DNS records are proxied through Cloudflare!"
    echo ""
    echo "This means traffic is NOT going through Cloudflare CDN."
    echo ""
    echo "To fix this:"
    echo "1. Go to https://dash.cloudflare.com/"
    echo "2. Select $DOMAIN"
    echo "3. Go to DNS section"
    echo "4. Click the gray cloud icon to turn it orange (Proxied)"
    echo ""
elif [ "$PROXIED_COUNT" -lt "$TOTAL_COUNT" ]; then
    echo "⚠️  WARNING: Only $PROXIED_COUNT of $TOTAL_COUNT records are proxied"
    echo ""
    echo "Some records may bypass Cloudflare CDN."
else
    echo "✅ All A records are proxied through Cloudflare"
fi

echo ""
echo "Step 4: Checking SSL/TLS Settings..."
echo ""

SSL_SETTINGS=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ssl" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json")

SSL_VALUE=$(echo "$SSL_SETTINGS" | jq -r '.result.value')

echo "SSL/TLS Mode: $SSL_VALUE"
echo ""

if [ "$SSL_VALUE" = "off" ]; then
    echo "❌ WARNING: SSL is OFF! This is insecure."
elif [ "$SSL_VALUE" = "flexible" ]; then
    echo "⚠️  WARNING: SSL is Flexible. May cause redirect loops."
    echo "Recommend changing to 'Full' or 'Full (strict)'"
elif [ "$SSL_VALUE" = "full" ] || [ "$SSL_VALUE" = "full_strict" ]; then
    echo "✅ SSL configuration is good"
fi

echo ""
echo "=========================================="
echo "Check complete!"
echo "=========================================="
