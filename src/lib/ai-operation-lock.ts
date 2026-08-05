/**
 * AI Agent Operation Lock System
 * 
 * Prevents conflicts between human and AI agents
 * Uses file-based locking with TTL (no Redis dependency)
 * 
 * Lock hierarchy:
 * 1. Resource-level lock: {resourceType}:{resourceId}
 * 2. Agent-level lock: Per-agent cooldown
 * 3. Global lock: System-wide maintenance mode
 */

import { writeFile, readFile, mkdir, unlink, readdir } from 'fs/promises'
import { join } from 'path'
import crypto from 'crypto'

const LOCK_DIR = '/tmp/x2xhub-locks'
const DEFAULT_TTL = 300 // 5 minutes
const COOLDOWN_PER_AGENT = 100 // 100ms between operations per agent

interface LockInfo {
  id: string
  resourceType: string
  resourceId: string
  agentId: string
  agentRole: 'human' | 'ai'
  operation: string
  acquiredAt: number
  expiresAt: number
}

interface LockCheckResult {
  locked: boolean
  lock?: LockInfo
  canProceed: boolean
  reason?: string
}

async function ensureLockDir(): Promise<void> {
  try {
    await mkdir(LOCK_DIR, { recursive: true })
  } catch {}
}

function getLockFilePath(resourceType: string, resourceId: string): string {
  const key = `${resourceType}:${resourceId}`
  const hash = crypto.createHash('md5').update(key).digest('hex')
  return join(LOCK_DIR, `${hash}.lock`)
}

function getAgentCooldownPath(agentId: string): string {
  const hash = crypto.createHash('md5').update(`agent:${agentId}`).digest('hex')
  return join(LOCK_DIR, `agent-${hash}.lock`)
}

export async function acquireLock(
  resourceType: string,
  resourceId: string,
  agentId: string,
  agentRole: 'human' | 'ai',
  operation: string,
  ttlMs: number = DEFAULT_TTL * 1000
): Promise<{ success: boolean; lock?: LockInfo; message?: string }> {
  await ensureLockDir()

  // Check agent cooldown first
  const cooldownPath = getAgentCooldownPath(agentId)
  try {
    const cooldownData = await readFile(cooldownPath, 'utf-8')
    const lastOpTime = parseInt(cooldownData)
    const elapsed = Date.now() - lastOpTime
    if (elapsed < COOLDOWN_PER_AGENT) {
      return {
        success: false,
        message: `Agent cooldown: ${COOLDOWN_PER_AGENT - elapsed}ms remaining`,
      }
    }
  } catch {}

  // Check global maintenance lock
  const globalLockPath = join(LOCK_DIR, 'global.lock')
  try {
    const globalData = JSON.parse(await readFile(globalLockPath, 'utf-8'))
    if (globalData.expiresAt > Date.now()) {
      return {
        success: false,
        message: 'System in maintenance mode',
      }
    }
  } catch {}

  const lockPath = getLockFilePath(resourceType, resourceId)

  // Check existing lock
  try {
    const existingLock = JSON.parse(await readFile(lockPath, 'utf-8')) as LockInfo
    if (existingLock.expiresAt > Date.now()) {
      // Lock still active
      if (existingLock.agentId === agentId) {
        // Same agent can extend
        existingLock.expiresAt = Date.now() + ttlMs
        await writeFile(lockPath, JSON.stringify(existingLock), { mode: 0o644 })
        return { success: true, lock: existingLock }
      }

      // Different agent - check if conflict allowed
      if (agentRole === 'ai' && existingLock.agentRole === 'ai') {
        // AI vs AI: block
        return {
          success: false,
          message: `Resource locked by another AI agent. Lock expires in ${Math.ceil((existingLock.expiresAt - Date.now()) / 1000)}s`,
        }
      }

      if (agentRole === 'human' && existingLock.agentRole === 'human') {
        // Human vs Human: allow (last-write-wins)
      }

      // Human vs AI: allow human to override
      if (agentRole === 'human' && existingLock.agentRole === 'ai') {
        // Allow human to break AI lock
      }

      // AI trying to override human: block
      if (agentRole === 'ai' && existingLock.agentRole === 'human') {
        return {
          success: false,
          message: 'Resource is being edited by a human. AI agent cannot override human operations.',
        }
      }
    }
  } catch {
    // No existing lock or expired - proceed
  }

  // Acquire lock
  const now = Date.now()
  const lock: LockInfo = {
    id: crypto.randomUUID(),
    resourceType,
    resourceId,
    agentId,
    agentRole,
    operation,
    acquiredAt: now,
    expiresAt: now + ttlMs,
  }

  try {
    await writeFile(lockPath, JSON.stringify(lock), { mode: 0o644 })
    await writeFile(cooldownPath, String(now), { mode: 0o644 })
    return { success: true, lock }
  } catch (e: any) {
    return { success: false, message: `Failed to acquire lock: ${e.message}` }
  }
}

export async function releaseLock(resourceType: string, resourceId: string, agentId: string): Promise<{ success: boolean }> {
  const lockPath = getLockFilePath(resourceType, resourceId)
  try {
    const lock = JSON.parse(await readFile(lockPath, 'utf-8')) as LockInfo
    if (lock.agentId === agentId) {
      await unlink(lockPath)
    }
    return { success: true }
  } catch {
    return { success: true } // Already released or expired
  }
}

export async function checkLock(resourceType: string, resourceId: string): Promise<LockCheckResult> {
  const lockPath = getLockFilePath(resourceType, resourceId)
  try {
    const lock = JSON.parse(await readFile(lockPath, 'utf-8')) as LockInfo
    if (lock.expiresAt > Date.now()) {
      return {
        locked: true,
        lock,
        canProceed: false,
        reason: `Resource locked by ${lock.agentRole} agent ${lock.agentId.slice(0, 8)}...`,
      }
    }
    // Expired - clean up
    try { await unlink(lockPath) } catch {}
  } catch {}

  return { locked: false, canProceed: true }
}

export async function setGlobalLock(durationMs: number, reason: string): Promise<void> {
  await ensureLockDir()
  const globalLockPath = join(LOCK_DIR, 'global.lock')
  await writeFile(globalLockPath, JSON.stringify({
    expiresAt: Date.now() + durationMs,
    reason,
  }), { mode: 0o644 })
}

export async function releaseGlobalLock(): Promise<void> {
  const globalLockPath = join(LOCK_DIR, 'global.lock')
  try { await unlink(globalLockPath) } catch {}
}

export async function getActiveLocks(): Promise<LockInfo[]> {
  await ensureLockDir()
  const files = await readdir(LOCK_DIR)
  const locks: LockInfo[] = []

  for (const file of files) {
    if (!file.endsWith('.lock') || file === 'global.lock') continue
    try {
      const data = await readFile(join(LOCK_DIR, file), 'utf-8')
      const lock = JSON.parse(data)
      if (lock.expiresAt > Date.now()) {
        locks.push(lock)
      }
    } catch {}
  }

  return locks
}

// Cleanup expired locks (call periodically)
export async function cleanupExpiredLocks(): Promise<number> {
  await ensureLockDir()
  const files = await readdir(LOCK_DIR)
  let cleaned = 0

  for (const file of files) {
    if (!file.endsWith('.lock') || file === 'global.lock') continue
    try {
      const data = await readFile(join(LOCK_DIR, file), 'utf-8')
      const lock = JSON.parse(data)
      if (lock.expiresAt <= Date.now()) {
        await unlink(join(LOCK_DIR, file))
        cleaned++
      }
    } catch {
      // Corrupt file, remove it
      try { await unlink(join(LOCK_DIR, file)) } catch {}
      cleaned++
    }
  }

  return cleaned
}
