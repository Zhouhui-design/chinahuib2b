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
    select: { 
      role: true, 
      isActive: true
    }
  })

  if (!user || user.role !== 'SELLER') {
    // Redirect buyers to home page
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!user.isActive) {
    // Account deactivated
    return NextResponse.redirect(new URL('/account-deactivated', request.url))
  }

  // Fetch seller profile with subscription details
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id }
  })
  
  if (!sellerProfile) {
    // No seller profile yet, redirect to setup
    return NextResponse.redirect(new URL('/seller/setup', request.url))
  }

  // Check subscription status
  const now = new Date()
  const expiryDate = sellerProfile.subscriptionExpiry
  
  // If subscription has expired
  if (expiryDate && now > expiryDate) {
    // Update subscription status to EXPIRED
    await prisma.sellerProfile.update({
      where: { userId: session.user.id },
      data: { 
        subscriptionStatus: 'EXPIRED',
        isActive: false
      }
    })
    
    // Check if within 3 months grace period
    const threeMonthsAfterExpiry = new Date(expiryDate)
    threeMonthsAfterExpiry.setMonth(threeMonthsAfterExpiry.getMonth() + 3)
    
    if (now > threeMonthsAfterExpiry) {
      // Beyond grace period - show error page
      return NextResponse.redirect(new URL('/seller/subscription-expired?grace=expired', request.url))
    } else {
      // Within grace period - allow access but show warning
      // Store will be hidden from buyers but seller can still access backend
      return NextResponse.next()
    }
  }

  // Check if subscription amount is at least $10
  const MIN_SUBSCRIPTION_AMOUNT = 10.00
  
  if (sellerProfile.subscriptionStatus !== 'ACTIVE' || 
      !sellerProfile.subscriptionAmount || 
      Number(sellerProfile.subscriptionAmount) < MIN_SUBSCRIPTION_AMOUNT) {
    // Not enough payment or not active
    return NextResponse.redirect(new URL('/seller/subscription-required', request.url))
  }

  // Active and paid subscription - allow access
  return NextResponse.next()
}

export const config = {
  matcher: '/seller/:path*',
}
