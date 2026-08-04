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
  // These routes don't need language prefix and handle their own i18n.
  // Use trailing-slash-aware checks so slugs like /seller-abc or /store-x
  // are NOT swallowed by this guard (they must reach slug detection below).
  const isDashboardRoute =
    pathname === '/seller' || pathname.startsWith('/seller/') ||
    pathname === '/admin' || pathname.startsWith('/admin/')
  const isStoreRoute =
    pathname === '/store' || pathname.startsWith('/store/')
  const isAuctionRoute = pathname.startsWith('/auction/')

  if (isDashboardRoute || isStoreRoute || isAuctionRoute) {
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
  const looksLikeSlug = (s: string) => {
    // Strip optional .com suffix for validation (URL keeps .com in browser bar)
    const base = s.replace(/\.com$/i, '')
    return (
      base.length >= 1 &&
      base.length <= 39 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(base) &&
      !RESERVED_TOP_LEVEL.has(base.toLowerCase()) &&
      !/^\d+$/.test(base) &&
      !supportedLanguages.includes(base as any)
    )
  }

  // Strip .com suffix to get the raw slug for DB lookup
  const stripComSuffix = (s: string) => s.replace(/\.com$/i, '')

  // Single-segment slug: /jianhao-fire → /store/jianhao-fire
  // Also supports /huihuan.com → /store/huihuan (URL bar keeps .com suffix)
  const singleSlugMatch = pathname.match(/^\/([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)(\.com)?$/i)
  if (singleSlugMatch && looksLikeSlug(singleSlugMatch[1] + (singleSlugMatch[2] || ''))) {
    const slug = stripComSuffix(singleSlugMatch[1] + (singleSlugMatch[2] || ''))
    const newUrl = new URL(`/store/${slug}`, request.url)
    const response = NextResponse.rewrite(newUrl)
    return addSecurityHeaders(response)
  }

  // Locale + slug: /de/jianhao-fire → /store/jianhao-fire (strip locale, keep slug)
  // Also supports /de/huihuan.com → /store/huihuan
  const localeSlugMatch = pathname.match(/^\/([a-z]{2})\/([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)(\.com)?$/i)
  if (localeSlugMatch) {
    const [, locale, slugPart, comSuffix] = localeSlugMatch
    const fullSlug = slugPart + (comSuffix || '')
    if (supportedLanguages.includes(locale) && looksLikeSlug(fullSlug)) {
      const slug = stripComSuffix(fullSlug)
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
