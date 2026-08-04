import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getGuardianAuditLogs } from '@/lib/ai-audit-prisma'

/**
 * GET /api/ai/audit-logs?aiUserId=xxx&action=xxx&page=1&limit=50
 * 获取 guardian 名下 AI 账号的审计日志
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const aiUserId = searchParams.get('aiUserId') || undefined
    const action = searchParams.get('action') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const result = await getGuardianAuditLogs({
      guardianId: session.user.id,
      aiUserId,
      action,
      page,
      limit,
    })

    return NextResponse.json({
      success: true,
      logs: result.logs,
      total: result.total,
      page,
      limit,
    })
  } catch (error) {
    console.error('[AI Audit Logs] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
