import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

const DAILY_FREE_LIMIT = 10
const PAID_SHOUT_OUT_COST = 0.10

// Get shout outs - GET /api/shout-outs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const shoutOuts = await db.shoutOut.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      take: limit,
      skip: offset,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
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
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        shoutOuts,
        pagination: {
          limit,
          offset,
          hasMore: shoutOuts.length === limit,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching shout outs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shout outs' },
      { status: 500 }
    )
  }
}

// Create shout out - POST /api/shout-outs
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { content, priority = 1, expiresInHours = 24 } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if it's a new day and reset counter
    const today = new Date()
    const todayDateStr = today.toISOString().split('T')[0]
    const lastShoutOutDate = user.lastShoutOutDate
      ? user.lastShoutOutDate.toISOString().split('T')[0]
      : null

    let isFree = true
    let remainingFree = 0

    if (todayDateStr === lastShoutOutDate) {
      // Same day - use existing counter
      if (user.dailyShoutOuts >= DAILY_FREE_LIMIT) {
        isFree = false
      } else {
        remainingFree = DAILY_FREE_LIMIT - user.dailyShoutOuts
      }
    } else {
      // New day - reset counter
      await db.user.update({
        where: { id: session.user.id },
        data: {
          dailyShoutOuts: 0,
          lastShoutOutDate: today,
        },
      })
      remainingFree = DAILY_FREE_LIMIT - 1
    }

    // Create shout out
    const shoutOut = await db.shoutOut.create({
      data: {
        content: content.trim(),
        senderId: session.user.id,
        isFree,
        cost: isFree ? 0 : PAID_SHOUT_OUT_COST,
        priority,
        expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000),
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
      },
    })

    // Update user's daily counter
    await db.user.update({
      where: { id: session.user.id },
      data: {
        dailyShoutOuts: {
          increment: 1,
        },
        lastShoutOutDate: today,
      },
    })

    // Get updated stats
    const updatedUser = await db.user.findUnique({
      where: { id: session.user.id },
    })

    const newRemainingFree = Math.max(0, DAILY_FREE_LIMIT - (updatedUser?.dailyShoutOuts || 0))

    return NextResponse.json({
      success: true,
      data: {
        shoutOut,
        stats: {
          remainingFree: isFree ? newRemainingFree : remainingFree,
          isFree,
          cost: isFree ? 0 : PAID_SHOUT_OUT_COST,
        },
      },
    })
  } catch (error) {
    console.error('Error creating shout out:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create shout out' },
      { status: 500 }
    )
  }
}

// Get user's shout out stats - GET /api/shout-outs/stats
export async function GET_STATS() {
  // Helper function - will be used in separate stats endpoint
}
