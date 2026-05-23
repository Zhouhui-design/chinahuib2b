/**
 * Database Connection Pool Optimization
 * Enhanced performance for PostgreSQL with connection pooling
 */

import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

// Database pool configuration optimized for production
const createPool = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://expo_dev:dev123@localhost:5432/global_expo_dev',

    // Connection pool settings
    max: 20, // Maximum number of connections
    min: 5, // Minimum number of connections
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established

    // Performance settings
    allowExitOnIdle: false,
    statement_timeout: 30000, // Query timeout 30s
    query_timeout: 30000, // Query timeout 30s
  })

  // Pool event handlers
  pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err)
  })

  pool.on('connect', () => {
    console.log('New database connection established')
  })

  pool.on('remove', () => {
    console.log('Database connection removed from pool')
  })

  return pool
}

// Create PostgreSQL pool with optimization
const pool = globalForPrisma.pool ?? createPool()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool
}

// Create Prisma adapter
const adapter = new PrismaPg(pool)

// Create Prisma client with optimized settings
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Export pool for direct queries if needed
export { pool }

// Database health check
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy'
  latency?: number
  error?: string
}> {
  const start = Date.now()

  try {
    await prisma.$queryRaw`SELECT 1`
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

// Get pool statistics
export function getPoolStats() {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  }
}
