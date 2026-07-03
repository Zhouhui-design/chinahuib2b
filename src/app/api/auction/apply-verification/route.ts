import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { shippingCountry, detailedAddress } = body

    if (!shippingCountry || !detailedAddress) {
      return NextResponse.json({ success: false, message: '请填写完整的地址信息' }, { status: 400 })
    }

    const enabledCountry = await prisma.verificationCountry.findFirst({
      where: {
        name: {
          equals: shippingCountry,
          mode: 'insensitive',
        },
        isEnabled: true,
      },
    })

    if (!enabledCountry) {
      return NextResponse.json({ 
        success: false, 
        message: '对不起，暂未开通该地址的平台审核，无法提交平台审核' 
      }, { status: 400 })
    }

    await prisma.verificationRequest.create({
      data: {
        userId: session.user.id,
        shippingCountry,
        detailedAddress,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: '您的地址已开通平台审核，后台在计算平台审核费用' 
    }, { status: 200 })

  } catch (error) {
    console.error('Error applying verification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}