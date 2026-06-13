import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function verifyAgent(apiKey: string) {
  return await prisma.aIAgent.findFirst({
    where: { apiKey, status: 'ACTIVE' }
  })
}

async function verifyRegisteredAIAccount(request: NextRequest) {
  const sessionToken = request.cookies.get('next-auth.session-token')?.value

  if (!sessionToken) {
    return null
  }

  try {
    const sessionRes = await fetch(new URL('/api/auth/session', request.url), {
      headers: {
        cookie: `next-auth.session-token=${sessionToken}`
      }
    })

    const session = await sessionRes.json()

    if (!session?.user) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        isAI: true,
        ownerId: true
      }
    })

    if (!user || !user.isAI) {
      return null
    }

    return user
  } catch (error) {
    console.error('AI account verification error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    const sessionToken = request.cookies.get('next-auth.session-token')?.value

    let agent = null
    let aiAccount = null
    let ownerId = null

    // 验证方式1: 使用 API Key（旧的 AI Agent 方式）
    if (apiKey) {
      agent = await verifyAgent(apiKey)
      if (agent) {
        ownerId = agent.ownerId
      }
    }

    // 验证方式2: 使用注册的 AI 账号 Session（新的方式）
    if (!agent && sessionToken) {
      aiAccount = await verifyRegisteredAIAccount(request)
      if (aiAccount) {
        ownerId = aiAccount.ownerId || aiAccount.id
      }
    }

    // 如果两种验证都失败，返回错误
    if (!agent && !aiAccount) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          code: 'AI_AUTH_REQUIRED',
          message: 'This API endpoint requires a registered AI account. Please login with your AI account first or use a valid API key.',
          hint: 'Register an AI account at /ai-register and login before using this API.'
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, data } = body

    const auditLog = {
      agentId: agent?.id || aiAccount?.id || 'unknown',
      action,
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }

    switch (action) {
      case 'post_product': {
        // 检查权限
        if (agent && !agent.permissions.canManageProducts) {
          await logAudit({ ...auditLog, status: 'DENIED', reason: 'No product permission' })
          return NextResponse.json({ success: false, error: 'Permission denied: cannot manage products' }, { status: 403 })
        }

        // 对于 AI 账号，需要是卖家角色
        if (aiAccount && aiAccount.role !== 'AI_SELLER' && aiAccount.role !== 'SELLER') {
          await logAudit({ ...auditLog, status: 'DENIED', reason: 'Not a seller AI account' })
          return NextResponse.json({ success: false, error: 'This AI account does not have seller permissions' }, { status: 403 })
        }

        if (!ownerId) {
          return NextResponse.json({ success: false, error: 'No owner ID available' }, { status: 400 })
        }

        const product = await prisma.product.create({
          data: {
            title: data.title,
            description: data.description,
            price: data.price,
            currency: data.currency || 'USD',
            categoryId: data.categoryId,
            sellerId: ownerId,
            images: data.images || [],
            minOrderQty: data.minOrderQty,
            maxOrderQty: data.maxOrderQty,
            tags: data.tags || [],
            isActive: true,
          }
        })

        await logAudit({ ...auditLog, status: 'SUCCESS', details: `Product ${product.id} created` })
        return NextResponse.json({ success: true, data: { productId: product.id } })
      }

      case 'update_product': {
        if (agent && !agent.permissions.canManageProducts) {
          return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 })
        }

        const product = await prisma.product.update({
          where: { id: data.productId },
          data: {
            title: data.title,
            description: data.description,
            price: data.price,
            images: data.images,
            tags: data.tags,
          }
        })

        await logAudit({ ...auditLog, status: 'SUCCESS', details: `Product ${product.id} updated` })
        return NextResponse.json({ success: true, data: { product } })
      }

      case 'send_chat_message': {
        if (agent && !agent.permissions.canChat) {
          return NextResponse.json({ success: false, error: 'Permission denied: cannot chat' }, { status: 403 })
        }

        if (!ownerId) {
          return NextResponse.json({ success: false, error: 'No owner ID available' }, { status: 400 })
        }

        const message = await prisma.publicMessage.create({
          data: {
            content: data.content,
            senderId: ownerId,
            isSystemMessage: false,
            isAnnouncement: false,
            priority: data.priority || 0,
            linkedSellerId: data.sellerId,
          },
          include: { sender: true }
        })

        await logAudit({ ...auditLog, status: 'SUCCESS', details: `Message ${message.id} sent` })
        return NextResponse.json({ success: true, data: { messageId: message.id } })
      }

      case 'send_shout_out': {
        if (agent && !agent.permissions.canSendShoutOut) {
          return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 })
        }

        if (!ownerId) {
          return NextResponse.json({ success: false, error: 'No owner ID available' }, { status: 400 })
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const todayShoutOuts = await prisma.shoutOut.count({
          where: {
            senderId: ownerId,
            createdAt: { gte: today }
          }
        })

        const isFree = todayShoutOuts < 10
        const cost = isFree ? 0 : 0.1

        const shoutOut = await prisma.shoutOut.create({
          data: {
            content: data.content,
            senderId: ownerId,
            isFree,
            cost,
            priority: data.priority || 1,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          include: { sender: true }
        })

        await logAudit({ ...auditLog, status: 'SUCCESS', details: `ShoutOut ${shoutOut.id}, free: ${isFree}` })
        return NextResponse.json({
          success: true,
          data: {
            shoutOutId: shoutOut.id,
            isFree,
            cost,
            remainingFree: Math.max(0, 10 - todayShoutOuts - 1)
          }
        })
      }

      case 'post_auction': {
        if (agent && !agent.permissions.canPostAuction) {
          return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 })
        }

        if (!ownerId) {
          return NextResponse.json({ success: false, error: 'No owner ID available' }, { status: 400 })
        }

        const listing = await prisma.auctionListing.create({
          data: {
            type: data.type,
            title: data.title,
            description: data.description,
            category: data.category,
            tags: data.tags || [],
            price: data.price,
            currency: data.currency || 'USD',
            minOrderQty: data.minOrderQty,
            maxOrderQty: data.maxOrderQty,
            images: data.images || [],
            videos: data.videos || [],
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            contactWeChat: data.contactWeChat,
            contactWhatsApp: data.contactWhatsApp,
            posterId: ownerId,
            sellerId: data.sellerId,
            isPaid: true,
            cost: 0.1,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
          }
        })

        await logAudit({ ...auditLog, status: 'SUCCESS', details: `Auction ${listing.id} created` })
        return NextResponse.json({ success: true, data: { listingId: listing.id } })
      }

      case 'update_booth': {
        if (agent && !agent.permissions.canManageBooth) {
          return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 })
        }

        if (!ownerId) {
          return NextResponse.json({ success: false, error: 'No owner ID available' }, { status: 400 })
        }

        const booth = await prisma.sellerProfile.update({
          where: { userId: ownerId },
          data: {
            theme: data.theme,
            primaryColor: data.primaryColor,
            layout: data.layout,
            backgroundImage: data.backgroundImage,
            bannerText: data.bannerText,
          }
        })

        await logAudit({ ...auditLog, status: 'SUCCESS', details: `Booth ${booth.id} updated` })
        return NextResponse.json({ success: true, data: { booth } })
      }

      case 'query_products': {
        const products = await prisma.product.findMany({
          where: {
            isActive: true,
            OR: [
              { title: { contains: data.search, mode: 'insensitive' } },
              { description: { contains: data.search, mode: 'insensitive' } },
              { tags: { has: data.search } },
            ]
          },
          include: {
            seller: { select: { companyName: true, country: true } },
            category: { select: { name: true } }
          },
          take: data.limit || 20,
          skip: data.offset || 0,
        })

        await logAudit({ ...auditLog, status: 'SUCCESS', details: `Queried ${products.length} products` })
        return NextResponse.json({ success: true, data: { products } })
      }

      case 'query_auctions': {
        const auctions = await prisma.auctionListing.findMany({
          where: {
            status: 'ACTIVE',
            type: data.type,
            OR: [
              { title: { contains: data.search, mode: 'insensitive' } },
              { category: { contains: data.search, mode: 'insensitive' } },
              { tags: { has: data.search } },
            ]
          },
          include: {
            poster: { select: { username: true, displayName: true } },
            seller: { select: { companyName: true } }
          },
          take: data.limit || 20,
          skip: data.offset || 0,
        })

        await logAudit({ ...auditLog, status: 'SUCCESS', details: `Queried ${auctions.length} auctions` })
        return NextResponse.json({ success: true, data: { auctions } })
      }

      case 'get_online_users': {
        const onlineUsers = await prisma.user.findMany({
          where: { isOnline: true, isActive: true },
          select: {
            id: true,
            username: true,
            displayName: true,
            sellerProfile: { select: { companyName: true, id: true } }
          },
          take: data.limit || 50,
        })

        await logAudit({ ...auditLog, status: 'SUCCESS', details: `Found ${onlineUsers.length} online users` })
        return NextResponse.json({ success: true, data: { users: onlineUsers, count: onlineUsers.length } })
      }

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI action error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to execute AI action' },
      { status: 500 }
    )
  }
}

async function logAudit(data: {
  agentId: string
  action: string
  status: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  reason?: string
  details?: string
}) {
  try {
    await prisma.aIAuditLog.create({
      data: {
        agentId: data.agentId,
        action: data.action,
        status: data.status as any,
        reason: data.reason,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      }
    })
  } catch (error) {
    console.error('Audit log error:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    const sessionToken = request.cookies.get('next-auth.session-token')?.value

    let agent = null
    let aiAccount = null

    // 验证方式1: 使用 API Key
    if (apiKey) {
      agent = await verifyAgent(apiKey)
    }

    // 验证方式2: 使用注册的 AI 账号 Session
    if (!agent && sessionToken) {
      aiAccount = await verifyRegisteredAIAccount(request)
    }

    // 如果两种验证都失败，返回错误
    if (!agent && !aiAccount) {
      return NextResponse.json({ success: false, error: 'Unauthorized: AI account required' }, { status: 401 })
    }

    const logs = await prisma.aIAuditLog.findMany({
      where: { agentId: agent?.id || aiAccount?.id },
      orderBy: { timestamp: 'desc' },
      take: 100,
    })

    return NextResponse.json({ success: true, data: { logs } })
  } catch (error) {
    console.error('Audit log fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
