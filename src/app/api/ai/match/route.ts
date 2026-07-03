import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { performProductMatching, performTaskMatching } from '@/lib/ai-matching-service'
import { sendProductMatchNotifications, sendTaskMatchNotifications, sendMatchNotificationsToBuyers, sendMatchNotificationsToSellers } from '@/lib/system-notification-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { targetId, targetType } = body

    if (!targetId || !targetType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: targetId, targetType' },
        { status: 400 }
      )
    }

    let matchingResult: { success: boolean; matches: any[]; product?: any; task?: any }

    if (targetType === 'product') {
      matchingResult = await performProductMatching(targetId)
    } else if (targetType === 'task') {
      matchingResult = await performTaskMatching(targetId)
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid targetType. Must be "product" or "task"' },
        { status: 400 }
      )
    }

    if (!matchingResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to perform matching' },
        { status: 500 }
      )
    }

    let notificationResults: any[] = []

    if (targetType === 'product' && matchingResult.product) {
      const seller = await prisma.sellerProfile.findUnique({
        where: { id: matchingResult.product.sellerId },
        include: { user: true }
      })

      if (seller) {
        notificationResults = await sendProductMatchNotifications(
          seller.userId,
          matchingResult.product.title,
          matchingResult.matches
        )

        await sendMatchNotificationsToBuyers(
          matchingResult.matches,
          matchingResult.product.title,
          seller.user?.displayName || seller.companyName || '卖家'
        )
      }
    } else if (targetType === 'task' && matchingResult.task) {
      const buyerUser = await prisma.user.findUnique({
        where: { id: matchingResult.task.postedById }
      })

      if (buyerUser) {
        notificationResults = await sendTaskMatchNotifications(
          buyerUser.id,
          matchingResult.task.title,
          matchingResult.matches
        )

        await sendMatchNotificationsToSellers(
          matchingResult.matches,
          matchingResult.task.title,
          buyerUser.displayName || buyerUser.username || '买家'
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        targetId,
        targetType,
        matches: matchingResult.matches,
        matchCount: matchingResult.matches.length,
        notifications: notificationResults
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error in AI match API:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const targetId = searchParams.get('targetId')
    const targetType = searchParams.get('targetType')

    if (!targetId || !targetType) {
      return NextResponse.json(
        { success: false, error: 'Missing query parameters: targetId, targetType' },
        { status: 400 }
      )
    }

    let matchingResult: { success: boolean; matches: any[]; product?: any; task?: any }

    if (targetType === 'product') {
      matchingResult = await performProductMatching(targetId)
    } else if (targetType === 'task') {
      matchingResult = await performTaskMatching(targetId)
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid targetType. Must be "product" or "task"' },
        { status: 400 }
      )
    }

    if (!matchingResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to perform matching' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        targetId,
        targetType,
        matches: matchingResult.matches,
        matchCount: matchingResult.matches.length
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error in AI match API:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}