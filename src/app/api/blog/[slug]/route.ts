import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const blog = await prisma.blog.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, displayName: true, avatarUrl: true, company: true },
      },
      comments: {
        include: {
          user: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
          replies: {
            include: {
              user: {
                select: { id: true, displayName: true, avatarUrl: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!blog) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
  }

  await prisma.blog.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  })

  return NextResponse.json(blog)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const body = await request.json()

    const blog = await prisma.blog.findUnique({ where: { slug } })
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    const comment = await prisma.blogComment.create({
      data: {
        blogId: blog.id,
        userId: body.userId,
        content: body.content,
        parentId: body.parentId,
      },
    })

    await prisma.blog.update({
      where: { slug },
      data: { commentCount: { increment: 1 } },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}