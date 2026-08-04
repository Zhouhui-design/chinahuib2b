import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { verifyAIBelongsToGuardian, logAIAudit } from '@/lib/ai-audit-prisma'

/**
 * DELETE /api/ai/accounts/[id]
 * Guardian 自助删除 AI 账号
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const aiUserId = params.id

    // 校验该 AI 账号属于当前 guardian
    const belongs = await verifyAIBelongsToGuardian(aiUserId, session.user.id)
    if (!belongs) {
      return NextResponse.json(
        { error: 'AI account not found or does not belong to you' },
        { status: 403 }
      )
    }

    // 删除 AI 账号（AIPermission 和 AIAuditLog 通过 onDelete: Cascade 自动级联删除）
    await prisma.user.delete({
      where: { id: aiUserId },
    })

    console.log(`[AI Accounts] Guardian ${session.user.id} deleted AI account ${aiUserId}`)

    return NextResponse.json({ success: true, message: 'AI account deleted successfully' })
  } catch (error) {
    console.error('[AI Accounts] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete AI account' }, { status: 500 })
  }
}
