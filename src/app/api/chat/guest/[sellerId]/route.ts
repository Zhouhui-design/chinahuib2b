import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifySellerNewMessage } from '@/lib/email-service'

// 游客（未登录）与卖家的私聊消息
// GET  /api/chat/guest/[sellerId]?guestKey=xxx  -> 拉取该游客与该卖家的消息
// POST /api/chat/guest/[sellerId]               -> 游客发消息给卖家
// 说明：sellerId 兼容 SellerProfile.id 或 User.id（与登录态聊天气泡一致）。

async function resolveSellerUserId(rawId: string): Promise<{ sellerUserId: string | null }> {
  // 先按 User.id 查
  const user = await db.user.findUnique({ where: { id: rawId }, select: { id: true } })
  if (user) return { sellerUserId: user.id }
  // 再按 SellerProfile.id 查
  const sp = await db.sellerProfile.findUnique({ where: { id: rawId }, select: { userId: true } })
  return { sellerUserId: sp?.userId || null }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await params
    const { searchParams } = new URL(request.url)
    const guestKey = searchParams.get('guestKey')
    if (!guestKey) {
      return NextResponse.json({ success: false, error: 'guestKey is required' }, { status: 400 })
    }

    const { sellerUserId } = await resolveSellerUserId(sellerId)
    if (!sellerUserId) {
      return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 })
    }

    const messages = await db.guestMessage.findMany({
      where: { sellerId: sellerUserId, guestKey },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })

    return NextResponse.json({ success: true, data: { messages } })
  } catch (error) {
    console.error('[guest-chat] GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await params
    const body = await request.json().catch(() => ({}))
    const content = (body?.content || '').toString().trim()
    const guestKey = (body?.guestKey || '').toString().trim()
    const senderName = (body?.senderName || '').toString().trim() || null
    const senderContact = (body?.senderContact || '').toString().trim() || null

    if (!content) {
      return NextResponse.json({ success: false, error: 'Message content is required' }, { status: 400 })
    }
    if (!guestKey) {
      return NextResponse.json({ success: false, error: 'guestKey is required' }, { status: 400 })
    }
    if (content.length > 2000) {
      return NextResponse.json({ success: false, error: 'Message too long' }, { status: 400 })
    }

    const { sellerUserId } = await resolveSellerUserId(sellerId)
    if (!sellerUserId) {
      return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 })
    }

    const message = await db.guestMessage.create({
      data: {
        sellerId: sellerUserId,
        guestKey,
        senderName,
        senderContact,
        content,
      },
    })

    // 同步邮件通知卖家（游客消息也走需求1的通道；买家名为游客称呼或"游客"）
    ;(async () => {
      try {
        const seller = await db.user.findUnique({
          where: { id: sellerUserId },
          select: { email: true, displayName: true, username: true },
        })
        await notifySellerNewMessage({
          sellerUserId,
          sellerEmail: seller?.email,
          sellerName: seller?.displayName || seller?.username,
          buyerName: senderName || '游客',
          content,
        })
      } catch (e) {
        console.warn('[guest-chat] email notify error:', e instanceof Error ? e.message : String(e))
      }
    })()

    return NextResponse.json({ success: true, data: message })
  } catch (error) {
    console.error('[guest-chat] POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 })
  }
}
