import { NextRequest, NextResponse } from 'next/server'
import { resolveUserId } from '@/lib/chat-auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request)
    if (!userId) {
      console.warn('[chat-conversations] Unauthorized: resolveUserId returned null')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[chat-conversations] Fetching conversations for userId:', userId)

    const allMessages = await db.privateMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })

    // Filter out self-messages (senderId == receiverId)
    const messages = allMessages.filter(m => m.senderId !== m.receiverId)

    console.log('[chat-conversations] Found', allMessages.length, 'messages',
      '(', messages.length, 'non-self) for user', userId)

    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        data: { conversations: [] },
      })
    }

    const partnerIds = new Set<string>()
    for (const msg of messages) {
      partnerIds.add(msg.senderId)
      partnerIds.add(msg.receiverId)
    }

    partnerIds.delete(userId)

    const partners = await db.user.findMany({
      where: { id: { in: Array.from(partnerIds) } },
      select: { id: true, username: true, displayName: true, avatarUrl: true },
    })
    const partnerMap = new Map(partners.map(p => [p.id, p]))

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

    console.log('[chat-conversations] Returning', conversations.length, 'conversations for user', userId)

    return NextResponse.json({
      success: true,
      data: { conversations },
    })
  } catch (error) {
    console.error('[chat-conversations] Error fetching conversations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
