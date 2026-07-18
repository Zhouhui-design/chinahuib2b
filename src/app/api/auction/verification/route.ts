import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email-service'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const posterId = searchParams.get('posterId')

  try {
    const where: any = {}
    
    if (status && status !== '') {
      where.verificationStatus = status
    }
    
    if (posterId) {
      where.posterId = posterId
    }

    const listings = await prisma.auctionListing.findMany({
      where,
      include: {
        poster: {
          select: { id: true, username: true, email: true, displayName: true },
        },
        seller: {
          select: { id: true, companyName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: listings })
  } catch (error) {
    console.error('Error fetching verification listings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action, listingId } = body

  try {
    if (action === 'approve') {
      return await handleApprove(listingId, session.user)
    } else if (action === 'reject') {
      const { reason } = body
      return await handleReject(listingId, reason, session.user)
    } else if (action === 'resubmit') {
      return await handleResubmit(listingId, session.user)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing verification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleApprove(listingId: string, admin: any) {
  const listing = await prisma.auctionListing.findUnique({
    where: { id: listingId },
    include: { poster: true },
  })

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const updatedListing = await prisma.auctionListing.update({
    where: { id: listingId },
    data: {
      verificationStatus: 'VERIFIED',
      status: 'ACTIVE',
      isVerified: true,
      verificationNotes: '审核通过',
      updatedAt: new Date(),
    },
  })

  await sendVerificationNotification(listing.poster, 'approved', listing)

  return NextResponse.json({ success: true, data: updatedListing })
}

async function handleReject(listingId: string, reason: string, admin: any) {
  const listing = await prisma.auctionListing.findUnique({
    where: { id: listingId },
    include: { poster: true },
  })

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const updatedListing = await prisma.auctionListing.update({
    where: { id: listingId },
    data: {
      verificationStatus: 'REJECTED',
      status: 'DRAFT',
      verificationNotes: reason,
      updatedAt: new Date(),
    },
  })

  await sendVerificationNotification(listing.poster, 'rejected', listing, reason)

  return NextResponse.json({ success: true, data: updatedListing })
}

async function handleResubmit(listingId: string, user: any) {
  const listing = await prisma.auctionListing.findUnique({
    where: { id: listingId },
  })

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  if (listing.posterId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const updatedListing = await prisma.auctionListing.update({
    where: { id: listingId },
    data: {
      verificationStatus: 'PENDING',
      status: 'PENDING_VERIFICATION',
      verificationNotes: null,
      updatedAt: new Date(),
    },
  })

  return NextResponse.json({ success: true, data: updatedListing })
}

async function sendVerificationNotification(user: any, type: 'approved' | 'rejected', listing: any, reason?: string) {
  if (!user.email) {
    return
  }

  try {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    })

    if (userSettings?.emailNotifications === false) {
      return
    }

    if (type === 'approved') {
      await sendEmail({
        to: user.email,
        subject: '您的拍卖商品审核已通过',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🎉 审核通过</h2>
            <p>尊敬的 ${user.displayName || user.username}，</p>
            <p>您的拍卖商品「${listing.title}」已通过平台审核。</p>
            <p>商品现已在拍卖大厅展示，全球买家都可以看到并下单购买。</p>
            <p style="margin-top: 20px;">祝您生意兴隆！</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">X2XHub 平台</p>
          </div>
        `,
      })
    } else {
      await sendEmail({
        to: user.email,
        subject: '您的拍卖商品审核未通过',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">审核未通过</h2>
            <p>尊敬的 ${user.displayName || user.username}，</p>
            <p>您的拍卖商品「${listing.title}」审核未通过。</p>
            <p><strong>原因：</strong>${reason}</p>
            <p>您可以在个人中心查看详情，并根据提示修改后重新提交审核。</p>
            <p style="margin-top: 20px;">如有疑问，请联系客服。</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">X2XHub 平台</p>
          </div>
        `,
      })
    }
  } catch (error) {
    console.error('Failed to send verification email:', error)
  }
}