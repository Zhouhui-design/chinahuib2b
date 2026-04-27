import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"


const productUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  minOrderQty: z.number().min(1).optional(),
  supplyCapacity: z.string().optional(),
  images: z.array(z.string()).optional(),
  mainImageUrl: z.string().url().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
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
        seller: true
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

    const data = validation.data

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        seller: true
      }
    })

    return NextResponse.json({
      success: true,
      product,
      message: 'Product updated successfully'
    })

  } catch (error) {
    console.error('Update product error:', error)
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
