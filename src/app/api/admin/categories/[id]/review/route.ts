import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { invalidateCategoryCaches } from '@/lib/cache'
import { z } from 'zod'

/**
 * 管理员分类审核 API
 *
 * POST /api/admin/categories/[id]/review
 *   body: { action: 'reject' | 'approve', reason?: string }
 *
 * - approve: 将 REJECTED 分类恢复为 APPROVED，清空驳回理由
 * - reject:  将分类设为 REJECTED，记录驳回理由；该分类立即从 /api/categories/tree 消失
 *
 * 仅 ADMIN 可用。审核后调用 invalidateCategoryCaches() 刷新缓存。
 */

const reviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().max(500).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: '分类 ID 必填' }, { status: 400 })
    }

    const body = await request.json()
    const validation = reviewSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: '参数校验失败', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { action, reason } = validation.data

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 })
    }

    // 系统预置分类不允许驳回（避免误操作影响全局）
    if (action === 'reject' && existing.source === 'SYSTEM') {
      return NextResponse.json(
        { error: '系统预置分类不可驳回，请直接删除' },
        { status: 400 }
      )
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'

    const updated = await prisma.category.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        rejectionReason: action === 'reject' ? (reason || null) : null,
      },
    })

    await invalidateCategoryCaches()

    console.log(`[CategoryReview] ${action} category ${id} by admin ${session.user.id}`)

    return NextResponse.json({
      success: true,
      category: updated,
    })
  } catch (error) {
    console.error('[CategoryReview] Error:', error)
    return NextResponse.json(
      { error: '审核操作失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
