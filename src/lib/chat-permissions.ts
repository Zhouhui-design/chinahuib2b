/**
 * 聊天权限验证系统
 * 
 * 确保AI托管聊天时严格遵守隐私边界
 * 防止访问未授权的私密聊天和群聊
 */

import { redis } from '@/lib/redis'

export interface ChatPermissionCheck {
  userId: string
  chatId: string
  action: 'read' | 'write' | 'admin'
  isAIHosted?: boolean
}

export interface PermissionResult {
  allowed: boolean
  level: 'none' | 'read' | 'write' | 'admin'
  reason?: string
  requiresConsent?: boolean
}

/**
 * 验证用户对聊天的访问权限
 */
export async function verifyChatPermission(
  check: ChatPermissionCheck
): Promise<PermissionResult> {
  const { userId, chatId, action, isAIHosted } = check
  
  // 获取聊天信息
  const chat = await getChatById(chatId)
  if (!chat) {
    return {
      allowed: false,
      level: 'none',
      reason: 'chat_not_found',
    }
  }
  
  // 检查用户是否是聊天参与者
  const isParticipant = await isUserParticipant(userId, chatId)
  if (!isParticipant) {
    // 记录未授权访问尝试
    if (isAIHosted) {
      await logUnauthorizedAccessAttempt({
        userId,
        chatId,
        chatType: chat.type,
        timestamp: new Date(),
      })
    }
    
    return {
      allowed: false,
      level: 'none',
      reason: 'not_participant',
    }
  }
  
  // 对于AI托管模式，进行额外检查
  if (isAIHosted) {
    const aiCheck = await verifyAIHostingPermission(userId, chatId, chat)
    if (!aiCheck.allowed) {
      return aiCheck
    }
  }
  
  // 确定访问级别
  let level: 'read' | 'write' | 'admin' = 'read'
  
  if (chat.ownerId === userId || chat.admins?.includes(userId)) {
    level = 'admin'
  } else if (isParticipant) {
    level = 'write'
  }
  
  // 检查请求的操作是否在权限范围内
  const actionAllowed = isActionAllowed(action, level)
  
  return {
    allowed: actionAllowed,
    level: actionAllowed ? level : 'none',
    reason: actionAllowed ? undefined : 'insufficient_permissions',
  }
}

/**
 * 验证AI托管权限（更严格的检查）
 */
async function verifyAIHostingPermission(
  userId: string,
  chatId: string,
  chat: ChatInfo
): Promise<PermissionResult> {
  // 检查1: 用户是否启用了AI托管
  const hostingConfig = await getAIHostingConfig(userId)
  if (!hostingConfig || !hostingConfig.enabled) {
    return {
      allowed: false,
      level: 'none',
      reason: 'ai_hosting_not_enabled',
    }
  }
  
  // 检查2: 聊天类型是否在允许范围内
  if (chat.type === 'private') {
    if (!hostingConfig.scope.privateChats) {
      return {
        allowed: false,
        level: 'none',
        reason: 'private_chat_hosting_disabled',
      }
    }
  } else if (chat.type === 'group') {
    if (!hostingConfig.scope.groupChats) {
      return {
        allowed: false,
        level: 'none',
        reason: 'group_chat_hosting_disabled',
      }
    }
    
    // 群聊需要额外检查成员同意
    const groupConsent = await checkGroupAIHostingConsent(chatId, userId)
    if (!groupConsent.consented) {
      return {
        allowed: false,
        level: 'none',
        reason: 'group_consent_required',
        requiresConsent: true,
      }
    }
  }
  
  // 检查3: 是否在特定聊天列表中（如果配置了）
  if (
    hostingConfig.scope.specificChats.length > 0 &&
    !hostingConfig.scope.specificChats.includes(chatId)
  ) {
    return {
      allowed: false,
      level: 'none',
      reason: 'chat_not_in_allowed_list',
    }
  }
  
  // 检查4: 强制隐私设置
  if (!hostingConfig.privacySettings.neverAccessOthersChats) {
    // 这个设置应该是强制为true的，如果出现false说明被篡改
    console.error('[SECURITY] Privacy setting violated!', { userId })
    return {
      allowed: false,
      level: 'none',
      reason: 'privacy_violation_detected',
    }
  }
  
  return {
    allowed: true,
    level: 'write',
  }
}

/**
 * 检查群聊成员对AI托管的同意状态
 */
async function checkGroupAIHostingConsent(
  chatId: string,
  requestingUserId: string
): Promise<{ consented: boolean; missingConsentFrom?: string[] }> {
  const chat = await getChatById(chatId)
  if (!chat || chat.type !== 'group') {
    return { consented: false }
  }
  
  // 如果是管理员，可以授权
  if (chat.admins?.includes(requestingUserId)) {
    return { consented: true }
  }
  
  // 获取所有成员
  const members = await getChatMembers(chatId)
  
  // 检查每个成员的同意状态
  const missingConsent: string[] = []
  
  for (const memberId of members) {
    if (memberId === requestingUserId) continue
    
    const hasConsented = await hasMemberConsented(memberId, chatId)
    if (!hasConsented) {
      missingConsent.push(memberId)
    }
  }
  
  return {
    consented: missingConsent.length === 0,
    missingConsentFrom: missingConsent.length > 0 ? missingConsent : undefined,
  }
}

/**
 * 检查操作是否在权限范围内
 */
function isActionAllowed(
  requestedAction: 'read' | 'write' | 'admin',
  userLevel: 'read' | 'write' | 'admin'
): boolean {
  const hierarchy = {
    none: 0,
    read: 1,
    write: 2,
    admin: 3,
  }
  
  return hierarchy[requestedAction] <= hierarchy[userLevel]
}

/**
 * 记录未授权访问尝试
 */
async function logUnauthorizedAccessAttempt(attempt: {
  userId: string
  chatId: string
  chatType: string
  timestamp: Date
}): Promise<void> {
  const key = `security:unauthorized_access:${attempt.userId}`
  
  await redis.lpush(
    key,
    JSON.stringify({
      chatId: attempt.chatId,
      chatType: attempt.chatType,
      timestamp: attempt.timestamp,
    })
  )
  
  // 只保留最近100条
  await redis.ltrim(key, 0, 99)
  await redis.expire(key, 7 * 24 * 60 * 60) // 7天过期
  
  // 检查是否有异常模式
  try {
    const recentAttempts = await redis.llen(key)
    const attemptCount = Number(recentAttempts) || 0
    
    if (attemptCount > 10) {
      // 触发安全告警
      await triggerSecurityAlert({
        userId: attempt.userId,
        type: 'repeated_unauthorized_access',
        count: attemptCount,
      })
    }
  } catch (error) {
    console.error('[Failed to check unauthorized access count]', error)
  }
}

/**
 * 获取用户的AI托管配置
 */
async function getAIHostingConfig(userId: string): Promise<AIHostingConfig | null> {
  const key = `ai:hosting:${userId}`
  const data = await redis.get(key)
  
  if (!data) return null
  
  return JSON.parse(data) as AIHostingConfig
}

/**
 * 检查成员是否同意AI托管
 */
async function hasMemberConsented(memberId: string, chatId: string): Promise<boolean> {
  const key = `chat:consent:${chatId}:${memberId}`
  const consent = await redis.get(key)
  
  return consent === 'granted'
}

// 辅助函数占位符（需要从数据库或其他服务获取）
interface ChatInfo {
  id: string
  type: 'private' | 'group'
  ownerId: string
  admins?: string[]
  participants?: string[]
}

async function getChatById(chatId: string): Promise<ChatInfo | null> {
  // TODO: 从数据库获取
  return null
}

async function isUserParticipant(userId: string, chatId: string): Promise<boolean> {
  // TODO: 从数据库检查
  return false
}

async function getChatMembers(chatId: string): Promise<string[]> {
  // TODO: 从数据库获取
  return []
}

async function triggerSecurityAlert(alert: {
  userId: string
  type: string
  count: number
}): Promise<void> {
  // TODO: 发送告警
  console.warn('[Security Alert]', alert)
}

interface AIHostingConfig {
  userId: string
  enabled: boolean
  scope: {
    privateChats: boolean
    groupChats: boolean
    specificChats: string[]
  }
  rules: {
    autoReplyEnabled: boolean
    maxMessagesPerHour: number
    allowedActions: string[]
    blockKeywords: string[]
  }
  privacySettings: {
    neverAccessOthersChats: boolean
    respectGroupPermissions: boolean
    noCommercialEspionage: boolean
  }
}
