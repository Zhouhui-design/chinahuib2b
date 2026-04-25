import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"


export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    // Fetch store brochures for this seller
    const brochures = await prisma.storeBrochure.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ brochures })

  } catch (error) {
    console.error('Get brochures error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch brochures' 
    }, { status: 500 })
  }
}
