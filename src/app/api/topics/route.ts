import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const topicSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  category: z.enum(['INDUSTRY', 'HOT_TOPIC', 'PRODUCT', 'NEWS', 'RECRUITMENT', 'ARTICLE', 'OTHER']).optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  documents: z.array(z.object({
    url: z.string(),
    name: z.string().optional(),
    type: z.string().optional(),
    size: z.number().optional(),
  })).optional(),
  link: z.string().url().optional(),
  phone: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category') as any
    const search = searchParams.get('search')

    const where: any = {
      isActive: true,
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ]
    }

    const topics = await db.topic.findMany({
      where,
      take: limit,
      skip: offset,
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
      },
    })

    const total = await db.topic.count({ where })

    return NextResponse.json({
      success: true,
      data: {
        topics,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = topicSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }

    const { title, content, category, images, videos, documents, link, phone } = validation.data

    const topic = await db.topic.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        content: content.trim(),
        category: category || 'OTHER',
        images: images || [],
        videos: videos || [],
        documents: documents ? JSON.parse(JSON.stringify(documents)) : null,
        link,
        phone,
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

    return NextResponse.json({
      success: true,
      data: { topic },
    })
  } catch (error) {
    console.error('Error creating topic:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create topic' },
      { status: 500 }
    )
  }
}