import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: { id: string; commentId: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const existingLike = await db.topicLike.findUnique({
      where: {
        TopicLike_userId_commentId_key: {
          userId: session.user.id,
          commentId: params.commentId,
        },
      },
    })

    if (existingLike) {
      await db.topicLike.delete({
        where: { id: existingLike.id },
      })

      await db.topicComment.update({
        where: { id: params.commentId },
        data: { likeCount: { decrement: 1 } },
      })

      return NextResponse.json({
        success: true,
        data: { liked: false },
      })
    } else {
      await db.topicLike.create({
        data: {
          userId: session.user.id,
          commentId: params.commentId,
        },
      })

      await db.topicComment.update({
        where: { id: params.commentId },
        data: { likeCount: { increment: 1 } },
      })

      return NextResponse.json({
        success: true,
        data: { liked: true },
      })
    }
  } catch (error) {
    console.error('Error toggling comment like:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}