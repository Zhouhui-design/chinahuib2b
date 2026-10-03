import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const UNREPLIED_THRESHOLD_HOURS = 48 // 2 天

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const threshold = new Date(Date.now() - UNREPLIED_THRESHOLD_HOURS * 60 * 60 * 1000)

    // 统计未回复买家留言的卖家数量
    const sellers = await prisma.sellerProfile.findMany({
      select: { userId: true },
    })
    const sellerUserIds = sellers.map((s) => s.userId).filter(Boolean)

    const incoming = await prisma.privateMessage.findMany({
      where: { receiverId: { in: sellerUserIds } },
      select: { senderId: true, receiverId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    const outgoing = await prisma.privateMessage.findMany({
      where: { senderId: { in: sellerUserIds } },
      select: { senderId: true, receiverId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    const lastIncoming = new Map<string, Date>()
    for (const m of incoming) {
      const key = `${m.receiverId}::${m.senderId}`
      if (!lastIncoming.has(key)) lastIncoming.set(key, m.createdAt)
    }
    const lastOutgoing = new Map<string, Date>()
    for (const m of outgoing) {
      const key = `${m.senderId}::${m.receiverId}`
      if (!lastOutgoing.has(key)) lastOutgoing.set(key, m.createdAt)
    }

    let unrepliedMessages = 0
    for (const [key, at] of lastIncoming.entries()) {
      const lastReply = lastOutgoing.get(key)
      if ((!lastReply || lastReply < at) && at < threshold) {
        unrepliedMessages++
      }
    }

    // 待审核卖家（未验证）
    const sellerVerifications = await prisma.sellerProfile.count({
      where: { isVerified: false },
    })

    return NextResponse.json({
      success: true,
      data: {
        freightInquiries: 0,
        paymentProofs: 0,
        sellerVerifications,
        auctionListings: 0,
        unrepliedMessages,
      },
    })
  } catch (error) {
    console.error('Pending counts error:', error)
    return NextResponse.json({ error: 'Failed to fetch counts' }, { status: 500 })
  }
}
