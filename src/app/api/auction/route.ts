import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

const LISTING_COST = 0.10

// Get auction listings - GET /api/auction
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'SELLING'
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'createdAt'

    const where: any = {
      type: type as any,
      status: 'ACTIVE',
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }

    const listings = await db.auctionListing.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { [sortBy]: 'desc' },
      include: {
        poster: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            isOnline: true,
          },
        },
        seller: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            isVerified: true,
          },
        },
        digitalVoucher: true,
      },
    })

    const total = await db.auctionListing.count({ where })

    return NextResponse.json({
      success: true,
      data: {
        listings,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + listings.length < total,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching auction listings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

// Create auction listing - POST /api/auction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      type,
      title,
      description,
      category,
      tags,
      price,
      currency = 'USD',
      minOrderQty,
      maxOrderQty,
      images,
      videos,
      documents,
      contactEmail,
      contactPhone,
      contactWeChat,
      contactWhatsApp,
      sellerId,
      digitalVoucherId,
      expiresInDays = 30,
    } = await request.json()

    if (!type || !title) {
      return NextResponse.json(
        { success: false, error: 'Type and title are required' },
        { status: 400 }
      )
    }

    // Verify seller if provided
    if (sellerId) {
      const seller = await db.sellerProfile.findUnique({
        where: { id: sellerId },
      })
      if (!seller || seller.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Invalid seller' },
          { status: 400 }
        )
      }
    }

    // Create listing
    const listing = await db.auctionListing.create({
      data: {
        type: type as any,
        title,
        description,
        category,
        tags: tags || [],
        price: price ? parseFloat(price) : null,
        currency,
        minOrderQty: minOrderQty ? parseInt(minOrderQty) : null,
        maxOrderQty: maxOrderQty ? parseInt(maxOrderQty) : null,
        images: images || [],
        videos: videos || [],
        documents: documents || [],
        contactEmail,
        contactPhone,
        contactWeChat,
        contactWhatsApp,
        posterId: session.user.id,
        sellerId: sellerId || null,
        isPaid: true,
        cost: LISTING_COST,
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
        digitalVoucherId: digitalVoucherId || null,
      },
      include: {
        poster: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            isOnline: true,
          },
        },
        seller: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            isVerified: true,
          },
        },
        digitalVoucher: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        listing,
        cost: LISTING_COST,
      },
    })
  } catch (error) {
    console.error('Error creating auction listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}
