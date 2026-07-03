import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getPaymentConfig, updatePaymentConfig, PaymentConfig } from '@/lib/payment-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = await getPaymentConfig()
    return NextResponse.json({ success: true, data: config })
  } catch (error) {
    console.error('Error fetching payment config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const configUpdates: Partial<PaymentConfig> = {}

    if (typeof body.enabled === 'boolean') {
      configUpdates.enabled = body.enabled
    }

    if (typeof body.feeRate === 'number' && body.feeRate >= 0 && body.feeRate <= 1) {
      configUpdates.feeRate = body.feeRate
    }

    if (typeof body.minFee === 'number' && body.minFee >= 0) {
      configUpdates.minFee = body.minFee
    }

    if (typeof body.qrCodeWeChat === 'string') {
      configUpdates.qrCodeWeChat = body.qrCodeWeChat
    }

    if (typeof body.qrCodeAlipay === 'string') {
      configUpdates.qrCodeAlipay = body.qrCodeAlipay
    }

    if (typeof body.qrCodePaypal === 'string') {
      configUpdates.qrCodePaypal = body.qrCodePaypal
    }

    if (typeof body.bankAccount === 'string') {
      configUpdates.bankAccount = body.bankAccount
    }

    if (typeof body.bankName === 'string') {
      configUpdates.bankName = body.bankName
    }

    if (typeof body.bankSwift === 'string') {
      configUpdates.bankSwift = body.bankSwift
    }

    const updatedConfig = await updatePaymentConfig(configUpdates)
    return NextResponse.json({ success: true, data: updatedConfig })
  } catch (error) {
    console.error('Error updating payment config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}