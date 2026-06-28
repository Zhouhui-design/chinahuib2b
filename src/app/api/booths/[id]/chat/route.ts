/**
 * 展位聊天 API - 与 chat-system 集成
 *
 * 提供:
 * - GET  /api/booths/[id]/chat-token - 获取与展位展商聊天的 token
 * - POST /api/booths/[id]/chat-send - 发送消息(代理)
 * - GET  /api/booths/[id]/chat-history - 获取聊天历史
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const CHAT_API_BASE = (process.env['CHAT_API_URL'] as string) || (process.env['NEXT_PUBLIC_CHAT_API_URL'] as string) || 'https://chat.x2xhub.com'
const CHAT_TENANT = (process.env['CHAT_TENANT'] as string) || 'chinahuib2b'
const CHAT_API_SECRET = (process.env['CHAT_API_SECRET'] as string) || ''

interface RouteParams {
  params: Promise<{ id: string }>
}

// 通用:调用 chat-system booth API
async function callChatAPI(path: string, options: RequestInit = {}) {
  const url = `${CHAT_API_BASE}/api/booth${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (CHAT_API_SECRET) {
    headers['X-API-Secret'] = CHAT_API_SECRET
  }

  const res = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Chat API error: ${res.status} ${text}`)
  }

  return res.json()
}

// GET /api/booths/[id]/chat-token
// 获取买家与展商聊天的 token(自动注册/获取 chat-system 账号)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: boothId } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. 获取展位信息
    const booth = await prisma.booth.findUnique({
      where: { id: boothId },
      include: {
        seller: {
          select: {
            id: true,
            userId: true,
            companyName: true,
            country: true,
            city: true,
            email: true,
          }
        }
      }
    })

    if (!booth) {
      return NextResponse.json({ error: 'Booth not found' }, { status: 404 })
    }

    // 2. 在 chat-system 注册/获取展商账号
    const sellerResult = await callChatAPI('/seller-link', {
      method: 'POST',
      body: JSON.stringify({
        externalSellerId: booth.sellerId,
        companyName: booth.seller.companyName,
        country: booth.seller.country,
        city: booth.seller.city,
        email: booth.seller.email,
        tenantId: CHAT_TENANT,
      }),
    })

    // 3. 在 chat-system 注册/获取当前用户账号
    const buyerResult = await callChatAPI('/buyer-link', {
      method: 'POST',
      body: JSON.stringify({
        externalUserId: session.user.id,
        email: session.user.email,
        displayName: session.user.name || session.user.email,
        tenantId: CHAT_TENANT,
      }),
    })

    return NextResponse.json({
      success: true,
      boothId,
      seller: {
        id: sellerResult.userId,
        username: sellerResult.username,
        displayName: sellerResult.displayName,
        companyName: booth.seller.companyName,
      },
      buyer: {
        id: buyerResult.userId,
        username: buyerResult.username,
        displayName: buyerResult.displayName,
        token: buyerResult.token,
      },
      // 预构建的聊天 URL - 跳转到 chat-system 并自动打开与该展商的对话
      chatUrl: `${CHAT_API_BASE}/?tenant=${CHAT_TENANT}&target=${sellerResult.userId}&targetName=${encodeURIComponent(booth.seller.companyName)}&booth=${boothId}&token=${buyerResult.token}`,
    })
  } catch (error) {
    console.error('Get chat token error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get chat token' },
      { status: 500 }
    )
  }
}

// POST /api/booths/[id]/chat-send
// 发送消息(代理模式)
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: boothId } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, productId, userToken } = body

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    // 如果没传 userToken,先获取
    let token = userToken
    if (!token) {
      const buyerResult = await callChatAPI('/buyer-link', {
        method: 'POST',
        body: JSON.stringify({
          externalUserId: session.user.id,
          email: session.user.email,
          displayName: session.user.name || session.user.email,
          tenantId: CHAT_TENANT,
        }),
      })
      token = buyerResult.token
    }

    // 查展位获取展商 ID
    const booth = await prisma.booth.findUnique({
      where: { id: boothId },
      select: { sellerId: true, seller: { select: { companyName: true } } }
    })

    if (!booth) {
      return NextResponse.json({ error: 'Booth not found' }, { status: 404 })
    }

    // 获取卖方 chat-system ID
    const sellerResult = await callChatAPI('/seller-link', {
      method: 'POST',
      body: JSON.stringify({
        externalSellerId: booth.sellerId,
        companyName: booth.seller.companyName,
        tenantId: CHAT_TENANT,
      }),
    })

    // 发送消息
    const result = await callChatAPI('/send-message', {
      method: 'POST',
      body: JSON.stringify({
        fromUserToken: token,
        toUserId: sellerResult.userId,
        content,
        boothId,
        productId,
        tenantId: CHAT_TENANT,
        contextType: 'booth-chat',
      }),
    })

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      timestamp: result.timestamp,
    })
  } catch (error) {
    console.error('Send chat message error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    )
  }
}
