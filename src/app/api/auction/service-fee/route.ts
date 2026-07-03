import { NextRequest, NextResponse } from 'next/server'
import { getPaymentConfig, calculateServiceFee, getPaymentMethods, ServiceFeeResult, PaymentMethod } from '@/lib/payment-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const amount = parseFloat(searchParams.get('amount') || '0')

    const config = await getPaymentConfig()
    const feeResult = calculateServiceFee(amount, config)
    const paymentMethods = await getPaymentMethods()

    return NextResponse.json({
      success: true,
      data: {
        enabled: config.enabled,
        fee: feeResult,
        paymentMethods
      }
    })
  } catch (error) {
    console.error('Error calculating service fee:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}