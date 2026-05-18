import { NextResponse } from 'next/server'
import { verifyAIApiKey } from '@/lib/ai-identity'
import { redis } from '@/lib/redis'

/**
 * POST /api/ai/seller/product/create
 * 
 * AI 卖家创建产品端点
 * 允许 AI 卖家上传新产品到店铺
 */
export async function POST(req: Request) {
  try {
    // 验证 AI API Key
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.replace('Bearer ', '')
    const aiIdentity = await verifyAIApiKey(apiKey)

    if (!aiIdentity) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // 检查 AI 是否有管理店铺权限
    if (!aiIdentity.capabilities.canManageStore) {
      return NextResponse.json(
        { error: 'This AI does not have store management capabilities' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      sellerId,
      name,
      description,
      price,
      currency = 'USD',
      category,
      images = [],
      videos = [],
      moq = 1,
      specifications = {},
      languages = ['en'],
    } = body

    // 验证必填字段
    if (!sellerId || !name || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: sellerId, name, description, price, category' },
        { status: 400 }
      )
    }

    // 验证卖家身份
    const sellerKey = `ai:seller:${sellerId}`
    const sellerData = await redis.get(sellerKey)
    
    if (!sellerData) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    const seller = JSON.parse(sellerData)
    
    // 确保该卖家属于当前 AI
    if (seller.aiIdentityId !== aiIdentity.id) {
      return NextResponse.json(
        { error: 'Unauthorized: This seller account does not belong to your AI identity' },
        { status: 403 }
      )
    }

    // 生成产品 ID
    const productId = `product_ai_${seller.storeId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 创建产品对象
    const product = {
      id: productId,
      sellerId,
      storeId: seller.storeId,
      aiIdentityId: aiIdentity.id,
      name,
      description,
      price,
      currency,
      category,
      images,
      videos,
      moq,
      specifications,
      languages,
      status: 'active',
      stock: 9999, // AI 管理的产品默认充足库存
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      orders: 0,
      rating: {
        average: 0,
        count: 0,
      },
      seo: {
        title: `${name} - Wholesale | ChinaHui B2B`,
        description: description.substring(0, 160),
        keywords: [category, name, 'wholesale', 'bulk'],
      },
    }

    // 存储到 Redis
    const productKey = `ai:product:${productId}`
    await redis.setEx(productKey, 365 * 24 * 60 * 60, JSON.stringify(product))

    // 添加到店铺产品列表
    const storeProductsKey = `ai:store:${seller.storeId}:products`
    await redis.lPush(storeProductsKey, productId)

    // 更新卖家统计
    seller.stats.totalProducts = (seller.stats.totalProducts || 0) + 1
    await redis.setEx(sellerKey, 365 * 24 * 60 * 60, JSON.stringify(seller))

    // 记录事件
    await logAIEvent({
      aiId: aiIdentity.id,
      event: 'product_created',
      details: { productId, productName: name, storeId: seller.storeId },
    })

    console.log(`[AI Product Created] ${aiIdentity.name} - Product: ${name} - ID: ${productId}`)

    return NextResponse.json({
      success: true,
      productId,
      message: 'Product created successfully',
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        category: product.category,
        status: product.status,
      },
    })
  } catch (error) {
    console.error('[AI Product Creation Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/ai/seller/product/update
 * 
 * AI 卖家更新产品信息
 */
export async function PUT(req: Request) {
  try {
    // 验证 AI API Key
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.replace('Bearer ', '')
    const aiIdentity = await verifyAIApiKey(apiKey)

    if (!aiIdentity) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { productId, updates } = body

    if (!productId || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, updates' },
        { status: 400 }
      )
    }

    // 获取产品信息
    const productKey = `ai:product:${productId}`
    const productData = await redis.get(productKey)

    if (!productData) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const product = JSON.parse(productData)

    // 验证权限
    if (product.aiIdentityId !== aiIdentity.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this product' },
        { status: 403 }
      )
    }

    // 更新产品
    const updatedProduct = {
      ...product,
      ...updates,
      updatedAt: new Date(),
    }

    await redis.setEx(productKey, 365 * 24 * 60 * 60, JSON.stringify(updatedProduct))

    // 记录事件
    await logAIEvent({
      aiId: aiIdentity.id,
      event: 'product_updated',
      details: { productId, updatedFields: Object.keys(updates) },
    })

    console.log(`[AI Product Updated] ${aiIdentity.name} - Product ID: ${productId}`)

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        price: updatedProduct.price,
        updatedAt: updatedProduct.updatedAt,
      },
    })
  } catch (error) {
    console.error('[AI Product Update Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/seller/product/list
 * 
 * AI 卖家获取自己的产品列表
 */
export async function GET(req: Request) {
  try {
    // 验证 AI API Key
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.replace('Bearer ', '')
    const aiIdentity = await verifyAIApiKey(apiKey)

    if (!aiIdentity) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // 从 URL 获取查询参数
    const url = new URL(req.url)
    const storeId = url.searchParams.get('storeId')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    if (!storeId) {
      return NextResponse.json(
        { error: 'Missing query parameter: storeId' },
        { status: 400 }
      )
    }

    // 获取店铺产品列表
    const storeProductsKey = `ai:store:${storeId}:products`
    const rawProductIds = await redis.lrange(storeProductsKey, offset, offset + limit - 1)
    
    const productIds: string[] = Array.isArray(rawProductIds) ? rawProductIds as string[] : []

    const products = []
    for (const productId of productIds) {
      const productKey = `ai:product:${productId}`
      const productData = await redis.get(productKey)
      if (productData) {
        const product = JSON.parse(productData)
        // 只返回当前 AI 的产品
        if (product.aiIdentityId === aiIdentity.id) {
          products.push({
            id: product.id,
            name: product.name,
            price: product.price,
            currency: product.currency,
            category: product.category,
            status: product.status,
            views: product.views,
            orders: product.orders,
            createdAt: product.createdAt,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    console.error('[AI Product List Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * 记录 AI 事件
 */
async function logAIEvent(event: {
  aiId: string
  event: string
  details?: Record<string, any>
}): Promise<void> {
  const key = `ai:events:${event.aiId}`
  
  await redis.lPush(
    key,
    JSON.stringify({
      ...event,
      timestamp: new Date(),
    })
  )
  
  await redis.lTrim(key, 0, 999)
  await redis.expire(key, 30 * 24 * 60 * 60)
}
