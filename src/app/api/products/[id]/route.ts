import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { handleSEOEvent } from "@/lib/seo-automation"
import { appendFileSync } from 'fs'


const productUpdateSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  minOrderQty: z.number().min(1).optional(),
  minOrderUnitId: z.string().optional(),
  supplyCapacity: z.string().optional(),
  supplyCapacityUnitId: z.string().optional(),
  images: z.array(z.string()).optional(),
  mainImageUrl: z.string().optional().refine(
    (val) => !val || val.startsWith('/uploads/') || /^https?:\/\//.test(val),
    { message: 'mainImageUrl must be a valid URL or a relative path starting with /uploads/' }
  ),
  videos: z.array(z.string().refine(
    (val) => val.startsWith('/uploads/') || /^https?:\/\//.test(val),
    { message: 'Video URL must be a valid URL or a relative path starting with /uploads/' }
  )).optional(),
  documents: z.array(z.object({
    url: z.string().refine(
      (val) => val.startsWith('/uploads/') || /^https?:\/\//.test(val),
      { message: 'Document URL must be a valid URL or a relative path starting with /uploads/' }
    ),
    name: z.string().optional(),
    type: z.string().optional(),
    size: z.number().optional(),
  })).optional(),
  isFeatured: z.boolean().optional(),
  acceptsOEM: z.boolean().optional(),
  youtubeUrl: z.string().optional().refine(
    (val) => !val || /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/i.test(val),
    { message: 'YouTube URL must be a valid YouTube video link' }
  ),
  isActive: z.boolean().optional(),
  boothId: z.string().optional(),
})


export async function GET(
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

    // Fetch product and verify ownership
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: true,
        minOrderUnit: true,
        supplyCapacityUnit: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.sellerId !== seller.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ product })

  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch product' 
    }, { status: 500 })
  }
}


export async function PUT(
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

    // Verify product belongs to this seller
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (existingProduct.sellerId !== seller.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validation = productUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validation.error.issues 
      }, { status: 400 })
    }

    const data = { ...validation.data }

    // Convert foreign-key scalar fields to Prisma nested connect syntax.
    // Prisma's update() doesn't accept raw FK columns (categoryId, minOrderUnitId,
    // supplyCapacityUnitId) — they must be wrapped in { connect: { id } }.
    // Also strip fields that exist in Zod schema but NOT yet in the Prisma model
    // (acceptsOEM, youtubeUrl) — these require a DB migration to enable.
    const { categoryId, minOrderUnitId, supplyCapacityUnitId, acceptsOEM, youtubeUrl, ...restData } = data as any
    const prismaData: any = { ...restData }
    if (categoryId) prismaData.category = { connect: { id: categoryId } }
    if (minOrderUnitId) prismaData.minOrderUnit = { connect: { id: minOrderUnitId } }
    if (supplyCapacityUnitId) prismaData.supplyCapacityUnit = { connect: { id: supplyCapacityUnitId } }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: prismaData,
      include: {
        category: true,
        seller: true,
        minOrderUnit: true,
        supplyCapacityUnit: true
      }
    })

    setTimeout(async () => {
      try {
        const seoResult = await handleSEOEvent({
          type: 'product_update',
          data: {
            id: product.id,
            url: `https://x2xhub.com/de/products/${product.id}`,
            title: product.title,
            description: product.description,
            imageUrl: product.mainImageUrl ? `https://x2xhub.com${product.mainImageUrl}` : undefined,
          },
        })
        
        console.log(`SEO automation completed for product ${product.id} update:`, JSON.stringify({
          cloudflare: seoResult.cloudflare.success,
          pingResults: seoResult.pingResults.filter(r => r.status === 'success').length,
        }))
      } catch (error) {
        console.error('Error in SEO automation for product update:', error)
      }
    }, 500)

    return NextResponse.json({
      success: true,
      product,
      message: 'Product updated successfully'
    })

  } catch (error) {
    // Log full error details to file for debugging
    const errorDetail = error instanceof Error
      ? `${error.message}\n${error.stack || ''}\nCause: ${JSON.stringify((error as any).cause || {}, null, 2)}`
      : JSON.stringify(error, null, 2)
    try {
      appendFileSync('/var/www/chinahuib2b/logs/product-update-errors.log',
        `[${new Date().toISOString()}] Product ${id} update error:\n${errorDetail}\n\n`)
    } catch {}
    console.error('Update product error:', errorDetail)
    return NextResponse.json({
      error: 'Failed to update product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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

    // Verify product belongs to this seller
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.sellerId !== seller.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete product (cascade will delete related brochures)
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
