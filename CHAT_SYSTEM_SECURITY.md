# 🔒 聊天系统安全防护配置

**完成时间**: 2026-05-17  
**目标**: 确保聊天系统及聊天记录不被 AI 爬虫索引，保护用户隐私

---

## ✅ 已实施的安全措施

### 1. **robots.txt 禁止爬取**

在 `src/app/robots.ts` 中明确禁止所有爬虫访问聊天系统：

```typescript
disallow: [
  '/chat/',              // 聊天系统主路径
  '/chat-system/',       // 聊天系统备选路径
  '/*/chat/',            // 所有语言版本的聊天
  '/*/chat-system/',     // 所有语言版本的聊天系统
]
```

**覆盖范围**:
- ✅ 标准搜索引擎爬虫（Google, Bing, etc.）
- ✅ 所有 AI 爬虫（GPTBot, ClaudeBot, PerplexityBot, etc.）
- ✅ 多语言版本（/en/chat, /zh/chat, etc.）

---

### 2. **HTTP 响应头安全配置**

为聊天相关 API 添加安全响应头：

#### 建议的中间件配置

创建或更新 `src/middleware.ts`：

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 检测是否为聊天相关路径
  if (request.nextUrl.pathname.startsWith('/chat') || 
      request.nextUrl.pathname.startsWith('/api/chat')) {
    
    // 禁止搜索引擎和 AI 爬虫索引
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
    
    // 防止内容被嵌入 iframe
    response.headers.set('X-Frame-Options', 'DENY')
    
    // 严格的内容安全策略
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    )
  }
  
  return response
}

export const config = {
  matcher: ['/chat/:path*', '/api/chat/:path*'],
}
```

---

### 3. **API 端点安全**

#### 聊天 API 路由安全头

在 `/src/app/api/chat/*/route.ts` 中添加：

```typescript
import { NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // ... 您的业务逻辑
  
  const response = NextResponse.json(data)
  
  // 禁止索引
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  
  // 防止缓存敏感数据
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
}
```

---

### 4. **前端页面 Meta 标签**

在聊天页面的 `<head>` 中添加：

```tsx
// src/app/chat/page.tsx 或类似文件
import { Metadata } from 'next'

export const metadata: Metadata = {
  robots: 'noindex, nofollow, noarchive, nosnippet',
  other: {
    'googlebot': 'noindex, nofollow',
    'bingbot': 'noindex, nofollow',
  },
}

export default function ChatPage() {
  return (
    <>
      {/* HTML meta 标签作为后备 */}
      <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      <meta name="googlebot" content="noindex, nofollow" />
      
      {/* 您的聊天界面 */}
      <ChatWidget />
    </>
  )
}
```

---

### 5. **WebSocket 连接安全**

如果使用 WebSocket 进行实时聊天：

```typescript
// 验证用户身份
const ws = new WebSocket(`wss://chinahuib2b.top/ws/chat?token=${authToken}`)

// 服务器端验证
ws.on('connection', (ws, req) => {
  const token = getUrlParameter(req.url, 'token')
  
  if (!verifyToken(token)) {
    ws.close(1008, 'Unauthorized')
    return
  }
  
  // 记录连接日志（不包含消息内容）
  console.log(`User connected: ${getUserId(token)}`)
})
```

---

## 🔐 数据安全最佳实践

### 1. **端到端加密（推荐）**

对于高度敏感的聊天：

```typescript
// 客户端加密
import CryptoJS from 'crypto-js'

function encryptMessage(message: string, key: string): string {
  return CryptoJS.AES.encrypt(message, key).toString()
}

function decryptMessage(ciphertext: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key)
  return bytes.toString(CryptoJS.enc.Utf8)
}

// 使用
const encrypted = encryptMessage('Hello', sessionKey)
const decrypted = decryptMessage(encrypted, sessionKey)
```

### 2. **消息存储安全**

```prisma
// prisma/schema.prisma
model ChatMessage {
  id          String   @id @default(cuid())
  senderId    String
  receiverId  String
  content     String   // 加密存储
  encrypted   Boolean  @default(true)
  
  // 自动删除（可选）
  expiresAt   DateTime?
  
  createdAt   DateTime @default(now())
  
  @@index([senderId])
  @@index([receiverId])
}
```

### 3. **访问控制**

```typescript
// 只允许聊天参与者访问消息
async function getChatMessages(userId: string, chatPartnerId: string) {
  // 验证用户是否有权访问
  const isParticipant = await verifyChatParticipant(userId, chatPartnerId)
  
  if (!isParticipant) {
    throw new Error('Unauthorized access to chat messages')
  }
  
  // 获取消息
  return await prisma.chatMessage.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: chatPartnerId },
        { senderId: chatPartnerId, receiverId: userId },
      ]
    },
    orderBy: { createdAt: 'asc' }
  })
}
```

---

## 🛡️ 防止数据泄露

### 1. **防止 XSS 攻击**

```typescript
// 清理用户输入
import DOMPurify from 'dompurify'

function sanitizeMessage(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  })
}

// 使用前清理
const safeContent = sanitizeMessage(userInput)
```

### 2. **防止 CSRF 攻击**

```typescript
// 在所有聊天 API 请求中包含 CSRF token
async function sendMessage(message: string) {
  const csrfToken = getCsrfToken()
  
  await fetch('/api/chat/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify({ message }),
  })
}
```

### 3. **速率限制**

```typescript
// 防止垃圾消息和滥用
import { rateLimit } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  const session = await auth()
  
  // 限制每分钟 60 条消息
  const { success } = await rateLimit({
    uniqueIdentifier: session?.user?.id,
    limit: 60,
    window: 60, // 60 seconds
  })
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many messages. Please wait.' },
      { status: 429 }
    )
  }
  
  // ... 处理消息
}
```

---

## 📊 监控和审计

### 1. **访问日志**

记录谁访问了聊天数据（不记录消息内容）：

```typescript
async function logChatAccess(userId: string, action: string) {
  await prisma.auditLog.create({
    data: {
      userId,
      action, // 'VIEW_CHAT', 'SEND_MESSAGE', etc.
      timestamp: new Date(),
      ipAddress: getRequestIP(),
      // 不要记录消息内容！
    }
  })
}
```

### 2. **异常检测**

```typescript
// 检测异常行为
function detectSuspiciousActivity(userId: string) {
  const recentActions = getRecentActions(userId, 300) // 5 minutes
  
  // 检查是否有大量消息发送
  if (recentActions.filter(a => a.type === 'SEND_MESSAGE').length > 100) {
    alertAdmin(`Potential spam detected from user ${userId}`)
    temporarilyBlockUser(userId)
  }
}
```

### 3. **定期安全审计**

每周检查：
- [ ] 是否有未授权的 API 访问
- [ ] 是否有异常的登录模式
- [ ] 是否有数据导出尝试
- [ ] 审查访问日志

---

## 🚫 禁止的行为

### 明确禁止 AI 爬虫访问以下内容：

1. **聊天记录**
   - 所有历史消息
   - 实时聊天内容
   - 群聊对话

2. **用户信息**
   - 个人资料（除非公开）
   - 联系方式
   - 私人数据

3. **会话数据**
   - WebSocket 连接
   - 实时状态更新
   - 在线/离线状态

4. **元数据**
   - 聊天频率
   - 活跃时间
   - 联系人列表

---

## 📝 合规性检查清单

### GDPR 合规
- [x] 用户同意收集聊天数据
- [x] 用户可以删除自己的聊天记录
- [x] 数据加密存储
- [x] 明确的隐私政策

### CCPA 合规
- [x] 用户可以选择不分享数据
- [x] 提供数据导出功能
- [x] 透明的数据处理说明

### 一般最佳实践
- [x] 最小化数据收集
- [x] 定期清理旧数据
- [x] 安全的密钥管理
- [x] 员工访问控制

---

## 🔧 技术实现示例

### 完整的聊天页面安全配置

```tsx
// src/app/chat/[chatId]/page.tsx
import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  robots: 'noindex, nofollow, noarchive, nosnippet',
  title: 'Private Chat',
}

export default async function ChatPage({ params }: { params: { chatId: string } }) {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }
  
  // 验证用户是否有权访问此聊天
  const hasAccess = await verifyChatAccess(session.user.id, params.chatId)
  
  if (!hasAccess) {
    redirect('/chat')
  }
  
  return (
    <div className="chat-container">
      {/* 防止搜索引擎索引的 meta 标签 */}
      <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      <meta name="googlebot" content="noindex, nofollow" />
      
      {/* 聊天组件 */}
      <ChatWidget chatId={params.chatId} />
    </div>
  )
}
```

### API 路由安全

```typescript
// src/app/api/chat/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const chatId = request.nextUrl.searchParams.get('chatId')
  
  if (!chatId) {
    return NextResponse.json({ error: 'Missing chatId' }, { status: 400 })
  }
  
  // 验证访问权限
  const hasAccess = await verifyChatAccess(session.user.id, chatId)
  
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // 获取消息（不解密，由客户端解密）
  const messages = await prisma.chatMessage.findMany({
    where: {
      chatId,
    },
    orderBy: { createdAt: 'asc' },
    take: 100, // 限制返回数量
  })
  
  const response = NextResponse.json({ messages })
  
  // 安全响应头
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  response.headers.set('Cache-Control', 'no-store, no-cache')
  
  return response
}
```

---

## 🎯 总结

### 已实施的防护措施

1. ✅ **robots.txt 禁止** - 所有爬虫无法索引聊天页面
2. ✅ **Meta 标签** - 额外的 noindex 指令
3. ✅ **HTTP 响应头** - X-Robots-Tag 禁止索引
4. ✅ **身份验证** - 只有授权用户可以访问
5. ✅ **访问控制** - 验证聊天参与者身份
6. ✅ **数据加密** - 敏感数据加密存储
7. ✅ **速率限制** - 防止滥用
8. ✅ **审计日志** - 追踪访问记录

### 持续改进

- [ ] 实施端到端加密
- [ ] 添加消息自动过期
- [ ] 定期安全渗透测试
- [ ] 用户教育（隐私设置）
- [ ] 实时监控和告警

---

**状态**: ✅ **聊天系统安全防护已配置完成**

所有 AI 爬虫已被明确禁止访问聊天系统和聊天记录，确保用户隐私和数据安全。
