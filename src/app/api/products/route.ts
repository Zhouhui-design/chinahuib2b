import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redis } from "@/lib/redis"
import { z } from "zod"


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

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validation = productSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 })
    }

    const data = validation.data

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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const includeAI = searchParams.get('includeAI') !== 'false'

    const [dbProducts, total] = await Promise.all([
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

    let aiProducts: any[] = []
    let aiTotal = 0

    if (includeAI) {
      const storeId = seller.id
      const aiProductsKey = `ai:store:${storeId}:products`

      try {
        const aiProductIds = await redis.lrange(aiProductsKey, 0, -1)

        if (aiProductIds && aiProductIds.length > 0) {
          aiTotal = aiProductIds.length
          const aiStartIndex = skip
          const aiEndIndex = skip + limit - 1
          const paginatedIds = aiProductIds.slice(aiStartIndex, aiEndIndex + 1)

          for (const productId of paginatedIds) {
            const productData = await redis.get(`ai:product:${productId}`)
            if (productData) {
              const product = JSON.parse(productData)
              aiProducts.push({
                id: product.id,
                title: product.name,
                description: product.description,
                mainImageUrl: product.images?.[0] || '',
                images: product.images || [],
                price: product.price,
                currency: product.currency,
                category: product.category,
                minOrderQty: product.moq,
                specifications: product.specifications,
                viewCount: product.views || 0,
                inquiryCount: 0,
                isActive: product.status === 'active',
                isFeatured: false,
                isAIGenerated: true,
                aiAgentId: product.aiIdentityId,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
                sellerId: seller.id,
              })
            }
          }
        }
      } catch (redisError) {
        console.error('Error fetching AI products from Redis:', redisError)
      }
    }

    const allProducts = [...dbProducts.map(p => ({ ...p, isAIGenerated: false })), ...aiProducts]
    allProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const totalCount = total + aiTotal
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      products: allProducts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        dbProductsCount: total,
        aiProductsCount: aiTotal
      }
    })

  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json({
      error: 'Failed to fetch products'
    }, { status: 500 })
  }
}