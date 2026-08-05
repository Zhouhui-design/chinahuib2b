import { NextRequest, NextResponse } from 'next/server'

async function getPrisma() {
  const { prisma } = await import('@/lib/db')
  return prisma
}

export interface AuthenticatedAgent {
  userId: string
  userRole: string
  userIsAI: boolean
  keyId: string
  keyName: string
  permissions: {
    canBuy: boolean
    canSell: boolean
    canChat: boolean
    canUpload: boolean
    canManageStore: boolean
    canAccessAdmin: boolean
  }
  rateLimit: number
}

export async function authenticateApiRequest(request: NextRequest): Promise<{
  success: boolean
  agent?: AuthenticatedAgent
  error?: string
  status?: number
}> {
  const authHeader = request.headers.get('authorization') || ''

  const apiKey = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader.startsWith('api_key ')
    ? authHeader.slice(8)
    : authHeader

  if (!apiKey || apiKey === 'Bearer' || apiKey === 'api_key') {
    return { success: false, error: 'Missing API key', status: 401 }
  }

  try {
    const prisma = await getPrisma()

    const keyRecord = await prisma.apiKey.findFirst({
      where: { key: apiKey, isActive: true },
      include: { user: true },
    })

    if (keyRecord && keyRecord.user) {
      await prisma.apiKey.update({
        where: { id: keyRecord.id },
        data: { lastUsedAt: new Date() },
      }).catch(() => {})

      const perms = keyRecord.permissions as any || {}
      const user = keyRecord.user

      return {
        success: true,
        agent: {
          userId: user.id,
          userRole: user.role,
          userIsAI: user.isAI,
          keyId: keyRecord.id,
          keyName: keyRecord.name,
          permissions: {
            canBuy: perms.canBuy ?? true,
            canSell: perms.canSell ?? true,
            canChat: perms.canChat ?? true,
            canUpload: perms.canUpload ?? true,
            canManageStore: perms.canManageStore ?? false,
            canAccessAdmin: perms.canAccessAdmin ?? false,
          },
          rateLimit: keyRecord.rateLimit || 1000,
        },
      }
    }

    const inactiveKey = await prisma.apiKey.findFirst({
      where: { key: apiKey, isActive: false },
    })

    if (inactiveKey) {
      return { success: false, error: 'API key is inactive', status: 403 }
    }

    return { success: false, error: 'Invalid API key', status: 401 }
  } catch (error: any) {
    console.error('[API Auth Error]', error?.message)
    console.error('[API Auth Stack]', error?.stack?.substring(0, 500))
    return { success: false, error: 'Authentication service error', status: 500 }
  }
}

export function requireCapability(agent: AuthenticatedAgent, capability: keyof AuthenticatedAgent['permissions']) {
  if (!agent.permissions[capability]) {
    return NextResponse.json(
      { success: false, error: `Missing capability: ${capability}` },
      { status: 403 }
    )
  }
  return null
}

export async function logApiUsage(
  apiKeyId: string,
  userId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime?: number,
  metadata?: any
) {
  try {
    const prisma = await getPrisma()
    await prisma.apiUsageLog.create({
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
  } catch {}
}
