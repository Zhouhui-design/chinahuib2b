import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { languages } from '@/lib/languages'

export const dynamic = 'force-dynamic'

const BASE_URL = 'https://x2xhub.com'
const DEFAULT_LANG = 'en'  // sitemap uses explicit locale-prefixed URLs (no 302 redirect)

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

  const normalizedPath = path === '/' ? '' : path

  languages.forEach(lang => {
    links.push({ lang: lang.code, href: `${BASE_URL}/${lang.code}${normalizedPath}` })
  })

  // x-default points to the default-language (en) version
  links.push({ lang: 'x-default', href: `${BASE_URL}/${DEFAULT_LANG}${normalizedPath}` })

  return links
}

// helper: strip trailing slash so homepage URL = /en (not /en/ -> 308)
function withLocale(path: string): string {
  const normalized = path === '/' ? '' : path
  return `${BASE_URL}/${DEFAULT_LANG}${normalized}`
}

export async function GET(request: NextRequest) {
  try {
    const entries: SitemapEntry[] = []
    const now = new Date().toISOString().split('T')[0]

    entries.push({
      loc: withLocale('/'),
      lastmod: now,
      changefreq: 'daily',
      priority: 1.0,
      alternates: createAlternates('/', true)
    })

    entries.push({
      loc: withLocale('/marketplace'),
      lastmod: now,
      changefreq: 'hourly',
      priority: 0.9,
      alternates: createAlternates('/marketplace')
    })

    entries.push({
      loc: withLocale('/products'),
      lastmod: now,
      changefreq: 'hourly',
      priority: 0.9,
      alternates: createAlternates('/products')
    })

    entries.push({
      loc: withLocale('/stores'),
      lastmod: now,
      changefreq: 'daily',
      priority: 0.85,
      alternates: createAlternates('/stores')
    })

    entries.push({
      loc: withLocale('/exhibitions'),
      lastmod: now,
      changefreq: 'daily',
      priority: 0.85,
      alternates: createAlternates('/exhibitions')
    })

    entries.push({
      loc: withLocale('/auction-screen'),
      lastmod: now,
      changefreq: 'hourly',
      priority: 0.95,
      alternates: createAlternates('/auction-screen')
    })

    entries.push({
      loc: withLocale('/chat-hall'),
      lastmod: now,
      changefreq: 'hourly',
      priority: 0.9,
      alternates: createAlternates('/chat-hall')
    })

    entries.push({
      loc: withLocale('/api-docs'),
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.8,
      alternates: createAlternates('/api-docs')
    })

    entries.push({
      loc: withLocale('/ai-register'),
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.8,
      alternates: createAlternates('/ai-register')
    })

    entries.push({
      loc: withLocale('/partner-recruitment'),
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.75,
      alternates: createAlternates('/partner-recruitment')
    })

    entries.push({
      loc: withLocale('/blog'),
      lastmod: now,
      changefreq: 'daily',
      priority: 0.85,
      alternates: createAlternates('/blog')
    })

    entries.push({
      loc: withLocale('/about'),
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.8,
      alternates: createAlternates('/about')
    })

    entries.push({
      loc: withLocale('/contact'),
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.8,
      alternates: createAlternates('/contact')
    })

    entries.push({
      loc: withLocale('/investment'),
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.75,
      alternates: createAlternates('/investment')
    })

    entries.push({
      loc: withLocale('/legal/privacy-policy'),
      lastmod: now,
      changefreq: 'yearly',
      priority: 0.6,
      alternates: createAlternates('/legal/privacy-policy')
    })
    
    entries.push({
      loc: withLocale('/legal/terms-of-service'),
      lastmod: now,
      changefreq: 'yearly',
      priority: 0.6,
      alternates: createAlternates('/legal/terms-of-service')
    })

    entries.push({
      loc: withLocale('/legal/cookie-settings'),
      lastmod: now,
      changefreq: 'yearly',
      priority: 0.6,
      alternates: createAlternates('/legal/cookie-settings')
    })

    try {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, updatedAt: true },
        take: 1000
      })

      products.forEach(product => {
        entries.push({
          loc: withLocale(`/products/${product.id}`),
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
        select: { id: true, storeSlug: true, updatedAt: true },
        take: 500
      })

      stores.forEach(store => {
        // Prefer the clean GitHub-style slug URL; fall back to legacy URL
        const storePath = store.storeSlug ? `/${store.storeSlug}` : `/stores/${store.id}`
        entries.push({
          loc: withLocale(storePath),
          lastmod: new Date(store.updatedAt).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.8,
          alternates: createAlternates(storePath)
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
          loc: withLocale(`/exhibitions/${booth.id}`),
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
          loc: withLocale(`/marketplace/topic/${topic.id}`),
          lastmod: new Date(topic.updatedAt).toISOString().split('T')[0],
          changefreq: 'hourly',
          priority: 0.75,
          alternates: createAlternates(`/marketplace/topic/${topic.id}`)
        })
      })
    } catch (error) {
      console.warn('Failed to fetch topics for sitemap:', error)
    }

    try {
      const tasks = await prisma.marketplaceTask.findMany({
        where: { status: 'OPEN' },
        select: { id: true, updatedAt: true },
        take: 500
      })

      tasks.forEach(task => {
        entries.push({
          loc: withLocale(`/marketplace/${task.id}`),
          lastmod: new Date(task.updatedAt).toISOString().split('T')[0],
          changefreq: 'hourly',
          priority: 0.8,
          alternates: createAlternates(`/marketplace/${task.id}`)
        })
      })
    } catch (error) {
      console.warn('Failed to fetch tasks for sitemap:', error)
    }

    try {
      const auctionListings = await prisma.auctionListing.findMany({
        where: { status: { not: 'COMPLETED' } },
        select: { id: true, updatedAt: true, title: true, status: true },
        take: 2000
      })

      auctionListings
        .filter(l => l.status === 'ACTIVE' || l.status === 'PENDING')
        .forEach(listing => {
          entries.push({
            loc: withLocale(`/auction/${listing.id}`),
            lastmod: new Date(listing.updatedAt).toISOString().split('T')[0],
            changefreq: 'hourly',
            priority: 0.9,
            alternates: createAlternates(`/auction/${listing.id}`)
          })
        })
    } catch (error) {
      console.warn('Failed to fetch auction listings for sitemap:', error)
    }

    try {
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
        loc: withLocale(page.path),
        lastmod: now,
        changefreq: 'daily',
        priority: page.priority,
        alternates: createAlternates(page.path)
      })
    })
    } catch (error) {
      console.warn('Failed to process regional pages for sitemap:', error)
    }

    const xml = generateSitemapXml(entries)

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'x-sitemap-generated': now,
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}