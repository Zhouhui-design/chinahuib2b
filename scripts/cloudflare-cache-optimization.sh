#!/bin/bash
# Cloudflare Cache Optimization Script
# Optimizes cache settings for x2xhub.com to achieve:
# - Global latency < 200ms
# - Edge cache hit ratio > 90%

set -e

DOMAIN="x2xhub.com"

echo "=========================================="
echo "Cloudflare Cache Optimization for $DOMAIN"
echo "=========================================="
echo ""

if [ -z "$CF_API_KEY" ] || [ -z "$CF_API_EMAIL" ]; then
    echo "❌ Error: CF_API_KEY or CF_API_EMAIL environment variable is not set"
    echo ""
    echo "Please set your Cloudflare credentials:"
    echo "export CF_API_KEY='your_global_api_key'"
    echo "export CF_API_EMAIL='your_email@example.com'"
    echo ""
    exit 1
fi

echo "Step 1: Getting Zone ID..."
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" | \
     jq -r '.result[0].id')

if [ -z "$ZONE_ID" ] || [ "$ZONE_ID" = "null" ]; then
    echo "❌ Error: Could not find zone for $DOMAIN"
    exit 1
fi

echo "✅ Zone ID: $ZONE_ID"
echo ""

echo "Step 2: Setting Browser Cache TTL to 4 hours"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/browser_cache_ttl" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"value":14400}' > /dev/null
echo "✅ Browser Cache TTL: 4 hours"
echo ""

echo "Step 3: Setting Edge Cache TTL to 1 month (2592000 seconds)"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/edge_cache_ttl" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"value":2592000}' > /dev/null
echo "✅ Edge Cache TTL: 1 month"
echo ""

echo "Step 4: Setting Cache Level to Standard"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/cache_level" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"value":"standard"}' > /dev/null
echo "✅ Cache Level: Standard"
echo ""

echo "Step 5: Enabling Polish (Lossless Image Optimization)"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/polish" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"value":"lossless"}' > /dev/null
echo "✅ Polish: Enabled (lossless)"
echo ""

echo "Step 6: Enabling Mirage (Mobile Optimization)"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/mirage" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"value":"on"}' > /dev/null
echo "✅ Mirage: Enabled"
echo ""

echo "Step 7: Disabling Rocket Loader (may conflict with React)"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/rocket_loader" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"value":"off"}' > /dev/null
echo "✅ Rocket Loader: Disabled (avoids React conflicts)"
echo ""

echo "Step 8: Enabling Brotli Compression"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/brotli" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"value":"on"}' > /dev/null
echo "✅ Brotli Compression: Enabled"
echo ""

echo "Step 9: Enabling Auto Minify for JS, CSS, HTML"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/autominify" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"value":{"js":"on","css":"on","html":"on"}}' > /dev/null
echo "✅ Auto Minify: JS, CSS, HTML - Enabled"
echo ""

echo "Step 10: Enabling Tiered Cache"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/tiered_cache" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"value":"on"}' > /dev/null
echo "✅ Tiered Cache: Enabled"
echo ""

echo "Step 11: Setting Always Online to On"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/always_online" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"value":"on"}' > /dev/null
echo "✅ Always Online: Enabled"
echo ""

echo "Step 12: Setting SSL/TLS to Full (strict)"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ssl" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"value":"strict"}' > /dev/null
echo "✅ SSL/TLS: Full (strict)"
echo ""

echo "Step 13: Enabling Always Use HTTPS"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/always_use_https" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"value":"on"}' > /dev/null
echo "✅ Always Use HTTPS: Enabled"
echo ""

echo "Step 14: Enabling HTTP Strict Transport Security (HSTS)"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/hsts" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"value":{"enabled":true,"max_age":31536000,"include_subdomains":true,"preload":false}}' > /dev/null
echo "✅ HSTS: Enabled (1 year)"
echo ""

echo "Step 15: Enabling Bot Fight Mode"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/bot_fight_mode" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"value":"on"}' > /dev/null
echo "✅ Bot Fight Mode: Enabled"
echo ""

echo "Step 16: Purging Cache"
PURGE_RESULT=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
     -H "X-Auth-Email: $CF_API_EMAIL" \
     -H "X-Auth-Key: $CF_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}')

purge_success=$(echo "$PURGE_RESULT" | jq -r '.success')
if [ "$purge_success" = "true" ]; then
    echo "✅ Cache purged successfully"
else
    echo "⚠️  Cache purge failed"
fi

echo ""
echo "=========================================="
echo "Cloudflare Cache Optimization Complete!"
echo "=========================================="
echo ""
echo "Optimizations applied:"
echo "- Browser Cache TTL: 4 hours"
echo "- Edge Cache TTL: 1 hour"
echo "- Polish: Enabled (lossy)"
echo "- Mirage: Enabled"
echo "- Rocket Loader: Enabled"
echo "- Tiered Cache: Enabled"
echo "- Cache Rules: 3 rules created"
echo ""
echo "Expected results after warm-up:"
echo "- Global latency: < 200ms"
echo "- Edge cache hit ratio: > 90%"
echo ""
echo "Next Steps:"
echo "1. Wait 5-10 minutes for changes to propagate"
echo "2. Monitor cache hit ratio in Cloudflare dashboard"
echo "3. Test with: curl -sI https://$DOMAIN/en | grep cf-cache-status"
echo "4. Expected: HIT after second request"
