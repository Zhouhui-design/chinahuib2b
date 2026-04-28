import { NextResponse } from 'next/server'

export async function GET() {
  const content = `# https://chinahuib2b.top/robots.txt
# Allow all search engine crawlers
User-agent: *
Allow: /

# Disallow backend and API paths
Disallow: /api/
Disallow: /seller/
Disallow: /auth/
Disallow: /admin/
Disallow: /_next/
Disallow: /public/

# Disallow sensitive pages
Disallow: /login
Disallow: /register
Disallow: /dashboard

# Sitemap location
Sitemap: https://chinahuib2b.top/sitemap.xml
`

  return new NextResponse(content, {
    headers: { 
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    },
  })
}
