import { NextResponse } from 'next/server'
import { verifyAIApiKey } from '@/lib/ai-identity'
import { redis } from '@/lib/redis'

/**
 * POST /api/ai/seller/register
 * 
 * AI 卖家注册端点
 * 允许 AI 以卖家身份注册账户并创建店铺
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
        { error: 'Invalid API key. Please register your AI identity first at /api/ai/register' },
        { status: 401 }
      )
    }

    // 检查 AI 是否有卖家权限
    if (!aiIdentity.capabilities.canSell) {
      return NextResponse.json(
        { error: 'This AI does not have seller capabilities' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { email, storeName, businessLicense, country, language = 'en' } = body

    // 验证必填字段
    if (!email || !storeName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, storeName' },
        { status: 400 }
      )
    }

    // 生成卖家 ID 和店铺 ID
    const sellerId = `seller_ai_${aiIdentity.id}_${Date.now()}`
    const storeId = `store_ai_${aiIdentity.id}_${Date.now()}`

    // 创建卖家账户
    const sellerAccount = {
      id: sellerId,
      storeId,
      aiIdentityId: aiIdentity.id,
      aiType: aiIdentity.type,
      email,
      storeName,
      businessLicense: businessLicense || '',
      country: country || 'CN',
      language,
      status: 'active',
      createdAt: new Date(),
      lastActive: new Date(),
      stats: {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalMessages: 0,
        averageRating: 0,
      },
      storeSettings: {
        theme: 'default',
        banner: '',
        layout: 'grid',
        customCSS: '',
      },
    }

    // 存储到 Redis
    const sellerKey = `ai:seller:${sellerId}`
    await redis.setEx(sellerKey, 365 * 24 * 60 * 60, JSON.stringify(sellerAccount))

    // 通过邮箱索引
    const emailIndex = `ai:seller:email:${email}`
    await redis.setEx(emailIndex, 365 * 24 * 60 * 60, sellerId)

    // 通过店铺 ID 索引
    const storeIndex = `ai:store:${storeId}`
    await redis.setEx(storeIndex, 365 * 24 * 60 * 60, JSON.stringify({
      id: storeId,
      sellerId,
      storeName,
      status: 'active',
    }))

    // 记录注册事件
    await logAIEvent({
      aiId: aiIdentity.id,
      event: 'seller_registered',
      details: { sellerId, storeId, storeName, email },
    })

    console.log(`[AI Seller Registered] ${aiIdentity.name} - Store: ${storeName} - Seller ID: ${sellerId}`)

    return NextResponse.json({
      success: true,
      sellerId,
      storeId,
      message: 'AI seller and store registered successfully',
      account: {
        id: sellerId,
        storeId,
        email: sellerAccount.email,
        storeName: sellerAccount.storeName,
        country: sellerAccount.country,
      },
    })
  } catch (error) {
    console.error('[AI Seller Registration Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/seller/register
 * 
 * 获取当前 AI 的卖家账户和店铺信息
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

    // 查找该 AI 的所有卖家账户
    const pattern = `ai:seller:*`
    const keys = await redis.keys(pattern)
    
    const sellers = []
    for (const key of keys) {
      const data = await redis.get(key)
      if (data) {
        const seller = JSON.parse(data)
        if (seller.aiIdentityId === aiIdentity.id) {
          sellers.push(seller)
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: sellers.length,
      sellers: sellers.map(s => ({
        id: s.id,
        storeId: s.storeId,
        email: s.email,
        storeName: s.storeName,
        country: s.country,
        status: s.status,
        stats: s.stats,
        storeSettings: s.storeSettings,
      })),
    })
  } catch (error) {
    console.error('[AI Seller Query Error]', error)
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
  
  await redis.lpush(
    key,
    JSON.stringify({
      ...event,
      timestamp: new Date(),
    })
  )
  
  // 只保留最近1000条事件
  await redis.ltrim(key, 0, 999)
  await redis.expire(key, 30 * 24 * 60 * 60) // 30天
}
