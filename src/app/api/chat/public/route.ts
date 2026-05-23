import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

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
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { content, linkedSellerId } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Create message
    const message = await db.publicMessage.create({
      data: {
        content: content.trim(),
        senderId: session.user.id,
        linkedSellerId: linkedSellerId || null,
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
