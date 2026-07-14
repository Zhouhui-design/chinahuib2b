import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cacheGetOrSet, CACHE_KEYS, CACHE_TTL, trackProductView } from '@/lib/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cacheKey = CACHE_KEYS.product(id)

    // Use cache or fetch fresh data
    const product = await cacheGetOrSet(
      cacheKey,
      async () => {
        const result = await prisma.product.findUnique({
          where: { 
            id,
            isActive: true 
          },
          include: {
            category: true,
            seller: {
              select: {
                id: true,
                companyName: true,
                country: true,
                city: true,
                phone: true,
                email: true,
                website: true,
                logoUrl: true
              }
            },
            brochure: true
          }
        })
        
        if (result) {
          return {
            ...result,
            videos: result.videos || [],
            documents: result.documents || []
          }
        }
        return null
      },
      CACHE_TTL.LONG // Cache for 1 hour
    )

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Track view in Redis (async, don't wait)
    trackProductView(id).catch(console.error)

    // Increment view count in database (async)
    prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    }).catch(console.error)

    return NextResponse.json({ 
      success: true,
      product 
    })

  } catch (error) {
    console.error('Get public product error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
