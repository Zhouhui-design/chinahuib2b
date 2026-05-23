import { createClient, RedisClientType } from 'redis'

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined
}

export const redis = globalForRedis.redis ?? createClient({
  url: process.env['REDIS_URL'] || 'redis://localhost:6379',
})

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

// Connect to Redis with error handling
const connectRedis = async () => {
  if (!redis.isOpen) {
    try {
      await redis.connect()
      console.log('Redis connected successfully')
    } catch (error) {
      console.error('Failed to connect to Redis:', error)
    }
  }
}

// Initialize connection
connectRedis()

// Handle connection events
redis.on('error', (err) => {
  console.error('Redis error:', err)
})

redis.on('connect', () => {
  console.log('Redis connecting...')
})

redis.on('ready', () => {
  console.log('Redis ready')
})

redis.on('reconnecting', () => {
  console.log('Redis reconnecting...')
})
