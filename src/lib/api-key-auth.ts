import { NextRequest, NextResponse } from 'next/server'
import { verifyAIApiKey, AIIdentity } from '@/lib/ai-identity'
import { prisma } from '@/lib/db'

export interface AuthenticatedAgent {
  aiIdentity: AIIdentity
  userId: string
  userRole: string
  userIsAI: boolean
}

export async function authenticateApiRequest(request: NextRequest): Promise<{
  success: boolean
  agent?: AuthenticatedAgent
  error?: string
  status?: number
}> {
  const authHeader = request.headers.get('authorization') || ''
  
  // Support both "Bearer" and "api_key" formats
  const apiKey = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader.startsWith('api_key ')
    ? authHeader.slice(8)
    : authHeader

  if (!apiKey || apiKey === 'Bearer' || apiKey === 'api_key') {
    return { success: false, error: 'Missing API key', status: 401 }
  }

  // First try: verify via ai-identity (Redis-backed, for AI Agent tokens)
  const identity = await verifyAIApiKey(apiKey)
  if (identity) {
    // Look up the user by the AI identity metadata
    // Try to find the User that this AI identity belongs to
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          // AI agents are linked via ownerId or matching apiKey
          { apiKeys: { some: { key: apiKey, isActive: true } } },
          { apiKeys: { some: { key: apiKey } } },
        ],
      },
    })

    if (user) {
      return {
        success: true,
        agent: {
          aiIdentity: identity,
          userId: user.id,
          userRole: user.role,
          userIsAI: user.isAI,
        },
      }
    }

    // If user not found in DB but AI identity is valid, create a synthetic agent
    return {
      success: true,
      agent: {
        aiIdentity: identity,
        userId: identity.id,
        userRole: 'AI_AGENT',
        userIsAI: true,
      },
    }
  }

  // Second try: check APIKey model in database
  const apiKeyRecord = await prisma.apiKey.findFirst({
    where: { key: apiKey, isActive: true },
    include: { user: true },
  })

  if (!apiKeyRecord) {
    return { success: false, error: 'Invalid API key', status: 401 }
  }

  // Check rate limit
  if (apiKeyRecord.rateLimit && apiKeyRecord.lastUsedAt) {
    const oneHourAgo = new Date(Date.now() - 3600 * 1000)
    if (apiKeyRecord.lastUsedAt < oneHourAgo) {
      // Rate limit exceeded - log but don't block for now
    }
  }

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKeyRecord.id },
    data: { lastUsedAt: new Date() },
  })

  const user = apiKeyRecord.user

  return {
    success: true,
    agent: {
      aiIdentity: {
        id: apiKeyRecord.id,
        name: apiKeyRecord.name,
        type: 'other',
        apiKey: apiKeyRecord.key,
        capabilities: {
          canBuy: (apiKeyRecord.permissions as any)?.canBuy ?? true,
          canSell: (apiKeyRecord.permissions as any)?.canSell ?? true,
          canChat: (apiKeyRecord.permissions as any)?.canChat ?? true,
          canUpload: (apiKeyRecord.permissions as any)?.canUpload ?? true,
          canManageStore: (apiKeyRecord.permissions as any)?.canManageStore ?? false,
          canAccessAdmin: (apiKeyRecord.permissions as any)?.canAccessAdmin ?? false,
        },
        rateLimits: {
          requestsPerHour: apiKeyRecord.rateLimit,
          uploadsPerDay: 100,
          messagesPerHour: 500,
        },
        status: 'active',
        createdAt: apiKeyRecord.createdAt,
        lastActive: new Date(),
      },
      userId: user.id,
      userRole: user.role,
      userIsAI: user.isAI,
    },
  }
}

export function requireCapability(agent: AuthenticatedAgent, capability: keyof AIIdentity['capabilities']) {
  if (!agent.aiIdentity.capabilities[capability]) {
    return NextResponse.json(
      { success: false, error: `Missing capability: ${capability}` },
      { status: 403 }
    )
  }
  return null
}

export function logApiUsage(
  apiKeyId: string,
  userId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime?: number,
  metadata?: any
) {
  // Non-blocking logging
  prisma.apiUsageLog
    .create({
      data: {
        apiKeyId,
        userId,
        endpoint,
        method,
        statusCode,
        responseTime,
        ipAddress: metadata?.ip || null,
        metadata: metadata || {},
      },
    })
    .catch(() => {}) // Silently fail
}
