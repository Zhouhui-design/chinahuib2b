import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const listings = await prisma.auctionListing.findMany({
      where: {
        posterId: session.user.id,
      },
      include: {
        poster: {
          select: { id: true, username: true, email: true, displayName: true },
        },
        seller: {
          select: { id: true, companyName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: listings })
  } catch (error) {
    console.error('Error fetching user listings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}