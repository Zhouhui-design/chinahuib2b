#!/bin/bash

# ======================================
# OpenClaw - ChinaHuiB2B 快速测试脚本
# ======================================

echo "🚀 OpenClaw - ChinaHuiB2B 快速测试脚本"
echo "=============================================="

API_BASE="https://chinahuib2b.top/api"
TEMP_FILE="/tmp/openclaw-test-temp.json"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ======================================
# Step 1: 注册 OpenClaw AI 身份
# ======================================
echo ""
echo -e "${BLUE}[Step 1] 注册 OpenClaw AI 身份...${NC}"
echo ""

read -p "输入 OpenClaw 显示名称 [OpenClaw AI Seller]: " AI_NAME
AI_NAME=${AI_NAME:-"OpenClaw AI Seller"}

read -p "输入 OpenClaw 联系邮箱 [openclaw@example.com]: " AI_EMAIL
AI_EMAIL=${AI_EMAIL:-"openclaw@example.com"}

# 构建注册请求
REGISTER_PAYLOAD=$(cat <<EOF
{
  "name": "$AI_NAME",
  "type": "openclaw",
  "email": "$AI_EMAIL",
  "capabilities": {
    "canSell": true,
    "canBuy": true,
    "canManageStore": true,
    "canCreateProducts": true,
    "canRespondToInquiries": true,
    "canNegotiatePrices": true,
    "canProcessOrders": true
  },
  "metadata": {
    "version": "1.0",
    "developer": "OpenClaw Team",
    "website": "https://openclaw.ai"
  }
}
EOF
)

# 发送注册请求
echo "发送请求到 $API_BASE/ai/register..."
curl -s -X POST "$API_BASE/ai/register" \
  -H "Content-Type: application/json" \
  -d "$REGISTER_PAYLOAD" > "$TEMP_FILE"

# 检查响应
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ 请求失败！${NC}"
  exit 1
fi

# 解析响应
REGISTER_SUCCESS=$(cat "$TEMP_FILE" | grep -o '"success":true')
if [ -z "$REGISTER_SUCCESS" ]; then
  echo -e "${RED}❌ 注册失败！${NC}"
  echo "响应内容:"
  cat "$TEMP_FILE"
  exit 1
fi

# 提取 API Key
API_KEY=$(cat "$TEMP_FILE" | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)
AI_ID=$(cat "$TEMP_FILE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$API_KEY" ]; then
  echo -e "${RED}❌ 无法提取 API Key！${NC}"
  echo "响应内容:"
  cat "$TEMP_FILE"
  exit 1
fi

echo -e "${GREEN}✅ AI 身份注册成功！${NC}"
echo -e "${YELLOW}⚠️  请妥善保存以下信息（只显示一次）：${NC}"
echo ""
echo "API Key: $API_KEY"
echo "AI ID: $AI_ID"
echo ""

# 保存到文件
SAVE_FILE="$HOME/openclaw-credentials.txt"
cat > "$SAVE_FILE" <<EOF
OpenClaw - ChinaHuiB2B 凭证
============================
生成时间: $(date)
AI 名称: $AI_NAME
AI 邮箱: $AI_EMAIL
AI ID: $AI_ID
API Key: $API_KEY

⚠️  请妥善保存！不要分享！
EOF

echo -e "${GREEN}✅ 凭证已保存到: $SAVE_FILE${NC}"

# ======================================
# Step 2: 注册卖家账户
# ======================================
echo ""
echo -e "${BLUE}[Step 2] 注册卖家账户和店铺...${NC}"
echo ""

read -p "输入店铺邮箱 [openclaw-store@example.com]: " STORE_EMAIL
STORE_EMAIL=${STORE_EMAIL:-"openclaw-store@example.com"}

read -p "输入店铺名称 [OpenClaw Digital Furniture Showroom]: " STORE_NAME
STORE_NAME=${STORE_NAME:-"OpenClaw Digital Furniture Showroom"}

read -p "输入国家 [China]: " STORE_COUNTRY
STORE_COUNTRY=${STORE_COUNTRY:-"China"}

# 构建卖家注册请求
SELLER_PAYLOAD=$(cat <<EOF
{
  "email": "$STORE_EMAIL",
  "storeName": "$STORE_NAME",
  "businessLicense": "AI-TRADER-$(date +%Y%m%d)",
  "country": "$STORE_COUNTRY",
  "language": "en"
}
EOF
)

# 发送卖家注册请求
echo "发送请求到 $API_BASE/ai/seller/register..."
curl -s -X POST "$API_BASE/ai/seller/register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "$SELLER_PAYLOAD" > "$TEMP_FILE"

# 检查响应
SELLER_SUCCESS=$(cat "$TEMP_FILE" | grep -o '"success":true')
if [ -z "$SELLER_SUCCESS" ]; then
  echo -e "${RED}❌ 卖家注册失败！${NC}"
  echo "响应内容:"
  cat "$TEMP_FILE"
  exit 1
fi

# 提取卖家 ID 和店铺 ID
SELLER_ID=$(cat "$TEMP_FILE" | grep -o '"sellerId":"[^"]*"' | cut -d'"' -f4)
STORE_ID=$(cat "$TEMP_FILE" | grep -o '"storeId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SELLER_ID" ] || [ -z "$STORE_ID" ]; then
  echo -e "${RED}❌ 无法提取卖家信息！${NC}"
  echo "响应内容:"
  cat "$TEMP_FILE"
  exit 1
fi

echo -e "${GREEN}✅ 卖家账户注册成功！${NC}"
echo "卖家 ID: $SELLER_ID"
echo "店铺 ID: $STORE_ID"
echo ""

# 追加到凭证文件
cat >> "$SAVE_FILE" <<EOF

卖家账户信息
============
卖家 ID: $SELLER_ID
店铺 ID: $STORE_ID
店铺邮箱: $STORE_EMAIL
店铺名称: $STORE_NAME
EOF

# ======================================
# Step 3: 创建咖啡桌产品
# ======================================
echo ""
echo -e "${BLUE}[Step 3] 创建咖啡桌产品...${NC}"
echo ""

read -p "输入产品名称 [Modern Glass Coffee Table]: " PRODUCT_NAME
PRODUCT_NAME=${PRODUCT_NAME:-"Modern Glass Coffee Table"}

read -p "输入产品价格 [199.99]: " PRODUCT_PRICE
PRODUCT_PRICE=${PRODUCT_PRICE:-"199.99"}

read -p "输入最小起订量 [10]: " PRODUCT_MOQ
PRODUCT_MOQ=${PRODUCT_MOQ:-"10"}

# 构建产品创建请求
PRODUCT_PAYLOAD=$(cat <<EOF
{
  "sellerId": "$SELLER_ID",
  "name": "$PRODUCT_NAME",
  "description": "Elegant coffee table with tempered glass top and stainless steel frame. Perfect for modern living rooms and office spaces. Wholesale pricing available for bulk orders.",
  "price": $PRODUCT_PRICE,
  "currency": "USD",
  "category": "Furniture",
  "images": [
    "https://chinahuib2b.top/images/coffee-table-1.jpg",
    "https://chinahuib2b.top/images/coffee-table-2.jpg"
  ],
  "moq": $PRODUCT_MOQ,
  "specifications": {
    "material": "Tempered Glass + Stainless Steel",
    "dimensions": "100cm x 50cm x 45cm",
    "weight": "15kg",
    "maxLoad": "50kg",
    "assemblyRequired": true
  },
  "languages": ["en", "zh"]
}
EOF
)

# 发送产品创建请求
echo "发送请求到 $API_BASE/ai/seller/product/create..."
curl -s -X POST "$API_BASE/ai/seller/product/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "$PRODUCT_PAYLOAD" > "$TEMP_FILE"

# 检查响应
PRODUCT_SUCCESS=$(cat "$TEMP_FILE" | grep -o '"success":true')
if [ -z "$PRODUCT_SUCCESS" ]; then
  echo -e "${RED}❌ 产品创建失败！${NC}"
  echo "响应内容:"
  cat "$TEMP_FILE"
  exit 1
fi

# 提取产品 ID
PRODUCT_ID=$(cat "$TEMP_FILE" | grep -o '"productId":"[^"]*"' | cut -d'"' -f4)

echo -e "${GREEN}✅ 产品创建成功！${NC}"
echo "产品 ID: $PRODUCT_ID"
echo ""

# 追加到凭证文件
cat >> "$SAVE_FILE" <<EOF

产品信息
========
产品 ID: $PRODUCT_ID
产品名称: $PRODUCT_NAME
产品价格: $PRODUCT_PRICE USD
最小起订量: $PRODUCT_MOQ
EOF

# ======================================
# Step 4: 查看产品列表
# ======================================
echo ""
echo -e "${BLUE}[Step 4] 查看产品列表...${NC}"
echo ""

curl -s -X GET "$API_BASE/ai/seller/product/list?storeId=$STORE_ID" \
  -H "Authorization: Bearer $API_KEY" > "$TEMP_FILE"

echo "产品列表响应:"
cat "$TEMP_FILE" | python3 -m json.tool 2>/dev/null || cat "$TEMP_FILE"
echo ""

# ======================================
# 完成
# ======================================
echo -e "${GREEN}==============================================${NC}"
echo -e "${GREEN}✅ OpenClaw 测试完成！${NC}"
echo -e "${GREEN}==============================================${NC}"
echo ""
echo -e "${YELLOW}📋 总结：${NC}"
echo "1. AI 身份已注册"
echo "2. 卖家账户已创建"
echo "3. 咖啡桌产品已上架"
echo ""
echo -e "${BLUE}📁 凭证已保存到: $SAVE_FILE${NC}"
echo ""
echo -e "${YELLOW}📚 更多文档:${NC}"
echo "  - $PWD/OPENCLAW_TEST_GUIDE.md"
echo "  - $PWD/AI_INTEGRATION_GUIDE.md"
echo ""
echo -e "${GREEN}🚀 OpenClaw 现在可以在 chinahuib2b.top 上运营了！${NC}"
echo ""

# 清理临时文件
rm -f "$TEMP_FILE"
