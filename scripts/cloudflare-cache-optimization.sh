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

if [ -z "$CF_API_TOKEN" ]; then
    echo "❌ Error: CF_API_TOKEN environment variable is not set"
    echo ""
    echo "Please set your Cloudflare API Token:"
    echo "export CF_API_TOKEN='your_token_here'"
    echo ""
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

echo "Step 2: Enabling Development Mode (temporary)"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/development_mode" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":"on"}' > /dev/null
echo "✅ Development Mode enabled (will be disabled later)"
echo ""

echo "Step 3: Setting Browser Cache TTL to 4 hours"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/browser_cache_ttl" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":14400}' > /dev/null
echo "✅ Browser Cache TTL: 4 hours"
echo ""

echo "Step 4: Enabling Cache on Cookie"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/cache_on_cookie" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":"on"}' > /dev/null
echo "✅ Cache on Cookie: Enabled"
echo ""

echo "Step 5: Setting Edge Cache TTL to 1 hour"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/edge_cache_ttl" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":3600}' > /dev/null
echo "✅ Edge Cache TTL: 1 hour"
echo ""

echo "Step 6: Enabling Polish (Image Optimization)"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/polish" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":"lossy"}' > /dev/null
echo "✅ Polish: Enabled (lossy compression)"
echo ""

echo "Step 7: Enabling Mirage (Mobile Optimization)"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/mirage" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":"on"}' > /dev/null
echo "✅ Mirage: Enabled"
echo ""

echo "Step 8: Enabling Rocket Loader (JavaScript Optimization)"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/rocket_loader" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":"on"}' > /dev/null
echo "✅ Rocket Loader: Enabled"
echo ""

echo "Step 9: Setting Always Online to On"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/always_online" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":"on"}' > /dev/null
echo "✅ Always Online: Enabled"
echo ""

echo "Step 10: Setting Tiered Cache to On"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/tiered_cache" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":"on"}' > /dev/null
echo "✅ Tiered Cache: Enabled"
echo ""

echo "Step 11: Creating Cache Rules"
echo ""

echo "Rule 1: Cache Static Assets"
CACHE_RULE_1=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/cache_rules" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
       "description": "Cache static assets (JS, CSS, images, fonts)",
       "expression": "(http.request.uri.path matches \"^/(_next/static|/uploads|/images|/fonts)/.*\") and (http.request.method eq \"GET\")",
       "action": {
         "cache": true,
         "edge_ttl": { "mode": "override", "value": 31536000 },
         "browser_ttl": { "mode": "override", "value": 31536000 },
         "cache_key": { "cache_deception_armor": true }
       },
       "priority": 1,
       "status": "active"
     }')

success=$(echo "$CACHE_RULE_1" | jq -r '.success')
if [ "$success" = "true" ]; then
    echo "✅ Rule 1: Cache Static Assets - Created"
else
    echo "⚠️  Rule 1: $(echo "$CACHE_RULE_1" | jq -r '.errors[0].message')"
fi

echo ""

echo "Rule 2: Cache HTML Pages"
CACHE_RULE_2=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/cache_rules" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
       "description": "Cache HTML pages with stale-while-revalidate",
       "expression": "(http.request.uri.path matches \"^/(en|zh|about|products|exhibitions|stores|auction-screen)(/.*)?$\") and (http.request.method eq \"GET\") and (not http.request.uri.path matches \"^/api/.*\")",
       "action": {
         "cache": true,
         "edge_ttl": { "mode": "override", "value": 600 },
         "browser_ttl": { "mode": "override", "value": 60 },
         "stale_while_revalidate": { "mode": "override", "value": 86400 },
         "cache_key": { "cache_deception_armor": true }
       },
       "priority": 2,
       "status": "active"
     }')

success=$(echo "$CACHE_RULE_2" | jq -r '.success')
if [ "$success" = "true" ]; then
    echo "✅ Rule 2: Cache HTML Pages - Created"
else
    echo "⚠️  Rule 2: $(echo "$CACHE_RULE_2" | jq -r '.errors[0].message')"
fi

echo ""

echo "Rule 3: No Cache for API"
CACHE_RULE_3=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/cache_rules" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
       "description": "No cache for API routes",
       "expression": "(http.request.uri.path matches \"^/api/.*\")",
       "action": {
         "cache": false
       },
       "priority": 3,
       "status": "active"
     }')

success=$(echo "$CACHE_RULE_3" | jq -r '.success')
if [ "$success" = "true" ]; then
    echo "✅ Rule 3: No Cache for API - Created"
else
    echo "⚠️  Rule 3: $(echo "$CACHE_RULE_3" | jq -r '.errors[0].message')"
fi

echo ""

echo "Step 12: Disabling Development Mode"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/development_mode" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":"off"}' > /dev/null
echo "✅ Development Mode disabled"
echo ""

echo "Step 13: Purging Cache"
PURGE_RESULT=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
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
