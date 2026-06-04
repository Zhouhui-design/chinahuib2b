import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import * as walletService from '@/services/walletService'
import { PaymentGateway } from '@prisma/client'

// POST - Create withdrawal request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { amount, gateway, gatewayDetails } = body
    
    if (!amount || !gateway) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const request = await walletService.createWithdrawalRequest(
      session.user.id,
      amount,
      gateway as PaymentGateway,
      gatewayDetails
    )
    
    return NextResponse.json(request, { status: 201 })
  } catch (error: any) {
    console.error('Error creating withdrawal request:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// GET - Get withdrawal requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get withdrawal requests for current user
    const { prisma } = await import('@/lib/db')
    const requests = await prisma.withdrawalRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
