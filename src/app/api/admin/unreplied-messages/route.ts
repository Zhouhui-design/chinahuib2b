import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const UNREPLIED_THRESHOLD_HOURS = 48 // 2 天

/**
 * GET /api/admin/unreplied-messages
 * 管理员查看：哪些卖家超过 2 天未回复买家留言（私信）。
 * 判定逻辑：对每个卖家，找出所有买家发来的私信（receiverId = 卖家 userId），
 * 取每个买家「最后一条留言」的时间；若卖家在该买家最后留言之后没有回复，
 * 且距今超过 2 天，则视为「未回复」。
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))

    const threshold = new Date(Date.now() - UNREPLIED_THRESHOLD_HOURS * 60 * 60 * 1000)

    // 所有卖家（userId 关联 User）
    const sellers = await prisma.sellerProfile.findMany({
      select: {
        id: true,
        userId: true,
        companyName: true,
      },
    })

    const sellerUserIds = sellers.map((s) => s.userId).filter(Boolean)

    // 所有发给卖家的私信（留言），按卖家+买家分组取最新一条
    const incoming = await prisma.privateMessage.findMany({
      where: {
        receiverId: { in: sellerUserIds },
      },
      select: {
        senderId: true,
        receiverId: true,
        createdAt: true,
        content: true,
        sender: { select: { id: true, username: true, displayName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 所有卖家发出的私信（回复）
    const outgoing = await prisma.privateMessage.findMany({
      where: {
        senderId: { in: sellerUserIds },
      },
      select: {
        senderId: true,
        receiverId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // 卖家 userId -> SellerProfile
    const sellerByUser = new Map(sellers.map((s) => [s.userId, s]))

    // 对每个 (sellerId, buyerId) 组合，找买家最后留言时间 和 卖家最后回复时间
    // key: `${sellerUserId}::${buyerId}`
    const lastIncoming = new Map<string, { at: Date; content: string; buyer: any }>()
    for (const m of incoming) {
      const key = `${m.receiverId}::${m.senderId}`
      if (!lastIncoming.has(key)) {
        lastIncoming.set(key, { at: m.createdAt, content: m.content, buyer: m.sender })
      }
    }

    const lastOutgoing = new Map<string, Date>()
    for (const m of outgoing) {
      const key = `${m.senderId}::${m.receiverId}`
      if (!lastOutgoing.has(key)) {
        lastOutgoing.set(key, m.createdAt)
      }
    }

    // 构建未回复列表
    const unreplied: any[] = []
    for (const [key, inc] of lastIncoming.entries()) {
      const [sellerUserIdRaw, buyerIdRaw] = key.split('::')
      const sellerUserId = sellerUserIdRaw || ''
      const buyerId = buyerIdRaw || ''
      const lastReply = lastOutgoing.get(key)

      // 卖家从未回复，或回复时间早于买家最后留言时间
      const notReplied = !lastReply || lastReply < inc.at

      // 且买家最后留言距今超过阈值
      if (notReplied && inc.at < threshold) {
        const seller = sellerByUser.get(sellerUserId)
        unreplied.push({
          sellerId: seller?.id || null,
          sellerUserId,
          companyName: seller?.companyName || '未知卖家',
          buyerId: buyerId,
          buyerName: inc.buyer?.displayName || inc.buyer?.username || inc.buyer?.email || '未知买家',
          buyerEmail: inc.buyer?.email || null,
          lastMessageAt: inc.at,
          lastMessage: inc.content?.slice(0, 200) || '',
          hoursSinceMessage: Math.round((Date.now() - inc.at.getTime()) / (60 * 60 * 1000)),
        })
      }
    }

    // 按最久未回复排序
    unreplied.sort((a, b) => b.lastMessageAt - a.lastMessageAt)

    const total = unreplied.length
    const paged = unreplied.slice((page - 1) * pageSize, page * pageSize)

    return NextResponse.json({
      success: true,
      data: {
        total,
        page,
        pageSize,
        thresholdHours: UNREPLIED_THRESHOLD_HOURS,
        items: paged,
      },
    })
  } catch (error) {
    console.error('Unreplied messages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unreplied messages', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
