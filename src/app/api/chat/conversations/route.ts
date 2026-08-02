import { NextRequest, NextResponse } from 'next/server'
import { resolveUserId } from '@/lib/chat-auth'
import { db } from '@/lib/db'

// GET /api/chat/conversations
// Returns list of conversations for the current user (unique chat partners
// with last message preview and unread count)
export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // First, get all message IDs for this user (lightweight query)
    const messages = await db.privateMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })

    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        data: { conversations: [] },
      })
    }

    // Collect unique partner IDs
    const partnerIds = new Set<string>()
    for (const msg of messages) {
      partnerIds.add(msg.senderId)
      partnerIds.add(msg.receiverId)
    }
    // Remove self
    partnerIds.delete(userId)

    // Fetch partner user info in one query
    const partners = await db.user.findMany({
      where: { id: { in: Array.from(partnerIds) } },
      select: { id: true, username: true, displayName: true, avatarUrl: true },
    })
    const partnerMap = new Map(partners.map(p => [p.id, p]))

    // Group by conversation partner
    const conversationsMap = new Map<string, {
      partnerId: string
      partnerName: string
      partnerAvatar: string | null
      lastMessage: string
      lastMessageTime: string
      unreadCount: number
    }>()

    for (const msg of messages) {
      const isOwn = msg.senderId === userId
      const partnerId = isOwn ? msg.receiverId : msg.senderId
      const partner = partnerMap.get(partnerId)

      const existing = conversationsMap.get(partnerId)
      const unreadInc = (!isOwn && !msg.isRead) ? 1 : 0

      if (!existing) {
        conversationsMap.set(partnerId, {
          partnerId,
          partnerName: partner?.displayName || partner?.username || 'Unknown',
          partnerAvatar: partner?.avatarUrl || null,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt.toISOString(),
          unreadCount: unreadInc,
        })
      } else {
        existing.unreadCount += unreadInc
      }
    }

    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    )

    return NextResponse.json({
      success: true,
      data: { conversations },
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
