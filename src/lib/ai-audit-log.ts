import { redis } from '@/lib/redis'

/**
 * AI活动审计日志
 * 
 * 用于监控和审计AI在聊天系统中的行为，确保遵守隐私保护规则
 */

export interface AIAuditLog {
  id: string
  timestamp: Date
  aiId: string
  action: 'message_sent' | 'data_accessed' | 'error' | 'privacy_violation_attempt'
  channelType: 'public' | 'community' | 'private'
  channelId: string
  userId?: string  // 仅在公开/社区频道记录（脱敏）
  messagePreview?: string  // 前50字符，脱敏处理
  complianceCheck: {
    privacyProtected: boolean
    identityDisclosed: boolean
    noPersonalDataStored: boolean
  }
  metadata?: Record<string, any>
}

const redisClient = redis

/**
 * 记录AI活动
 */
export async function logAIActivity(log: Omit<AIAuditLog, 'id' | 'timestamp'>): Promise<void> {
  try {
    const id = `ai_log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const auditLog: AIAuditLog = {
      ...log,
      id,
      timestamp: new Date(),
    }
    
    // 存储到Redis，设置7天过期时间
    const key = `ai:audit:${id}`
    await redisClient.setex(
      key,
      7 * 24 * 60 * 60, // 7天
      JSON.stringify(auditLog)
    )
    
    // 同时添加到最近活动列表（仅保留最近100条）
    await redisClient.lpush('ai:audit:recent', JSON.stringify(auditLog))
    await redisClient.ltrim('ai:audit:recent', 0, 99)
    
    // 如果是违规尝试，单独记录
    if (log.action === 'privacy_violation_attempt') {
      await redisClient.lpush('ai:audit:violations', JSON.stringify(auditLog))
      await redisClient.ltrim('ai:audit:violations', 0, 999) // 保留更多违规记录
      
      console.warn('[AI Privacy Violation Attempt]', {
        aiId: log.aiId,
        channelType: log.channelType,
        channelId: log.channelId,
      })
    }
  } catch (error) {
    console.error('[Failed to log AI activity]', error)
    // 不抛出错误，避免影响主流程
  }
}

/**
 * 获取最近的AI活动日志
 */
export async function getRecentAILogs(limit: number = 50): Promise<AIAuditLog[]> {
  try {
    const logs = await redisClient.lrange('ai:audit:recent', 0, limit - 1)
    if (!logs || !Array.isArray(logs)) return []
    return (logs as string[]).map((log: string) => JSON.parse(log) as AIAuditLog)
  } catch (error) {
    console.error('[Failed to get recent AI logs]', error)
    return []
  }
}

/**
 * 获取AI违规记录
 */
export async function getAIViolations(limit: number = 100): Promise<AIAuditLog[]> {
  try {
    const violations = await redisClient.lrange('ai:audit:violations', 0, limit - 1)
    if (!violations || !Array.isArray(violations)) return []
    return (violations as string[]).map((v: string) => JSON.parse(v) as AIAuditLog)
  } catch (error) {
    console.error('[Failed to get AI violations]', error)
    return []
  }
}

/**
 * 获取特定AI的活动统计
 */
export async function getAIStats(aiId: string): Promise<{
  totalMessages: number
  totalAccesses: number
  violationCount: number
  lastActive: Date | null
}> {
  try {
    const key = `ai:stats:${aiId}`
    const stats = await redisClient.hgetall(key)
    
    if (!stats || typeof stats !== 'object') {
      return {
        totalMessages: 0,
        totalAccesses: 0,
        violationCount: 0,
        lastActive: null,
      }
    }
    
    const statsObj = stats as Record<string, string>
    
    return {
      totalMessages: parseInt(statsObj.totalMessages || '0'),
      totalAccesses: parseInt(statsObj.totalAccesses || '0'),
      violationCount: parseInt(statsObj.violationCount || '0'),
      lastActive: statsObj.lastActive ? new Date(statsObj.lastActive) : null,
    }
  } catch (error) {
    console.error('[Failed to get AI stats]', error)
    return {
      totalMessages: 0,
      totalAccesses: 0,
      violationCount: 0,
      lastActive: null,
    }
  }
}

/**
 * 更新AI统计信息
 */
export async function updateAIStats(
  aiId: string,
  action: 'message_sent' | 'data_accessed' | 'violation'
): Promise<void> {
  try {
    const key = `ai:stats:${aiId}`
    
    if (action === 'message_sent') {
      await redisClient.hincrby(key, 'totalMessages', 1)
    } else if (action === 'data_accessed') {
      await redisClient.hincrby(key, 'totalAccesses', 1)
    } else if (action === 'violation') {
      await redisClient.hincrby(key, 'violationCount', 1)
    }
    
    await redisClient.hset(key, 'lastActive', new Date().toISOString())
    await redisClient.expire(key, 30 * 24 * 60 * 60) // 30天过期
  } catch (error) {
    console.error('[Failed to update AI stats]', error)
  }
}

/**
 * 清理过期的审计日志（定时任务调用）
 */
export async function cleanupOldAuditLogs(): Promise<void> {
  try {
    // Redis已设置TTL，会自动清理
    // 这里可以添加额外的清理逻辑
    console.log('[AI Audit Logs Cleanup] TTL-based cleanup is automatic')
  } catch (error) {
    console.error('[Failed to cleanup audit logs]', error)
  }
}
