import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import * as walletService from '@/services/walletService'
import { PaymentGateway } from '@prisma/client'

// POST - Create payment proof
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { amount, gateway, transactionId, imageUrl, notes } = body
    
    if (!amount || !gateway) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const proof = await walletService.createPaymentProof(
      session.user.id,
      amount,
      gateway as PaymentGateway,
      transactionId,
      imageUrl,
      notes
    )
    
    return NextResponse.json(proof, { status: 201 })
  } catch (error) {
    console.error('Error creating payment proof:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get payment proofs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get payment proofs for current user
    const { prisma } = await import('@/lib/db')
    const proofs = await prisma.paymentProof.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(proofs)
  } catch (error) {
    console.error('Error fetching payment proofs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
