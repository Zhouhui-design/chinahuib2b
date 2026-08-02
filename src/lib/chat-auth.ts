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
        console.log('[chat-auth] resolveUserId: getToken returned', tokenUserId)
        return tokenUserId
      }
    }
  } catch (err) {
    console.warn('[chat-auth] getToken failed:', err instanceof Error ? err.message : String(err))
  }

  // Method 2: Try getServerSession
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      console.log('[chat-auth] resolveUserId: getServerSession returned', session.user.id)
      return session.user.id as string
    }
  } catch (err) {
    console.warn('[chat-auth] getServerSession failed:', err instanceof Error ? err.message : String(err))
  }

  // Method 3: Fallback - try to read the cookie manually and extract the JWT sub claim
  try {
    const cookies = request.cookies
    const tokenCookie =
      cookies.get('__Secure-next-auth.session-token') ||
      cookies.get('next-auth.session-token')
    if (tokenCookie?.value) {
      const token = await getToken({ req: request, secret: NEXTAUTH_SECRET })
      if (token) {
        const tokenUserId = (token.id as string) || (token.sub as string)
        if (tokenUserId) {
          console.log('[chat-auth] resolveUserId: cookie fallback returned', tokenUserId)
          return tokenUserId
        }
      }
    }
  } catch (err) {
    console.warn('[chat-auth] cookie fallback failed:', err instanceof Error ? err.message : String(err))
  }

  console.warn('[chat-auth] resolveUserId: all methods failed, returning null')
  return null
}
