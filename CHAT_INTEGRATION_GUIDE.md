# 💬 聊天系统集成指南

## ✅ 已完成的功能

### Chat Widget 组件

**文件**: `src/components/chat/ChatWidget.tsx`

**功能特性**:
- ✅ 实时 WebSocket 连接
- ✅ JWT 身份验证
- ✅ 消息发送和接收
- ✅ 自动滚动到底部
- ✅ 连接状态指示器
- ✅ 最小化/最大化窗口
- ✅ 响应式设计
- ✅ 未登录用户引导

### 集成位置

1. **产品详情页**: `/[locale]/products/[id]/page.tsx`
   - 浮动聊天按钮（右下角）
   - 点击打开聊天窗口
   - 自动关联产品和卖家

2. **店铺详情页**: `/[locale]/stores/[id]/page.tsx`
   - 同样的聊天组件
   - 直接联系卖家

---

## 🔧 技术实现

### WebSocket 连接流程

```
用户点击聊天按钮
    ↓
检查登录状态
    ↓
生成 JWT Token
    ↓
建立 WebSocket 连接
    ↓
加入对话房间
    ↓
开始实时通信
```

### JWT Token 生成

```typescript
const generateJWT = (userId: string, email: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ 
    userId, 
    email,
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  }))
  const signature = btoa(secret)
  
  return `${header}.${payload}.${signature}`
}
```

**注意**: 生产环境应该使用服务器端生成 JWT，而不是客户端。

### 消息格式

**发送消息**:
```json
{
  "type": "message",
  "conversationId": "buyer_id_seller_id",
  "senderId": "buyer_id",
  "receiverId": "seller_id",
  "content": "Hello!",
  "productId": "product_id",
  "timestamp": "2026-05-17T12:00:00Z"
}
```

**接收消息**:
```json
{
  "type": "message",
  "id": "msg_123",
  "content": "Hi there!",
  "senderId": "seller_id",
  "timestamp": "2026-05-17T12:00:01Z"
}
```

---

## 🚀 配置步骤

### Step 1: 确保 Chat System 运行

聊天系统位于: `/home/sardenesy/projects/chat-system`

**启动聊天服务器**:
```bash
cd /home/sardenesy/projects/chat-system/server
npm start
```

默认端口: `5001`

### Step 2: 配置环境变量

编辑 `.env.local`:

```bash
# Chat System Configuration
NEXT_PUBLIC_CHAT_API_URL="http://localhost:5001"
NEXT_PUBLIC_CHAT_WS_URL="ws://localhost:5001/ws"
NEXT_PUBLIC_CHAT_JWT_SECRET="your-secret-key-here"
```

**生产环境**:
```bash
NEXT_PUBLIC_CHAT_API_URL="https://chat.chinahuib2b.top"
NEXT_PUBLIC_CHAT_WS_URL="wss://chat.chinahuib2b.top/ws"
NEXT_PUBLIC_CHAT_JWT_SECRET="production-secret-key"
```

### Step 3: 重启应用

```bash
# 开发环境
npm run dev

# 生产环境
pm2 restart chinahuib2b
```

---

## 🎨 UI 设计

### 聊天按钮

- **位置**: 右下角固定（bottom-6 right-6）
- **样式**: 蓝色圆形按钮
- **图标**: MessageCircle
- **状态指示**: 红色圆点（未连接时）

### 聊天窗口

- **尺寸**: 宽 384px (w-96)，高 500px
- **最小化**: 高 64px (h-16)
- **位置**: 右下角固定
- **阴影**: shadow-2xl
- **圆角**: rounded-lg

### 颜色方案

- **主色**: Blue-600 (#2563eb)
- **背景**: White / Gray-50
- **自己的消息**: Blue-600 背景，白色文字
- **对方的消息**: White 背景，灰色边框

---

## 🔐 安全考虑

### 当前实现（简化版）

⚠️ **警告**: 当前的 JWT 生成在客户端，仅用于演示。

### 生产环境建议

1. **服务器端 JWT 生成**

创建 API 端点 `/api/chat/token`:

```typescript
// src/app/api/chat/token/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import jwt from 'jsonwebtoken'

export async function GET() {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const token = jwt.sign(
    {
      userId: session.user.id,
      email: session.user.email,
    },
    process.env.CHAT_SYSTEM_JWT_SECRET!,
    { expiresIn: '1h' }
  )
  
  return NextResponse.json({ token })
}
```

2. **更新 ChatWidget 组件**

```typescript
// 获取 JWT Token
const response = await fetch('/api/chat/token')
const { token } = await response.json()

// 使用 token 连接
const websocket = new WebSocket(`${wsUrl}?token=${token}`)
```

3. **CORS 配置**

确保聊天服务器允许来自 chinahuib2b.top 的请求：

```javascript
// chat-system/server/index.js
const cors = require('cors')

app.use(cors({
  origin: ['http://localhost:3000', 'https://chinahuib2b.top'],
  credentials: true
}))
```

---

## 📊 功能清单

### 已实现

- ✅ WebSocket 实时通信
- ✅ JWT 身份验证（简化版）
- ✅ 消息发送和接收
- ✅ 自动滚动
- ✅ 连接状态显示
- ✅ 最小化/最大化
- ✅ 响应式设计
- ✅ 产品/店铺页面集成

### 待完善

- ⏳ 服务器端 JWT 生成
- ⏳ 消息历史记录加载
- ⏳ 图片/文件发送
- ⏳ 已读回执
- ⏳ 输入指示器（typing...）
- ⏳ 离线消息队列
- ⏳ 通知声音
- ⏳ 移动端优化

---

## 🧪 测试方法

### 本地测试

1. **启动聊天服务器**:
   ```bash
   cd /home/sardenesy/projects/chat-system/server
   npm start
   ```

2. **启动 Chinahuib2b**:
   ```bash
   cd /home/sardenesy/projects/chinahuib2b
   npm run dev
   ```

3. **测试流程**:
   - 访问产品详情页
   - 登录账户
   - 点击右下角聊天按钮
   - 发送测试消息
   - 在另一个浏览器窗口以卖家身份登录
   - 查看是否收到消息

### 调试技巧

**检查 WebSocket 连接**:
```javascript
// 在浏览器控制台
console.log(window.chatWs) // 如果暴露了
```

**查看网络请求**:
- 打开 Chrome DevTools
- Network 标签
- WS 过滤器
- 查看 WebSocket 帧

---

## 🐛 常见问题

### 问题 1: WebSocket 连接失败

**症状**: 连接状态一直显示红色

**原因**: 
- 聊天服务器未启动
- URL 配置错误
- 防火墙阻止

**解决**:
1. 确认聊天服务器运行在端口 5001
2. 检查 `.env.local` 中的 `NEXT_PUBLIC_CHAT_WS_URL`
3. 尝试直接访问 `ws://localhost:5001/ws`

### 问题 2: 消息发送失败

**症状**: 点击发送按钮无反应

**原因**:
- WebSocket 未连接
- JWT Token 无效
- 接收方 ID 错误

**解决**:
1. 检查控制台是否有错误
2. 确认 `isConnected` 为 true
3. 验证 sellerId 是否正确

### 问题 3: 消息不显示

**症状**: 发送了消息但看不到

**原因**:
- 消息格式错误
- 前端解析失败
- 乐观更新失败

**解决**:
1. 检查 WebSocket onmessage 事件
2. 确认消息 JSON 格式正确
3. 查看浏览器控制台错误

---

## 📈 性能优化

### 1. 连接复用

避免每次打开聊天都创建新连接：

```typescript
// 使用单例模式
class ChatClientSingleton {
  private static instance: ChatClientSingleton
  private ws: WebSocket | null = null
  
  static getInstance(): ChatClientSingleton {
    if (!ChatClientSingleton.instance) {
      ChatClientSingleton.instance = new ChatClientSingleton()
    }
    return ChatClientSingleton.instance
  }
  
  connect() { ... }
  disconnect() { ... }
}
```

### 2. 消息分页

加载历史消息时分页：

```typescript
const loadMessages = async (page: number = 1, limit: number = 50) => {
  const response = await fetch(
    `/api/chat/messages?conversationId=${convId}&page=${page}&limit=${limit}`
  )
  const data = await response.json()
  setMessages(prev => [...data.messages, ...prev])
}
```

### 3. 虚拟滚动

对于大量消息，使用虚拟列表：

```bash
npm install react-window
```

---

## 🎯 下一步改进

### 短期（本周）

1. ✅ 实现服务器端 JWT 生成
2. ✅ 添加消息历史记录
3. ✅ 实现已读回执

### 中期（本月）

1. 支持图片和文件发送
2. 添加输入指示器
3. 实现离线消息队列
4. 添加通知声音

### 长期（季度）

1. 群组聊天支持
2. 语音/视频通话
3. 消息搜索功能
4. AI 自动回复

---

## 📝 代码示例

### 在产品页面使用

```tsx
// src/app/[locale]/products/[id]/page.tsx
import ChatWidget from '@/components/chat/ChatWidget'

export default function ProductDetailPage() {
  // ... 获取 product 数据
  
  return (
    <div>
      {/* 产品详情内容 */}
      
      {/* 聊天组件 */}
      {product && (
        <ChatWidget 
          sellerId={product.seller.id} 
          productId={product.id} 
        />
      )}
    </div>
  )
}
```

### 自定义聊天按钮样式

```tsx
<ChatWidget 
  sellerId={sellerId}
  buttonColor="bg-green-600"
  buttonPosition="bottom-4 left-4"
  windowWidth="w-[400px]"
  windowHeight="h-[600px]"
/>
```

---

**最后更新**: 2026-05-17  
**版本**: 1.0.0  
**维护者**: AI Assistant
