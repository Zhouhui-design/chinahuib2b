import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function middleware(request: NextRequest) {
  const session = await auth()
  
  // Check if user is authenticated
  if (!session?.user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check if user is a seller
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true }
  })

  if (!user || user.role !== 'SELLER') {
    // Redirect buyers to home page
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!user.isActive) {
    // Account deactivated
    return NextResponse.redirect(new URL('/account-deactivated', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/seller/:path*',
}
