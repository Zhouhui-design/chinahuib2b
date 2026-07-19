import { GET } from '@/app/api/health/route'

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
    const responseJson = await response.json()

    expect(response.status).toBe(200)
    expect(responseJson.status).toBe('healthy')
    expect(responseJson.services.database).toBe('ok')
    expect(responseJson.services.redis).toBe('ok')
  })

  it('should return unhealthy status when database is down', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('DB error'))
    mockRedis.ping.mockResolvedValue('PONG' as any)

    const response = await GET()
    const responseJson = await response.json()

    expect(response.status).toBe(503)
    expect(responseJson.status).toBe('unhealthy')
    expect(responseJson.services.database).toBe('error')
  })

  it('should return unhealthy status when Redis is down', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }] as any)
    mockRedis.ping.mockRejectedValue(new Error('Redis error'))

    const response = await GET()
    const responseJson = await response.json()

    expect(response.status).toBe(503)
    expect(responseJson.status).toBe('unhealthy')
    expect(responseJson.services.redis).toBe('error')
  })

  it('should include uptime and version', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }] as any)
    mockRedis.ping.mockResolvedValue('PONG' as any)

    const response = await GET()
    const responseJson = await response.json()

    expect(responseJson.uptime).toBeDefined()
    expect(typeof responseJson.uptime).toBe('number')
    expect(responseJson.version).toBeDefined()
  })
})
