import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export interface AIAuthResult {
  valid: boolean
  userId?: string
  role?: string
  isAI?: boolean
  ownerId?: string
  error?: string
}

export async function verifyAIAuth(request: NextRequest): Promise<AIAuthResult> {
  try {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value

    if (!sessionToken) {
      return { valid: false, error: 'Missing session token' }
    }

    const sessionRes = await fetch(new URL('/api/auth/session', request.url), {
      headers: {
        cookie: `next-auth.session-token=${sessionToken}`
      }
    })

    const session = await sessionRes.json()

    if (!session?.user) {
      return { valid: false, error: 'Invalid or expired session' }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        isAI: true,
        ownerId: true
      }
    })

    if (!user) {
      return { valid: false, error: 'User not found' }
    }

    if (!user.isAI) {
      return { valid: false, error: 'This endpoint requires an AI account' }
    }

    return {
      valid: true,
      userId: user.id,
      role: user.role,
      isAI: user.isAI,
      ownerId: user.ownerId || undefined
    }
  } catch (error) {
    console.error('AI Auth verification error:', error)
    return { valid: false, error: 'Authentication failed' }
  }
}

export function requireAIAuth(handler: (request: NextRequest, auth: AIAuthResult) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const auth = await verifyAIAuth(request)

    if (!auth.valid) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          code: 'AI_AUTH_REQUIRED',
          message: 'This API endpoint requires a registered AI account',
          details: auth.error
        },
        { status: 401 }
      )
    }

    return handler(request, auth)
  }
}

export function createAIAuthResponse(auth: AIAuthResult, additionalData?: Record<string, any>) {
  return NextResponse.json({
    success: true,
    authenticated: true,
    isAI: auth.isAI,
    role: auth.role,
    userId: auth.userId,
    ownerId: auth.ownerId,
    ...additionalData
  })
}
