/**
 * AI Agent Operation Lock System
 * 
 * 防止监护人和 AI Agent 同时操作同一个资源导致冲突
 * 实现分布式锁机制：AI Agent 开始操作时获取锁，完成后释放
 * 
 * Lock states:
 * - unlocked: 无 AI 操作
 * - locked: AI Agent 正在操作中
 * - cooldown: AI 操作完成，冷却期防止连续冲突
 */

import { redis } from '@/lib/redis'

const LOCK_TTL = 300 // 5 minutes
const COOLDOWN_TTL = 60 // 1 minute cooldown after lock release
const LOCK_PREFIX = 'ai:lock:'

export interface LockInfo {
  locked: boolean
  lockedBy?: string
  lockedAt?: number
  expiresAt?: number
  operation?: string
  cooldownUntil?: number
}

/**
 * Try to acquire a lock for a resource
 * Returns success/failure and lock info
 */
export async function acquireLock(
  resourceType: string,
  resourceId: string,
  agentId: string,
  operation: string
): Promise<{ success: boolean; lock?: LockInfo; message?: string }> {
  const lockKey = `${LOCK_PREFIX}${resourceType}:${resourceId}`
  const now = Date.now()
  const expiresAt = now + LOCK_TTL * 1000

  // Check if resource is in cooldown
  const cooldownKey = `${lockKey}:cooldown`
  const cooldownExpiry = await redis.get(cooldownKey)
  if (cooldownExpiry && parseInt(cooldownExpiry) > now) {
    return {
      success: false,
      message: `Resource is in cooldown period. Try again after ${new Date(parseInt(cooldownExpiry)).toISOString()}`,
      lock: {
        locked: false,
        cooldownUntil: parseInt(cooldownExpiry),
      },
    }
  }

  // Check if already locked by another agent
  const existingLock = await redis.get(lockKey)
  if (existingLock) {
    try {
      const lockData = JSON.parse(existingLock)
      const lockInfo: LockInfo = {
        locked: true,
        lockedBy: lockData.agentId,
        lockedAt: lockData.lockedAt,
        expiresAt: lockData.expiresAt,
        operation: lockData.operation,
      }

      // If locked by the same agent, allow it
      if (lockData.agentId === agentId) {
        return { success: true, lock: lockInfo }
      }

      return {
        success: false,
        message: `Resource is locked by ${lockData.agentId} for ${lockData.operation}. Try again later.`,
        lock: lockInfo,
      }
    } catch {
      // Invalid lock data, force unlock
    }
  }

  // Acquire the lock
  const lockData = {
    agentId,
    operation,
    lockedAt: now,
    expiresAt,
  }

  await redis.setEx(lockKey, LOCK_TTL, JSON.stringify(lockData))

  return {
    success: true,
    lock: {
      locked: true,
      lockedBy: agentId,
      lockedAt: now,
      expiresAt,
      operation,
    },
  }
}

/**
 * Release a lock for a resource
 */
export async function releaseLock(
  resourceType: string,
  resourceId: string,
  agentId: string
): Promise<boolean> {
  const lockKey = `${LOCK_PREFIX}${resourceType}:${resourceId}`

  try {
    const existingLock = await redis.get(lockKey)
    if (!existingLock) return true

    const lockData = JSON.parse(existingLock)
    if (lockData.agentId !== agentId) {
      return false // Cannot release another agent's lock
    }

    // Delete the lock
    await redis.del(lockKey)

    // Set cooldown period
    const cooldownKey = `${lockKey}:cooldown`
    const cooldownUntil = Date.now() + COOLDOWN_TTL * 1000
    await redis.setEx(cooldownKey, COOLDOWN_TTL, String(cooldownUntil))

    return true
  } catch {
    return false
  }
}

/**
 * Get current lock status for a resource
 */
export async function getLockStatus(
  resourceType: string,
  resourceId: string
): Promise<LockInfo> {
  const lockKey = `${LOCK_PREFIX}${resourceType}:${resourceId}`
  const now = Date.now()

  const lockData = await redis.get(lockKey)
  const cooldownKey = `${lockKey}:cooldown`
  const cooldownExpiry = await redis.get(cooldownKey)

  const info: LockInfo = { locked: false }

  if (lockData) {
    try {
      const data = JSON.parse(lockData)
      if (data.expiresAt > now) {
        info.locked = true
        info.lockedBy = data.agentId
        info.lockedAt = data.lockedAt
        info.expiresAt = data.expiresAt
        info.operation = data.operation
      }
    } catch {}
  }

  if (cooldownExpiry && parseInt(cooldownExpiry) > now) {
    info.cooldownUntil = parseInt(cooldownExpiry)
  }

  return info
}

/**
 * Check if a resource can be modified
 * Returns true if no lock exists or lock is expired
 */
export async function canModify(
  resourceType: string,
  resourceId: string
): Promise<{ canModify: boolean; reason?: string }> {
  const status = await getLockStatus(resourceType, resourceId)

  if (status.locked) {
    return {
      canModify: false,
      reason: `Resource is being modified by AI Agent. Please wait.`,
    }
  }

  if (status.cooldownUntil) {
    const waitTime = Math.ceil((status.cooldownUntil - Date.now()) / 1000)
    return {
      canModify: false,
      reason: `Resource just had an AI operation. Please wait ${waitTime} seconds.`,
    }
  }

  return { canModify: true }
}

/**
 * List all currently locked resources
 */
export async function listLocks(): Promise<Array<{ resource: string; lock: LockInfo }>> {
  const keys = await redis.keys(`${LOCK_PREFIX}*`)
  const result: Array<{ resource: string; lock: LockInfo }> = []

  for (const key of keys) {
    if (key.includes(':cooldown')) continue

    const data = await redis.get(key)
    if (data) {
      try {
        const lockData = JSON.parse(data)
        const now = Date.now()

        if (lockData.expiresAt > now) {
          result.push({
            resource: key.replace(LOCK_PREFIX, ''),
            lock: {
              locked: true,
              lockedBy: lockData.agentId,
              lockedAt: lockData.lockedAt,
              expiresAt: lockData.expiresAt,
              operation: lockData.operation,
            },
          })
        }
      } catch {}
    }
  }

  return result
}

/**
 * Force release all locks (admin only)
 */
export async function forceReleaseAllLocks(): Promise<number> {
  const keys = await redis.keys(`${LOCK_PREFIX}*`)
  let count = 0

  for (const key of keys) {
    await redis.del(key)
    count++
  }

  return count
}
