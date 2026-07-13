import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { languages } from '@/lib/languages'

const BASE_URL = 'https://x2xhub.com'

interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternates?: { lang: string; href: string }[]
}

function generateSitemapXml(entries: SitemapEntry[]): string {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`

  const urlEntries = entries.map(entry => {
    const alternates = entry.alternates?.map(alt => 
      `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}" />`
    ).join('\n') || ''
    
    return `  <url>
    <loc>${entry.loc}</loc>
    ${entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority ? `    <priority>${entry.priority}</priority>` : ''}
    ${alternates}
  </url>`
  }).join('\n')

  return `${xmlHeader}\n${urlEntries}\n</urlset>`
}

function createAlternates(path: string, isDefault = false): { lang: string; href: string }[] {
  const links: { lang: string; href: string }[] = []
  
  languages.forEach(lang => {
    const href = lang.code === 'en' 
      ? `${BASE_URL}${path}` 
      : `${BASE_URL}/${lang.code}${path}`
    links.push({ lang: lang.code, href })
  })
  
  links.push({ lang: 'x-default', href: `${BASE_URL}${path}` })
  
  return links
}

export async function GET(request: NextRequest) {
  try {
    const entries: SitemapEntry[] = []
    const now = new Date().toISOString().split('T')[0]

    entries.push({
      loc: `${BASE_URL}/`,
      lastmod: now,
      changefreq: 'daily',
      priority: 1.0,
      alternates: createAlternates('/', true)
    })

    entries.push({
      loc: `${BASE_URL}/marketplace`,
      lastmod: now,
      changefreq: 'hourly',
      priority: 0.9,
      alternates: createAlternates('/marketplace')
    })

    entries.push({
      loc: `${BASE_URL}/products`,
      lastmod: now,
      changefreq: 'hourly',
      priority: 0.9,
      alternates: createAlternates('/products')
    })

    entries.push({
      loc: `${BASE_URL}/stores`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.85,
      alternates: createAlternates('/stores')
    })

    entries.push({
      loc: `${BASE_URL}/exhibitions`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.85,
      alternates: createAlternates('/exhibitions')
    })

    entries.push({
      loc: `${BASE_URL}/about`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.8,
      alternates: createAlternates('/about')
    })

    entries.push({
      loc: `${BASE_URL}/contact`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.8,
      alternates: createAlternates('/contact')
    })

    entries.push({
      loc: `${BASE_URL}/investment`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.75,
      alternates: createAlternates('/investment')
    })

    entries.push({
      loc: `${BASE_URL}/auth/login`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.8,
      alternates: createAlternates('/auth/login')
    })
    
    entries.push({
      loc: `${BASE_URL}/auth/register`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.8,
      alternates: createAlternates('/auth/register')
    })

    entries.push({
      loc: `${BASE_URL}/api/docs`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.75,
      alternates: createAlternates('/api/docs')
    })

    entries.push({
      loc: `${BASE_URL}/privacy`,
      lastmod: now,
      changefreq: 'yearly',
      priority: 0.6,
      alternates: createAlternates('/privacy')
    })
    
    entries.push({
      loc: `${BASE_URL}/terms`,
      lastmod: now,
      changefreq: 'yearly',
      priority: 0.6,
      alternates: createAlternates('/terms')
    })

    try {
      const products = await prisma.product.findMany({
        where: { isActive: true, isPublished: true },
        select: { id: true, slug: true, updatedAt: true },
        take: 1000
      })

      products.forEach(product => {
        entries.push({
          loc: `${BASE_URL}/products/${product.id}`,
          lastmod: new Date(product.updatedAt).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.85,
          alternates: createAlternates(`/products/${product.id}`)
        })
      })
    } catch (error) {
      console.warn('Failed to fetch products for sitemap:', error)
    }

    try {
      const stores = await prisma.sellerProfile.findMany({
        where: { isActive: true },
        select: { id: true, updatedAt: true },
        take: 500
      })

      stores.forEach(store => {
        entries.push({
          loc: `${BASE_URL}/stores/${store.id}`,
          lastmod: new Date(store.updatedAt).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.8,
          alternates: createAlternates(`/stores/${store.id}`)
        })
      })
    } catch (error) {
      console.warn('Failed to fetch stores for sitemap:', error)
    }

    try {
      const booths = await prisma.booth.findMany({
        where: { isActive: true, isPublished: true },
        select: { id: true, updatedAt: true },
        take: 500
      })

      booths.forEach(booth => {
        entries.push({
          loc: `${BASE_URL}/exhibitions/${booth.id}`,
          lastmod: new Date(booth.updatedAt).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.85,
          alternates: createAlternates(`/exhibitions/${booth.id}`)
        })
      })
    } catch (error) {
      console.warn('Failed to fetch booths for sitemap:', error)
    }

    try {
      const topics = await prisma.topic.findMany({
        where: { isActive: true },
        select: { id: true, updatedAt: true },
        take: 500
      })

      topics.forEach(topic => {
        entries.push({
          loc: `${BASE_URL}/marketplace/topic/${topic.id}`,
          lastmod: new Date(topic.updatedAt).toISOString().split('T')[0],
          changefreq: 'hourly',
          priority: 0.75,
          alternates: createAlternates(`/marketplace/topic/${topic.id}`)
        })
      })
    } catch (error) {
      console.warn('Failed to fetch topics for sitemap:', error)
    }

    const regionalPages = [
      { path: '/marketplace?region=us', region: 'US', priority: 0.85 },
      { path: '/marketplace?region=eu', region: 'EU', priority: 0.85 },
      { path: '/marketplace?region=fr', region: 'FR', priority: 0.85 },
      { path: '/marketplace?region=de', region: 'DE', priority: 0.85 },
      { path: '/marketplace?region=uk', region: 'UK', priority: 0.85 },
      { path: '/marketplace?region=jp', region: 'JP', priority: 0.85 },
      { path: '/marketplace?region=kr', region: 'KR', priority: 0.85 },
      { path: '/marketplace?region=au', region: 'AU', priority: 0.85 },
    ]

    regionalPages.forEach(page => {
      entries.push({
        loc: `${BASE_URL}${page.path}`,
        lastmod: now,
        changefreq: 'daily',
        priority: page.priority,
        alternates: createAlternates(page.path)
      })
    })

    const xml = generateSitemapXml(entries)

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}