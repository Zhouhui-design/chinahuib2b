#!/bin/bash
# Cloudflare Cache Rules for x2xhub.com

set -e

DOMAIN="x2xhub.com"
ZONE_ID="cf57340c7328c5d72dd97c45136304c5"

echo "=========================================="
echo "Cloudflare Cache Rules for $DOMAIN"
echo "=========================================="
echo ""

if [ -z "$CF_API_KEY" ] || [ -z "$CF_API_EMAIL" ]; then
    echo "❌ Error: CF_API_KEY or CF_API_EMAIL environment variable is not set"
    exit 1
fi

echo "Creating regional cache rules..."
echo ""

create_cache_rule() {
    local rule_name="$1"
    local priority="$2"
    local expression="$3"
    
    echo "Rule $priority: $rule_name"
    local result=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rules/cache" \
         -H "X-Auth-Email: $CF_API_EMAIL" \
         -H "X-Auth-Key: $CF_API_KEY" \
         -H "Content-Type: application/json" \
         --data "{
           \"description\": \"$rule_name\",
           \"expression\": \"$expression\",
           \"action\": {
             \"cache\": true,
             \"edge_ttl\": { \"mode\": \"override\", \"value\": 300 },
             \"browser_ttl\": { \"mode\": \"override\", \"value\": 60 },
             \"stale_while_revalidate\": { \"mode\": \"override\", \"value\": 86400 },
             \"cache_key\": { \"cache_deception_armor\": true }
           },
           \"priority\": $priority,
           \"status\": \"active\"
         }")

    local success=$(echo "$result" | jq -r '.success')
    if [ "$success" = "true" ]; then
        echo "✅ Rule $priority: $rule_name - Created"
    else
        echo "⚠️  Rule $priority: $(echo "$result" | jq -r '.errors[0].message')"
    fi
    echo ""
}

create_cache_rule "US Region - English Content" 1 "(ip.geoip.country eq \"US\") and (http.request.method eq \"GET\") and (not http.request.uri.path matches \"^/api/.*\")"
create_cache_rule "EU Region - Localized Content" 2 "(ip.geoip.country in {\"FR\",\"DE\",\"GB\",\"NL\",\"BE\",\"LU\",\"AT\",\"ES\",\"IT\"}) and (http.request.method eq \"GET\") and (not http.request.uri.path matches \"^/api/.*\")"
create_cache_rule "Japan Region - Japanese Content" 3 "(ip.geoip.country eq \"JP\") and (http.request.method eq \"GET\") and (not http.request.uri.path matches \"^/api/.*\")"
create_cache_rule "South Korea Region - Korean Content" 4 "(ip.geoip.country eq \"KR\") and (http.request.method eq \"GET\") and (not http.request.uri.path matches \"^/api/.*\")"
create_cache_rule "Australia Region - English Content" 5 "(ip.geoip.country eq \"AU\") and (http.request.method eq \"GET\") and (not http.request.uri.path matches \"^/api/.*\")"

echo "=========================================="
echo "Cache Rules Configuration Complete!"
echo "=========================================="