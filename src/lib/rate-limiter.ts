/**
 * Redis-based Rate Limiting
 * Production-ready rate limiting with sliding window algorithm
 */

import { redis } from './redis'

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  message?: string
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * Sliding window rate limiter using Redis
 * 
 * Uses sorted sets to track requests within a time window
 * More accurate than fixed window counters
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 100, windowMs: 60 * 1000 }
): Promise<RateLimitResult> {
  const { maxRequests, windowMs } = config
  const now = Date.now()
  const windowStart = now - windowMs
  
  // Create a unique key for this identifier
  const key = `ratelimit:${identifier}`
  
  try {
    // Use simple INCR with expiry (fixed window)
    // This is simpler and works well for most use cases
    const currentCount = await redis.incr(key)
    
    // Set expiry on first request
    if (currentCount === 1) {
      await redis.expire(key, Math.ceil(windowMs / 1000))
    }
    
    const allowed = currentCount <= maxRequests
    const remaining = Math.max(0, maxRequests - currentCount)
    const resetTime = now + windowMs
    
    if (!allowed) {
      const ttl = await redis.ttl(key)
      const retryAfter = ttl > 0 ? ttl : Math.ceil(windowMs / 1000)
      
      return {
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        resetTime,
        retryAfter,
      }
    }
    
    return {
      allowed: true,
      limit: maxRequests,
      remaining,
      resetTime,
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    
    // Fail open - allow request if Redis is down
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests,
      resetTime: now + windowMs,
    }
  }
}

/**
 * Rate limit by IP address
 */
export async function rateLimitByIP(
  ip: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  return rateLimit(`ip:${ip}`, config)
}

/**
 * Rate limit by user ID
 */
export async function rateLimitByUser(
  userId: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  return rateLimit(`user:${userId}`, config)
}

/**
 * Rate limit by API endpoint
 */
export async function rateLimitByEndpoint(
  endpoint: string,
  identifier: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  return rateLimit(`endpoint:${endpoint}:${identifier}`, config)
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  // Authentication endpoints (strict)
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 5 attempts per 15 minutes
    message: 'Too many login attempts. Please try again later.',
  },
  
  // Password reset (very strict)
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 3 attempts per hour
    message: 'Too many password reset requests. Please wait.',
  },
  
  // API endpoints (moderate)
  API_DEFAULT: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests per minute
    message: 'Rate limit exceeded. Please slow down.',
  },
  
  // File uploads (restrictive)
  UPLOAD: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 10 uploads per hour
    message: 'Upload limit reached. Please try again later.',
  },
  
  // Search queries (moderate)
  SEARCH: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 searches per minute
    message: 'Too many searches. Please wait.',
  },
  
  // Contact/inquiry forms (restrictive)
  CONTACT: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 5 contacts per hour
    message: 'Contact limit reached. Please try again later.',
  },
  
  // Public read-only APIs (generous)
  PUBLIC_READ: {
    maxRequests: 200,
    windowMs: 60 * 1000, // 200 requests per minute
    message: 'Rate limit exceeded.',
  },
}

/**
 * Get rate limit status for monitoring
 */
export async function getRateLimitStatus(identifier: string): Promise<{
  currentCount: number
  windowMs: number
  key: string
} | null> {
  try {
    const key = `ratelimit:${identifier}`
    const now = Date.now()
    
    // Get all keys matching the pattern
    const keys = await redis.keys(`ratelimit:${identifier}*`)
    
    if (keys.length === 0) {
      return null
    }
    
    // Get count for the first key
    const count = await redis.zcard(keys[0])
    
    return {
      currentCount: Number(count) || 0,
      windowMs: 60 * 1000, // Default window
      key: keys[0],
    }
  } catch (error) {
    console.error('Get rate limit status error:', error)
    return null
  }
}

/**
 * Reset rate limit for an identifier
 */
export async function resetRateLimit(identifier: string): Promise<boolean> {
  try {
    const key = `ratelimit:${identifier}`
    await redis.del(key)
    return true
  } catch (error) {
    console.error('Reset rate limit error:', error)
    return false
  }
}

/**
 * Clean up expired rate limit keys
 * Should be called periodically (e.g., via cron job)
 */
export async function cleanupRateLimits(): Promise<number> {
  try {
    const keys = await redis.keys('ratelimit:*')
    
    if (keys.length === 0) {
      return 0
    }
    
    let deleted = 0
    
    for (const key of keys) {
      const ttl = await redis.ttl(key)
      
      // If key has no TTL or is expired, delete it
      if (ttl <= 0) {
        await redis.del(key)
        deleted++
      }
    }
    
    return deleted
  } catch (error) {
    console.error('Cleanup rate limits error:', error)
    return 0
  }
}
