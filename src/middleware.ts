import { NextResponse } from "next/server"
import { languages, defaultLanguage } from "@/lib/languages"
import { addSecurityHeaders, generateCSRFToken } from "@/lib/security"

// List of supported language codes
const supportedLanguages = languages.map(lang => lang.code)

export function middleware(request: any) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for AI crawler files and sitemap
  if (
    pathname === '/llms.txt' ||
    pathname === '/llms-full.txt' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return addSecurityHeaders(response)
  }
  
  // Skip middleware for Service Worker files - they need to bypass language redirection
  if (
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/service-worker') ||
    pathname.includes('service-worker') ||
    pathname.includes('pwa-sw-worker') ||
    pathname.includes('pwa-worker') ||
    pathname.includes('worker.js') ||
    pathname.includes('pwa-js.js') ||
    pathname.startsWith('/pwasw')
  ) {
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  }
  
  // Skip middleware for dashboard routes (seller, admin)
  // These routes don't need language prefix and handle their own i18n
  // Also skip /store/* (slug-based store pages handle their own locale detection)
  if (
    pathname.startsWith('/seller') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/store') ||
    pathname.startsWith('/auction/')
  ) {
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  }

  // === Store slug detection (GitHub-style URLs: x2xhub.com/<slug>) ===
  // Rewrites /<slug> → /store/<slug> so the URL bar keeps the clean slug form.
  // Must run BEFORE the locale redirect below, otherwise /<slug> would be
  // rewritten to /<defaultLocale>/<slug> and 404.
  const RESERVED_TOP_LEVEL = new Set<string>([
    'store', 'stores', 'products', 'exhibitions', 'marketplace', 'auction',
    'api', 'api-docs', 'api-keys', 'auth', 'admin', 'seller', 'buyer',
    'profile', 'team-chat', 'chat-hall', 'blog', 'booths', 'categories',
    'ai-register', 'ai-audit', 'test-components', 'test-seo', 'download',
    'about', 'investment', 'partner-recruitment', 'auction-screen',
    'service-worker', 'sw', 'pwasw', 'uploads', 'health', 'maintenance',
    'legal', 'checkout', 'cart', 'wishlist', 'favorites', 'notifications',
    'mcp', 'docs', 'debug', 'diagnostic', 'recommendations', 'reviews',
  ])
  const looksLikeSlug = (s: string) =>
    s.length >= 1 &&
    s.length <= 39 &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(s) &&
    !RESERVED_TOP_LEVEL.has(s.toLowerCase()) &&
    !/^\d+$/.test(s) &&
    !supportedLanguages.includes(s as any)

  // Single-segment slug: /jianhao-fire → /store/jianhao-fire
  const singleSlugMatch = pathname.match(/^\/([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)$/)
  if (singleSlugMatch && looksLikeSlug(singleSlugMatch[1])) {
    const slug = singleSlugMatch[1]
    const newUrl = new URL(`/store/${slug}`, request.url)
    const response = NextResponse.rewrite(newUrl)
    return addSecurityHeaders(response)
  }

  // Locale + slug: /de/jianhao-fire → /store/jianhao-fire (strip locale, keep slug)
  const localeSlugMatch = pathname.match(/^\/([a-z]{2})\/([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)$/)
  if (localeSlugMatch) {
    const [, locale, slug] = localeSlugMatch
    if (supportedLanguages.includes(locale) && looksLikeSlug(slug)) {
      const newUrl = new URL(`/store/${slug}`, request.url)
      const response = NextResponse.rewrite(newUrl)
      return addSecurityHeaders(response)
    }
  }
  
  // Handle language-prefixed dashboard routes (e.g., /de/seller -> /seller)
  const localeDashboardMatch = pathname.match(/^\/([a-z]{2})\/(seller|admin)(\/.*)?$/)
  if (localeDashboardMatch) {
    const [, , dashboardRoute, rest] = localeDashboardMatch
    const newPathname = `/${dashboardRoute}${rest || ''}`
    const newUrl = new URL(newPathname, request.url)
    return NextResponse.rewrite(newUrl)
  }

  // Handle Cloudflare Worker adding wrong locale prefix (e.g., /zh/de -> /de)
  const localePrefixMatch = pathname.match(/^\/([a-z]{2})\/([a-z]{2})(\/.*)?$/)
  if (localePrefixMatch) {
    const [, firstLang, secondLang, rest] = localePrefixMatch
    if (supportedLanguages.includes(firstLang) && supportedLanguages.includes(secondLang)) {
      const newPathname = rest ? `/${secondLang}${rest}` : `/${secondLang}`
      const newUrl = new URL(newPathname, request.url)
      return NextResponse.rewrite(newUrl)
    }
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
      pathname === '/robots.txt' ||
      pathname === '/llms.txt' ||
      pathname === '/llms-full.txt' ||
      pathname.includes('.')
    ) {
      const response = NextResponse.next()
      return addSecurityHeaders(response)
    }

    // For root path /, use rewrite instead of redirect for better SEO
    if (pathname === '/') {
      const newPathname = `/${defaultLanguage}${pathname === '/' ? '' : pathname}`
      const newUrl = new URL(newPathname, request.url)
      const response = NextResponse.rewrite(newUrl)
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
    '/((?!api|_next/static|_next/image|favicon.ico|uploads|sitemap.xml|robots.txt|llms.txt|llms-full.txt|sw.js|pwasw|service-worker).*)',
  ]
}
