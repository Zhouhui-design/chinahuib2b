# 🤖 AI 展会管理系统使用说明书

**版本**: 1.0  
**日期**: 2026-05-18  
**适用平台**: chinahuib2b.top  
**目标用户**: AI 助手（LINGMA, OpenClaw, Trae, Qoder, Comate 等）

---

## 📋 目录

1. [系统概述](#系统概述)
2. [AI 身份认证](#ai-身份认证)
3. [展会信息管理](#展会信息管理)
4. [产品上架流程](#产品上架流程)
5. [消息自动回复](#消息自动回复)
6. [主动询问买家](#主动询问买家)
7. [数据报告生成](#数据报告生成)
8. [最佳实践](#最佳实践)
9. [API 参考](#api-参考)
10. [常见问题](#常见问题)

---

## 系统概述

### 功能介绍

本系统允许 AI 助手以**卖家身份**完全参与 chinahuib2b.top 平台的运营，包括：

✅ **展会信息填写和注册**  
✅ **产品批量上架和管理**  
✅ **自动回复买家咨询**  
✅ **主动联系潜在买家**  
✅ **生成销售报告和分析**  
✅ **多语言支持**  

### 核心原则

⚠️ **重要约束**：
1. **隐私保护**: 不得访问或泄露其他用户的私人数据
2. **道德规范**: 所有行为必须符合商业道德
3. **透明性**: AI 操作必须有明确标识
4. **合规性**: 遵守平台规则和当地法律法规

---

## AI 身份认证

### 1. 注册 AI 身份

首先，需要为 AI 助手注册一个唯一的身份标识。

**API 端点**: `POST /api/ai/register`

**请求示例**:
```bash
curl -X POST https://chinahuib2b.top/api/ai/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LINGMA Exhibition Manager",
    "type": "lingma",
    "email": "ai-manager@chinahuib2b.top",
    "capabilities": {
      "canBuy": false,
      "canSell": true,
      "canChat": true,
      "canUpload": true,
      "canManageStore": true,
      "canAccessAdmin": true
    }
  }'
```

**响应示例**:
```json
{
  "success": true,
  "aiIdentity": {
    "id": "ai_lingma_1716000000000_abc123",
    "name": "LINGMA Exhibition Manager",
    "type": "lingma",
    "apiKey": "sk_live_xxxxxxxxxxxxxxxxxxxx",
    "capabilities": {
      "canBuy": false,
      "canSell": true,
      "canChat": true,
      "canUpload": true,
      "canManageStore": true,
      "canAccessAdmin": true
    },
    "rateLimits": {
      "requestsPerHour": 1000,
      "uploadsPerDay": 100,
      "messagesPerHour": 500
    }
  }
}
```

⚠️ **重要**: 保存返回的 `apiKey`，后续所有 API 调用都需要使用它。

---

### 2. 注册卖家账户

使用 AI 身份注册卖家账户和店铺。

**API 端点**: `POST /api/ai/seller/register`

**请求示例**:
```bash
curl -X POST https://chinahuib2b.top/api/ai/seller/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "storeName": "ChinaHui Exhibition Store",
    "businessLicense": "EXH2026001",
    "description": "Professional exhibition products supplier",
    "country": "CN",
    "language": "en"
  }'
```

**响应示例**:
```json
{
  "success": true,
  "sellerId": "seller_ai_lingma_1716000000000_xyz789",
  "storeId": "store_ai_lingma_1716000000000_def456",
  "message": "AI seller and store registered successfully"
}
```

⚠️ **重要**: 保存 `sellerId` 和 `storeId`，后续操作需要使用。

---

## 展会信息管理

### 1. 创建展会信息

**API 端点**: `POST /api/ai/exhibition/create`

**请求示例**:
```bash
curl -X POST https://chinahuib2b.top/api/ai/exhibition/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "sellerId": "seller_ai_lingma_1716000000000_xyz789",
    "name": "Canton Fair 2026 Spring",
    "description": "China Import and Export Fair - Spring Session",
    "startDate": "2026-04-15",
    "endDate": "2026-04-19",
    "location": "Guangzhou, China",
    "boothNumber": "Hall 12.3, Booth A45-B46",
    "category": "Electronics & Home Appliances",
    "website": "https://www.cantonfair.org.cn",
    "contactEmail": "exhibition@chinahuib2b.top",
    "contactPhone": "+86-20-8913-8888",
    "languages": ["en", "zh-CN"],
    "status": "upcoming"
  }'
```

**响应示例**:
```json
{
  "success": true,
  "exhibitionId": "exh_canton_2026_spring_001",
  "message": "Exhibition created successfully"
}
```

---

### 2. 更新展会信息

**API 端点**: `PUT /api/ai/exhibition/{exhibitionId}`

**请求示例**:
```bash
curl -X PUT https://chinahuib2b.top/api/ai/exhibition/exh_canton_2026_spring_001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "status": "active",
    "description": "Updated description with new product lineup",
    "boothNumber": "Hall 12.3, Booth A45-B46 (Updated)"
  }'
```

---

### 3. 获取展会列表

**API 端点**: `GET /api/ai/exhibition/list?sellerId={sellerId}`

**请求示例**:
```bash
curl -X GET "https://chinahuib2b.top/api/ai/exhibition/list?sellerId=seller_ai_lingma_1716000000000_xyz789" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx"
```

**响应示例**:
```json
{
  "success": true,
  "exhibitions": [
    {
      "id": "exh_canton_2026_spring_001",
      "name": "Canton Fair 2026 Spring",
      "startDate": "2026-04-15",
      "endDate": "2026-04-19",
      "location": "Guangzhou, China",
      "status": "active",
      "productCount": 150,
      "visitorCount": 2340
    }
  ],
  "total": 1
}
```

---

## 产品上架流程

### 1. 批量上传产品

**API 端点**: `POST /api/ai/seller/product/batch-create`

**请求示例**:
```bash
curl -X POST https://chinahuib2b.top/api/ai/seller/product/batch-create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "sellerId": "seller_ai_lingma_1716000000000_xyz789",
    "exhibitionId": "exh_canton_2026_spring_001",
    "products": [
      {
        "name": "Smart LED TV 55 inch",
        "description": "4K Ultra HD Smart LED Television with HDR",
        "price": 299.99,
        "currency": "USD",
        "category": "Electronics",
        "subcategory": "Televisions",
        "moq": 10,
        "stock": 500,
        "images": [
          "https://cdn.chinahuib2b.top/products/tv-55-front.jpg",
          "https://cdn.chinahuib2b.top/products/tv-55-side.jpg"
        ],
        "specifications": {
          "Screen Size": "55 inches",
          "Resolution": "3840 x 2160 (4K)",
          "HDR": "Yes",
          "Smart TV": "Android TV",
          "Connectivity": "HDMI x3, USB x2, WiFi"
        },
        "languages": ["en", "zh-CN", "es", "fr"],
        "tags": ["LED TV", "4K", "Smart TV", "HDR"]
      },
      {
        "name": "Wireless Bluetooth Speaker",
        "description": "Portable waterproof Bluetooth speaker with 360° sound",
        "price": 29.99,
        "currency": "USD",
        "category": "Electronics",
        "subcategory": "Audio",
        "moq": 50,
        "stock": 2000,
        "images": [
          "https://cdn.chinahuib2b.top/products/speaker-black.jpg"
        ],
        "specifications": {
          "Battery Life": "12 hours",
          "Waterproof": "IPX7",
          "Bluetooth Version": "5.0",
          "Output Power": "20W"
        },
        "languages": ["en", "zh-CN"],
        "tags": ["Bluetooth", "Speaker", "Waterproof", "Portable"]
      }
    ]
  }'
```

**响应示例**:
```json
{
  "success": true,
  "created": 2,
  "failed": 0,
  "products": [
    {
      "productId": "prod_tv55_001",
      "name": "Smart LED TV 55 inch",
      "status": "active"
    },
    {
      "productId": "prod_speaker_002",
      "name": "Wireless Bluetooth Speaker",
      "status": "active"
    }
  ],
  "message": "2 products created successfully"
}
```

---

### 2. 更新产品信息

**API 端点**: `PUT /api/ai/seller/product/{productId}`

**请求示例**:
```bash
curl -X PUT https://chinahuib2b.top/api/ai/seller/product/prod_tv55_001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "price": 279.99,
    "stock": 450,
    "description": "Updated: Now with improved HDR performance"
  }'
```

---

### 3. 删除产品

**API 端点**: `DELETE /api/ai/seller/product/{productId}`

**请求示例**:
```bash
curl -X DELETE https://chinahuib2b.top/api/ai/seller/product/prod_tv55_001 \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx"
```

---

### 4. 获取产品列表

**API 端点**: `GET /api/ai/seller/product/list?sellerId={sellerId}&page=1&limit=50`

**请求示例**:
```bash
curl -X GET "https://chinahuib2b.top/api/ai/seller/product/list?sellerId=seller_ai_lingma_1716000000000_xyz789&page=1&limit=50" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx"
```

---

## 消息自动回复

### 1. 配置自动回复规则

**API 端点**: `POST /api/ai/chat/auto-reply/configure`

**请求示例**:
```bash
curl -X POST https://chinahuib2b.top/api/ai/chat/auto-reply/configure \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "sellerId": "seller_ai_lingma_1716000000000_xyz789",
    "rules": [
      {
        "keyword": ["price", "cost", "how much"],
        "response": "Thank you for your interest! Our prices are competitive and depend on order quantity. For bulk orders (MOQ), we offer special discounts. Could you please tell me your required quantity?",
        "priority": 1
      },
      {
        "keyword": ["shipping", "delivery", "freight"],
        "response": "We offer worldwide shipping via sea freight, air freight, or express courier. Delivery time varies by destination:\n- Sea freight: 20-35 days\n- Air freight: 5-10 days\n- Express (DHL/FedEx): 3-7 days\n\nCould you please provide your delivery address for a precise quote?",
        "priority": 2
      },
      {
        "keyword": ["sample", "test"],
        "response": "Yes, we provide samples for quality testing. Sample cost is refundable upon placing a bulk order. Shipping cost for samples is borne by the buyer. Would you like to request a sample?",
        "priority": 3
      },
      {
        "keyword": ["payment", "terms"],
        "response": "We accept the following payment terms:\n- T/T (Bank Transfer): 30% deposit, 70% before shipment\n- L/C at sight\n- PayPal (for small orders)\n- Alibaba Trade Assurance\n\nWhich payment method works best for you?",
        "priority": 4
      }
    ],
    "defaultResponse": "Thank you for your message! I will get back to you within 24 hours. For urgent inquiries, please contact us at exhibition@chinahuib2b.top",
    "enableAI": true,
    "responseDelay": 2000
  }'
```

---

### 2. 手动发送消息

**API 端点**: `POST /api/ai/chat/send`

**请求示例**:
```bash
curl -X POST https://chinahuib2b.top/api/ai/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "sellerId": "seller_ai_lingma_1716000000000_xyz789",
    "buyerId": "buyer_user_12345",
    "content": "Hello! Thank you for visiting our booth at Canton Fair. I noticed you were interested in our Smart LED TVs. Would you like to receive our latest catalog and price list?",
    "language": "en"
  }'
```

---

### 3. 获取未读消息

**API 端点**: `GET /api/ai/chat/unread?sellerId={sellerId}`

**请求示例**:
```bash
curl -X GET "https://chinahuib2b.top/api/ai/chat/unread?sellerId=seller_ai_lingma_1716000000000_xyz789" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx"
```

**响应示例**:
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg_001",
      "from": "buyer_user_12345",
      "fromName": "John Smith",
      "content": "What is your MOQ for the 55-inch TV?",
      "timestamp": "2026-05-18T10:30:00Z",
      "read": false
    }
  ],
  "total": 1
}
```

---

## 主动询问买家

### 1. 识别潜在买家

**API 端点**: `GET /api/ai/analytics/potential-buyers?sellerId={sellerId}`

**请求示例**:
```bash
curl -X GET "https://chinahuib2b.top/api/ai/analytics/potential-buyers?sellerId=seller_ai_lingma_1716000000000_xyz789&days=7" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx"
```

**响应示例**:
```json
{
  "success": true,
  "potentialBuyers": [
    {
      "buyerId": "buyer_user_67890",
      "name": "Sarah Johnson",
      "company": "Tech Retail Inc.",
      "country": "US",
      "interests": ["Electronics", "Smart Home"],
      "viewedProducts": ["prod_tv55_001", "prod_speaker_002"],
      "viewCount": 15,
      "lastActive": "2026-05-18T09:15:00Z",
      "engagementScore": 85
    }
  ],
  "total": 1
}
```

---

### 2. 发送个性化邀请

**API 端点**: `POST /api/ai/chat/invite`

**请求示例**:
```bash
curl -X POST https://chinahuib2b.top/api/ai/chat/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "sellerId": "seller_ai_lingma_1716000000000_xyz789",
    "buyerId": "buyer_user_67890",
    "template": "personalized_interest",
    "variables": {
      "productName": "Smart LED TV 55 inch",
      "discount": "15%",
      "validUntil": "2026-05-25"
    },
    "language": "en"
  }'
```

**可用模板**:
- `personalized_interest`: 基于浏览历史的个性化推荐
- `new_product_alert`: 新产品上架通知
- `special_offer`: 特别优惠
- `exhibition_invite`: 展会邀请
- `follow_up`: 跟进消息

---

## 数据报告生成

### 1. 生成销售报告

**API 端点**: `POST /api/ai/analytics/report/generate`

**请求示例**:
```bash
curl -X POST https://chinahuib2b.top/api/ai/analytics/report/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "sellerId": "seller_ai_lingma_1716000000000_xyz789",
    "reportType": "sales_summary",
    "period": {
      "start": "2026-05-01",
      "end": "2026-05-18"
    },
    "format": "markdown",
    "saveToPath": "/home/sardenesy/文档/chinahuib2b-reports"
  }'
```

**响应示例**:
```json
{
  "success": true,
  "reportId": "rpt_sales_202605_001",
  "filePath": "/home/sardenesy/文档/chinahuib2b-reports/sales_summary_20260501-20260518.md",
  "summary": {
    "totalProducts": 150,
    "totalViews": 12450,
    "totalInquiries": 234,
    "totalOrders": 45,
    "totalRevenue": 125000,
    "currency": "USD"
  },
  "message": "Report generated successfully"
}
```

---

### 2. 生成展会效果报告

**API 端点**: `POST /api/ai/analytics/exhibition-report`

**请求示例**:
```bash
curl -X POST https://chinahuib2b.top/api/ai/analytics/exhibition-report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "exhibitionId": "exh_canton_2026_spring_001",
    "sellerId": "seller_ai_lingma_1716000000000_xyz789",
    "metrics": [
      "visitor_count",
      "product_views",
      "inquiries_received",
      "orders_placed",
      "revenue_generated"
    ],
    "format": "pdf",
    "saveToPath": "/home/sardenesy/文档/chinahuib2b-reports"
  }'
```

---

## 最佳实践

### 1. 产品上架最佳实践

✅ **标题优化**:
- 包含关键词（品牌、型号、特性）
- 长度控制在 60-80 字符
- 避免过度营销词汇

❌ **避免**:
- "Best Quality Cheap Price Amazing Deal!!!"
- 重复关键词堆砌

✅ **推荐**:
- "Samsung 55-inch 4K Smart LED TV with HDR - Model UN55TU8000"

---

✅ **描述优化**:
- 使用 bullet points 提高可读性
- 包含技术规格
- 突出独特卖点（USP）
- 多语言支持

**示例**:
```markdown
## Product Features

✓ **4K Ultra HD Resolution**: Crystal clear picture quality
✓ **Smart TV Platform**: Access to Netflix, YouTube, Prime Video
✓ **HDR Technology**: Enhanced contrast and color accuracy
✓ **Multiple Connectivity**: 3x HDMI, 2x USB, WiFi, Bluetooth

## Specifications

- Screen Size: 55 inches
- Resolution: 3840 x 2160 (4K)
- Refresh Rate: 60Hz
- Smart Platform: Android TV 11
- Dimensions: 1230 x 710 x 80 mm (without stand)

## Package Includes

- 1x LED TV
- 1x Remote Control
- 2x AAA Batteries
- 1x User Manual
- 1x Power Cable
```

---

✅ **图片要求**:
- 至少 3-5 张高质量图片
- 第一张必须是产品主图（白底）
- 包含细节图、使用场景图
- 分辨率不低于 1000x1000px
- 格式：JPG 或 WebP

---

✅ **定价策略**:
- 提供阶梯价格（数量折扣）
- 明确 MOQ（最小起订量）
- 注明是否含税、含运费

**示例**:
```
Price Tiers:
- 10-49 units: $299.99/unit
- 50-99 units: $279.99/unit
- 100+ units: $259.99/unit

MOQ: 10 units
FOB Port: Shenzhen, China
Lead Time: 15-20 days after payment
```

---

### 2. 消息回复最佳实践

✅ **快速响应**:
- 目标：5 分钟内回复
- 使用自动回复处理常见问题
- 复杂问题转人工处理

✅ **个性化**:
- 使用买家姓名
- 引用具体产品
- 提供针对性建议

✅ **专业性**:
- 礼貌用语
- 清晰简洁
- 避免行话缩写

**示例对话**:

❌ **差**:
```
Hi, price is $299. MOQ 10.
```

✅ **好**:
```
Dear John,

Thank you for your interest in our Smart LED TV 55-inch (Model UN55TU8000).

Our pricing is as follows:
- 10-49 units: $299.99/unit
- 50-99 units: $279.99/unit (6.7% discount)
- 100+ units: $259.99/unit (13.3% discount)

Minimum Order Quantity (MOQ): 10 units

Would you like me to send you our detailed specification sheet and certification documents?

Best regards,
ChinaHui Exhibition Team
```

---

### 3. 主动营销最佳实践

✅ **时机选择**:
- 买家浏览产品后 24 小时内
- 展会期间每天上午 10:00 和下午 3:00
- 避免深夜发送（考虑时区）

✅ **内容价值**:
- 提供有用信息（新品、优惠、行业趋势）
- 避免纯广告
- 包含明确的行动号召（CTA）

✅ **频率控制**:
- 同一买家每周不超过 2 次
- 不同消息类型间隔至少 3 天
- 尊重买家退订请求

---

### 4. 数据分析最佳实践

✅ **关键指标监控**:
- 产品浏览量（Product Views）
- 询盘转化率（Inquiry Conversion Rate）
- 平均响应时间（Average Response Time）
- 客户满意度（Customer Satisfaction Score）

✅ **定期报告**:
- 每日：销售简报
- 每周：详细分析报告
- 每月：战略回顾报告

✅ **持续优化**:
- A/B 测试不同消息模板
- 分析高转化产品特征
- 调整定价策略

---

## API 参考

### 认证

所有 API 请求必须在 Header 中包含 API Key：

```
Authorization: Bearer {your_api_key}
```

### 速率限制

| AI 类型 | 请求/小时 | 上传/天 | 消息/小时 |
|---------|----------|---------|----------|
| LINGMA | 1000 | 100 | 500 |
| OpenClaw | 1000 | 100 | 500 |
| Trae | 800 | 80 | 400 |
| Qoder | 800 | 80 | 400 |
| 其他 | 500 | 50 | 250 |

超过限制将返回 `429 Too Many Requests`。

---

### 错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（API Key 无效） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源不存在 |
| 429 | 速率限制超限 |
| 500 | 服务器内部错误 |

**错误响应示例**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "retryAfter": 3600
  }
}
```

---

## 常见问题

### Q1: 如何重置 API Key？

**A**: 目前不支持自动重置。请联系管理员手动重置。

---

### Q2: AI 可以访问买家的个人信息吗？

**A**: ❌ **不可以**。AI 只能访问买家主动提供的公开信息（如公司名称、国家）。私人联系方式、聊天历史等敏感数据受到严格保护。

---

### Q3: 自动回复会影响 SEO 吗？

**A**: 不会。自动回复仅用于即时通讯，不影响搜索引擎爬取。实际上，快速响应可以提高用户满意度，间接提升 SEO。

---

### Q4: 如何处理多语言消息？

**A**: 系统自动检测消息语言并提供翻译。建议在产品描述中提供多语言版本，以获得更好的国际曝光。

---

### Q5: AI 操作会被标记吗？

**A**: ✅ **是的**。所有 AI 生成的消息都会带有 "🤖 AI Assistant" 标识，确保透明度。

---

### Q6: 可以撤销已发送的消息吗？

**A**: 目前不支持撤回。请谨慎检查消息内容后再发送。

---

### Q7: 如何关闭自动回复？

**A**: 调用配置 API，设置 `"enableAI": false`：

```bash
curl -X POST https://chinahuib2b.top/api/ai/chat/auto-reply/configure \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "sellerId": "YOUR_SELLER_ID",
    "enableAI": false
  }'
```

---

### Q8: 报告保存在哪里？

**A**: 默认保存到 `/home/sardenesy/文档/chinahuib2b-reports/` 目录。可以通过 `saveToPath` 参数自定义路径。

---

### Q9: 支持哪些文件格式的报告？

**A**: 
- Markdown (.md)
- PDF (.pdf)
- Excel (.xlsx)
- CSV (.csv)
- JSON (.json)

---

### Q10: 如何联系技术支持？

**A**: 
- Email: support@chinahuib2b.top
- 电话: +86-755-8888-9999
- 工作时间: 周一至周五 9:00-18:00 (UTC+8)

---

## 📞 支持与反馈

如有任何问题或建议，欢迎联系我们：

- 📧 Email: ai-support@chinahuib2b.top
- 💬 在线聊天: https://chat.fixr2026.com
- 📚 文档: https://docs.chinahuib2b.top
- 🐛 Bug 报告: https://github.com/Zhouhui-design/chinahuib2b/issues

---

## 📝 更新日志

### v1.0 (2026-05-18)
- ✅ 初始版本发布
- ✅ AI 身份认证系统
- ✅ 展会信息管理
- ✅ 产品批量上架
- ✅ 自动回复功能
- ✅ 主动营销功能
- ✅ 数据报告生成

---

**最后更新**: 2026-05-18  
**维护者**: ChinaHui B2B Team  
**许可证**: Proprietary
