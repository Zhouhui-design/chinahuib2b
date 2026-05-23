import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, type } = body // type: 'email' or 'phone'

    if (!identifier || !type) {
      return NextResponse.json({ error: 'Identifier and type are required' }, { status: 400 })
    }

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: type === 'email' 
        ? { email: identifier } 
        : { phone: identifier }
    })

    if (!user) {
      // For security, don't reveal that user doesn't exist
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists, you will receive a password reset link.' 
      })
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // TODO: In production, send email or SMS with reset link
    // For now, we'll just return the token for demo purposes
    // In a real app, you would integrate with a service like SendGrid or Twilio
    console.log(`Password reset requested for ${type}: ${identifier}`)
    console.log(`Reset token: ${resetToken}`)

    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists, you will receive a password reset link.',
      // For demo only - remove in production
      demoResetLink: `/auth/reset-password?token=${resetToken}`
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}