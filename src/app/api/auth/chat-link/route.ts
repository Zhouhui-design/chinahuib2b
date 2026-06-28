import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const CHAT_SYSTEM_BASE_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://chat.fixturerb2b.top'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role } = body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const linkEndpoint = role === 'SELLER' ? '/api/booth/seller-link' : '/api/booth/buyer-link'
    const externalIdField = role === 'SELLER' ? 'externalSellerId' : 'externalUserId'
    
    const sellerProfile = role === 'SELLER' ? await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    }) : null

    const externalId = role === 'SELLER' ? (sellerProfile?.id || session.user.id) : session.user.id

    const linkRes = await fetch(`${CHAT_SYSTEM_BASE_URL}${linkEndpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        [externalIdField]: externalId,
        email: user.email,
        displayName: user.displayName || user.username,
        companyName: sellerProfile?.companyName || user.company,
        country: sellerProfile?.country,
        city: sellerProfile?.city,
        tenantId: 'chinahuib2b',
      })
    })

    const linkData = await linkRes.json()

    if (!linkRes.ok) {
      return NextResponse.json({ error: linkData.error || 'Failed to link chat account' }, { status: linkRes.status })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        chatSystemToken: linkData.token,
        chatSystemUserId: linkData.userId,
        chatSystemLinkedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Chat system account linked successfully',
      chatUser: {
        userId: linkData.userId,
        username: linkData.username,
        displayName: linkData.displayName
      }
    })

  } catch (error) {
    console.error('Chat link error:', error)
    return NextResponse.json({ error: 'Failed to link chat account' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        chatSystemToken: true,
        chatSystemUserId: true,
        chatSystemLinkedAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      isLinked: !!user.chatSystemToken,
      chatSystemToken: user.chatSystemToken || null,
      chatSystemUserId: user.chatSystemUserId || null,
      chatSystemLinkedAt: user.chatSystemLinkedAt || null
    })

  } catch (error) {
    console.error('Get chat link status error:', error)
    return NextResponse.json({ error: 'Failed to get chat link status' }, { status: 500 })
  }
}
