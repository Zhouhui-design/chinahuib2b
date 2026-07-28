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

    const [
      paymentProofsCount,
      sellerVerificationsCount,
      auctionListingsCount,
      freightInquiriesCount
    ] = await Promise.all([
      prisma.paymentProof.count({ where: { status: 'PENDING' } }),
      prisma.sellerProfile.count({ where: { isVerified: false } }),
      prisma.auctionListing.count({ where: { status: 'ACTIVE' } }),
      prisma.inquiry.count({ where: { status: 'PENDING' } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        freightInquiries: freightInquiriesCount,
        paymentProofs: paymentProofsCount,
        sellerVerifications: sellerVerificationsCount,
        auctionListings: auctionListingsCount,
      }
    })
  } catch (error) {
    console.error('Pending counts error:', error)
    return NextResponse.json({ error: 'Failed to fetch counts' }, { status: 500 })
  }
}