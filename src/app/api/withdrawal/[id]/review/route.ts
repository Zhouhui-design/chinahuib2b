import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import * as walletService from '@/services/walletService'
import { WithdrawalStatus } from '@prisma/client'

// POST - Review withdrawal request (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { prisma } = await import('@/lib/db')
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const body = await request.json()
    const { status, reviewNotes, gatewayTransactionId } = body
    
    const result = await walletService.reviewWithdrawalRequest(
      params.id,
      session.user.id,
      status as WithdrawalStatus,
      reviewNotes,
      gatewayTransactionId
    )
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error reviewing withdrawal request:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
