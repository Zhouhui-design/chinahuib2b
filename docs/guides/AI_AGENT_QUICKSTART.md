# 🚀 AI Agent 平台 - 5分钟快速开始

**让买家和卖家使用自己的 AI 代理操作平台**

---

## ⚡ 快速开始（5分钟）

### 步骤 1: 启动开发服务器

```bash
cd /home/sardenesy/projects/chinahuib2b
npm run dev
```

访问: http://localhost:3000

---

### 步骤 2: 创建 API Key

**方法 A: 通过 Web 界面**

1. 访问: http://localhost:3000/dashboard/api-keys
2. 点击 "Create New Key"
3. 输入名称（例如："My Buyer Agent"）
4. 选择角色（Buyer 或 Seller）
5. 点击 "Create Key"
6. **复制并保存 API Key**（只显示一次！）

**方法 B: 通过 API**

```bash
curl -X POST http://localhost:3000/api/ai-agent/keys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Buyer Agent",
    "role": "buyer",
    "rateLimit": 1000
  }'
```

响应:
```json
{
  "success": true,
  "key": "sk_live_xxxxxxxxxxxxxxxx",
  "message": "API key created successfully. Store it securely!"
}
```

---

### 步骤 3: 使用 SDK

安装或使用内置 SDK：

```typescript
import { createBuyerAgent, createSellerAgent } from '@/lib/ai-agent-sdk'

// 买家代理
const buyer = createBuyerAgent('your-api-key-here')

// 卖家代理
const seller = createSellerAgent('your-api-key-here')
```

---

### 步骤 4: 第一个 AI Agent

#### 买家示例：搜索产品

```typescript
const buyer = createBuyerAgent('sk_live_xxx')

// 搜索蓝牙耳机
const products = await buyer.searchProducts({
  keyword: 'bluetooth headphones',
  minPrice: 50,
  maxPrice: 200,
  limit: 10
})

console.log(`Found ${products.data.length} products`)

// 获取第一个产品详情
if (products.data.length > 0) {
  const details = await buyer.getProductDetails(products.data[0].id)
  console.log('Product:', details.name, '$', details.price)
  
  // 发送询价
  await buyer.sendInquiry(
    products.data[0].id,
    'What is the minimum order quantity?'
  )
  console.log('Inquiry sent!')
}
```

---

#### 卖家示例：自动回复

```typescript
const seller = createSellerAgent('sk_live_xxx')

// 获取待回复的询盘
const inquiries = await seller.getPendingInquiries(5)

console.log(`Found ${inquiries.data.length} pending inquiries`)

// 自动回复每个询盘
for (const inquiry of inquiries.data) {
  // 这里可以集成你的 LLM（OpenAI, Claude等）
  const response = `Thank you for your inquiry about ${inquiry.productName}. 
                   MOQ is 100 units. Lead time is 15 days.`
  
  await seller.replyToInquiry(inquiry.id, response)
  console.log(`Replied to inquiry ${inquiry.id}`)
}
```

---

## 🧪 测试你的设置

运行测试脚本：

```bash
chmod +x scripts/test-ai-agent-platform.sh
./scripts/test-ai-agent-platform.sh
```

这将自动测试：
1. ✅ 创建 API Key
2. ✅ 列出 API Keys
3. ✅ 带认证的产品搜索
4. ✅ AI 推荐系统

---

## 📚 完整文档

- [AI Agent Developer Guide](./AI_AGENT_DEVELOPER_GUIDE.md) - 完整开发文档
- [SDK Source Code](./src/lib/ai-agent-sdk.ts) - SDK 源码
- [Strategic Release Report](./AI_AGENT_PLATFORM_STRATEGIC_RELEASE.md) - 战略报告

---

## 💡 常见用例

### 用例 1: 价格监控

```typescript
const buyer = createBuyerAgent('api-key')

async function monitorPrice(productId: string, targetPrice: number) {
  while (true) {
    const product = await buyer.getProductDetails(productId)
    
    if (product.price <= targetPrice) {
      console.log(`🎉 Price drop! ${product.name} is now $${product.price}`)
      // 发送邮件、通知等
      break
    }
    
    // 每小时检查一次
    await new Promise(r => setTimeout(r, 60 * 60 * 1000))
  }
}

monitorPrice('prod_123', 100)
```

---

### 用例 2: 批量询价

```typescript
const buyer = createBuyerAgent('api-key')

async function bulkInquiry(keyword: string, quantity: number) {
  // 搜索产品
  const products = await buyer.searchProducts({
    keyword,
    limit: 20
  })
  
  // 向 top 10 供应商发送询价
  for (const product of products.data.slice(0, 10)) {
    await buyer.sendInquiry(
      product.id,
      `Hi, I need ${quantity} units of ${product.name}. 
       What's your best price and lead time?`
    )
    
    // 避免速率限制
    await new Promise(r => setTimeout(r, 1000))
  }
  
  console.log('Sent 10 inquiries!')
}

bulkInquiry('wireless mouse', 500)
```

---

### 用例 3: 动态定价

```typescript
const seller = createSellerAgent('api-key')

async function adjustPrices() {
  const analytics = await seller.getSellerAnalytics('week')
  
  // 低库存产品涨价
  for (const product of analytics.lowInventoryProducts || []) {
    await seller.updateProduct(product.id, {
      price: product.price * 1.1  // +10%
    })
  }
  
  // 滞销产品降价
  for (const product of analytics.slowMovingProducts || []) {
    await seller.updateProduct(product.id, {
      price: product.price * 0.9  // -10%
    })
  }
  
  console.log('Prices updated!')
}

// 每天执行
adjustPrices()
setInterval(adjustPrices, 24 * 60 * 60 * 1000)
```

---

## 🔧 故障排除

### 问题 1: API Key 无效

**错误**: `"Invalid or inactive API key"`

**解决**:
1. 确认 API Key 正确复制（包括 `sk_live_` 前缀）
2. 检查 Key 是否已删除或过期
3. 创建新的 API Key 重试

---

### 问题 2: 速率限制

**错误**: `"Rate limit exceeded"`

**解决**:
1. 默认限制：1000 请求/小时
2. 等待一小时后重置
3. 或创建新的 API Key

---

### 问题 3: TypeScript 类型错误

**错误**: `Property 'aPIKey' does not exist on type 'PrismaClient'`

**解决**:
```bash
# 重新生成 Prisma Client
npx prisma generate

# 重启 TypeScript 服务器
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## 🎯 下一步

1. **阅读完整文档**: [AI_AGENT_DEVELOPER_GUIDE.md](./AI_AGENT_DEVELOPER_GUIDE.md)
2. **查看示例代码**: SDK 中的 `buyerAgentExample()` 和 `sellerAgentExample()`
3. **集成到你的 AI 系统**: OpenAI, Claude, 或自定义 LLM
4. **加入开发者社区**: 分享你的 AI Agent 应用

---

## 📞 需要帮助？

- 📖 文档: [AI_AGENT_DEVELOPER_GUIDE.md](./AI_AGENT_DEVELOPER_GUIDE.md)
- 💬 问题: 查看常见问题部分
- 🐛 Bug: 提交 GitHub Issue
- 📧 联系: dev@chinahuib2b.top

---

**开始构建你的 AI Agent！** 🤖✨
