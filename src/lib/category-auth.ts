import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { authenticateAgent } from '@/middleware/ai-agent-auth'
import { getEffectiveUserIdStrict } from '@/lib/ai-permissions'

/**
 * 统一解析当前请求的卖家身份，支持 session 与 API Key 双路径鉴权。
 *
 * 路径 A（session）：适用于浏览器登录的卖家和 AI 子账号。
 *   - 通过 auth() 拿 session（含 isAI/ownerId）
 *   - 用 getEffectiveUserIdStrict(session) 把 AI 子账号映射到监护人 ID
 *     —— 若 session 中缺失 isAI/ownerId，会 fallback 到 Prisma 查询补全。
 *
 * 路径 B（API Key）：适用于外部 AI Agent 通过 HTTP 调用。
 *   - 通过 authenticateAgent(request) 鉴权，返回 agent.userId
 *   - 反查 User.isAI/ownerId，映射到监护人 ID
 *
 * 返回的 seller 永远是监护人（人类卖家）的 SellerProfile，
 * submittedById 是实际发起操作的用户 ID（AI 子账号或人类本身），用于审计。
 */
export async function resolveSellerFromRequest(request: NextRequest): Promise<{
  seller: Awaited<ReturnType<typeof prisma.sellerProfile.findUnique>> | null
  submitterUserId: string
  authMethod: 'session' | 'api-key' | 'none'
  effectiveUserId: string | null
}> {
  // 路径 A：session 鉴权
  const session = await auth()
  if (session?.user?.id) {
    // 使用严格版：确保即使 session 缺少 isAI/ownerId，也会从 DB 补查
    const effectiveUserId = await getEffectiveUserIdStrict(prisma, session)
    console.log('[resolveSellerFromRequest:A] session.user.id=', session.user.id,
      'session.user.isAI=', (session.user as any).isAI,
      'session.user.ownerId=', (session.user as any).ownerId,
      '-> effectiveUserId=', effectiveUserId)
    if (!effectiveUserId) {
      return { seller: null, submitterUserId: '', authMethod: 'session', effectiveUserId: null }
    }
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: effectiveUserId },
    })
    console.log('[resolveSellerFromRequest:A] find seller by userId=', effectiveUserId,
      '-> seller.id=', seller?.id, 'seller.userId=', seller?.userId)
    return {
      seller,
      submitterUserId: session.user.id,
      authMethod: 'session',
      effectiveUserId,
    }
  }

  // 路径 B：API Key 鉴权
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const result = await authenticateAgent(request)
    if (!result.success || !result.agent) {
      return { seller: null, submitterUserId: '', authMethod: 'api-key', effectiveUserId: null }
    }

    // 反查 User 以判断是否 AI 子账号
    const user = await prisma.user.findUnique({
      where: { id: result.agent.userId },
      select: { isAI: true, ownerId: true },
    })

    // AI 子账号映射到监护人 ID；人类用户直接用自身 ID
    const effectiveUserId =
      user?.isAI && user.ownerId ? user.ownerId : result.agent.userId

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: effectiveUserId },
    })
    return {
      seller,
      submitterUserId: result.agent.userId,
      authMethod: 'api-key',
      effectiveUserId,
    }
  }

  return { seller: null, submitterUserId: '', authMethod: 'none', effectiveUserId: null }
}
