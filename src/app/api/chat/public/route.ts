import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

// Shared system guest account: carries senderId FK for anonymous messages.
// Real display name lives in PublicMessage.guestName.
const GUEST_USERNAME = '__guest__'

async function getGuestUserId(): Promise<string> {
  const existing = await db.user.findUnique({
    where: { username: GUEST_USERNAME },
    select: { id: true },
  })
  if (existing) return existing.id

  const created = await db.user.create({
    data: {
      email: 'guest@system.local',
      username: GUEST_USERNAME,
      // Random unusable password: this account is never meant to log in.
      password: `!guest-no-login-${randomBytes(24).toString('hex')}`,
      displayName: 'Guest',
      role: 'BUYER',
      isActive: false,
    },
    select: { id: true },
  })
  return created.id
}

function sanitizeGuestName(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  // Only allow the shape we generate ourselves, e.g. "Guest#4821".
  const m = raw.trim().match(/^Guest#(\d{4})$/)
  return m ? `Guest#${m[1]}` : ''
}

// Get public messages - GET /api/chat/public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const messages = await db.publicMessage.findMany({
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
            sellerProfile: {
              select: {
                id: true,
                companyName: true,
                logoUrl: true,
                isVerified: true,
              },
            },
          },
        },
        linkedSeller: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            isVerified: true,
          },
        },
      },
    })

    // Get online users count
    const onlineUsersCount = await db.user.count({
      where: { isOnline: true, isActive: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.reverse(),
        onlineUsersCount,
        pagination: {
          limit,
          offset,
          hasMore: messages.length === limit,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching public messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// Send public message - POST /api/chat/public
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const body = await request.json()
    const { content, linkedSellerId, messageType, fileUrl, fileName, fileSize, mimeType } = body

    // Guests may post plain text only. Uploads/seller-linking stay logged-in only.
    const isGuest = !session?.user
    let guestName = ''
    if (isGuest) {
      if (messageType && messageType !== 'TEXT') {
        return NextResponse.json(
          { success: false, error: 'Please sign in to share files or images' },
          { status: 401 }
        )
      }
      guestName = sanitizeGuestName(body.guestName)
      if (!guestName) {
        return NextResponse.json(
          { success: false, error: 'Invalid guest identity' },
          { status: 400 }
        )
      }
      if (typeof content === 'string' && content.trim().length > 500) {
        return NextResponse.json(
          { success: false, error: 'Guest messages are limited to 500 characters' },
          { status: 400 }
        )
      }
    }

    if (!messageType || messageType === 'TEXT') {
      if (!content || content.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Message content is required' },
          { status: 400 }
        )
      }
    }

    if ((messageType === 'IMAGE' || messageType === 'FILE') && !fileUrl) {
      return NextResponse.json(
        { success: false, error: 'File URL is required for image/file messages' },
        { status: 400 }
      )
    }

    const senderId = isGuest ? await getGuestUserId() : session!.user.id

    // Create message
    const message = await db.publicMessage.create({
      data: {
        content: content?.trim() || '',
        messageType: messageType || 'TEXT',
        senderId,
        guestName: isGuest ? guestName : null,
        linkedSellerId: isGuest ? null : (linkedSellerId || null),
        fileUrl: isGuest ? null : (fileUrl || null),
        fileName: isGuest ? null : (fileName || null),
        fileSize: isGuest ? null : (fileSize || null),
        mimeType: isGuest ? null : (mimeType || null),
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
            sellerProfile: {
              select: {
                id: true,
                companyName: true,
                logoUrl: true,
                isVerified: true,
              },
            },
          },
        },
        linkedSeller: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            isVerified: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: message,
    })
  } catch (error) {
    console.error('Error sending public message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
