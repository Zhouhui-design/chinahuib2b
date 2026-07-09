import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'
import { z } from 'zod'

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().optional(),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = commentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }

    const { content, parentId } = validation.data

    const comment = await db.topicComment.create({
      data: {
        topicId: params.id,
        userId: session.user.id,
        content: content.trim(),
        parentId,
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

    await db.topic.update({
      where: { id: params.id },
      data: { commentCount: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      data: { comment },
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}