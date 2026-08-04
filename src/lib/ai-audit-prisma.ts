/**
 * AI 审计日志工具（基于 Prisma AIAuditLog 模型）
 *
 * 记录 AI 账号的所有操作，供 guardian 查询。
 * fire-and-forget 设计：永不抛错，不影响主流程。
 */

import { prisma } from '@/lib/db'

export interface AuditInput {
  userId: string
  action: string
  target?: string
  result?: 'SUCCESS' | 'FAILED' | 'DENIED'
  metadata?: Record<string, any>
}

/**
 * 记录 AI 审计日志。
 * 永不抛错，fire-and-forget。
 */
export async function logAIAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.aIAuditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        target: input.target ?? null,
        result: input.result ?? 'SUCCESS',
        metadata: input.metadata ?? undefined,
      },
    })
  } catch (error) {
    console.error('[AI Audit] logAIAudit error:', error)
  }
}

/**
 * 校验 AI 账号属于该监护人。
 */
export async function verifyAIBelongsToGuardian(
  aiUserId: string,
  guardianId: string
): Promise<boolean> {
  try {
    const aiUser = await prisma.user.findFirst({
      where: {
        id: aiUserId,
        ownerId: guardianId,
        isAI: true,
      },
      select: { id: true },
    })
    return !!aiUser
  } catch (error) {
    console.error('[AI Audit] verifyAIBelongsToGuardian error:', error)
    return false
  }
}

/**
 * 获取 guardian 名下所有 AI 账号的审计日志（带分页与过滤）。
 */
export async function getGuardianAuditLogs(params: {
  guardianId: string
  aiUserId?: string
  action?: string
  page?: number
  limit?: number
}): Promise<{ logs: any[]; total: number }> {
  const { guardianId, aiUserId, action, page = 1, limit = 50 } = params

  // 获取 guardian 名下的所有 AI 账号 ID
  const aiAccounts = await prisma.user.findMany({
    where: { ownerId: guardianId, isAI: true },
    select: { id: true },
  })
  const aiAccountIds = aiAccounts.map(a => a.id)

  if (aiAccountIds.length === 0) {
    return { logs: [], total: 0 }
  }

  // 构建查询条件
  const where: any = {
    userId: aiUserId && aiAccountIds.includes(aiUserId) ? aiUserId : { in: aiAccountIds },
  }
  if (action) {
    where.action = action
  }

  const [logs, total] = await Promise.all([
    prisma.aIAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.aIAuditLog.count({ where }),
  ])

  return { logs, total }
}
