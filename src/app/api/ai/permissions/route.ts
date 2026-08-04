import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { verifyAIBelongsToGuardian, logAIAudit } from '@/lib/ai-audit-prisma'
import { getAIPermissionList, AI_PERMISSIONS } from '@/lib/ai-permissions'

/**
 * GET /api/ai/permissions?aiUserId=xxx
 * 返回 AI 账号的权限列表（默认值 + DB 记录合并）
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const aiUserId = searchParams.get('aiUserId')
    if (!aiUserId) {
      return NextResponse.json({ error: 'aiUserId is required' }, { status: 400 })
    }

    // 校验 AI 账号属于当前 guardian
    const belongs = await verifyAIBelongsToGuardian(aiUserId, session.user.id)
    if (!belongs) {
      return NextResponse.json(
        { error: 'AI account not found or does not belong to you' },
        { status: 403 }
      )
    }

    const permissions = await getAIPermissionList(aiUserId)

    return NextResponse.json({ success: true, permissions })
  } catch (error) {
    console.error('[AI Permissions] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
  }
}

/**
 * PUT /api/ai/permissions
 * body: { aiUserId, permission, isAllowed, expiresAt? }
 * 更新 AI 账号的某项权限
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { aiUserId, permission, isAllowed, expiresAt } = body

    if (!aiUserId || !permission) {
      return NextResponse.json(
        { error: 'aiUserId and permission are required' },
        { status: 400 }
      )
    }

    // 校验权限名称有效
    if (!AI_PERMISSIONS[permission as keyof typeof AI_PERMISSIONS]) {
      return NextResponse.json(
        { error: `Invalid permission: ${permission}` },
        { status: 400 }
      )
    }

    // 校验 AI 账号属于当前 guardian
    const belongs = await verifyAIBelongsToGuardian(aiUserId, session.user.id)
    if (!belongs) {
      return NextResponse.json(
        { error: 'AI account not found or does not belong to you' },
        { status: 403 }
      )
    }

    // Upsert 权限记录
    const existing = await prisma.aIPermission.findFirst({
      where: { userId: aiUserId, permission },
    })

    if (existing) {
      await prisma.aIPermission.update({
        where: { id: existing.id },
        data: {
          isAllowed,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      })
    } else {
      await prisma.aIPermission.create({
        data: {
          userId: aiUserId,
          permission,
          isAllowed,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      })
    }

    // 审计日志
    await logAIAudit({
      userId: aiUserId,
      action: 'permission.update',
      target: permission,
      result: 'SUCCESS',
      metadata: { isAllowed, updatedBy: session.user.id },
    })

    return NextResponse.json({
      success: true,
      message: `Permission '${permission}' updated to ${isAllowed}`,
    })
  } catch (error) {
    console.error('[AI Permissions] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update permission' }, { status: 500 })
  }
}
