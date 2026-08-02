import { NextRequest, NextResponse } from 'next/server'
import { resolveUserId } from '@/lib/chat-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// Get private messages with a user - GET /api/chat/private/[userId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUserId = await resolveUserId(request)
    
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const rawOtherId = params.userId

    // Resolve other user: accept either User ID or SellerProfile ID
    let otherUserId = rawOtherId
    const directUser = await db.user.findUnique({ where: { id: rawOtherId }, select: { id: true } })
    if (!directUser) {
      const sellerProfile = await db.sellerProfile.findUnique({
        where: { id: rawOtherId },
        select: { userId: true },
      })
      if (sellerProfile) {
        otherUserId = sellerProfile.userId
      }
    }

    // Prevent fetching messages with self
    if (currentUserId === otherUserId) {
      return NextResponse.json({
        success: true,
        data: { messages: [], pagination: { limit, offset, hasMore: false } },
      })
    }

    const messages = await db.privateMessage.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            isOnline: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            isOnline: true,
          },
        },
      },
    })

    // Mark messages as read
    await db.privateMessage.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: currentUserId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: {
          limit,
          offset,
          hasMore: messages.length === limit,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching private messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// Send private message - POST /api/chat/private/[userId]
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = await resolveUserId(request)
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - cannot resolve user identity' },
        { status: 401 }
      )
    }

    const { content } = await request.json()
    const rawReceiverId = params.userId

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Resolve receiver: accept either a User ID or a SellerProfile ID
    // (ChatWidget passes SellerProfile ID from store/product pages)
    let receiverId = rawReceiverId
    let receiver = await db.user.findUnique({ where: { id: rawReceiverId } })
    if (!receiver) {
      const sellerProfile = await db.sellerProfile.findUnique({
        where: { id: rawReceiverId },
        select: { userId: true },
      })
      if (sellerProfile) {
        receiverId = sellerProfile.userId
        receiver = await db.user.findUnique({ where: { id: receiverId } })
      }
    }

    if (!receiver) {
      return NextResponse.json(
        { success: false, error: 'Receiver not found' },
        { status: 404 }
      )
    }

    // Prevent self-messaging
    if (userId === receiverId) {
      return NextResponse.json(
        { success: false, error: 'Cannot send message to yourself' },
        { status: 400 }
      )
    }

    // Create message
    const message = await db.privateMessage.create({
      data: {
        content: content.trim(),
        senderId: userId,
        receiverId: receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            isOnline: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            isOnline: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: message,
    })
  } catch (error) {
    console.error('Error sending private message:', error)
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: `Failed to send message: ${errMsg}` },
      { status: 500 }
    )
  }
}
