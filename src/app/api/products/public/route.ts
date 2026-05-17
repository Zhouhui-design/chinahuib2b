import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cacheGetOrSet, CACHE_KEYS, CACHE_TTL, trackProductView } from '@/lib/cache'

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const categoryId = searchParams.get('categoryId')
    const featured = searchParams.get('featured') === 'true'
    
    // Build cache key
    const filters = [
      categoryId && `cat:${categoryId}`,
      featured && 'featured',
    ].filter(Boolean).join(':')
    
    const cacheKey = CACHE_KEYS.productList(page, limit, filters || undefined)

    // Use cache or fetch fresh data
    const data = await cacheGetOrSet(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit
        
        const where: any = {
          isActive: true,
        }
        
        if (categoryId) {
          where.categoryId = categoryId
        }
        
        if (featured) {
          where.isFeatured = true
        }

        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  nameEn: true,
                  slug: true,
                }
              },
              seller: {
                select: {
                  id: true,
                  companyName: true,
                  country: true,
                  city: true,
                  logoUrl: true,
                  isVerified: true,
                }
              },
              brochure: {
                select: {
                  id: true,
                  fileName: true,
                  fileSize: true,
                }
              }
            },
            orderBy: [
              { isFeatured: 'desc' },
              { createdAt: 'desc' },
            ],
            skip,
            take: limit,
          }),
          prisma.product.count({ where }),
        ])

        return {
          products,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          }
        }
      },
      CACHE_TTL.MEDIUM // Cache for 30 minutes
    )

    return NextResponse.json(data)

  } catch (error) {
    console.error('Get public products error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
