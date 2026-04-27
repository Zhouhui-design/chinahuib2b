import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Get total count
    const total = await prisma.sellerProfile.count({
      where: {
        isActive: true
      }
    })

    // Get sellers with pagination
    const sellers = await prisma.sellerProfile.findMany({
      where: {
        isActive: true
      },
      include: {
        user: {
          select: { 
            username: true,
            email: true
          }
        },
        products: {
          where: { isActive: true },
          take: 3,
          select: {
            id: true,
            title: true,
            mainImageUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    return NextResponse.json({
      sellers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching sellers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sellers' },
      { status: 500 }
    )
  }
}
