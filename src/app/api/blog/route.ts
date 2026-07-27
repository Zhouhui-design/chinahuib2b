import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const where: any = {
    isPublished: true,
  }

  if (category) {
    where.category = category.toUpperCase()
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { titleEn: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      { tags: { hasSome: [search] } },
    ]
  }

  const [posts, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: {
        author: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.blog.count({ where }),
  ])

  return NextResponse.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        titleEn: body.titleEn,
        slug: body.slug,
        content: body.content,
        contentEn: body.contentEn,
        excerpt: body.excerpt,
        excerptEn: body.excerptEn,
        category: body.category || 'OTHER',
        tags: body.tags || [],
        images: body.images || [],
        featuredImage: body.featuredImage,
        authorId: body.authorId,
        isPublished: body.isPublished ?? true,
        seoTitle: body.seoTitle,
        seoTitleEn: body.seoTitleEn,
        seoDescription: body.seoDescription,
        seoDescriptionEn: body.seoDescriptionEn,
        seoKeywords: body.seoKeywords || [],
      },
    })

    return NextResponse.json(blog, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}