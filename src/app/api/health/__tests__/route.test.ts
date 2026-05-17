import { GET } from '@/app/api/health/route'
import { NextResponse } from 'next/server'

// Mock Prisma and Redis
jest.mock('@/lib/db', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}))

jest.mock('@/lib/redis', () => ({
  redis: {
    ping: jest.fn(),
  },
}))

import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockRedis = redis as jest.Mocked<typeof redis>

describe('Health Check API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return healthy status when all services are up', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }] as any)
    mockRedis.ping.mockResolvedValue('PONG' as any)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.services.database).toBe('ok')
    expect(data.services.redis).toBe('ok')
  })

  it('should return unhealthy status when database is down', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('DB error'))
    mockRedis.ping.mockResolvedValue('PONG' as any)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.services.database).toBe('error')
  })

  it('should return unhealthy status when Redis is down', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }] as any)
    mockRedis.ping.mockRejectedValue(new Error('Redis error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.services.redis).toBe('error')
  })

  it('should include uptime and version', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }] as any)
    mockRedis.ping.mockResolvedValue('PONG' as any)

    const response = await GET()
    const data = await response.json()

    expect(data.uptime).toBeDefined()
    expect(typeof data.uptime).toBe('number')
    expect(data.version).toBeDefined()
  })
})
