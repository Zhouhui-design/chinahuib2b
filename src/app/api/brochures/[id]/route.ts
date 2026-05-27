import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Try to find in product brochures first
    const brochure = await prisma.productBrochure.findUnique({
      where: { id },
      include: { product: true }
    })
    
    if (brochure) {
      return NextResponse.json({
        type: 'PRODUCT',
        brochure: {
          id: brochure.id,
          fileName: brochure.fileName,
          fileSize: brochure.fileSize,
          downloadCount: brochure.downloadCount,
          productId: brochure.productId,
          productTitle: brochure.product.title
        }
      })
    }
    
    // Try store brochures
    const storeBrochure = await prisma.storeBrochure.findUnique({
      where: { id },
      include: { seller: true }
    })
    
    if (storeBrochure) {
      return NextResponse.json({
        type: 'STORE',
        brochure: {
          id: storeBrochure.id,
          title: storeBrochure.title,
          fileName: storeBrochure.fileName,
          fileSize: storeBrochure.fileSize,
          downloadCount: storeBrochure.downloadCount,
          sellerId: storeBrochure.sellerId,
          companyName: storeBrochure.seller.companyName
        }
      })
    }
    
    return NextResponse.json({ error: 'Brochure not found' }, { status: 404 })
  } catch (error) {
    console.error('Get brochure error:', error)
    return NextResponse.json({ error: 'Failed to fetch brochure' }, { status: 500 })
  }
}

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
