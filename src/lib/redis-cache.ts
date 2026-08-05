/**
 * Redis Cache Layer for x2xhub AI APIs
 * 
 * Provides:
 * - API response caching (marketplace listings, task details)
 * - Rate limiting for AI Agent requests
 * - Session caching for authenticated agents
 * - Distributed lock state (future: migrate from file-based)
 */

export const dynamic = 'force-dynamic'

let redisClient: any = null
let redisAvailable = false

async function getRedis() {
  if (redisClient && redisAvailable) {
    try {
      await redisClient.ping()
      return redisClient
    } catch {
      redisAvailable = false
    }
  }

  try {
    const { createClient } = await import('redis')
    const client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    })

    client.on('error', (err: any) => {
      console.error('[Redis Error]', err.message)
      redisAvailable = false
    })

    await client.connect()
    redisClient = client
    redisAvailable = true
    return client
  } catch (e: any) {
    console.error('[Redis Init Error]', e?.message)
    redisAvailable = false
    return null
  }
}

const CACHE_PREFIX = 'x2xhub:cache:'
const RATE_PREFIX = 'x2xhub:rate:'
const SESSION_PREFIX = 'x2xhub:session:'

const DEFAULT_CACHE_TTL = 300 // 5 minutes

export async function cacheGet(key: string): Promise<string | null> {
  const redis = await getRedis()
  if (!redis) return null

  try {
    const fullKey = `${CACHE_PREFIX}${key}`
    const value = await redis.get(fullKey)
    return value
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds: number = DEFAULT_CACHE_TTL): Promise<boolean> {
  const redis = await getRedis()
  if (!redis) return false

  try {
    const fullKey = `${CACHE_PREFIX}${key}`
    await redis.setEx(fullKey, ttlSeconds, value)
    return true
  } catch {
    return false
  }
}

export async function cacheDelete(key: string): Promise<boolean> {
  const redis = await getRedis()
  if (!redis) return false

  try {
    const fullKey = `${CACHE_PREFIX}${key}`
    await redis.del(fullKey)
    return true
  } catch {
    return false
  }
}

export async function cacheGetJSON<T>(key: string): Promise<T | null> {
  const value = await cacheGet(key)
  if (!value) return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export async function cacheSetJSON(key: string, value: any, ttlSeconds: number = DEFAULT_CACHE_TTL): Promise<boolean> {
  return cacheSet(key, JSON.stringify(value), ttlSeconds)
}

export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = DEFAULT_CACHE_TTL
): Promise<T> {
  const cached = await cacheGetJSON<T>(key)
  if (cached !== null) return cached

  const result = await fetchFn()
  await cacheSetJSON(key, result, ttlSeconds)
  return result
}

export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const redis = await getRedis()
  if (!redis) {
    // If Redis is not available, allow all requests (fail-open)
    return { allowed: true, remaining: limit, resetTime: Math.floor(Date.now() / 1000) + windowSeconds }
  }

  try {
    const rateKey = `${RATE_PREFIX}${identifier}`
    const now = Math.floor(Date.now() / 1000)
    const windowStart = now - windowSeconds

    // Remove old entries and add current request
    await redis.zRemRangeByScore(rateKey, 0, windowStart)
    await redis.zAdd(rateKey, [{ score: now, value: `${now}-${Math.random()}` }])
    await redis.expire(rateKey, windowSeconds + 1)

    const count = await redis.zCard(rateKey)
    const allowed = count <= limit
    const remaining = Math.max(0, limit - count)

    // Get the oldest entry's score for reset time
    const oldest = await redis.zRange(rateKey, 0, 0)
    const resetTime = oldest.length > 0 ? parseInt(oldest[0].split('-')[0]) + windowSeconds : now + windowSeconds

    return { allowed, remaining, resetTime }
  } catch {
    return { allowed: true, remaining: limit, resetTime: Math.floor(Date.now() / 1000) + windowSeconds }
  }
}

export async function setAgentSession(agentId: string, data: any, ttlSeconds: number = 3600): Promise<boolean> {
  const redis = await getRedis()
  if (!redis) return false

  try {
    const sessionKey = `${SESSION_PREFIX}${agentId}`
    await redis.setEx(sessionKey, ttlSeconds, JSON.stringify({
      ...data,
      lastAccess: new Date().toISOString(),
    }))
    return true
  } catch {
    return false
  }
}

export async function getAgentSession(agentId: string): Promise<any> {
  const redis = await getRedis()
  if (!redis) return null

  try {
    const sessionKey = `${SESSION_PREFIX}${agentId}`
    const value = await redis.get(sessionKey)
    if (!value) return null
    return JSON.parse(value)
  } catch {
    return null
  }
}

export async function deleteAgentSession(agentId: string): Promise<boolean> {
  const redis = await getRedis()
  if (!redis) return false

  try {
    const sessionKey = `${SESSION_PREFIX}${agentId}`
    await redis.del(sessionKey)
    return true
  } catch {
    return false
  }
}

export async function isRedisAvailable(): Promise<boolean> {
  const redis = await getRedis()
  return !!redis
}

// Invalidate cache by pattern
export async function invalidateCachePattern(pattern: string): Promise<number> {
  const redis = await getRedis()
  if (!redis) return 0

  try {
    const fullPattern = `${CACHE_PREFIX}${pattern}*`
    const keys = await redis.keys(fullPattern)
    if (keys.length > 0) {
      await redis.del(keys)
    }
    return keys.length
  } catch {
    return 0
  }
}
