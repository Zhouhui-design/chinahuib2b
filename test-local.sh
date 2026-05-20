#!/bin/bash

# Test script for chinahuib2b.next - handles proxy settings
# Usage: ./test-local.sh [path]

PROXY_BYPASS="localhost,127.0.0.1"
TARGET="${1:-/seller}"

echo "Testing: http://127.0.0.1:3001${TARGET}"
echo ""

# Temporarily bypass proxy for localhost
export no_proxy="${PROXY_BYPASS}"
export NO_PROXY="${PROXY_BYPASS}"

# Test with curl, bypassing proxy for localhost
http_proxy="" https_proxy="" ALL_PROXY="" all_proxy="" \
  curl -s "http://127.0.0.1:3001${TARGET}" 2>&1 | head -50

echo ""
echo "=== Response Headers ==="
http_proxy="" https_proxy="" ALL_PROXY="" all_proxy="" \
  curl -sI "http://127.0.0.1:3001${TARGET}" 2>&1 | head -20
