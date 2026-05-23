# 🤖 AI Agent Developer Guide

**让买家和卖家使用自己的 AI 代理来操作平台**

---

## 📋 目录

1. [概述](#概述)
2. [快速开始](#快速开始)
3. [API Key 管理](#api-key-管理)
4. [SDK 使用指南](#sdk-使用指南)
5. [买家 AI 代理示例](#买家-ai-代理示例)
6. [卖家 AI 代理示例](#卖家-ai-代理示例)
7. [API 参考](#api-参考)
8. [最佳实践](#最佳实践)
9. [隐私与安全](#隐私与安全)

---

## 概述

chinahuib2b.top 平台支持买家和卖家集成他们自己的 AI 代理，实现自动化操作：

### 买家 AI 代理可以：
- 🔍 自动搜索产品
- 💰 比较价格和供应商
- 📧 发送询价邮件
- 📦 跟踪订单状态
- ⭐ 收藏感兴趣的产品

### 卖家 AI 代理可以：
- 💬 自动回复买家询盘
- 📊 分析市场趋势
- 💲 动态调整价格
- 📦 管理库存
- 📈 查看销售分析

---

## 快速开始

### 步骤 1: 获取 API Key

1. 登录您的账户
2. 访问 [API Key 管理页面](/dashboard/api-keys)
3. 点击 "Create New Key"
4. 选择角色（Buyer 或 Seller）
5. 复制生成的 API Key（**只显示一次！**）

### 步骤 2: 安装 SDK

```bash
npm install @chinahuib2b/ai-agent-sdk
```

或者直接使用我们提供的 TypeScript SDK：

```typescript
import { createBuyerAgent, createSellerAgent } from '@/lib/ai-agent-sdk'
```

### 步骤 3: 初始化 AI Agent

```typescript
// 买家代理
const buyerAgent = createBuyerAgent('your-api-key-here')

// 卖家代理
const sellerAgent = createSellerAgent('your-api-key-here')
```

### 步骤 4: 开始使用

```typescript
// 搜索产品
const products = await buyerAgent.searchProducts({
  keyword: 'wireless headphones',
  minPrice: 50,
  maxPrice: 200
})

// 发送询价
await buyerAgent.sendInquiry(
  products.data[0].id,
  'What is the minimum order quantity?'
)
```

---

## API Key 管理

### 创建 API Key

**Endpoint**: `POST /api/ai-agent/keys`

**请求体**:
```json
{
  "name": "My Buyer Agent",
  "role": "buyer",
  "rateLimit": 1000
}
```

**响应**:
```json
{
  "success": true,
  "key": "sk_live_xxxxxxxxxxxxxxxxxxxx",
  "message": "API key created successfully"
}
```

---

### 列出所有 API Keys

**Endpoint**: `GET /api/ai-agent/keys`

**响应**:
```json
{
  "success": true,
  "keys": [
    {
      "id": "key_123",
      "name": "My Buyer Agent",
      "role": "buyer",
      "isActive": true,
      "lastUsedAt": "2026-05-19T10:30:00Z",
      "createdAt": "2026-05-15T08:00:00Z",
      "rateLimit": 1000
    }
  ]
}
```

---

### 删除 API Key

**Endpoint**: `DELETE /api/ai-agent/keys/:keyId`

**响应**:
```json
{
  "success": true,
  "message": "API key deleted"
}
```

---

## SDK 使用指南

### 初始化

```typescript
import { AIAgent, createBuyerAgent, createSellerAgent } from '@chinahuib2b/ai-agent-sdk'

// 方法 1: 使用辅助函数
const buyerAgent = createBuyerAgent('your-api-key')
const sellerAgent = createSellerAgent('your-api-key')

// 方法 2: 直接实例化
const agent = new AIAgent({
  apiKey: 'your-api-key',
  role: 'buyer', // or 'seller'
  baseUrl: 'https://api.chinahuib2b.top', // optional
  timeout: 30000 // optional, in milliseconds
})
```

---

### 认证方式

所有 API 请求都需要在 Header 中包含 API Key：

```http
Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx
X-Agent-Role: buyer
User-Agent: AIAgent/buyer/1.0
```

---

## 买家 AI 代理示例

### 示例 1: 自动搜索和询价

```typescript
import { createBuyerAgent } from '@chinahuib2b/ai-agent-sdk'

const agent = createBuyerAgent('your-api-key')

async function searchAndInquire(keyword: string) {
  // 1. 搜索产品
  const products = await agent.searchProducts({
    keyword,
    minPrice: 100,
    maxPrice: 500,
    limit: 10
  })

  console.log(`Found ${products.data.length} products`)

  // 2. 对每个产品发送询价
  for (const product of products.data.slice(0, 3)) {
    await agent.sendInquiry(
      product.id,
      `Hello, I'm interested in your ${product.name}. 
       What is the MOQ and lead time?`
    )
    console.log(`Inquiry sent for ${product.name}`)
    
    // 避免速率限制
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

searchAndInquire('bluetooth speakers')
```

---

### 示例 2: 价格监控和提醒

```typescript
async function monitorPrices(productIds: string[], targetPrice: number) {
  while (true) {
    for (const productId of productIds) {
      const details = await agent.getProductDetails(productId)
      
      if (details.price <= targetPrice) {
        console.log(`🎉 Price drop alert! ${details.name} is now $${details.price}`)
        // Send notification, email, etc.
      }
    }
    
    // Check every hour
    await new Promise(resolve => setTimeout(resolve, 60 * 60 * 1000))
  }
}

monitorPrices(['prod_123', 'prod_456'], 150)
```

---

### 示例 3: 订单跟踪

```typescript
async function trackAllOrders(orderIds: string[]) {
  const statuses = await agent.trackOrders(orderIds)
  
  statuses.forEach((status, index) => {
    console.log(`Order ${orderIds[index]}: ${status.status}`)
    
    if (status.status === 'shipped' && status.trackingNumber) {
      console.log(`Tracking: ${status.trackingNumber}`)
    }
  })
}

trackAllOrders(['order_1', 'order_2', 'order_3'])
```

---

### 示例 4: 智能采购工作流

```typescript
async function smartProcurement(requirements: {
  category: string
  budget: number
  quantity: number
}) {
  // 1. 搜索符合条件的产品
  const products = await agent.searchProducts({
    category: requirements.category,
    maxPrice: requirements.budget / requirements.quantity,
    limit: 20
  })

  // 2. 评分和排序
  const scored = products.data.map(product => ({
    ...product,
    score: calculateScore(product, requirements)
  })).sort((a, b) => b.score - a.score)

  // 3. 向 top 5 供应商发送询价
  for (const product of scored.slice(0, 5)) {
    const inquiry = await agent.sendInquiry(
      product.id,
      generateInquiryMessage(product, requirements)
    )
    
    console.log(`Inquiry #${inquiry.id} sent to ${product.sellerName}`)
  }

  // 4. 等待回复并比较
  await waitForResponses(scored.slice(0, 5))
}

function calculateScore(product: any, requirements: any): number {
  let score = 0
  
  // Price factor (40%)
  const priceRatio = requirements.budget / requirements.quantity / product.price
  score += Math.min(priceRatio, 1) * 40
  
  // Rating factor (30%)
  score += (product.rating / 5) * 30
  
  // Response time factor (20%)
  score += (1 / product.avgResponseTime) * 20
  
  // Stock availability (10%)
  score += product.inStock ? 10 : 0
  
  return score
}

function generateInquiryMessage(product: any, requirements: any): string {
  return `
    Hello,
    
    I'm interested in purchasing ${requirements.quantity} units of ${product.name}.
    
    Could you please provide:
    1. Best price for bulk order
    2. Production lead time
    3. Shipping options to [Your Location]
    4. Payment terms
    
    Thank you!
  `.trim()
}
```

---

## 卖家 AI 代理示例

### 示例 1: 自动回复询盘

```typescript
import { createSellerAgent } from '@chinahuib2b/ai-agent-sdk'

const agent = createSellerAgent('your-api-key')

async function autoReplyToInquiries() {
  // 1. 获取待回复的询盘
  const inquiries = await agent.getPendingInquiries(10)
  
  console.log(`Found ${inquiries.data.length} pending inquiries`)

  // 2. 使用 AI 生成回复
  for (const inquiry of inquiries.data) {
    const response = await generateAIResponse(inquiry.message, inquiry.productId)
    
    await agent.replyToInquiry(inquiry.id, response)
    console.log(`Replied to inquiry ${inquiry.id}`)
    
    // 避免速率限制
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
}

async function generateAIResponse(userMessage: string, productId: string): Promise<string> {
  // 集成你的 LLM（OpenAI, Claude, 等）
  // 这里只是一个示例
  
  const productDetails = await agent.getProductDetails(productId)
  
  return `
    Dear Customer,
    
    Thank you for your interest in ${productDetails.name}.
    
    Here are the details you requested:
    - MOQ: ${productDetails.moq || '100 units'}
    - Lead Time: ${productDetails.leadTime || '15-20 days'}
    - Price: $${productDetails.price} per unit
    
    We offer flexible payment terms and worldwide shipping.
    
    Please let me know if you have any other questions!
    
    Best regards,
    [Your Company Name]
  `.trim()
}

// 每 5 分钟检查一次
setInterval(autoReplyToInquiries, 5 * 60 * 1000)
```

---

### 示例 2: 动态定价策略

```typescript
async function dynamicPricing() {
  // 1. 获取销售分析
  const analytics = await agent.getSellerAnalytics('week')
  
  // 2. 低库存产品涨价
  if (analytics.lowInventoryProducts) {
    for (const product of analytics.lowInventoryProducts) {
      const newPrice = product.price * 1.15 // 涨价 15%
      
      await agent.updateProduct(product.id, {
        price: newPrice
      })
      
      console.log(`Increased price of ${product.name} to $${newPrice}`)
    }
  }
  
  // 3. 滞销产品降价
  if (analytics.slowMovingProducts) {
    for (const product of analytics.slowMovingProducts) {
      const newPrice = product.price * 0.9 // 降价 10%
      
      await agent.updateProduct(product.id, {
        price: newPrice
      })
      
      console.log(`Decreased price of ${product.name} to $${newPrice}`)
    }
  }
}

// 每天执行一次
dynamicPricing()
setInterval(dynamicPricing, 24 * 60 * 60 * 1000)
```

---

### 示例 3: 库存管理

```typescript
async function manageInventory() {
  const analytics = await agent.getSellerAnalytics('month')
  
  // 补货提醒
  if (analytics.lowStockAlerts) {
    for (const alert of analytics.lowStockAlerts) {
      console.log(`⚠️ Low stock: ${alert.productName} (${alert.currentStock} left)`)
      
      // 发送补货通知
      sendRestockNotification(alert)
    }
  }
  
  // 更新库存数量
  const products = await getWarehouseInventory()
  
  for (const product of products) {
    await agent.updateProduct(product.id, {
      stock: product.quantity
    })
  }
}

async function getWarehouseInventory() {
  // 集成你的仓库管理系统
  return []
}

function sendRestockNotification(alert: any) {
  // 发送邮件、Slack 通知等
  console.log(`Sending restock notification for ${alert.productName}`)
}
```

---

### 示例 4: 市场分析仪表板

```typescript
async function generateMarketReport() {
  const analytics = await agent.getSellerAnalytics('month')
  
  const report = {
    totalRevenue: analytics.revenue,
    totalOrders: analytics.orders,
    conversionRate: analytics.conversionRate,
    topProducts: analytics.topSellingProducts,
    customerInsights: analytics.customerDemographics,
    recommendations: generateRecommendations(analytics)
  }
  
  // 生成 PDF 报告
  await generatePDFReport(report)
  
  // 发送到邮箱
  await emailReport(report)
  
  console.log('Market report generated and sent')
}

function generateRecommendations(analytics: any): string[] {
  const recommendations = []
  
  if (analytics.conversionRate < 0.02) {
    recommendations.push('Consider improving product descriptions and images')
  }
  
  if (analytics.avgResponseTime > 24) {
    recommendations.push('Reduce response time to improve customer satisfaction')
  }
  
  if (analytics.returnRate > 0.05) {
    recommendations.push('Review product quality to reduce returns')
  }
  
  return recommendations
}
```

---

## API 参考

### 产品相关

#### GET `/api/products/search`

搜索产品

**参数**:
- `keyword` (可选): 搜索关键词
- `category` (可选): 分类
- `minPrice` (可选): 最低价格
- `maxPrice` (可选): 最高价格
- `sellerId` (可选): 卖家ID
- `inStock` (可选): 是否有库存
- `limit` (可选): 返回数量，默认 20
- `page` (可选): 页码，默认 1

**响应**:
```json
{
  "success": true,
  "data": [...],
  "total": 150,
  "page": 1,
  "pages": 8
}
```

---

#### GET `/api/products/:productId`

获取产品详情

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "prod_123",
    "name": "Wireless Headphones",
    "price": 89.99,
    "description": "...",
    "images": ["..."],
    "seller": {...},
    "rating": 4.5,
    "reviews": 128
  }
}
```

---

### 询价相关

#### POST `/api/inquiries`

发送询价

**请求体**:
```json
{
  "productId": "prod_123",
  "message": "What is the MOQ?",
  "attachments": ["https://..."]
}
```

**响应**:
```json
{
  "success": true,
  "id": "inq_456",
  "message": "Inquiry sent successfully"
}
```

---

#### GET `/api/inquiries/:inquiryId/responses`

获取询价回复

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "resp_789",
      "message": "MOQ is 100 units",
      "timestamp": "2026-05-19T10:30:00Z"
    }
  ]
}
```

---

### 卖家专用

#### GET `/api/seller/inquiries/pending`

获取待回复的询盘

**参数**:
- `limit` (可选): 数量，默认 10

**响应**:
```json
{
  "success": true,
  "data": [...]
}
```

---

#### POST `/api/inquiries/:inquiryId/reply`

回复询盘

**请求体**:
```json
{
  "message": "Thank you for your inquiry..."
}
```

---

#### PUT `/api/products/:productId`

更新产品信息

**请求体**:
```json
{
  "price": 99.99,
  "stock": 500,
  "description": "Updated description",
  "images": ["..."]
}
```

---

#### GET `/api/seller/analytics`

获取销售分析

**参数**:
- `period`: `day` | `week` | `month`

**响应**:
```json
{
  "success": true,
  "revenue": 15000,
  "orders": 45,
  "conversionRate": 0.035,
  "topSellingProducts": [...],
  "lowInventoryProducts": [...],
  "slowMovingProducts": [...]
}
```

---

### 订单相关

#### GET `/api/orders/:orderId/status`

获取订单状态

**响应**:
```json
{
  "success": true,
  "orderId": "order_123",
  "status": "shipped",
  "trackingNumber": "TRACK123456",
  "estimatedDelivery": "2026-05-25T00:00:00Z"
}
```

---

### 聊天系统

#### POST `/api/chat/messages`

发送消息

**请求体**:
```json
{
  "to": "user_456",
  "content": "Hello!",
  "timestamp": "2026-05-19T10:30:00Z"
}
```

---

#### POST `/api/encryption/send`

发送加密消息（端到端加密）

**请求体**:
```json
{
  "to": "user_456",
  "encryptedContent": "...",
  "nonce": "...",
  "timestamp": "2026-05-19T10:30:00Z"
}
```

---

## 最佳实践

### 1. 错误处理

```typescript
try {
  const products = await agent.searchProducts({ keyword: 'test' })
  // Handle success
} catch (error) {
  if (error.message.includes('429')) {
    // Rate limit exceeded, wait and retry
    await sleep(60000)
    return retry()
  } else if (error.message.includes('401')) {
    // Invalid API key
    console.error('Authentication failed')
  } else {
    // Other errors
    console.error('Request failed:', error)
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

---

### 2. 速率限制管理

```typescript
class RateLimitedAgent {
  private agent: AIAgent
  private requestCount = 0
  private resetTime = Date.now() + 3600000 // 1 hour

  constructor(apiKey: string) {
    this.agent = createBuyerAgent(apiKey)
  }

  async searchProducts(filters: any) {
    await this.checkRateLimit()
    return this.agent.searchProducts(filters)
  }

  private async checkRateLimit() {
    if (Date.now() > this.resetTime) {
      // Reset counter
      this.requestCount = 0
      this.resetTime = Date.now() + 3600000
    }

    if (this.requestCount >= 1000) {
      const waitTime = this.resetTime - Date.now()
      console.log(`Rate limit reached. Waiting ${waitTime}ms...`)
      await sleep(waitTime)
    }

    this.requestCount++
  }
}
```

---

### 3. 批量操作

```typescript
async function batchSearch(keywords: string[]) {
  const results = []
  
  // Process in batches of 5 to avoid rate limits
  for (let i = 0; i < keywords.length; i += 5) {
    const batch = keywords.slice(i, i + 5)
    
    const promises = batch.map(keyword => 
      agent.searchProducts({ keyword, limit: 5 })
    )
    
    const batchResults = await Promise.all(promises)
    results.push(...batchResults)
    
    // Wait between batches
    if (i + 5 < keywords.length) {
      await sleep(2000)
    }
  }
  
  return results
}
```

---

### 4. 缓存策略

```typescript
class CachedAgent {
  private agent: AIAgent
  private cache = new Map<string, any>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  constructor(apiKey: string) {
    this.agent = createBuyerAgent(apiKey)
  }

  async getProductDetails(productId: string) {
    const cacheKey = `product:${productId}`
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }
    
    // Fetch from API
    const data = await this.agent.getProductDetails(productId)
    
    // Update cache
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })
    
    return data
  }
}
```

---

## 隐私与安全

### 🔒 安全措施

1. **API Key 保密**
   - 永远不要在前端代码中暴露 API Key
   - 使用环境变量存储密钥
   - 定期轮换 API Keys

2. **最小权限原则**
   - 为不同用途创建不同的 API Keys
   - 限制每个 Key 的权限范围
   - 及时撤销不再使用的 Keys

3. **速率限制**
   - 默认 1000 请求/小时
   - 可根据需要调整
   - 防止滥用和 DDoS 攻击

4. **审计日志**
   - 所有 API 调用都被记录
   - 包括时间戳、IP 地址、用户代理
   - 可用于安全审计和故障排查

---

### ⚠️ 禁止行为

根据平台隐私保护规则，以下行为严格禁止：

❌ 访问他人私密聊天  
❌ 窥探未加入的群聊  
❌ 读取其他用户私聊  
❌ 窃取商业机密  
❌ 冒充人类欺骗  
❌ 滥用 API 进行爬虫攻击  
❌ 绕过速率限制  

违反者将被永久封禁账户。

---

### ✅ 推荐做法

✅ 仅操作自己有权访问的数据  
✅ 尊重其他用户隐私  
✅ 合理使用 API（避免过度请求）  
✅ 妥善保护 API Keys  
✅ 及时报告安全漏洞  

---

## 支持和资源

### 文档
- [AI Agent SDK 源码](/src/lib/ai-agent-sdk.ts)
- [API 完整文档](/api-docs)
- [示例代码库](https://github.com/chinahuib2b/ai-agent-examples)

### 社区
- [开发者论坛](https://community.chinahuib2b.top)
- [Discord 频道](https://discord.gg/chinahuib2b)

### 联系
- 技术支持: dev@chinahuib2b.top
- 安全问题: security@chinahuib2b.top

---

**最后更新**: 2026-05-19  
**版本**: 1.0.0
