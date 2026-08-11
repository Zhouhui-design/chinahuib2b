import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { invalidateBoothCaches, invalidateSellerCaches } from "@/lib/cache"

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { boothId, productIds } = body

    if (!boothId) {
      return NextResponse.json({ error: 'Booth ID is required' }, { status: 400 })
    }

    // Verify booth ownership
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const booth = await prisma.booth.findUnique({
      where: { id: boothId }
    })

    if (!booth) {
      return NextResponse.json({ error: 'Booth not found' }, { status: 404 })
    }

    if (booth.sellerId !== sellerProfile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check booth product count limit (100 products)
    const currentProductCount = await prisma.product.count({
      where: { boothId }
    })
    
    const productsToAdd = productIds || []
    if (productsToAdd.length > 0 && currentProductCount + productsToAdd.length > 100) {
      return NextResponse.json({ 
        error: 'Booth can have maximum 100 products',
        currentCount: currentProductCount,
        requestedAdd: productsToAdd.length
      }, { status: 400 })
    }

    // Update products to belong to this booth
    if (productsToAdd.length > 0) {
      await prisma.product.updateMany({
        where: {
          id: { in: productsToAdd },
          sellerId: sellerProfile.id
        },
        data: { boothId }
      })
    }

    // Invalidate booth + seller caches so exhibition and store pages
    // reflect the updated product list immediately.
    await invalidateBoothCaches(boothId, sellerProfile.id)
    await invalidateSellerCaches(sellerProfile.id, sellerProfile.storeSlug || undefined)

    return NextResponse.json({
      success: true,
      message: `${productsToAdd.length} products added to booth`
    })

  } catch (error) {
    console.error('Add products to booth error:', error)
    return NextResponse.json({ error: 'Failed to add products' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productIds } = body

    if (!productIds || productIds.length === 0) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 })
    }

    // Verify ownership
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    // Remove products from booth (set boothId to null)
    const result = await prisma.product.updateMany({
      where: {
        id: { in: productIds },
        sellerId: sellerProfile.id,
        boothId: { not: null }
      },
      data: { boothId: null }
    })

    // Invalidate seller caches so store pages reflect the change immediately.
    await invalidateSellerCaches(sellerProfile.id, sellerProfile.storeSlug || undefined)

    return NextResponse.json({
      success: true,
      message: `${result.count} products removed from booth`
    })

  } catch (error) {
    console.error('Remove products from booth error:', error)
    return NextResponse.json({ error: 'Failed to remove products' }, { status: 500 })
  }
}
