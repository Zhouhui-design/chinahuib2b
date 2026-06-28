import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const booths = await prisma.booth.findMany({
      where: { isPublished: true, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: {
            id: true,
            companyName: true,
            country: true,
            city: true,
            logoUrl: true
          }
        },
        products: {
          select: {
            id: true,
            title: true,
            mainImageUrl: true,
            images: true
          },
          take: 4
        }
      }
    })

    return NextResponse.json({ booths })

  } catch (error) {
    console.error('Get public booths error:', error)
    return NextResponse.json({ error: 'Failed to fetch booths' }, { status: 500 })
  }
}
