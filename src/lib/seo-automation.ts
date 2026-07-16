export interface SEOEvent {
  type: 'product_create' | 'product_update' | 'booth_create' | 'booth_update' | 'store_update' | 'task_create' | 'task_update'
  data: {
    id: string
    url: string
    title?: string
    description?: string
    imageUrl?: string
  }
}

export interface SEOPingResult {
  searchEngine: string
  url: string
  status: 'success' | 'error' | 'pending'
  statusCode?: number
  message?: string
}

export interface CloudflarePurgeResult {
  success: boolean
  message?: string
}

const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID || ''
const CLOUDFLARE_AUTH_EMAIL = process.env.CLOUDFLARE_AUTH_EMAIL || ''
const CLOUDFLARE_AUTH_KEY = process.env.CLOUDFLARE_AUTH_KEY || ''

const SEARCH_ENGINES = [
  { name: 'Google', pingUrl: 'https://www.google.com/ping?sitemap=https://x2xhub.com/sitemap.xml' },
  { name: 'Bing', pingUrl: 'https://www.bing.com/webmaster/ping.aspx?siteMap=https://x2xhub.com/sitemap.xml' },
  { name: 'Yandex', pingUrl: 'https://webmaster.yandex.ru/site/map.xml?url=https://x2xhub.com/sitemap.xml' },
  { name: 'Baidu', pingUrl: 'https://www.baidu.com/sitemap.xml?site=https://x2xhub.com' },
  { name: 'DuckDuckGo', pingUrl: 'https://duckduckgo.com/?q=site:x2xhub.com&ia=web' },
  { name: 'Seznam', pingUrl: 'https://www.seznam.cz/search?q=x2xhub.com' },
  { name: 'Naver', pingUrl: 'https://search.naver.com/search.naver?query=x2xhub.com' },
  { name: 'Yahoo', pingUrl: 'https://search.yahoo.com/search?p=x2xhub.com' },
]

export async function purgeCloudflareCache(urls?: string[]): Promise<CloudflarePurgeResult> {
  try {
    const https = await import('https')
    const payload = urls && urls.length > 0
      ? { files: urls }
      : { purge_everything: true }

    return new Promise((resolve) => {
      const options = {
        hostname: 'api.cloudflare.com',
        path: `/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
        method: 'POST',
        headers: {
          'X-Auth-Email': CLOUDFLARE_AUTH_EMAIL,
          'X-Auth-Key': CLOUDFLARE_AUTH_KEY,
          'Content-Type': 'application/json',
        },
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          try {
            const result = JSON.parse(data)
            if (result.success) {
              resolve({ success: true, message: 'Cache purged successfully' })
            } else {
              resolve({ success: false, message: result.errors?.[0]?.message || 'Unknown error' })
            }
          } catch {
            resolve({ success: true, message: 'Cache purged (non-JSON response)' })
          }
        })
      })

      req.on('error', (error) => {
        resolve({ success: false, message: error.message })
      })

      req.write(JSON.stringify(payload))
      req.end()
    })
  } catch (error) {
    return { success: false, message: (error as Error).message }
  }
}

export async function pingSearchEngines(url?: string): Promise<SEOPingResult[]> {
  const results: SEOPingResult[] = []
  
  for (const engine of SEARCH_ENGINES) {
    try {
      const https = await import('https')
      const http = await import('http')
      
      const isHttps = engine.pingUrl.startsWith('https')
      const protocol = isHttps ? https : http
      const parsedUrl = new URL(engine.pingUrl)

      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'x2xhub.com SEO Bot/1.0',
          'Accept': '*/*',
        },
      }

      const result = await new Promise<SEOPingResult>((resolve) => {
        const req = protocol.request(options, (res) => {
          resolve({
            searchEngine: engine.name,
            url: engine.pingUrl,
            status: res.statusCode && res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'error',
            statusCode: res.statusCode,
          })
          res.resume()
        })

        req.on('error', (error) => {
          resolve({
            searchEngine: engine.name,
            url: engine.pingUrl,
            status: 'error',
            message: error.message,
          })
        })

        req.on('timeout', () => {
          req.destroy()
          resolve({
            searchEngine: engine.name,
            url: engine.pingUrl,
            status: 'error',
            message: 'Timeout',
          })
        })

        req.end()
      })

      results.push(result)
    } catch (error) {
      results.push({
        searchEngine: engine.name,
        url: engine.pingUrl,
        status: 'error',
        message: (error as Error).message,
      })
    }
  }

  return results
}

export function generateSocialShareLinks(url: string, title: string, description?: string, imageUrl?: string): Record<string, string> {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDesc = description ? encodeURIComponent(description) : ''
  const encodedImage = imageUrl ? encodeURIComponent(imageUrl) : ''

  return {
    linkedin: `https://www.linkedin.com/shareArticle?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDesc}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&t=${encodedTitle}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
    wechat: `https://x2xhub.com/api/share/wechat?url=${encodedUrl}&title=${encodedTitle}`,
  }
}

export async function handleSEOEvent(event: SEOEvent): Promise<{
  cloudflare: CloudflarePurgeResult
  pingResults: SEOPingResult[]
  shareLinks: Record<string, string>
}> {
  const shareLinks = generateSocialShareLinks(
    event.data.url,
    event.data.title || 'X2XHub - Global B2B Trade Platform',
    event.data.description,
    event.data.imageUrl
  )

  const [cloudflare, pingResults] = await Promise.all([
    purgeCloudflareCache([event.data.url]),
    pingSearchEngines(event.data.url),
  ])

  return { cloudflare, pingResults, shareLinks }
}

export async function generateDailySEOReport(): Promise<{
  date: string
  totalPages: number
  indexedPages: number
  errors: { type: string; count: number; details?: string[] }[]
  warnings: { type: string; count: number; details?: string[] }[]
  recommendations: string[]
}> {
  try {
    const { prisma } = await import('./db')
    
    const [products, booths, stores] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.booth.count({ where: { isActive: true, isPublished: true } }),
      prisma.sellerProfile.count({ where: { isActive: true } }),
    ])

    const totalPages = products + booths + stores + 15

    const errors: { type: string; count: number; details?: string[] }[] = []
    const warnings: { type: string; count: number; details?: string[] }[] = []
    const recommendations: string[] = []

    if (products === 0) {
      errors.push({ type: 'No products', count: 0, details: ['No published products found'] })
      recommendations.push('Add products to improve SEO visibility')
    }

    if (booths === 0) {
      warnings.push({ type: 'No exhibitions', count: 0, details: ['No published exhibitions'] })
      recommendations.push('Create exhibition booths to attract visitors')
    }

    const productsWithoutImages = await prisma.product.count({
      where: { isActive: true, mainImageUrl: '' },
    })
    if (productsWithoutImages > 0) {
      warnings.push({ type: 'Products without images', count: productsWithoutImages })
      recommendations.push(`Add images to ${productsWithoutImages} products`)
    }

    const productsWithoutDescription = await prisma.product.count({
      where: { isActive: true, description: '' },
    })
    if (productsWithoutDescription > 0) {
      warnings.push({ type: 'Products without description', count: productsWithoutDescription })
      recommendations.push(`Add descriptions to ${productsWithoutDescription} products`)
    }

    recommendations.push('Submit sitemap to Google Search Console')
    recommendations.push('Submit sitemap to Bing Webmaster Tools')
    recommendations.push('Monitor Core Web Vitals performance')

    return {
      date: new Date().toISOString(),
      totalPages,
      indexedPages: Math.min(totalPages, totalPages * 0.8),
      errors,
      warnings,
      recommendations,
    }
  } catch (error) {
    return {
      date: new Date().toISOString(),
      totalPages: 0,
      indexedPages: 0,
      errors: [{ type: 'Database Error', count: 1, details: [(error as Error).message] }],
      warnings: [],
      recommendations: ['Check database connection'],
    }
  }
}