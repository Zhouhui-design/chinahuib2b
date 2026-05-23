/**
 * System Health Check API
 * Comprehensive health monitoring for production deployment
 */

import { NextResponse } from 'next/server'
import { checkDatabaseHealth, getPoolStats } from './db-optimized'
import { checkRedisHealth, getRedisInfo } from './redis-optimized'

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  uptime: number
  version: string
  services: {
    api: {
      status: 'healthy'
      responseTime: number
    }
    database: {
      status: 'healthy' | 'unhealthy'
      latency?: number
      error?: string
      poolStats?: {
        total: number
        idle: number
        waiting: number
      }
    }
    redis: {
      status: 'healthy' | 'unhealthy'
      latency?: number
      error?: string
      info?: {
        connectedClients: string
        usedMemory: string
        uptime: string
        version: string
      }
    }
  }
  environment: string
}

export async function GET(): Promise<NextResponse<HealthCheckResult>> {
  const apiStart = Date.now()

  // Check database
  const dbHealth = await checkDatabaseHealth()
  const poolStats = getPoolStats()

  // Check Redis
  const redisHealth = await checkRedisHealth()
  const redisInfo = await getRedisInfo()

  // Calculate API response time
  const apiResponseTime = Date.now() - apiStart

  // Determine overall status
  let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'

  if (dbHealth.status === 'unhealthy' || redisHealth.status === 'unhealthy') {
    overallStatus = 'unhealthy'
  } else if (
    (dbHealth.latency && dbHealth.latency > 1000) ||
    (redisHealth.latency && redisHealth.latency > 500)
  ) {
    overallStatus = 'degraded'
  }

  const result: HealthCheckResult = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env['npm_package_version'] || '1.0.0',
    services: {
      api: {
        status: 'healthy',
        responseTime: apiResponseTime,
      },
      database: {
        status: dbHealth.status,
        latency: dbHealth.latency,
        error: dbHealth.error,
        poolStats,
      },
      redis: {
        status: redisHealth.status,
        latency: redisHealth.latency,
        error: redisHealth.error,
        info: redisInfo || undefined,
      },
    },
    environment: process.env.NODE_ENV || 'development',
  }

  const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503

  return NextResponse.json(result, { status: httpStatus })
}
