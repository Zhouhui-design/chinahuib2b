import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')
  const sellerId = searchParams.get('sellerId')
  const rating = searchParams.get('rating')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const where: any = {
    isActive: true,
  }

  if (productId) {
    where.productId = productId
  }

  if (sellerId) {
    where.sellerId = sellerId
  }

  if (rating) {
    where.rating = parseInt(rating)
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ])

  const allReviews = await prisma.review.findMany({
    where: { ...where, isActive: true },
    select: { rating: true },
  })

  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  allReviews.forEach((review) => {
    const rating = review.rating as number
    if (ratingCounts[rating as keyof typeof ratingCounts] !== undefined) {
      ratingCounts[rating as keyof typeof ratingCounts]++
    }
  })

  const averageRating =
    allReviews.length > 0
      ? allReviews.reduce((sum, review) => sum + (review.rating as number), 0) /
        allReviews.length
      : 0

  return NextResponse.json({
    reviews,
    total,
    averageRating,
    ratingCounts,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const review = await prisma.review.create({
      data: {
        productId: body.productId,
        sellerId: body.sellerId,
        userId: body.userId,
        rating: body.rating,
        title: body.title,
        content: body.content,
        images: body.images || [],
        isVerified: body.isVerified ?? false,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}