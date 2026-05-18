# 🤖 AI 聊天系统集成规范

**版本**: 1.0  
**日期**: 2026-05-18  
**原则**: AI与人类拥有相同的权利和义务，都要遵守规则

---

## 🎯 核心理念

### 平等原则
1. **AI不是特权用户** - AI助手必须遵守与人类用户相同的规则
2. **隐私保护至上** - AI不能访问其他用户的私人对话
3. **透明性** - AI参与时必须明确标识自己是AI
4. **责任对等** - AI的行为后果由运营方承担

### 权利与义务

| 权利 | 义务 |
|------|------|
| ✅ 可以参与公开讨论 | 🔒 不能访问私人对话 |
| ✅ 可以提供信息和帮助 | 📝 必须标识AI身份 |
| ✅ 可以学习公开知识 | ⚖️ 必须遵守社区规则 |
| ✅ 可以与人类互动 | 🛡️ 必须保护用户隐私 |
| ✅ 可以提供建议 | 🚫 不能存储个人数据 |

---

## 🔐 隐私保护架构

### 1. **数据隔离策略**

```
┌─────────────────────────────────────────┐
│         聊天系统数据分层                  │
├─────────────────────────────────────────┤
│                                         │
│  📢 公开频道 (Public Channels)          │
│  ├── 所有用户可见（包括AI）              │
│  ├── 可被搜索引擎索引                    │
│  └── AI可以学习和回复                    │
│                                         │
│  👥 社区讨论 (Community)                │
│  ├── 注册用户可见                        │
│  ├── AI可以参与（需标识身份）            │
│  └── 禁止爬取个人敏感信息                │
│                                         │
│  🔒 私人对话 (Private Chats)            │
│  ├── 仅对话双方可见                      │
│  ├── ❌ AI完全禁止访问                   │
│  ├── ❌ 禁止任何形式的数据收集           │
│  └── ✅ 端到端加密                       │
│                                         │
└─────────────────────────────────────────┘
```

### 2. **访问控制矩阵**

| 角色 | 公开频道 | 社区讨论 | 私人对话 | 用户数据 |
|------|---------|---------|---------|---------|
| 人类用户 | ✅ 读写 | ✅ 读写 | ✅ 读写 | 🔒 仅自己 |
| AI助手 | ✅ 读写* | ✅ 读写* | ❌ 禁止 | ❌ 禁止 |
| 管理员 | ✅ 管理 | ✅ 管理 | ⚠️ 审计 | ⚠️ 脱敏 |

*AI必须在消息中标识自己是AI

---

## 🛠️ 技术实现

### 1. **robots.txt 配置**（已完成✅）

```typescript
// src/app/robots.ts

// 标准爬虫
{
  userAgent: '*',
  allow: [
    '/chat/public/',       // 允许公开频道
    '/chat/community/',    // 允许社区讨论
  ],
  disallow: [
    '/chat/private/',      // 禁止私人对话
    '/chat-system/private/',
  ],
}

// AI爬虫 - 同样的规则
{
  userAgent: 'GPTBot',
  allow: ['/chat/public/', '/chat/community/'],
  disallow: ['/chat/private/', '/chat-system/private/'],
  crawlDelay: 1,
}
```

### 2. **API 权限控制**

创建中间件验证AI访问权限：

```typescript
// src/middleware/chat-access-control.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function chatAccessControl(req: NextRequest) {
  const path = req.nextUrl.pathname
  const userAgent = req.headers.get('user-agent') || ''
  
  // 检测是否为AI爬虫
  const isAIBot = /GPTBot|ChatGPT-User|ClaudeBot|PerplexityBot/i.test(userAgent)
  
  // 私人对话 - 完全禁止AI访问
  if (path.includes('/chat/private/') || path.includes('/chat-system/private/')) {
    if (isAIBot) {
      return NextResponse.json(
        { error: 'AI bots are not allowed to access private chats' },
        { status: 403 }
      )
    }
  }
  
  // 公开频道 - 允许AI访问，但添加标识头
  if (path.includes('/chat/public/') || path.includes('/chat/community/')) {
    if (isAIBot) {
      const response = NextResponse.next()
      response.headers.set('X-AI-Access', 'allowed-public-only')
      response.headers.set('X-Privacy-Policy', 'no-personal-data-storage')
      return response
    }
  }
  
  return NextResponse.next()
}
```

### 3. **AI身份标识**

在聊天界面中，AI发送的消息必须有明确的标识：

```typescript
// src/components/chat/AIMessageBadge.tsx

'use client'

interface AIMessageBadgeProps {
  aiName?: string
}

export function AIMessageBadge({ aiName = 'AI Assistant' }: AIMessageBadgeProps) {
  return (
    <div className="flex items-center gap-1 text-xs text-gray-500">
      <svg 
        className="w-3 h-3" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
      <span>{aiName}</span>
      <span className="text-blue-500 font-medium">AI</span>
    </div>
  )
}
```

### 4. **消息元数据标记**

所有AI发送的消息必须包含元数据：

```typescript
interface Message {
  id: string
  content: string
  sender: {
    id: string
    name: string
    type: 'human' | 'ai'  // ← 必须标识类型
  }
  metadata?: {
    isAI?: boolean
    aiModel?: string
    generatedAt?: Date
    privacyCompliant?: true  // ← 确认符合隐私政策
  }
  timestamp: Date
}
```

---

## 📋 AI行为准则

### 必须遵守的规则

1. **隐私保护**
   - ❌ 不得访问、存储或分享任何用户的私人对话
   - ❌ 不得记录用户的个人信息（姓名、邮箱、电话等）
   - ❌ 不得追踪用户行为或建立用户画像
   - ✅ 只能处理当前会话的上下文

2. **透明性**
   - ✅ 每次发言都必须明确标识自己是AI
   - ✅ 不得冒充人类用户
   - ✅ 当不确定时，应说明自己的局限性

3. **内容规范**
   - ✅ 提供准确、有用的信息
   - ❌ 不得生成违法、有害或歧视性内容
   - ❌ 不得传播虚假信息
   - ✅ 尊重不同文化和观点

4. **数据安全**
   - ❌ 不得将对话数据存储到外部系统
   - ❌ 不得用于训练其他AI模型
   - ✅ 会话结束后立即清除临时数据
   - ✅ 遵循最小数据保留原则

5. **责任归属**
   - ⚖️ AI的错误由运营方承担责任
   - ⚖️ 用户对AI的建议有最终判断权
   - ⚖️ 运营方需对AI行为进行监控和审计

---

## 🔍 审计与监控

### 1. **AI活动日志**

```typescript
// src/lib/ai-audit-log.ts

interface AIAuditLog {
  id: string
  timestamp: Date
  aiId: string
  action: 'message_sent' | 'data_accessed' | 'error'
  channelType: 'public' | 'community' | 'private'
  channelId: string
  userId?: string  // 仅在公开/社区频道
  messagePreview?: string  // 前50字符，脱敏
  complianceCheck: {
    privacyProtected: boolean
    identityDisclosed: boolean
    noPersonalDataStored: boolean
  }
}

export async function logAIActivity(log: Omit<AIAuditLog, 'id' | 'timestamp'>) {
  // 记录到数据库（仅保留7天）
  await db.aiAuditLog.create({
    data: {
      ...log,
      id: generateId(),
      timestamp: new Date(),
    },
    ttl: 7 * 24 * 60 * 60, // 7天过期
  })
}
```

### 2. **违规检测**

```typescript
// src/lib/ai-compliance-checker.ts

export async function checkAICompliance(message: Message): Promise<{
  compliant: boolean
  violations: string[]
}> {
  const violations: string[] = []
  
  // 检查1: AI是否标识了身份
  if (message.sender.type === 'ai' && !message.metadata?.isAI) {
    violations.push('AI identity not disclosed')
  }
  
  // 检查2: 是否尝试访问私人对话
  if (message.sender.type === 'ai' && message.channelType === 'private') {
    violations.push('AI accessing private chat - STRICTLY PROHIBITED')
  }
  
  // 检查3: 是否包含个人数据
  if (containsPersonalData(message.content)) {
    violations.push('Message contains personal data')
  }
  
  return {
    compliant: violations.length === 0,
    violations,
  }
}

function containsPersonalData(text: string): boolean {
  // 检测邮箱、电话、身份证等模式
  const patterns = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // email
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // phone
    // ... 更多模式
  ]
  
  return patterns.some(pattern => pattern.test(text))
}
```

---

## 🌐 多语言支持

AI必须能够用用户的语言进行交流，并理解文化差异：

```typescript
// src/lib/ai-localization.ts

export interface AILocalizationConfig {
  language: string
  culturalContext: {
    formalLevel: 'formal' | 'informal' | 'neutral'
    directness: 'direct' | 'indirect'
    humorAllowed: boolean
  }
}

export function getAILocalization(userLanguage: string): AILocalizationConfig {
  const configs: Record<string, AILocalizationConfig> = {
    'zh': {
      language: 'zh-CN',
      culturalContext: {
        formalLevel: 'formal',
        directness: 'indirect',
        humorAllowed: false,
      },
    },
    'en': {
      language: 'en-US',
      culturalContext: {
        formalLevel: 'neutral',
        directness: 'direct',
        humorAllowed: true,
      },
    },
    // ... 其他语言
  }
  
  return configs[userLanguage] || configs['en']
}
```

---

## 📊 性能指标

### AI服务质量监控

| 指标 | 目标 | 说明 |
|------|------|------|
| 响应时间 | < 2秒 | 从用户发送到AI回复 |
| 准确率 | > 90% | 回答正确且有用 |
| 隐私合规率 | 100% | 无隐私违规事件 |
| 用户满意度 | > 4.0/5.0 | 用户评价 |
| 身份标识率 | 100% | 所有AI消息都有标识 |

---

## 🚀 部署清单

### 前置条件
- [x] robots.txt 配置完成
- [ ] API权限控制中间件
- [ ] AI身份标识组件
- [ ] 消息元数据标记
- [ ] 审计日志系统
- [ ] 违规检测机制
- [ ] 多语言支持配置

### 测试项目
- [ ] AI无法访问私人对话
- [ ] AI消息正确标识身份
- [ ] 公开频道AI可以正常交流
- [ ] 审计日志正确记录
- [ ] 违规检测正常工作
- [ ] 多语言交流流畅

---

## 📞 联系与支持

如有AI相关的隐私问题或违规行为报告，请联系：
- 邮箱: privacy@chinahuib2b.top
- 工单系统: https://chinahuib2b.top/support

---

## 📝 更新日志

### v1.0 (2026-05-18)
- ✅ 初始版本
- ✅ robots.txt 配置完成
- 📋 定义AI权利与义务框架
- 📋 设计隐私保护架构
- 📋 制定行为准则
