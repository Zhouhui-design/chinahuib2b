import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

const CHAT_SYSTEM_BASE_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://chat.fixturerb2b.top'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const username = searchParams.get('username')
    const userId = searchParams.get('userId')
    const redirect = searchParams.get('redirect') || '/'

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?error=InvalidToken', request.url))
    }

    const verifyRes = await fetch(`${CHAT_SYSTEM_BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })

    if (!verifyRes.ok) {
      return NextResponse.redirect(new URL('/auth/login?error=InvalidToken', request.url))
    }

    const verifyData = await verifyRes.json()
    
    const chatUserId = verifyData.userId || userId
    const chatUsername = verifyData.username || username

    let user = await prisma.user.findFirst({
      where: { chatSystemUserId: chatUserId }
    })

    if (!user) {
      const randomPassword = Math.random().toString(36).substring(2, 15)
      const hashedPassword = await bcrypt.hash(randomPassword, 10)

      user = await prisma.user.create({
        data: {
          email: `${chatUsername}@chat.system`,
          username: chatUsername,
          password: hashedPassword,
          role: 'BUYER',
          isActive: true,
          emailVerified: true,
          chatSystemToken: token,
          chatSystemUserId: chatUserId,
          chatSystemLinkedAt: new Date()
        }
      })
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          chatSystemToken: token,
          lastLoginAt: new Date()
        }
      })
    }

    const sessionData = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      chatSystemToken: token,
      chatSystemUserId: chatUserId
    }

    const response = NextResponse.redirect(new URL(redirect, request.url))
    
    const encryptedSession = Buffer.from(JSON.stringify(sessionData)).toString('base64')
    response.cookies.set('chat-session', encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Chat login callback error:', error)
    return NextResponse.redirect(new URL('/auth/login?error=LoginFailed', request.url))
  }
}
