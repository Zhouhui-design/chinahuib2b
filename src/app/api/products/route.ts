import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"


// Validation schema for product creation/update
const productSchema = z.object({
  title: z.string().min(3).max(200),
  categoryId: z.string(),
  description: z.string().optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  minOrderQty: z.number().min(1).optional(),
  supplyCapacity: z.string().optional(),
  images: z.array(z.string()).optional(),
  mainImageUrl: z.string().url().optional(),
  isFeatured: z.boolean().optional().default(false),
})

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get seller profile
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const validation = productSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validation.error.issues 
      }, { status: 400 })
    }

    const data = validation.data

    // Create product
    const product = await prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description || '',
        specifications: data.specifications || {},
        minOrderQty: data.minOrderQty,
        supplyCapacity: data.supplyCapacity,
        images: data.images || [],
        mainImageUrl: data.mainImageUrl || '',
        isFeatured: data.isFeatured,
        isActive: true,
      },
      include: {
        category: true,
        seller: true
      }
    })

    return NextResponse.json({
      success: true,
      product,
      message: 'Product created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


export async function GET(request: NextRequest) {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId: seller.id },
        include: {
          category: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.product.count({
        where: { sellerId: seller.id }
      })
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch products' 
    }, { status: 500 })
  }
}
