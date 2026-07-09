import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
        TopicLike_userId_topicId_key: {
          userId: session.user.id,
          topicId: params.id,
        },
      },
    })

    if (existingLike) {
      await db.topicLike.delete({
        where: { id: existingLike.id },
      })

      await db.topic.update({
        where: { id: params.id },
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
          topicId: params.id,
        },
      })

      await db.topic.update({
        where: { id: params.id },
        data: { likeCount: { increment: 1 } },
      })

      return NextResponse.json({
        success: true,
        data: { liked: true },
      })
    }
  } catch (error) {
    console.error('Error toggling topic like:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}