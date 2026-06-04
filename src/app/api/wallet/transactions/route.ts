import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import * as walletService from '@/services/walletService'
import { TransactionType, TransactionStatus } from '@prisma/client'

// GET - Get transaction history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') as TransactionType | undefined
    const status = searchParams.get('status') as TransactionStatus | undefined
    
    const history = await walletService.getTransactionHistory(
      session.user.id,
      page,
      limit,
      type,
      status
    )
    
    return NextResponse.json(history)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
