import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://x2xhub.com'

export async function GET(request: NextRequest) {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/reset-password
Disallow: /_next/
Disallow: /sw.js

User-agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Bingbot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: GPTBot
Disallow: /admin/
Disallow: /api/
Disallow: /chat/

User-agent: Googlebot-Image
Allow: /images/
Allow: /uploads/

User-agent: *
Allow: /en/
Allow: /zh/
Allow: /fr/
Allow: /de/
Allow: /ja/
Allow: /ko/
Allow: /es/
Allow: /pt/
Allow: /ru/
Allow: /ar/
Allow: /hi/
Allow: /th/
Allow: /vi/

Allow: /marketplace
Allow: /products
Allow: /stores
Allow: /exhibitions
Allow: /about
Allow: /contact

Sitemap: ${BASE_URL}/sitemap.xml
Host: ${BASE_URL}
`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}