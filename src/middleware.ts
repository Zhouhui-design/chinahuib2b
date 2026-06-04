import { NextResponse } from "next/server"
import { languages, defaultLanguage } from "@/lib/languages"
import { addSecurityHeaders, generateCSRFToken } from "@/lib/security"

// List of supported language codes
const supportedLanguages = languages.map(lang => lang.code)

export function middleware(request: any) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for dashboard routes (seller, admin)
  // These routes don't need language prefix
  if (
    pathname.startsWith('/seller') ||
    pathname.startsWith('/admin')
  ) {
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  }
  
  // Check if pathname has a language prefix
  const pathnameHasLocale = supportedLanguages.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // If no locale in pathname, redirect to default locale
  if (!pathnameHasLocale) {
    // Skip redirect for static files, API routes, and uploads
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/api-docs') ||
      pathname.startsWith('/uploads') ||
      pathname.includes('.')
    ) {
      const response = NextResponse.next()
      return addSecurityHeaders(response)
    }

    const newUrl = new URL(`/${defaultLanguage}${pathname}`, request.url)
    const response = NextResponse.redirect(newUrl)
    return addSecurityHeaders(response)
  }

  const response = NextResponse.next()
  
  // Set CSRF token cookie if not present
  if (!request.cookies.get('csrf-token')) {
    const csrfToken = generateCSRFToken()
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: false, // Accessible from JavaScript for API calls
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })
  }
  
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    // Match all paths except static files, API routes, and uploads
    '/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\..*).*)',
  ]
}
