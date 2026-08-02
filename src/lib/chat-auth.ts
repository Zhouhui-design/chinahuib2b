import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getToken } from 'next-auth/jwt'
import { authOptions } from './auth'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'x2xhub_fallback_secret_32chars_long_enough'

export async function resolveUserId(request: NextRequest): Promise<string | null> {
  // Method 1: Try getToken first (most reliable for JWT strategy)
  try {
    const token = await getToken({ req: request, secret: NEXTAUTH_SECRET })
    if (token) {
      const tokenUserId = (token.id as string) || (token.sub as string)
      if (tokenUserId) {
        return tokenUserId
      }
    }
  } catch {
    // getToken may fail
  }

  // Method 2: Try getServerSession
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      return session.user.id as string
    }
  } catch {
    // getServerSession may fail
  }

  return null
}
