import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redis } from "@/lib/redis"
import { z } from "zod"
import { translateText, autoTranslateToAllLanguages } from "@/lib/translation-service"
import { performProductMatching } from "@/lib/ai-matching-service"
import { sendProductMatchNotifications, sendMatchNotificationsToBuyers } from "@/lib/system-notification-service"
import { handleSEOEvent } from "@/lib/seo-automation"


const productSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  titles: z.record(z.string(), z.string()).optional(),
  categoryId: z.string(),
  description: z.string().optional(),
  descriptions: z.record(z.string(), z.string()).optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  minOrderQty: z.number().min(1).optional(),
  supplyCapacity: z.string().optional(),
  images: z.array(z.string().refine(
    (val) => val.startsWith('/uploads/') || /^https?:\/\//.test(val),
    { message: 'Image URL must be a valid URL or a relative path starting with /uploads/' }
  )).optional(),
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
  isFeatured: z.boolean().optional().default(false),
  acceptsOEM: z.boolean().optional().default(false),
  youtubeUrl: z.string().optional().refine(
    (val) => !val || /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/i.test(val),
    { message: 'YouTube URL must be a valid YouTube video link' }
  ),
  autoTranslate: z.boolean().optional().default(false),
  sourceLanguage: z.string().optional().default('en'),
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
    console.log('Create product request body:', JSON.stringify(body, null, 2))
    const validation = productSchema.safeParse(body)

    if (!validation.success) {
      console.log('Validation failed:', JSON.stringify(validation.error.issues, null, 2))
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 })
    }

    const data = validation.data

    let titles: Record<string, string> = data.titles || {}
    let descriptions: Record<string, string> = data.descriptions || {}

    if (data.autoTranslate) {
      if (data.title && Object.keys(titles).length === 0) {
        titles = await autoTranslateToAllLanguages(data.title, data.sourceLanguage || 'en')
      }
      if (data.description && Object.keys(descriptions).length === 0) {
        descriptions = await autoTranslateToAllLanguages(data.description, data.sourceLanguage || 'en')
      }
    } else {
      if (data.title && !titles[data.sourceLanguage || 'en']) {
        titles[data.sourceLanguage || 'en'] = data.title
      }
      if (data.description && !descriptions[data.sourceLanguage || 'en']) {
        descriptions[data.sourceLanguage || 'en'] = data.description
      }
    }

    const product = await prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: data.categoryId,
        title: data.title || titles['en'] || Object.values(titles)[0] || 'Untitled Product',
        titles: Object.keys(titles).length > 0 ? titles : null,
        description: data.description || descriptions['en'] || Object.values(descriptions)[0] || '',
        descriptions: Object.keys(descriptions).length > 0 ? descriptions : null,
        specifications: data.specifications || {},
        minOrderQty: data.minOrderQty,
        supplyCapacity: data.supplyCapacity,
        images: data.images || [],
        mainImageUrl: data.mainImageUrl || '',
        videos: data.videos || [],
        documents: data.documents ? JSON.parse(JSON.stringify(data.documents)) : null,
        isFeatured: data.isFeatured,
        acceptsOEM: data.acceptsOEM,
        youtubeUrl: data.youtubeUrl,
        isActive: true,
      },
      include: {
        category: true,
        seller: true
      }
    })

    setTimeout(async () => {
      try {
        const matchingResult = await performProductMatching(product.id)
        
        if (matchingResult.success && matchingResult.matches.length > 0) {
          const sellerUser = await prisma.user.findUnique({
            where: { id: session.user.id }
          })
          
          await sendProductMatchNotifications(
            session.user.id,
            product.title,
            matchingResult.matches
          )
          
          await sendMatchNotificationsToBuyers(
            matchingResult.matches,
            product.title,
            sellerUser?.displayName || seller.companyName || '卖家'
          )
          
          console.log(`AI matching completed for product ${product.id}: ${matchingResult.matches.length} matches found`)
        }
      } catch (error) {
        console.error('Error in AI matching for product:', error)
      }
    }, 100)

    setTimeout(async () => {
      try {
        const seoResult = await handleSEOEvent({
          type: 'product_create',
          data: {
            id: product.id,
            url: `https://x2xhub.com/products/${product.id}`,
            title: product.title,
            description: product.description,
            imageUrl: product.mainImageUrl ? `https://x2xhub.com${product.mainImageUrl}` : undefined,
          },
        })
        
        console.log(`SEO automation completed for product ${product.id}:`, JSON.stringify({
          cloudflare: seoResult.cloudflare.success,
          pingResults: seoResult.pingResults.filter(r => r.status === 'success').length,
        }))
      } catch (error) {
        console.error('Error in SEO automation for product:', error)
      }
    }, 500)

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

    const [dbProducts, total, booths] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId: seller.id },
        include: {
          category: { select: { name: true } },
          booth: { select: { id: true, name: true, exhibitionName: true, theme: true, colorScheme: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.product.count({
        where: { sellerId: seller.id }
      }),
      prisma.booth.findMany({
        where: { sellerId: seller.id, isPublished: true },
        select: { id: true, name: true, exhibitionName: true, theme: true, colorScheme: true }
      })
    ])

    const aiProducts: any[] = []
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
      booths,
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