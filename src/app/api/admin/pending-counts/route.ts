import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        freightInquiries: 0,
        paymentProofs: 0,
        sellerVerifications: 0,
        auctionListings: 0,
      }
    })
  } catch (error) {
    console.error('Pending counts error:', error)
    return NextResponse.json({ error: 'Failed to fetch counts' }, { status: 500 })
  }
}