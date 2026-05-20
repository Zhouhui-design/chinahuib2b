#!/bin/bash

# Test AI Agent Platform API
# This script tests the core functionality of the AI Agent platform

echo "🧪 Testing AI Agent Platform..."
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Create API Key
echo "1️⃣  Creating API Key..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/ai-agent/keys" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Buyer Agent",
    "role": "buyer",
    "rateLimit": 1000
  }')

echo "Response:"
echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_RESPONSE"
echo ""

# Extract API key from response
API_KEY=$(echo "$CREATE_RESPONSE" | grep -o '"key":"[^"]*"' | cut -d'"' -f4)

if [ -z "$API_KEY" ]; then
  echo "❌ Failed to create API key"
  exit 1
fi

echo "✅ API Key created: ${API_KEY:0:20}..."
echo ""

# Test 2: List API Keys
echo "2️⃣  Listing API Keys..."
LIST_RESPONSE=$(curl -s "$BASE_URL/api/ai-agent/keys")

echo "Response:"
echo "$LIST_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LIST_RESPONSE"
echo ""

# Test 3: Search Products with API Key
echo "3️⃣  Searching Products with AI Agent authentication..."
SEARCH_RESPONSE=$(curl -s "$BASE_URL/api/products/search?keyword=test&limit=5" \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-Agent-Role: buyer")

echo "Response:"
echo "$SEARCH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SEARCH_RESPONSE"
echo ""

# Test 4: Get Recommendations
echo "4️⃣  Getting AI Recommendations..."
RECOMMEND_RESPONSE=$(curl -s "$BASE_URL/api/recommendations/products?userId=test-user-123&limit=5")

echo "Response:"
echo "$RECOMMEND_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RECOMMEND_RESPONSE"
echo ""

echo "✅ All tests completed!"
echo ""
echo "📝 Next steps:"
echo "   1. Visit http://localhost:3000/dashboard/api-keys to manage keys"
echo "   2. Read AI_AGENT_DEVELOPER_GUIDE.md for SDK usage"
echo "   3. Integrate API authentication into your AI agents"
