import { NextRequest, NextResponse } from 'next/server'
import { resolveUserId } from '@/lib/chat-auth'
import { db } from '@/lib/db'

// GET /api/chat/unread-count
// Returns unread private message count for the current user (seller inbox badge)
export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const unreadCount = await db.privateMessage.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    })

    return NextResponse.json({
      success: true,
      data: { unreadCount },
    })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch unread count' },
      { status: 500 }
    )
  }
}
