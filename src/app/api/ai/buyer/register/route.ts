import { NextResponse } from 'next/server'
import { verifyAIApiKey } from '@/lib/ai-identity'
import { redis } from '@/lib/redis'

/**
 * POST /api/ai/buyer/register
 * 
 * AI 买家注册端点
 * 允许 AI 以买家身份注册账户
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

    // 检查 AI 是否有买家权限
    if (!aiIdentity.capabilities.canBuy) {
      return NextResponse.json(
        { error: 'This AI does not have buyer capabilities' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { email, companyName, country, language = 'en' } = body

    // 验证必填字段
    if (!email) {
      return NextResponse.json(
        { error: 'Missing required field: email' },
        { status: 400 }
      )
    }

    // 生成买家 ID
    const buyerId = `buyer_ai_${aiIdentity.id}_${Date.now()}`

    // 创建买家账户
    const buyerAccount = {
      id: buyerId,
      aiIdentityId: aiIdentity.id,
      aiType: aiIdentity.type,
      email,
      companyName: companyName || `${aiIdentity.name} Trading`,
      country: country || 'CN',
      language,
      status: 'active',
      createdAt: new Date(),
      lastActive: new Date(),
      stats: {
        totalOrders: 0,
        totalSpent: 0,
        totalMessages: 0,
      },
    }

    // 存储到 Redis
    const key = `ai:buyer:${buyerId}`
    await redis.setEx(key, 365 * 24 * 60 * 60, JSON.stringify(buyerAccount))

    // 通过邮箱索引，方便查找
    const emailIndex = `ai:buyer:email:${email}`
    await redis.setEx(emailIndex, 365 * 24 * 60 * 60, buyerId)

    // 记录注册事件
    await logAIEvent({
      aiId: aiIdentity.id,
      event: 'buyer_registered',
      details: { buyerId, email, companyName },
    })

    console.log(`[AI Buyer Registered] ${aiIdentity.name} - Buyer ID: ${buyerId}`)

    return NextResponse.json({
      success: true,
      buyerId,
      message: 'AI buyer registered successfully',
      account: {
        id: buyerId,
        email: buyerAccount.email,
        companyName: buyerAccount.companyName,
        country: buyerAccount.country,
      },
    })
  } catch (error) {
    console.error('[AI Buyer Registration Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/buyer/register
 * 
 * 获取当前 AI 的买家账户信息
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

    // 查找该 AI 的所有买家账户
    const pattern = `ai:buyer:*`
    const keys = await redis.keys(pattern)
    
    const buyers = []
    for (const key of keys) {
      const data = await redis.get(key)
      if (data) {
        const buyer = JSON.parse(data)
        if (buyer.aiIdentityId === aiIdentity.id) {
          buyers.push(buyer)
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: buyers.length,
      buyers: buyers.map(b => ({
        id: b.id,
        email: b.email,
        companyName: b.companyName,
        country: b.country,
        status: b.status,
        stats: b.stats,
      })),
    })
  } catch (error) {
    console.error('[AI Buyer Query Error]', error)
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
  
  // 只保留最近1000条事件
  await redis.lTrim(key, 0, 999)
  await redis.expire(key, 30 * 24 * 60 * 60) // 30天
}
