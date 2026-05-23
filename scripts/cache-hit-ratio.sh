#!/bin/bash
# Cache Hit Ratio Test for chinahuib2b.top
# Usage: ./cache-hit-ratio.sh

DOMAIN="chinahuib2b.top"

# Static assets that should be cached
STATIC_URLS=(
  "/_next/static/chunks/main.js"
  "/_next/static/css/app.css"
  "/favicon.ico"
)

HIT=0
MISS=0
DYNAMIC=0
TOTAL=${#STATIC_URLS[@]}

echo "=========================================="
echo "Cache Hit Ratio Test"
echo "Domain: $DOMAIN"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

for url in "${STATIC_URLS[@]}"; do
  STATUS=$(curl -sI "https://$DOMAIN$url" 2>/dev/null | grep -i "cf-cache-status" | awk '{print $2}' | tr -d '\r')
  
  if [ "$STATUS" = "HIT" ]; then
    HIT=$((HIT + 1))
    echo "✅ HIT: $url"
  elif [ "$STATUS" = "MISS" ]; then
    MISS=$((MISS + 1))
    echo "⚠️  MISS: $url"
  elif [ "$STATUS" = "DYNAMIC" ]; then
    DYNAMIC=$((DYNAMIC + 1))
    echo "ℹ️  DYNAMIC: $url"
  else
    echo "❓ UNKNOWN ($STATUS): $url"
  fi
done

echo ""
echo "=========================================="
echo "Results:"
echo "  Total URLs tested: $TOTAL"
echo "  Cache Hits: $HIT"
echo "  Cache Misses: $MISS"
echo "  Dynamic: $DYNAMIC"

if [ $TOTAL -gt 0 ]; then
  RATIO=$(( HIT * 100 / TOTAL ))
  echo "  Hit Ratio: ${RATIO}%"
  
  if [ $RATIO -ge 80 ]; then
    echo ""
    echo "Status: ✅ EXCELLENT (>80%)"
  elif [ $RATIO -ge 60 ]; then
    echo ""
    echo "Status: ⚠️  GOOD (60-80%)"
  else
    echo ""
    echo "Status: ❌ NEEDS IMPROVEMENT (<60%)"
  fi
fi

echo "=========================================="
