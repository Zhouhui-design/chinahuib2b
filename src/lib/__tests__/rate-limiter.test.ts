import { rateLimit, RATE_LIMITS } from '../rate-limiter'
import { redis } from '../redis'

// Mock Redis
jest.mock('../redis', () => ({
  redis: {
    incr: jest.fn(),
    expire: jest.fn(),
    ttl: jest.fn(),
  },
}))

const mockRedis = redis as jest.Mocked<typeof redis>

describe('Rate Limiter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rateLimit function', () => {
    it('should allow request when under limit', async () => {
      mockRedis.incr.mockResolvedValue(1)
      mockRedis.expire.mockResolvedValue(undefined as any)

      const result = await rateLimit('test-user', { maxRequests: 5, windowMs: 60000 })

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
      expect(mockRedis.incr).toHaveBeenCalledWith('ratelimit:test-user')
    })

    it('should block request when over limit', async () => {
      mockRedis.incr.mockResolvedValue(6)
      mockRedis.ttl.mockResolvedValue(30)

      const result = await rateLimit('test-user', { maxRequests: 5, windowMs: 60000 })

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBe(30)
    })

    it('should set expiry on first request', async () => {
      mockRedis.incr.mockResolvedValue(1)
      mockRedis.expire.mockResolvedValue(undefined as any)

      await rateLimit('test-user', { maxRequests: 5, windowMs: 60000 })

      expect(mockRedis.expire).toHaveBeenCalledWith('ratelimit:test-user', 60)
    })

    it('should handle Redis errors gracefully (fail open)', async () => {
      mockRedis.incr.mockRejectedValue(new Error('Redis error'))

      const result = await rateLimit('test-user', { maxRequests: 5, windowMs: 60000 })

      // Should allow request when Redis is down
      expect(result.allowed).toBe(true)
    })
  })

  describe('Predefined configurations', () => {
    it('should have AUTH config', () => {
      expect(RATE_LIMITS.AUTH).toBeDefined()
      expect(RATE_LIMITS.AUTH.maxRequests).toBe(5)
      expect(RATE_LIMITS.AUTH.windowMs).toBe(15 * 60 * 1000)
    })

    it('should have PASSWORD_RESET config', () => {
      expect(RATE_LIMITS.PASSWORD_RESET).toBeDefined()
      expect(RATE_LIMITS.PASSWORD_RESET.maxRequests).toBe(3)
    })

    it('should have API_DEFAULT config', () => {
      expect(RATE_LIMITS.API_DEFAULT).toBeDefined()
      expect(RATE_LIMITS.API_DEFAULT.maxRequests).toBe(100)
    })
  })
})
