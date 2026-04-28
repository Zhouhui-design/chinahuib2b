import { NextResponse } from "next/server"
import { languages, defaultLanguage } from "@/lib/languages"

// List of supported language codes
const supportedLanguages = languages.map(lang => lang.code)

export function middleware(request: any) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for dashboard routes (seller, admin)
  // These routes don't need language prefix
  if (
    pathname.startsWith('/seller') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth')
  ) {
    return NextResponse.next()
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
      pathname.startsWith('/uploads') ||
      pathname.includes('.')
    ) {
      return NextResponse.next()
    }

    const newUrl = new URL(`/${defaultLanguage}${pathname}`, request.url)
    return NextResponse.redirect(newUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files, API routes, and uploads
    '/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\..*).*)',
  ]
}
