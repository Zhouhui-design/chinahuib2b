import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const commentLimit = parseInt(searchParams.get('commentLimit') || '50')
    const commentOffset = parseInt(searchParams.get('commentOffset') || '0')

    const topic = await db.topic.findUnique({
      where: {
        id: params.id,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            sellerProfile: {
              select: {
                companyName: true,
                logoUrl: true,
                isVerified: true,
              },
            },
          },
        },
      },
    })

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topic not found' },
        { status: 404 }
      )
    }

    await db.topic.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    })

    const comments = await db.topicComment.findMany({
      where: {
        topicId: params.id,
      },
      take: commentLimit,
      skip: commentOffset,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            sellerProfile: {
              select: {
                companyName: true,
                logoUrl: true,
                isVerified: true,
              },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    const totalComments = await db.topicComment.count({
      where: { topicId: params.id },
    })

    return NextResponse.json({
      success: true,
      data: {
        topic,
        comments,
        commentPagination: {
          limit: commentLimit,
          offset: commentOffset,
          total: totalComments,
          hasMore: commentOffset + commentLimit < totalComments,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching topic:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch topic' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const topic = await db.topic.findUnique({
      where: { id: params.id },
    })

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topic not found' },
        { status: 404 }
      )
    }

    if (topic.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      )
    }

    await db.topic.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      message: 'Topic deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting topic:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete topic' },
      { status: 500 }
    )
  }
}