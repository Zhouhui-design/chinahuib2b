/**
 * Redis Connection and Performance Optimization
 * Enhanced Redis client with lazy connection initialization
 */

import { createClient, RedisClientType } from 'redis'

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined
  redisConnected: boolean
}

// Create Redis client without immediate connection
const createRedisClient = (): RedisClientType => {
  const client = createClient({
    url: process.env['REDIS_URL'] || 'redis://localhost:6379',

    // Socket settings for better performance
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('Redis: Max reconnection attempts reached')
          return new Error('Redis: Max reconnection attempts reached')
        }
        return Math.min(retries * 1000, 3000)
      },
      connectTimeout: 10000,
      keepAlive: 30000,
    },
  })

  // Error handling
  client.on('error', (err) => {
    console.error('Redis Client Error:', err)
  })

  client.on('connect', () => {
    console.log('Redis Client Connected')
  })

  client.on('ready', () => {
    console.log('Redis Client Ready')
  })

  client.on('reconnecting', () => {
    console.log('Redis Client Reconnecting...')
  })

  client.on('end', () => {
    console.log('Redis Client Disconnected')
  })

  return client
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

// Lazy connection - only connect when actually needed
let isConnected = false

export async function connectRedis(): Promise<void> {
  if (!redis.isOpen && !isConnected) {
    try {
      await redis.connect()
      isConnected = true
      console.log('Redis connected successfully')
    } catch (error) {
      console.error('Failed to connect to Redis:', error)
      throw error
    }
  }
}

// Redis health check
export async function checkRedisHealth(): Promise<{
  status: 'healthy' | 'unhealthy'
  latency?: number
  error?: string
}> {
  const start = Date.now()

  try {
    // Ensure connection
    await connectRedis()

    await redis.ping()
    const latency = Date.now() - start

    return {
      status: 'healthy',
      latency,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Get Redis client info
export async function getRedisInfo() {
  try {
    await connectRedis()

    const info = await redis.info()
    const lines = info.split('\r\n')
    const infoObj: Record<string, string> = {}

    lines.forEach(line => {
      const [key, value] = line.split(':')
      if (key && value) {
        infoObj[key] = value
      }
    })

    return {
      connectedClients: infoObj['connected_clients'] || 'N/A',
      usedMemory: infoObj['used_memory_human'] || 'N/A',
      uptime: infoObj['uptime_in_days'] || 'N/A',
      version: infoObj['redis_version'] || 'N/A',
    }
  } catch (error) {
    return null
  }
}

// Disconnect Redis
export async function disconnectRedis(): Promise<void> {
  if (redis.isOpen) {
    await redis.quit()
    isConnected = false
  }
}

// Check if Redis is connected
export function isRedisConnected(): boolean {
  return redis.isOpen && isConnected
}
