import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * AI Agent Authentication Middleware
 * Validates API keys and extracts AI agent information
 */

export interface AIAgentInfo {
  userId: string
  role: string
  username: string
  email: string
  isSystemAI: boolean
  aiProvider?: string
  aiModel?: string
  aiCapabilities?: any
  permissions?: any
  rateLimit?: number
}

export interface AuthResult {
  success: boolean
  agent?: AIAgentInfo
  error?: string
  statusCode?: number
}

/**
 * Authenticate AI agent using API key from request header
 */
export async function authenticateAI(request: NextRequest): Promise<AuthResult> {
  try {
    // Get API key from header
    const apiKey = request.headers.get('X-API-Key') || 
                   request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!apiKey) {
      return {
        success: false,
        error: 'Missing API key. Please provide X-API-Key or Authorization header.',
        statusCode: 401,
      }
    }

    // Find API key in database
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isSystemAI: true,
            aiProvider: true,
            aiModel: true,
            aiCapabilities: true,
            isActive: true,
          },
        },
      },
    })

    if (!key) {
      return {
        success: false,
        error: 'Invalid API key',
        statusCode: 401,
      }
    }

    // Check if key is active
    if (!key.isActive) {
      return {
        success: false,
        error: 'API key is inactive or revoked',
        statusCode: 403,
      }
    }

    // Check if user is active
    if (!key.user.isActive) {
      return {
        success: false,
        error: 'User account is inactive',
        statusCode: 403,
      }
    }

    // Check expiration
    if (key.expiresAt && new Date() > key.expiresAt) {
      return {
        success: false,
        error: 'API key has expired',
        statusCode: 403,
      }
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    })

    // Log API usage
    await prisma.apiUsageLog.create({
      data: {
        apiKeyId: key.id,
        userId: key.userId,
        endpoint: new URL(request.url).pathname,
        method: request.method,
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    // Build agent info
    const agentInfo: AIAgentInfo = {
      userId: key.userId,
      role: key.role,
      username: key.user.username,
      email: key.user.email,
      isSystemAI: key.user.isSystemAI,
      aiProvider: key.user.aiProvider || undefined,
      aiModel: key.user.aiModel || undefined,
      aiCapabilities: key.user.aiCapabilities || {},
      permissions: key.permissions as any,
      rateLimit: key.rateLimit,
    }

    return {
      success: true,
      agent: agentInfo,
    }
  } catch (error) {
    console.error('AI authentication error:', error)
    return {
      success: false,
      error: 'Authentication failed',
      statusCode: 500,
    }
  }
}

/**
 * Check if agent has required permission
 */
export function checkPermission(
  agent: AIAgentInfo,
  permission: string
): boolean {
  if (!agent.permissions) {
    return false
  }

  const permKey = `can${permission.charAt(0).toUpperCase()}${permission.slice(1)}`
  return agent.permissions[permKey] === true
}

/**
 * Check rate limit for agent
 */
export async function checkRateLimit(agent: AIAgentInfo): Promise<{
  allowed: boolean
  remaining?: number
  resetAt?: Date
}> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    // Count requests in the last hour
    const requestCount = await prisma.apiUsageLog.count({
      where: {
        userId: agent.userId,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    })

    const limit = agent.rateLimit || 1000
    const remaining = Math.max(0, limit - requestCount)

    if (requestCount >= limit) {
      // Calculate reset time (next hour)
      const resetAt = new Date(oneHourAgo.getTime() + 60 * 60 * 1000)
      
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      }
    }

    return {
      allowed: true,
      remaining,
      resetAt: new Date(oneHourAgo.getTime() + 60 * 60 * 1000),
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    // Fail open - allow request if rate limit check fails
    return { allowed: true }
  }
}

/**
 * Helper function to create authenticated API handler
 */
export function withAIAuth(
  handler: (request: NextRequest, agent: AIAgentInfo) => Promise<NextResponse>,
  options?: {
    requiredPermissions?: string[]
    checkRateLimit?: boolean
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Authenticate
    const auth = await authenticateAI(request)
    
    if (!auth.success || !auth.agent) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.statusCode || 401 }
      )
    }

    const agent = auth.agent

    // Check permissions if required
    if (options?.requiredPermissions) {
      for (const permission of options.requiredPermissions) {
        if (!checkPermission(agent, permission)) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Insufficient permissions. Required: ${permission}` 
            },
            { status: 403 }
          )
        }
      }
    }

    // Check rate limit if enabled
    if (options?.checkRateLimit !== false) {
      const rateLimit = await checkRateLimit(agent)
      
      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            remaining: rateLimit.remaining,
            resetAt: rateLimit.resetAt,
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': String(agent.rateLimit || 1000),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimit.resetAt?.toISOString() || '',
            },
          }
        )
      }

      // Add rate limit headers to successful response
      const response = await handler(request, agent)
      
      if (rateLimit.remaining !== undefined) {
        response.headers.set('X-RateLimit-Limit', String(agent.rateLimit || 1000))
        response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining))
        if (rateLimit.resetAt) {
          response.headers.set('X-RateLimit-Reset', rateLimit.resetAt.toISOString())
        }
      }
      
      return response
    }

    return handler(request, agent)
  }
}
