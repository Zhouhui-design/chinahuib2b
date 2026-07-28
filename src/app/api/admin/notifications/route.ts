import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    const where = unreadOnly ? { isRead: false } : {}

    const [paymentProofs, sellerVerifications, auctionListings, freightInquiries] = await Promise.all([
      prisma.paymentProof.findMany({
        where: { status: 'PENDING' },
        orderBy: { submittedAt: 'desc' },
        take: 5,
      }),
      prisma.sellerProfile.findMany({
        where: { isVerified: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.auctionListing.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.inquiry.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    const notifications = [
      ...paymentProofs.map(pp => ({
        id: `payment-${pp.id}`,
        type: 'warning' as const,
        title: '待审核支付凭证',
        message: `金额 ${pp.amount} ${pp.currency} 需要审核`,
        isRead: false,
        createdAt: pp.submittedAt.toISOString(),
        link: '/admin/payment-proofs',
      })),
      ...sellerVerifications.map(sp => ({
        id: `seller-${sp.id}`,
        type: 'info' as const,
        title: '待审核组织',
        message: `${sp.companyName} 等待审核`,
        isRead: false,
        createdAt: sp.createdAt.toISOString(),
        link: '/admin/seller-profiles',
      })),
      ...auctionListings.map(al => ({
        id: `auction-${al.id}`,
        type: 'success' as const,
        title: '活跃拍卖',
        message: `${al.title} 正在拍卖中`,
        isRead: false,
        createdAt: al.createdAt.toISOString(),
        link: '/admin/auction-listings',
      })),
      ...freightInquiries.map(fi => ({
        id: `inquiry-${fi.id}`,
        type: 'info' as const,
        title: '新货代询价',
        message: `来自买家的询价等待处理`,
        isRead: false,
        createdAt: fi.createdAt.toISOString(),
        link: '/admin/freight-inquiries',
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      success: true,
      notifications,
    })
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pathname } = new URL(request.url)
    const parts = pathname.split('/')
    
    if (parts.includes('mark-all-read')) {
      return NextResponse.json({ success: true })
    }

    if (parts.includes('read') && parts.length >= 5) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}