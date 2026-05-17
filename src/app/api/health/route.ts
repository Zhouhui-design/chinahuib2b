import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'

/**
 * Health check endpoint
 * Used by load balancers, monitoring systems, and CI/CD
 */
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
    version: process.env.npm_package_version || '1.0.0',
  }
  
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    health.services.database = 'ok'
  } catch (error) {
    health.services.database = 'error'
    health.status = 'unhealthy'
  }
  
  try {
    // Check Redis connection
    await redis.ping()
    health.services.redis = 'ok'
  } catch (error) {
    health.services.redis = 'error'
    health.status = 'unhealthy'
  }
  
  const statusCode = health.status === 'healthy' ? 200 : 503
  
  return NextResponse.json(health, { status: statusCode })
}
