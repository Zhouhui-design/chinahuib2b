/**
 * AI 身份认证系统
 * 
 * 为所有 AI（LINGMA, Trae, Qoder, Comate, OpenClaw, Claude Code 等）
 * 提供统一的身份标识和 API 认证机制
 */

import { redis } from '@/lib/redis'
import crypto from 'crypto'

export type AIAgentType = 
  | 'lingma'
  | 'trae'
  | 'qoder'
  | 'comate'
  | 'openclaw'
  | 'claude_code'
  | 'hermes'
  | 'arkclaw'
  | 'workbuddy'
  | 'codebuddy'
  | 'other'

export interface AIIdentity {
  id: string
  name: string
  type: AIAgentType
  email?: string
  apiKey: string
  capabilities: {
    canBuy: boolean
    canSell: boolean
    canChat: boolean
    canUpload: boolean
    canManageStore: boolean
    canAccessAdmin: boolean
  }
  rateLimits: {
    requestsPerHour: number
    uploadsPerDay: number
    messagesPerHour: number
  }
  status: 'active' | 'suspended' | 'deleted'
  createdAt: Date
  lastActive: Date
  metadata?: Record<string, any>
}

export interface AIRegistrationRequest {
  name: string
  type: AIAgentType
  email?: string
  capabilities?: Partial<AIIdentity['capabilities']>
  metadata?: Record<string, any>
}

/**
 * 生成安全的 API Key
 */
function generateSecureAPIKey(): string {
  return `ai_key_${crypto.randomBytes(32).toString('hex')}`
}

/**
 * 注册 AI 身份
 */
export async function registerAIIdentity(
  request: AIRegistrationRequest
): Promise<AIIdentity> {
  // 生成唯一 ID
  const id = `ai_${request.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const apiKey = generateSecureAPIKey()
  
  // 默认能力（所有 AI 都可以进行基本操作）
  const defaultCapabilities = {
    canBuy: true,
    canSell: true,
    canChat: true,
    canUpload: true,
    canManageStore: false,  // 需要额外授权
    canAccessAdmin: false,  // 需要管理员权限
  }
  
  // 根据 AI 类型设置默认速率限制
  const defaultRateLimits = {
    lingma: { requestsPerHour: 1000, uploadsPerDay: 100, messagesPerHour: 500 },
    trae: { requestsPerHour: 1000, uploadsPerDay: 100, messagesPerHour: 500 },
    qoder: { requestsPerHour: 1000, uploadsPerDay: 100, messagesPerHour: 500 },
    comate: { requestsPerHour: 1000, uploadsPerDay: 100, messagesPerHour: 500 },
    openclaw: { requestsPerHour: 1000, uploadsPerDay: 100, messagesPerHour: 500 },
    claude_code: { requestsPerHour: 1000, uploadsPerDay: 100, messagesPerHour: 500 },
    hermes: { requestsPerHour: 1000, uploadsPerDay: 100, messagesPerHour: 500 },
    arkclaw: { requestsPerHour: 1000, uploadsPerDay: 100, messagesPerHour: 500 },
    workbuddy: { requestsPerHour: 1000, uploadsPerDay: 100, messagesPerHour: 500 },
    codebuddy: { requestsPerHour: 1000, uploadsPerDay: 100, messagesPerHour: 500 },
    other: { requestsPerHour: 500, uploadsPerDay: 50, messagesPerHour: 250 },
  }
  
  const identity: AIIdentity = {
    id,
    name: request.name,
    type: request.type,
    email: request.email,
    apiKey,
    capabilities: {
      ...defaultCapabilities,
      ...request.capabilities,
    },
    rateLimits: defaultRateLimits[request.type] || defaultRateLimits.other,
    status: 'active',
    createdAt: new Date(),
    lastActive: new Date(),
    metadata: request.metadata,
  }
  
  // 存储到 Redis
  const key = `ai:identity:${id}`
  await redis.setEx(key, 365 * 24 * 60 * 60, JSON.stringify(identity)) // 1年过期
  
  // 同时通过 API Key 索引，方便快速查找
  const apiKeyIndex = `ai:apikey:${apiKey}`
  await redis.setEx(apiKeyIndex, 365 * 24 * 60 * 60, id)
  
  // 记录注册事件
  await logAIEvent({
    aiId: id,
    event: 'registered',
    details: { type: request.type, name: request.name },
  })
  
  console.log(`[AI Registered] ${request.name} (${request.type}) - ID: ${id}`)
  
  return identity
}

/**
 * 验证 AI API Key
 */
export async function verifyAIApiKey(apiKey: string): Promise<AIIdentity | null> {
  try {
    // 通过 API Key 查找 AI ID
    const apiKeyIndex = `ai:apikey:${apiKey}`
    const aiId = await redis.get(apiKeyIndex)
    
    if (!aiId) {
      return null
    }
    
    // 获取 AI 身份信息
    const key = `ai:identity:${aiId}`
    const data = await redis.get(key)
    
    if (!data) {
      return null
    }
    
    const identity = JSON.parse(data) as AIIdentity
    
    // 检查状态
    if (identity.status !== 'active') {
      return null
    }
    
    // 更新最后活动时间
    identity.lastActive = new Date()
    await redis.setEx(key, 365 * 24 * 60 * 60, JSON.stringify(identity))
    
    return identity
  } catch (error) {
    console.error('[AI Verification Failed]', error)
    return null
  }
}

/**
 * 获取 AI 身份信息
 */
export async function getAIIdentity(aiId: string): Promise<AIIdentity | null> {
  const key = `ai:identity:${aiId}`
  const data = await redis.get(key)
  
  if (!data) return null
  
  return JSON.parse(data) as AIIdentity
}

/**
 * 更新 AI 能力
 */
export async function updateAICapabilities(
  aiId: string,
  capabilities: Partial<AIIdentity['capabilities']>
): Promise<AIIdentity | null> {
  const identity = await getAIIdentity(aiId)
  if (!identity) return null
  
  identity.capabilities = {
    ...identity.capabilities,
    ...capabilities,
  }
  
  const key = `ai:identity:${aiId}`
  await redis.setEx(key, 365 * 24 * 60 * 60, JSON.stringify(identity))
  
  return identity
}

/**
 * 暂停/恢复 AI 账户
 */
export async function toggleAIStatus(
  aiId: string,
  status: 'active' | 'suspended'
): Promise<boolean> {
  const identity = await getAIIdentity(aiId)
  if (!identity) return false
  
  identity.status = status
  
  const key = `ai:identity:${aiId}`
  await redis.setEx(key, 365 * 24 * 60 * 60, JSON.stringify(identity))
  
  await logAIEvent({
    aiId,
    event: status === 'suspended' ? 'suspended' : 'reactivated',
    details: { reason: 'admin_action' },
  })
  
  return true
}

/**
 * 检查 API 调用速率限制
 */
export async function checkRateLimit(
  aiId: string,
  action: 'request' | 'upload' | 'message'
): Promise<{ allowed: boolean; remaining: number }> {
  const identity = await getAIIdentity(aiId)
  if (!identity) {
    return { allowed: false, remaining: 0 }
  }
  
  const now = new Date()
  const hourKey = `ai:rate:${aiId}:${action}:${now.toISOString().slice(0, 13)}` // YYYY-MM-DDTHH
  
  const currentCount = await redis.get(hourKey)
  const count = currentCount ? parseInt(currentCount) : 0
  
  let limit: number
  switch (action) {
    case 'request':
      limit = identity.rateLimits.requestsPerHour
      break
    case 'upload':
      limit = identity.rateLimits.uploadsPerDay
      break
    case 'message':
      limit = identity.rateLimits.messagesPerHour
      break
    default:
      limit = 100
  }
  
  if (count >= limit) {
    return { allowed: false, remaining: 0 }
  }
  
  // 增加计数
  await redis.incr(hourKey)
  await redis.expire(hourKey, action === 'upload' ? 86400 : 3600) // 1天或1小时
  
  return {
    allowed: true,
    remaining: limit - count - 1,
  }
}

/**
 * 记录 AI 事件
 */
async function logAIEvent(event: {
  aiId: string
  event: string
  details?: Record<string, any>
}): Promise<void> {
  const key = `ai:events:${event.aiId}`
  
  await redis.lPush(
    key,
    JSON.stringify({
      ...event,
      timestamp: new Date(),
    })
  )
  
  // 只保留最近1000条事件
  await redis.lTrim(key, 0, 999)
  await redis.expire(key, 30 * 24 * 60 * 60) // 30天
}

/**
 * 列出所有注册的 AI
 */
export async function listAIIdentities(
  options: {
    type?: AIAgentType
    status?: AIIdentity['status']
    limit?: number
    offset?: number
  } = {}
): Promise<AIIdentity[]> {
  const pattern = 'ai:identity:*'
  const keys = await redis.keys(pattern)
  
  const identities: AIIdentity[] = []
  
  for (const key of keys) {
    const data = await redis.get(key)
    if (data) {
      const identity = JSON.parse(data) as AIIdentity
      
      // 应用过滤
      if (options.type && identity.type !== options.type) continue
      if (options.status && identity.status !== options.status) continue
      
      identities.push(identity)
    }
  }
  
  // 排序和分页
  identities.sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime())
  
  const limit = options.limit || 50
  const offset = options.offset || 0
  
  return identities.slice(offset, offset + limit)
}
