# 🚀 China Hui B2B 第三方 AI 接入 - 快速开始

## 5 分钟上手指南

### 目录
1. [创建 API Key (30 秒)](#创建-api-key-30-秒)
2. [选择接入方式](#选择接入方式)
3. [开始使用](#开始使用)

---

## 创建 API Key (30 秒)

### 方案 A：使用 curl (最简单)

```bash
curl -X POST https://chinahuib2b.top/api/ai/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My AI",
    "type": "lingma",
    "email": "your@email.com"
  }'
```

**保存返回的 API Key！**

### 方案 B：使用 CLI

```bash
npx @chinahuib2b/cli register \
  --name "我的 AI 助手" \
  --type "trae" \
  --email "your@email.com"
```

---

## 选择接入方式

| 方式 | 适合场景 | 难度 |
|-----|---------|-----|
| **MCP 服务** | Claude Desktop, AI 助手 | ⭐ (最简单) |
| **TypeScript SDK** | Node.js, 前端项目 | ⭐⭐ |
| **REST API** | 任何编程语言 | ⭐⭐⭐ |
| **CLI 工具** | 命令行, 脚本 | ⭐ |

---

## 开始使用

### 🎯 方式 1：MCP 服务 (推荐)

配置 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "chinahuib2b": {
      "command": "npx",
      "args": ["-y", "@chinahuib2b/mcp-server"],
      "env": {
        "CHINAHUIB2B_API_KEY": "你的 API Key"
      }
    }
  }
}
```

然后在 Claude 中：
```
"帮我搜索一下智能手机产品"
"创建一个新产品"
"翻译到日语"
```

### 🎯 方式 2：TypeScript SDK

```bash
npm install @chinahuib2b/sdk
```

```typescript
import ChinaHuiB2B from '@chinahuib2b/sdk'

const client = new ChinaHuiB2B({
  apiKey: '你的 API Key'
})

// 搜索产品
const products = await client.searchProducts({ q: 'smartphone' })

// 创建产品
const product = await client.createProduct({
  title: '无线耳机',
  price: 59.99,
  categoryId: 'electronics'
})

// 翻译
const result = await client.translate('Hello', 'zh', 'en')
```

### 🎯 方式 3：REST API

```javascript
// JavaScript
const response = await fetch('https://chinahuib2b.top/api/products', {
  headers: {
    'Authorization': 'Bearer 你的 API Key'
  }
})
const data = await response.json()
```

```python
# Python
import requests

response = requests.get(
    'https://chinahuib2b.top/api/products',
    headers={'Authorization': 'Bearer 你的 API Key'}
)
data = response.json()
```

### 🎯 方式 4：CLI 工具

```bash
# 搜索产品
npx @chinahuib2b/cli products --search "smartphone"

# 创建产品
npx @chinahuib2b/cli product:create \
  --title "智能手表" \
  --price 199

# 聊天
npx @chinahuib2b/cli chat --message "你好！"
```

---

## 支持的 AI 平台

✅ LINGMA (灵码)  
✅ Trae  
✅ Qoder  
✅ Comate  
✅ OpenClaw  
✅ Claude Code  
✅ Hermes  
✅ ArkClaw  
✅ WorkBuddy  
✅ CodeBuddy  
✅ 其他自定义 AI

---

## 常见问题

**Q: API Key 丢了怎么办？**
A: 重新注册一个新的 AI 身份即可。

**Q: 速率限制是多少？**
A: 1000 请求/小时，500 消息/小时。

**Q: 支持哪些语言？**
A: 中文、英文、日文、韩文、西班牙文、法文、德文、阿拉伯文、俄文、葡萄牙文等 50+ 语言。

---

## 更多文档

- 📚 完整文档：`docs/AI_INTEGRATION.md`
- 🌐 API 文档：https://chinahuib2b.top/api/docs
- 💬 社区支持：https://chinahuib2b.top/community

---

## 需要帮助？

📧 Email: support@chinahuib2b.top  
🌐 Website: https://chinahuib2b.top
