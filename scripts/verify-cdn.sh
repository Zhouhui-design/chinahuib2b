#!/bin/bash
# Verify CDN Configuration for chinahuib2b.top
# Usage: ./scripts/verify-cdn.sh

DOMAIN="chinahuib2b.top"

echo "=========================================="
echo "CDN Verification for $DOMAIN"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# Check DNS
echo "1. DNS Resolution:"
DNS_RESULT=$(dig +short $DOMAIN)
echo "$DNS_RESULT"
echo ""

# Check if DNS points to Cloudflare
if echo "$DNS_RESULT" | grep -qE "^(104\.|172\.67\.)"; then
    echo "✅ DNS points to Cloudflare IP"
else
    echo "❌ DNS does NOT point to Cloudflare IP"
fi
echo ""

# Check CDN headers
echo "2. CDN Headers:"
HEADERS=$(curl -sI https://$DOMAIN/)
CF_HEADERS=$(echo "$HEADERS" | grep -iE "cf-|server:")
echo "$CF_HEADERS"
echo ""

# Verify success
if echo "$HEADERS" | grep -q "cf-ray"; then
    echo "✅ SUCCESS: cf-ray header found"
else
    echo "❌ FAILED: cf-ray header NOT found"
fi

if echo "$HEADERS" | grep -q "cf-cache-status"; then
    echo "✅ SUCCESS: cf-cache-status header found"
else
    echo "❌ FAILED: cf-cache-status header NOT found"
fi

if echo "$HEADERS" | grep -qi "server: cloudflare"; then
    echo "✅ SUCCESS: Server is cloudflare"
else
    echo "⚠️  WARNING: Server header is not 'cloudflare'"
fi

echo ""

# Check response time
echo "3. Response Time:"
TIME=$(curl -s -o /dev/null -w "%{time_total}" https://$DOMAIN/)
echo "Time: ${TIME}s"

# Convert to milliseconds for comparison
TIME_MS=$(echo "$TIME * 1000" | bc | cut -d'.' -f1)

if [ "$TIME_MS" -lt 500 ]; then
    echo "✅ Response time is good (< 500ms)"
elif [ "$TIME_MS" -lt 1000 ]; then
    echo "⚠️  Response time is acceptable (500-1000ms)"
else
    echo "❌ Response time is slow (> 1000ms)"
fi

echo ""
echo "=========================================="

# Final verdict
if echo "$HEADERS" | grep -q "cf-ray" && echo "$HEADERS" | grep -q "cf-cache-status"; then
    echo "🎉 OVERALL: CDN IS WORKING! ✅"
else
    echo "❌ OVERALL: CDN IS NOT WORKING YET"
    echo ""
    echo "Possible reasons:"
    echo "  - DNS propagation still in progress (wait 5-10 min)"
    echo "  - Proxy not enabled in Cloudflare Dashboard"
    echo "  - SSL/TLS configuration issue"
    echo ""
    echo "Try again in 5-10 minutes."
fi

echo "=========================================="
