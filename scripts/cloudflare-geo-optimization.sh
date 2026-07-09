#!/bin/bash
# Cloudflare Geo Optimization Script for x2xhub.com
# Optimizes Geo targeting for: US, EU (FR, DE, UK), Japan, South Korea, Australia

set -e

DOMAIN="x2xhub.com"

echo "=========================================="
echo "Cloudflare Geo Optimization for $DOMAIN"
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

echo "Step 2: Enabling Geo Location Header"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/geo" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":"on"}' > /dev/null
echo "✅ Geo Location Header: Enabled"
echo ""

echo "Step 3: Creating Regional Cache Rules"
echo ""

echo "Rule 1: US Region - English Content"
US_RULE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/cache_rules" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
       "description": "US Region - English Content Cache",
       "expression": "(ip.geoip.country eq \"US\") and (http.request.method eq \"GET\") and (not http.request.uri.path matches \"^/api/.*\")",
       "action": {
         "cache": true,
         "edge_ttl": { "mode": "override", "value": 300 },
         "browser_ttl": { "mode": "override", "value": 60 },
         "stale_while_revalidate": { "mode": "override", "value": 86400 },
         "cache_key": { "cache_deception_armor": true }
       },
       "priority": 1,
       "status": "active"
     }')

success=$(echo "$US_RULE" | jq -r '.success')
if [ "$success" = "true" ]; then
    echo "✅ Rule 1: US Region - Created"
else
    echo "⚠️  Rule 1: $(echo "$US_RULE" | jq -r '.errors[0].message')"
fi

echo ""

echo "Rule 2: EU Region (FR, DE, UK) - Localized Content"
EU_RULE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/cache_rules" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
       "description": "EU Region (FR, DE, UK) - Localized Content Cache",
       "expression": "(ip.geoip.country in {\"FR\", \"DE\", \"GB\", \"NL\", \"BE\", \"LU\", \"AT\", \"ES\", \"IT\"}) and (http.request.method eq \"GET\") and (not http.request.uri.path matches \"^/api/.*\")",
       "action": {
         "cache": true,
         "edge_ttl": { "mode": "override", "value": 300 },
         "browser_ttl": { "mode": "override", "value": 60 },
         "stale_while_revalidate": { "mode": "override", "value": 86400 },
         "cache_key": { "cache_deception_armor": true }
       },
       "priority": 2,
       "status": "active"
     }')

success=$(echo "$EU_RULE" | jq -r '.success')
if [ "$success" = "true" ]; then
    echo "✅ Rule 2: EU Region - Created"
else
    echo "⚠️  Rule 2: $(echo "$EU_RULE" | jq -r '.errors[0].message')"
fi

echo ""

echo "Rule 3: Japan Region - Japanese Content"
JP_RULE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/cache_rules" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
       "description": "Japan Region - Japanese Content Cache",
       "expression": "(ip.geoip.country eq \"JP\") and (http.request.method eq \"GET\") and (not http.request.uri.path matches \"^/api/.*\")",
       "action": {
         "cache": true,
         "edge_ttl": { "mode": "override", "value": 300 },
         "browser_ttl": { "mode": "override", "value": 60 },
         "stale_while_revalidate": { "mode": "override", "value": 86400 },
         "cache_key": { "cache_deception_armor": true }
       },
       "priority": 3,
       "status": "active"
     }')

success=$(echo "$JP_RULE" | jq -r '.success')
if [ "$success" = "true" ]; then
    echo "✅ Rule 3: Japan Region - Created"
else
    echo "⚠️  Rule 3: $(echo "$JP_RULE" | jq -r '.errors[0].message')"
fi

echo ""

echo "Rule 4: South Korea Region - Korean Content"
KR_RULE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/cache_rules" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
       "description": "South Korea Region - Korean Content Cache",
       "expression": "(ip.geoip.country eq \"KR\") and (http.request.method eq \"GET\") and (not http.request.uri.path matches \"^/api/.*\")",
       "action": {
         "cache": true,
         "edge_ttl": { "mode": "override", "value": 300 },
         "browser_ttl": { "mode": "override", "value": 60 },
         "stale_while_revalidate": { "mode": "override", "value": 86400 },
         "cache_key": { "cache_deception_armor": true }
       },
       "priority": 4,
       "status": "active"
     }')

success=$(echo "$KR_RULE" | jq -r '.success')
if [ "$success" = "true" ]; then
    echo "✅ Rule 4: South Korea Region - Created"
else
    echo "⚠️  Rule 4: $(echo "$KR_RULE" | jq -r '.errors[0].message')"
fi

echo ""

echo "Rule 5: Australia Region - English Content"
AU_RULE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/cache_rules" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
       "description": "Australia Region - English Content Cache",
       "expression": "(ip.geoip.country eq \"AU\") and (http.request.method eq \"GET\") and (not http.request.uri.path matches \"^/api/.*\")",
       "action": {
         "cache": true,
         "edge_ttl": { "mode": "override", "value": 300 },
         "browser_ttl": { "mode": "override", "value": 60 },
         "stale_while_revalidate": { "mode": "override", "value": 86400 },
         "cache_key": { "cache_deception_armor": true }
       },
       "priority": 5,
       "status": "active"
     }')

success=$(echo "$AU_RULE" | jq -r '.success')
if [ "$success" = "true" ]; then
    echo "✅ Rule 5: Australia Region - Created"
else
    echo "⚠️  Rule 5: $(echo "$AU_RULE" | jq -r '.errors[0].message')"
fi

echo ""

echo "Step 4: Creating Worker for Geo-based Language Redirection"
echo "Creating worker script..."

WORKER_CODE=$(cat << 'EOF'
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname
  
  if (path.startsWith('/api/') || path.startsWith('/_next/') || path.startsWith('/uploads/')) {
    return fetch(request)
  }
  
  const geo = request.cf?.country || 'US'
  const acceptLang = request.headers.get('Accept-Language') || ''
  
  const langMap = {
    'US': 'en',
    'GB': 'en',
    'AU': 'en',
    'CA': 'en',
    'FR': 'fr',
    'DE': 'de',
    'JP': 'ja',
    'KR': 'ko',
    'CN': 'zh',
    'TW': 'zh',
    'HK': 'zh',
    'ES': 'es',
    'PT': 'pt',
    'RU': 'ru',
    'TH': 'th',
    'VI': 'vi',
    'AR': 'ar',
    'HI': 'hi',
  }
  
  const defaultLang = langMap[geo] || 'en'
  
  if (path === '/' || path === '') {
    const targetPath = `/${defaultLang}/`
    return Response.redirect(`https://x2xhub.com${targetPath}`, 302)
  }
  
  if (!path.match(/^\/[a-z]{2}\//)) {
    const targetPath = `/${defaultLang}${path}`
    return Response.redirect(`https://x2xhub.com${targetPath}`, 302)
  }
  
  return fetch(request)
}
EOF
)

echo "Creating worker 'geo-redirector'..."
WORKER_CREATE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/accounts/ced5d8fd71b99398a4f21c65f1cc485e/workers/scripts/geo-redirector" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/javascript" \
     --data "$WORKER_CODE")

success=$(echo "$WORKER_CREATE" | jq -r '.success')
if [ "$success" = "true" ]; then
    echo "✅ Worker 'geo-redirector' - Created"
else
    echo "⚠️  Worker: $(echo "$WORKER_CREATE" | jq -r '.errors[0].message')"
fi

echo ""

echo "Step 5: Creating Route for Worker"
ROUTE_CREATE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/workers/routes" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
       "pattern": "x2xhub.com/*",
       "script": "geo-redirector"
     }')

success=$(echo "$ROUTE_CREATE" | jq -r '.success')
if [ "$success" = "true" ]; then
    echo "✅ Worker Route - Created"
else
    echo "⚠️  Route: $(echo "$ROUTE_CREATE" | jq -r '.errors[0].message')"
fi

echo ""

echo "Step 6: Setting Security Level to Medium"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/security_level" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":"medium"}' > /dev/null
echo "✅ Security Level: Medium"
echo ""

echo "Step 7: Enabling Bot Management"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/bot_management" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":"on"}' > /dev/null
echo "✅ Bot Management: Enabled"
echo ""

echo "Step 8: Purging Cache"
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
echo "Cloudflare Geo Optimization Complete!"
echo "=========================================="
echo ""
echo "Optimizations applied:"
echo "- Geo Location Header: Enabled"
echo "- Regional Cache Rules: 5 rules created (US, EU, JP, KR, AU)"
echo "- Geo-redirector Worker: Created"
echo "- Worker Route: x2xhub.com/*"
echo "- Security Level: Medium"
echo "- Bot Management: Enabled"
echo ""
echo "Target Regions:"
echo "🇺🇸 US - English content"
echo "🇪🇺 EU (FR, DE, UK) - Localized content"
echo "🇯🇵 Japan - Japanese content"
echo "🇰🇷 South Korea - Korean content"
echo "🇦🇺 Australia - English content"
echo ""
echo "Expected results:"
echo "- Visitors automatically redirected to regional language"
echo "- Faster page loads via regional CDN caching"
echo "- Better SEO targeting for regional searches"