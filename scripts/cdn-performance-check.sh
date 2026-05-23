#!/bin/bash
# CDN Performance Check Script for chinahuib2b.top
# Usage: ./cdn-performance-check.sh

DOMAIN="chinahuib2b.top"
ENDPOINTS=(
  "/"
  "/products"
  "/seller"
  "/about"
  "/contact"
)

echo "=========================================="
echo "CDN Performance Check"
echo "Domain: $DOMAIN"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

for endpoint in "${ENDPOINTS[@]}"; do
  echo "Testing: https://$DOMAIN$endpoint"
  
  # Get response headers with timing
  RESPONSE=$(curl -sI -w "\n%{time_total}" "https://$DOMAIN$endpoint" 2>/dev/null)
  
  # Extract metrics
  HTTP_CODE=$(echo "$RESPONSE" | head -1 | awk '{print $2}')
  CF_RAY=$(echo "$RESPONSE" | grep -i "cf-ray" | awk '{print $2}')
  CF_CACHE=$(echo "$RESPONSE" | grep -i "cf-cache-status" | awk '{print $2}')
  AGE=$(echo "$RESPONSE" | grep -i "^age:" | awk '{print $2}')
  TIME_TOTAL=$(echo "$RESPONSE" | tail -1)
  
  # Display results
  echo "  HTTP Status: ${HTTP_CODE:-N/A}"
  echo "  CF-Ray: ${CF_RAY:-N/A}"
  echo "  Cache Status: ${CF_CACHE:-N/A}"
  echo "  Age: ${AGE:-0} seconds"
  echo "  Response Time: ${TIME_TOTAL}s"
  
  # Color code cache status
  if [ "$CF_CACHE" = "HIT" ]; then
    echo "  Status: ✅ CACHED"
  elif [ "$CF_CACHE" = "MISS" ]; then
    echo "  Status: ⚠️  NOT CACHED (first request)"
  elif [ "$CF_CACHE" = "DYNAMIC" ]; then
    echo "  Status: ℹ️  DYNAMIC (not cached by design)"
  else
    echo "  Status: ❓ UNKNOWN"
  fi
  
  echo ""
done

echo "=========================================="
echo "Check complete!"
echo "=========================================="
