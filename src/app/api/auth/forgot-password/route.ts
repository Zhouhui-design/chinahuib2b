import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email-service'
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

    // Send the reset link by email (only email flow can receive the link)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://x2xhub.com'
    const resetLink = `${baseUrl}/en/auth/reset-password?token=${resetToken}`

    if (type === 'email') {
      const displayName = user.displayName || user.username || 'there'
      const subject = 'Reset your x2xhub password'
      const text =
        `Hi ${displayName},\n\n` +
        `We received a request to reset your x2xhub password.\n\n` +
        `Reset it here (valid for 24 hours):\n${resetLink}\n\n` +
        `If you did not request this, you can safely ignore this email — your password will not change.\n\n` +
        `— x2xhub`
      const html =
        `<p>Hi ${displayName},</p>` +
        `<p>We received a request to reset your x2xhub password.</p>` +
        `<p><a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;">Reset Password</a></p>` +
        `<p style="color:#6b7280;font-size:13px;">This link is valid for 24 hours. If the button doesn't work, copy this link into your browser:<br>${resetLink}</p>` +
        `<p style="color:#6b7280;font-size:13px;">If you did not request this, you can safely ignore this email — your password will not change.</p>` +
        `<p>— x2xhub</p>`

      const result = await sendEmail(user.email, subject, text, html)
      if (!result.success) {
        console.error('Password reset email failed:', result.message)
        // Still return a generic success to avoid leaking account existence,
        // but log the failure so ops can see delivery problems.
      }
    } else {
      // Phone reset is not wired to an SMS provider yet; log for ops.
      console.log(`Password reset requested via phone for user ${user.id}; SMS not configured.`)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists, you will receive a password reset link.' 
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}