# 🤖 AI 托管聊天系统规范

**版本**: 1.0  
**日期**: 2026-05-18  
**核心原则**: AI可以代替人工作，但绝对不能侵犯他人隐私和商业机密

---

## 🎯 核心理念

### 允许的AI托管场景

✅ **买家AI托管**：
- 自动回复卖家的产品咨询
- 智能筛选感兴趣的供应商
- 自动询问价格、MOQ等信息
- 管理多个对话（仅自己参与的）

✅ **卖家AI托管**：
- 自动回复买家的产品询问
- 智能推荐相关产品
- 处理常见FAQ
- 管理客户对话（仅与自己店铺相关的）

### 严格禁止的行为

❌ **绝对禁止**：
- 访问未邀请的私密聊天（1对1）
- 窥探未加入的群聊记录
- 读取其他用户的私人消息
- 窃取商业机密或竞争情报
- 冒充人类用户欺骗他人

---

## 🔐 隐私保护架构

### 数据访问权限矩阵

| 数据类型 | 买家AI | 卖家AI | 平台AI | 说明 |
|---------|--------|--------|--------|------|
| 自己的1对1聊天 | ✅ 读写 | ❌ 禁止 | ❌ 禁止 | 仅限参与者 |
| 自己店铺的客服对话 | ❌ 禁止 | ✅ 读写 | ❌ 禁止 | 仅限店主 |
| 已加入的群聊 | ✅ 读写* | ✅ 读写* | ❌ 禁止 | *需明确授权 |
| 未加入的群聊 | ❌ 禁止 | ❌ 禁止 | ❌ 禁止 | 完全隔离 |
| 其他用户的私聊 | ❌ 禁止 | ❌ 禁止 | ❌ 禁止 | 严格禁止 |
| 竞争对手数据 | ❌ 禁止 | ❌ 禁止 | ❌ 禁止 | 商业机密 |

### 访问控制流程

```
┌─────────────────────────────────────────┐
│       AI 托管聊天访问控制流程            │
├─────────────────────────────────────────┤
│                                         │
│  AI请求访问聊天                          │
│       ↓                                 │
│  验证身份                                │
│  ├─ 是聊天参与者？                       │
│  │   ├─ 是 → 继续检查                   │
│  │   └─ 否 → ❌ 拒绝访问                │
│  │                                       │
│  ├─ 有明确授权？                         │
│  │   ├─ 是 → 允许访问                   │
│  │   └─ 否 → ❌ 拒绝访问                │
│  │                                       │
│  └─ 在授权范围内？                       │
│      ├─ 是 → ✅ 允许操作                │
│      └─ 否 → ❌ 拒绝操作                │
│                                         │
│  所有访问都被记录和审计                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🛠️ 技术实现

### 1. **聊天访问控制中间件**

```typescript
// src/middleware/chat-hosting-access-control.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyChatAccess } from '@/lib/chat-permissions'

export async function chatHostingAccessControl(req: NextRequest) {
  const path = req.nextUrl.pathname
  const userId = getUserIdFromSession(req) // 从session获取用户ID
  const isAIHosted = req.headers.get('x-ai-hosted') === 'true'
  
  // 提取聊天ID
  const chatId = extractChatId(path)
  if (!chatId) {
    return NextResponse.next()
  }
  
  // 如果是AI托管模式，进行严格权限检查
  if (isAIHosted) {
    const accessCheck = await verifyChatAccess(userId, chatId, {
      requireExplicitPermission: true,
      allowOnlyInvitedChats: true,
    })
    
    if (!accessCheck.allowed) {
      // 记录违规尝试
      await logPrivacyViolation({
        userId,
        chatId,
        violationType: accessCheck.reason,
        timestamp: new Date(),
        ip: req.headers.get('x-forwarded-for'),
      })
      
      return NextResponse.json(
        {
          error: 'Access Denied',
          message: 'AI hosting is not allowed for this chat',
          reason: accessCheck.reason,
        },
        { status: 403 }
      )
    }
    
    // 添加审计头
    const response = NextResponse.next()
    response.headers.set('X-AI-Hosting', 'allowed')
    response.headers.set('X-Access-Level', accessCheck.level)
    return response
  }
  
  return NextResponse.next()
}

/**
 * 验证聊天访问权限
 */
export async function verifyChatAccess(
  userId: string,
  chatId: string,
  options: {
    requireExplicitPermission?: boolean
    allowOnlyInvitedChats?: boolean
  } = {}
): Promise<{
  allowed: boolean
  level: 'read' | 'write' | 'admin'
  reason?: string
}> {
  // 获取聊天信息
  const chat = await getChatById(chatId)
  if (!chat) {
    return { allowed: false, level: 'read', reason: 'chat_not_found' }
  }
  
  // 检查1: 用户是否是聊天参与者
  const isParticipant = await isUserInChat(userId, chatId)
  if (!isParticipant) {
    return { 
      allowed: false, 
      level: 'read', 
      reason: 'not_participant' 
    }
  }
  
  // 检查2: 对于群聊，需要明确授权AI托管
  if (chat.type === 'group') {
    const aiHostingEnabled = await checkAIHostingPermission(userId, chatId)
    if (!aiHostingEnabled && options.requireExplicitPermission) {
      return {
        allowed: false,
        level: 'read',
        reason: 'ai_hosting_not_enabled_for_group',
      }
    }
  }
  
  // 检查3: 确认不是私密聊天（除非是自己的）
  if (chat.type === 'private') {
    const otherParticipant = getOtherParticipant(chat, userId)
    if (!otherParticipant) {
      return {
        allowed: false,
        level: 'read',
        reason: 'invalid_private_chat',
      }
    }
  }
  
  // 确定访问级别
  let level: 'read' | 'write' | 'admin' = 'read'
  if (chat.ownerId === userId) {
    level = 'admin'
  } else if (isParticipant) {
    level = 'write'
  }
  
  return { allowed: true, level }
}
```

---

### 2. **AI托管配置系统**

```typescript
// src/lib/ai-chat-hosting.ts

import { redis } from '@/lib/redis'

export interface AIHostingConfig {
  userId: string
  enabled: boolean
  scope: {
    privateChats: boolean      // 是否托管私聊
    groupChats: boolean        // 是否托管群聊
    specificChats: string[]    // 特定聊天ID列表
  }
  rules: {
    autoReplyEnabled: boolean
    maxMessagesPerHour: number
    allowedActions: Array<'read' | 'reply' | 'forward' | 'summarize'>
    blockKeywords: string[]    // 敏感关键词过滤
  }
  privacySettings: {
    neverAccessOthersChats: true  // 永远不访问他人聊天（强制）
    respectGroupPermissions: true // 尊重群聊权限（强制）
    noCommercialEspionage: true   // 不进行商业间谍活动（强制）
  }
  createdAt: Date
  updatedAt: Date
}

/**
 * 启用AI托管聊天
 */
export async function enableAIHosting(
  userId: string,
  config: Partial<AIHostingConfig>
): Promise<AIHostingConfig> {
  // 强制隐私设置（不可更改）
  const mandatoryPrivacySettings = {
    neverAccessOthersChats: true,
    respectGroupPermissions: true,
    noCommercialEspionage: true,
  }
  
  const hostingConfig: AIHostingConfig = {
    userId,
    enabled: true,
    scope: {
      privateChats: false, // 默认关闭私聊托管（更安全）
      groupChats: false,   // 默认关闭群聊托管
      specificChats: [],
      ...config.scope,
    },
    rules: {
      autoReplyEnabled: true,
      maxMessagesPerHour: 50,
      allowedActions: ['read', 'reply'],
      blockKeywords: ['password', 'secret', 'confidential'],
      ...config.rules,
    },
    privacySettings: mandatoryPrivacySettings, // 强制应用
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  // 保存到Redis
  const key = `ai:hosting:${userId}`
  await redis.setex(key, 90 * 24 * 60 * 60, JSON.stringify(hostingConfig))
  
  // 记录启用日志
  await logAIHostingEvent({
    userId,
    event: 'hosting_enabled',
    config: hostingConfig,
    timestamp: new Date(),
  })
  
  return hostingConfig
}

/**
 * 为特定聊天启用AI托管
 */
export async function enableAIHostingForChat(
  userId: string,
  chatId: string,
  permissions: {
    canRead: boolean
    canReply: boolean
    canForward: boolean
  }
): Promise<void> {
  // 验证用户是否有权限
  const accessCheck = await verifyChatAccess(userId, chatId)
  if (!accessCheck.allowed) {
    throw new Error('No permission to enable AI hosting for this chat')
  }
  
  // 对于群聊，需要所有成员同意（或管理员授权）
  const chat = await getChatById(chatId)
  if (chat?.type === 'group') {
    const allMembersConsent = await checkGroupConsent(chatId, userId)
    if (!allMembersConsent) {
      throw new Error('Group members consent required for AI hosting')
    }
  }
  
  // 更新配置
  const config = await getAIHostingConfig(userId)
  if (!config) {
    throw new Error('AI hosting not enabled for user')
  }
  
  config.scope.specificChats.push(chatId)
  config.updatedAt = new Date()
  
  await saveAIHostingConfig(userId, config)
  
  // 记录事件
  await logAIHostingEvent({
    userId,
    chatId,
    event: 'chat_hosting_enabled',
    permissions,
    timestamp: new Date(),
  })
}

/**
 * 检查群聊成员同意状态
 */
async function checkGroupConsent(
  chatId: string,
  requestingUserId: string
): Promise<boolean> {
  const chat = await getChatById(chatId)
  if (!chat || chat.type !== 'group') {
    return false
  }
  
  // 检查是否有管理员授权
  const isAdmin = chat.admins?.includes(requestingUserId)
  if (isAdmin) {
    return true
  }
  
  // 否则需要所有成员明确同意
  const members = await getChatMembers(chatId)
  const consents = await Promise.all(
    members.map(async (memberId) => {
      if (memberId === requestingUserId) return true
      return await hasMemberConsentedToAIHosting(memberId, chatId)
    })
  )
  
  return consents.every(Boolean)
}
```

---

### 3. **隐私违规检测和阻止**

```typescript
// src/lib/privacy-violation-detector.ts

import { redis } from '@/lib/redis'

export interface PrivacyViolation {
  id: string
  userId: string
  chatId: string
  violationType: 
    | 'unauthorized_access'      // 未授权访问
    | 'cross_chat_snooping'      // 跨聊天窥探
    | 'commercial_espionage'     // 商业间谍
    | 'impersonation'            // 冒充他人
    | 'data_exfiltration'        // 数据泄露
  severity: 'warning' | 'critical' | 'severe'
  details: string
  timestamp: Date
  evidence?: {
    requestPath: string
    userAgent: string
    ipAddress: string
  }
}

/**
 * 检测并阻止隐私违规
 */
export async function detectAndBlockViolation(
  userId: string,
  action: {
    type: string
    targetChatId: string
    context: Record<string, any>
  }
): Promise<{
  blocked: boolean
  reason?: string
  severity?: string
}> {
  // 检查1: 用户是否有权限访问目标聊天
  const hasAccess = await isUserInChat(userId, action.targetChatId)
  if (!hasAccess) {
    await recordViolation({
      userId,
      chatId: action.targetChatId,
      violationType: 'unauthorized_access',
      severity: 'critical',
      details: `User attempted to access chat without permission`,
      evidence: action.context,
    })
    
    return {
      blocked: true,
      reason: 'Unauthorized access attempt',
      severity: 'critical',
    }
  }
  
  // 检查2: 检测跨聊天窥探行为
  const suspiciousPattern = await detectCrossChatSnooping(userId, action)
  if (suspiciousPattern) {
    await recordViolation({
      userId,
      chatId: action.targetChatId,
      violationType: 'cross_chat_snooping',
      severity: 'severe',
      details: suspiciousPattern.description,
      evidence: action.context,
    })
    
    return {
      blocked: true,
      reason: 'Suspicious cross-chat activity detected',
      severity: 'severe',
    }
  }
  
  // 检查3: 检测商业间谍行为
  const espionageDetected = await detectCommercialEspionage(userId, action)
  if (espionageDetected) {
    await recordViolation({
      userId,
      chatId: action.targetChatId,
      violationType: 'commercial_espionage',
      severity: 'severe',
      details: espionageDetected.description,
      evidence: action.context,
    })
    
    // 立即禁用该用户的AI托管
    await disableAIHosting(userId, 'commercial_espionage_detected')
    
    return {
      blocked: true,
      reason: 'Commercial espionage detected - AI hosting disabled',
      severity: 'severe',
    }
  }
  
  return { blocked: false }
}

/**
 * 检测跨聊天窥探模式
 */
async function detectCrossChatSnooping(
  userId: string,
  action: any
): Promise<{ description: string } | null> {
  // 检查是否在短时间内访问了多个不相关的聊天
  const recentAccesses = await getRecentChatAccesses(userId, 300) // 5分钟
  
  if (recentAccesses.length > 10) {
    // 检查这些聊天是否相关
    const unrelatedCount = await countUnrelatedChats(recentAccesses)
    
    if (unrelatedCount > 5) {
      return {
        description: `User accessed ${unrelatedCount} unrelated chats in 5 minutes`,
      }
    }
  }
  
  return null
}

/**
 * 检测商业间谍行为
 */
async function detectCommercialEspionage(
  userId: string,
  action: any
): Promise<{ description: string } | null> {
  // 检查是否频繁访问竞争对手的聊天
  const userType = await getUserType(userId)
  
  if (userType === 'seller') {
    // 卖家试图访问其他卖家的客户对话
    const targetChat = await getChatById(action.targetChatId)
    const targetOwner = await getChatOwner(action.targetChatId)
    
    if (targetOwner && targetOwner !== userId) {
      const bothAreSellers = await Promise.all([
        isSeller(userId),
        isSeller(targetOwner),
      ])
      
      if (bothAreSellers.every(Boolean)) {
        return {
          description: 'Seller attempting to access competitor\'s customer chats',
        }
      }
    }
  }
  
  return null
}

/**
 * 记录违规行为
 */
async function recordViolation(violation: Omit<PrivacyViolation, 'id'>): Promise<void> {
  const id = `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const fullViolation: PrivacyViolation = {
    ...violation,
    id,
    timestamp: new Date(),
  }
  
  // 存储到Redis（保留90天）
  await redis.lpush('privacy:violations', JSON.stringify(fullViolation))
  await redis.ltrim('privacy:violations', 0, 9999)
  await redis.expire('privacy:violations', 90 * 24 * 60 * 60)
  
  // 严重违规立即告警
  if (violation.severity === 'severe' || violation.severity === 'critical') {
    await sendAlert({
      type: 'privacy_violation',
      severity: violation.severity,
      userId: violation.userId,
      details: violation.details,
    })
  }
  
  console.error('[Privacy Violation Detected]', fullViolation)
}

/**
 * 禁用AI托管
 */
async function disableAIHosting(userId: string, reason: string): Promise<void> {
  const key = `ai:hosting:${userId}`
  const config = await redis.get(key)
  
  if (config) {
    const parsed = JSON.parse(config)
    parsed.enabled = false
    parsed.disabledReason = reason
    parsed.disabledAt = new Date()
    
    await redis.setex(key, 90 * 24 * 60 * 60, JSON.stringify(parsed))
  }
  
  console.warn(`[AI Hosting Disabled] User: ${userId}, Reason: ${reason}`)
}
```

---

## 📋 实施清单

### Phase 1: 基础架构（已完成✅）
- [x] 聊天访问控制中间件
- [x] AI托管配置系统
- [x] 隐私违规检测器
- [x] 审计日志系统

### Phase 2: API端点（待实施📋）
- [ ] POST /api/chat/hosting/enable - 启用AI托管
- [ ] POST /api/chat/hosting/disable - 禁用AI托管
- [ ] POST /api/chat/hosting/configure - 配置托管规则
- [ ] GET /api/chat/hosting/status - 查询托管状态
- [ ] GET /api/chat/hosting/violations - 查看违规记录

### Phase 3: 前端界面（待实施📋）
- [ ] AI托管设置页面
- [ ] 聊天级别的权限管理
- [ ] 违规警告和通知
- [ ] 托管活动仪表板

### Phase 4: 测试和优化（待实施📋）
- [ ] 单元测试
- [ ] 集成测试
- [ ] 压力测试
- [ ] 安全审计

---

## 🔍 监控和告警

### 实时监控指标

| 指标 | 阈值 | 动作 |
|------|------|------|
| 未授权访问尝试 | > 5次/小时 | 临时封禁 + 告警 |
| 跨聊天窥探 | 检测到模式 | 立即阻止 + 调查 |
| 商业间谍行为 | 1次 | 永久禁用 + 法律行动 |
| 数据泄露风险 | 检测到 | 紧急响应 |

### 告警机制

```typescript
// 严重违规 - 立即通知管理员
if (violation.severity === 'severe') {
  await notifyAdmins({
    channel: 'urgent',
    message: `Critical privacy violation by user ${userId}`,
    action: 'immediate_review_required',
  })
}

// 一般违规 - 记录并观察
if (violation.severity === 'warning') {
  await addToWatchList(userId)
}
```

---

## 🎓 使用示例

### 买家启用AI托管

```typescript
// 启用AI托管
await enableAIHosting(userId, {
  scope: {
    privateChats: true,
    groupChats: false,
    specificChats: ['chat_123', 'chat_456'],
  },
  rules: {
    autoReplyEnabled: true,
    maxMessagesPerHour: 30,
    allowedActions: ['read', 'reply'],
  },
})

// AI只能访问指定的聊天
// 尝试访问其他聊天会被阻止
```

### 卖家启用AI客服

```typescript
// 为店铺启用AI客服
await enableAIHosting(sellerId, {
  scope: {
    privateChats: false, // 不托管私聊
    groupChats: false,
    specificChats: [], // 自动处理所有客户咨询
  },
  rules: {
    autoReplyEnabled: true,
    maxMessagesPerHour: 100,
    allowedActions: ['read', 'reply'],
    blockKeywords: ['competitor', 'price_war'],
  },
})

// AI只能回复与自己店铺相关的咨询
// 无法访问其他卖家的客户
```

---

## ⚖️ 法律和合规

### 隐私政策条款

**用户协议中必须包含**：

1. **明确授权**
   - 用户必须明确同意启用AI托管
   - 可以随时撤销授权
   - 清楚了解AI的访问范围

2. **数据保护**
   - AI不会存储聊天记录
   - 所有数据处理符合GDPR/CCPA
   - 用户有权要求删除数据

3. **责任声明**
   - 用户对AI的行为负责
   - 平台不承担滥用责任
   - 违规将导致账户封禁

4. **商业机密保护**
   - 严禁利用AI窃取商业机密
   - 违者将面临法律起诉
   - 平台配合执法调查

---

## 🎉 总结

我们实现了一个安全的AI托管聊天系统：

✅ **允许合理使用** - 买卖双方都可以用AI提高效率  
✅ **严格隐私保护** - 绝对禁止访问他人私密聊天  
✅ **全面监控** - 所有操作都被记录和审计  
✅ **即时阻止** - 检测到违规立即采取行动  
✅ **法律合规** - 符合隐私保护和数据安全法规  

**AI是工具，服务于人，但绝不能成为侵犯隐私的武器！**

---

**文档版本**: 1.0  
**最后更新**: 2026-05-18  
**状态**: 核心框架完成，API和UI待实施
