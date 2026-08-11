import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { invalidateSellerCaches, invalidateProductCaches } from "@/lib/cache"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { products } = body

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({
        error: 'Products array is required'
      }, { status: 400 })
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const results = {
      success: [] as any[],
      failed: [] as any[],
      total: products.length,
      createdCount: 0,
      failedCount: 0
    }

    for (let i = 0; i < products.length; i++) {
      const product = products[i]

      try {
        const specsObj = (product.specifications || []).reduce((acc: any, spec: any) => {
          if (spec.key?.trim() && spec.value?.trim()) {
            acc[spec.key.trim()] = spec.value.trim()
          }
          return acc
        }, {})

        const created = await prisma.product.create({
          data: {
            title: product.title,
            description: product.description || '',
            categoryId: product.categoryId,
            sellerId: seller.id,
            images: product.images || [],
            mainImageUrl: product.mainImageUrl || (product.images?.[0] || ''),
            minOrderQty: product.minOrderQty || 1,
            supplyCapacity: product.supplyCapacity || '',
            specifications: Object.keys(specsObj).length > 0 ? specsObj : undefined,
            isActive: true,
          }
        })

        results.success.push({
          index: i,
          title: product.title,
          id: created.id
        })
        results.createdCount++

      } catch (err) {
        results.failed.push({
          index: i,
          title: product.title,
          error: err instanceof Error ? err.message : 'Failed to create'
        })
        results.failedCount++
      }
    }

    // Invalidate seller caches so store page lists the newly created products
    // (with their mainImageUrl/images) immediately instead of after 24h.
    if (results.createdCount > 0) {
      await invalidateSellerCaches(seller.id, seller.storeSlug || undefined)
      await invalidateProductCaches('bulk', seller.id)
    }

    return NextResponse.json({
      success: true,
      message: `Created ${results.createdCount} products, ${results.failedCount} failed`,
      results
    })

  } catch (error) {
    console.error('Bulk create error:', error)
    return NextResponse.json({
      error: 'Failed to process bulk upload'
    }, { status: 500 })
  }
}