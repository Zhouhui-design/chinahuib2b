/**
 * API Key Authentication Middleware
 * Validates AI Agent API keys and enforces rate limits
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export interface AuthenticatedAgent {
  userId: string
  apiKeyId: string
  role: 'buyer' | 'seller' | 'admin'
  permissions: any
  rateLimit: number
}

/**
 * Middleware to authenticate AI Agent API requests
 */
export async function authenticateAgent(request: NextRequest): Promise<{
  success: boolean
  agent?: AuthenticatedAgent
  error?: string
}> {
  try {
    // Get API key from header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Missing or invalid authorization header'
      }
    }

    const apiKey = authHeader.replace('Bearer ', '')

    // Look up API key in database
    const apiKeyRecord = await prisma.aPIKey.findUnique({
      where: {
        key: apiKey,
        isActive: true
      },
      include: {
        user: true
      }
    })

    if (!apiKeyRecord) {
      return {
        success: false,
        error: 'Invalid or inactive API key'
      }
    }

    // Check expiration
    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      return {
        success: false,
        error: 'API key has expired'
      }
    }

    // Check rate limit
    const rateLimitExceeded = await checkRateLimit(apiKeyRecord.id, apiKeyRecord.rateLimit)
    
    if (rateLimitExceeded) {
      return {
        success: false,
        error: 'Rate limit exceeded. Try again later.'
      }
    }

    // Update last used timestamp
    await prisma.aPIKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() }
    })

    // Log API usage
    logAPIUsage({
      apiKeyId: apiKeyRecord.id,
      userId: apiKeyRecord.userId,
      endpoint: request.nextUrl.pathname,
      method: request.method,
      ipAddress: request.ip || request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent')
    })

    return {
      success: true,
      agent: {
        userId: apiKeyRecord.userId,
        apiKeyId: apiKeyRecord.id,
        role: apiKeyRecord.role as 'buyer' | 'seller' | 'admin',
        permissions: apiKeyRecord.permissions,
        rateLimit: apiKeyRecord.rateLimit
      }
    }
  } catch (error) {
    console.error('[Auth Middleware] Error:', error)
    return {
      success: false,
      error: 'Authentication failed'
    }
  }
}

/**
 * Check if rate limit is exceeded
 */
async function checkRateLimit(apiKeyId: string, limit: number): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  const requestCount = await prisma.aPIUsageLog.count({
    where: {
      apiKeyId,
      createdAt: {
        gte: oneHourAgo
      }
    }
  })

  return requestCount >= limit
}

/**
 * Log API usage asynchronously (non-blocking)
 */
async function logAPIUsage(data: {
  apiKeyId: string
  userId: string
  endpoint: string
  method: string
  ipAddress?: string | null
  userAgent?: string | null
}) {
  try {
    await prisma.aPIUsageLog.create({
      data: {
        apiKeyId: data.apiKeyId,
        userId: data.userId,
        endpoint: data.endpoint,
        method: data.method,
        statusCode: 200, // Will be updated by response interceptor
        responseTime: 0, // Will be calculated
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      }
    })
  } catch (error) {
    // Don't block the request if logging fails
    console.error('[API Usage Log] Failed to log:', error)
  }
}

/**
 * Helper: Require authentication in API routes
 */
export function requireAuth(request: NextRequest) {
  return authenticateAgent(request)
}
