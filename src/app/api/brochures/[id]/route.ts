import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"


export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Find brochure and verify ownership
    const brochure = await prisma.storeBrochure.findFirst({
      where: {
        id,
        sellerId: seller.id
      }
    })

    if (!brochure) {
      return NextResponse.json({ error: 'Brochure not found' }, { status: 404 })
    }

    // Delete from database (file remains in storage - could add cleanup later)
    await prisma.storeBrochure.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Brochure deleted successfully'
    })

  } catch (error) {
    console.error('Delete brochure error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete brochure',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
