import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getPublishedBoothById } from "@/lib/server/booths"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // If ID is provided, get single booth
    if (id) {
      const booth = await getPublishedBoothById(id)

      if (!booth) {
        return NextResponse.json({ error: 'Booth not found' }, { status: 404 })
      }

      return NextResponse.json({ booth })
    }

    // Otherwise, get all published booths
    const booths = await prisma.booth.findMany({
      where: { 
        isActive: true,
        isPublished: true
      },
      include: {
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
        products: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            mainImageUrl: true,
            images: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ booths })

  } catch (error) {
    console.error('Get public booths error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch booths',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
