import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cacheGetOrSet, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cacheKey = CACHE_KEYS.seller(id)

    // Use cache or fetch fresh data
    const seller = await cacheGetOrSet(
      cacheKey,
      async () => {
        return await prisma.sellerProfile.findUnique({
          where: { 
            id,
            isActive: true 
          },
          include: {
            products: {
              where: {
                isActive: true
              },
              orderBy: {
                createdAt: 'desc'
              },
              include: {
                category: true
              }
            },
            storeBrochures: {
              orderBy: {
                sortOrder: 'asc'
              }
            }
          }
        })
      },
      CACHE_TTL.LONG // Cache for 1 hour
    )

    if (!seller) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      seller 
    })

  } catch (error) {
    console.error('Get public seller error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch store',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
