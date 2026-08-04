import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

/**
 * GET /api/ai/accounts
 * 返回当前 guardian 的所有 AI 账号及其权限摘要
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const aiAccounts = await prisma.user.findMany({
      where: {
        ownerId: session.user.id,
        isAI: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        aiPermissions: {
          select: {
            permission: true,
            isAllowed: true,
            expiresAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, accounts: aiAccounts })
  } catch (error) {
    console.error('[AI Accounts] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch AI accounts' }, { status: 500 })
  }
}
