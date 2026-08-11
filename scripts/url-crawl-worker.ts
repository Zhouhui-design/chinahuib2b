#!/usr/bin/env tsx
/**
 * URL Health Crawl Worker
 * 读取 sitemap → 分类 URL → 检查 HTTP 状态 → 写入 UrlCrawlRecord 表
 *
 * 用法:
 *   tsx scripts/url-crawl-worker.ts [days] [--force] [--category=PRODUCT] [--limit=N]
 *
 *   days     : 只重新处理 lastCheckedAt 在 N 天之前的记录（默认 7，即 cron 每周）
 *   --force  : 忽略 lastCheckedAt，处理所有 PENDING/FAILED 记录
 *   --category=X : 只处理某一分类（PRODUCT|MARKETPLACE|STATIC|AUTH|FILTER）
 *   --limit=N    : 单次最多检查 N 个 URL（防超时/防限流）
 *   --discover   : 只从 sitemap 发现并入库新 URL，不执行抓取
 *   --crawl      : 只执行抓取（假设记录已入库）
 */

import { prisma } from '@/lib/db'
import { UrlCrawlCategory, UrlCrawlStatus } from '@prisma/client'

const SITEMAP_URL = process.env.SITEMAP_URL || 'https://x2xhub.com/sitemap.xml'
const BASE_HOST = process.env.CRAWL_BASE_HOST || 'x2xhub.com'
const DEFAULT_DAYS = parseInt(process.argv[2] || '7', 10) || 7
const DEFAULT_LIMIT = 200
const CONCURRENCY = 8
const REQUEST_TIMEOUT_MS = 20000

// ---------- CLI Args ----------
function parseArgs() {
  const args = {
    force: false,
    discover: true,
    crawl: true,
    category: null as UrlCrawlCategory | null,
    limit: DEFAULT_LIMIT,
  }
  for (let i = 3; i < process.argv.length; i++) {
    const a = process.argv[i]
    if (a === '--force' || a === '--force-all') args.force = true
    else if (a === '--discover') { args.discover = true; args.crawl = false }
    else if (a === '--crawl' || a === '--force-all') {
      if (a === '--crawl') args.discover = false
      args.crawl = true
    }
    else if (a.startsWith('--category=')) {
      const c = a.slice('--category='.length) as UrlCrawlCategory
      if (Object.values(UrlCrawlCategory).includes(c)) args.category = c
      else { console.warn('Unknown category:', c, '→ ignoring') }
    } else if (a.startsWith('--limit=')) {
      const n = parseInt(a.slice('--limit='.length), 10)
      if (Number.isFinite(n) && n > 0) args.limit = n
    }
  }
  return args
}

// ---------- URL Classification ----------
function classifyCategory(url: string): UrlCrawlCategory | null {
  try {
    const u = new URL(url)
    // strip locale prefix: /zh/seller → /seller
    const pathParts = u.pathname.split('/').filter(Boolean)
    const firstSeg = pathParts[0] || ''
    const secondSeg = pathParts[1] || ''
    const hasLocalePrefix = /^[a-z]{2}(-[a-z]+)?$/i.test(firstSeg) // zh, de, pt-br, en-chat-hall edge case later
    const pathAfterLocale = hasLocalePrefix
      ? '/' + pathParts.slice(1).join('/')
      : u.pathname
    const search = u.search || ''

    // AUTH (priority first because it's short match)
    if (/^\/auth\b/.test(pathAfterLocale)) return UrlCrawlCategory.AUTH

    // FILTER: pages with query params that indicate lists
    if (search.length > 0) {
      if (/[?&](category|region|tag|sort|filter|page)=/i.test(search)) {
        // Make sure it's a listing page
        if (/^\/(products|marketplace|stores|sellers|exhibitions|search)\b/.test(pathAfterLocale)) {
          return UrlCrawlCategory.FILTER
        }
      }
    }

    // PRODUCT: product detail
    if (/^\/products\/[^?]/.test(pathAfterLocale) && !search.includes('?category=')) {
      return UrlCrawlCategory.PRODUCT
    }
    if (firstSeg.endsWith('-chat-hall')) {
      return UrlCrawlCategory.MARKETPLACE
    }

    // MARKETPLACE: marketplace listings, stores
    if (/^\/(marketplace|stores|sellers)\b/.test(pathAfterLocale)) {
      return UrlCrawlCategory.MARKETPLACE
    }

    // STATIC: everything else that looks like a public page
    const staticPatterns = [
      /^\/about$/i,
      /^\/terms$/i,
      /^\/privacy$/i,
      /^\/contact$/i,
      /^\/exhibitions?$/i,
      /^\/exhibitions\/.+/,
      /^\/products$/,        // products list without query
      /^\/marketplace$/,      // marketplace list without query
      /^\/stores$/,
      /^\/sitemap\.xml$/,
      /^\/robots\.txt$/,
      /^\/llms\.txt$/,
      /^\/api\/docs/,
      /^\/blogs?(\/|$)/,
      /^\/topics?(\/|$)/,
      /^\/reviews?(\/|$)/,
    ]
    if (staticPatterns.some(p => p.test(pathAfterLocale))) {
      return UrlCrawlCategory.STATIC
    }

    // Booth product subpath or chat path are MARKETPLACE-ish, fallback to STATIC
    // Everything else → STATIC as catch-all (non-critical, optional monitoring)
    return UrlCrawlCategory.STATIC
  } catch {
    return null
  }
}

// ---------- Sitemap Parse ----------
async function fetchSitemapUrls(sitemapUrl: string, depth = 0): Promise<string[]> {
  if (depth > 3) return []
  try {
    console.log(`[Discover] GET ${sitemapUrl}`)
    const res = await fetch(sitemapUrl, {
      headers: { 'User-Agent': 'x2xhub-HealthCrawler/1.0 (+https://x2xhub.com/robots.txt)', 'Accept': 'application/xml,text/xml,*/*' },
    })
    if (!res.ok) {
      console.error(`[Discover] sitemap ${sitemapUrl} → HTTP ${res.status}`)
      return []
    }
    const text = await res.text()
    // Extract <loc>…</loc> and <sitemap><loc>…</loc></sitemap>
    const locRegex = /<loc>([^<]+)<\/loc>/g
    const urls: string[] = []
    let m
    while ((m = locRegex.exec(text)) !== null) {
      urls.push(m[1])
    }
    // If it contains nested sitemap .xml, recurse
    const nested = urls.filter(u => /\.xml(\?|$)/i.test(u))
    const pages = urls.filter(u => !/\.xml(\?|$)/i.test(u))
    const nestedPages: string[] = []
    for (const n of nested) {
      nestedPages.push(...await fetchSitemapUrls(n, depth + 1))
    }
    const all = Array.from(new Set([...pages, ...nestedPages])).filter(u => {
      try {
        const h = new URL(u).hostname
        return h.includes(BASE_HOST)
      } catch { return false }
    })
    console.log(`[Discover] ${sitemapUrl}: found ${all.length} URLs (nested ${nested.length})`)
    return all
  } catch (e) {
    console.error(`[Discover] sitemap error for ${sitemapUrl}:`, (e as Error).message)
    return []
  }
}

// ---------- Upsert records ----------
async function upsertDiscoveredUrls(urls: string[]): Promise<Map<UrlCrawlCategory, number>> {
  const stats = new Map<UrlCrawlCategory, number>()
  let inserted = 0
  for (const url of urls) {
    const category = classifyCategory(url)
    if (!category) continue
    try {
      await prisma.urlCrawlRecord.upsert({
        where: { url },
        create: { url, category, status: UrlCrawlStatus.PENDING },
        update: {}, // don't overwrite existing status
      })
      inserted++
      stats.set(category, (stats.get(category) ?? 0) + 1)
    } catch (e) {
      // race-safe: ignore duplicate unique-insert errors
    }
  }
  console.log(`[Discover] upserted ${inserted} URLs across categories`)
  return stats
}

// ---------- HTTP Check ----------
type CheckResult = {
  status: UrlCrawlStatus
  statusCode?: number
  errorMessage?: string
  responseTime: number
  redirectCount: number
  finalUrl?: string
}

async function checkUrl(url: string, category: UrlCrawlCategory): Promise<CheckResult> {
  const start = Date.now()
  let redirectCount = 0
  let finalUrl = url
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent': 'x2xhub-HealthCrawler/1.0 (+https://x2xhub.com/robots.txt)',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      // @ts-expect-error Node.js fetch supports signal
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    // Follow up to 5 redirects manually to track count and final url
    let r: Response = res
    let safety = 0
    while ((r.status === 301 || r.status === 302 || r.status === 303 || r.status === 307 || r.status === 308) && safety < 5) {
      safety++
      const loc = r.headers.get('location')
      if (!loc) break
      redirectCount++
      const next = new URL(loc, url).toString()
      finalUrl = next
      r = await fetch(next, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'x2xhub-HealthCrawler/1.0 (+https://x2xhub.com/robots.txt)',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        // @ts-expect-error
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
    }

    const responseTime = Date.now() - start

    // Status classification
    let status: UrlCrawlStatus
    if (r.status >= 200 && r.status < 300) {
      status = UrlCrawlStatus.SUCCESS
    } else if (r.status >= 300 && r.status < 400) {
      // Redirect loop or too many redirects → FAILED; otherwise treat 304 / 3xx that landed? Actually we already followed redirects, so 3xx at this point means more redirects to follow (>5). Mark as FAILED
      status = UrlCrawlStatus.FAILED
    } else if (r.status === 401 || r.status === 403) {
      // AUTH pages are expected to require login → SKIPPED
      if (category === UrlCrawlCategory.AUTH) {
        status = UrlCrawlStatus.SKIPPED
      } else {
        status = UrlCrawlStatus.FAILED
      }
    } else if (r.status === 404) {
      status = UrlCrawlStatus.FAILED
    } else if (r.status >= 400 && r.status < 500) {
      status = UrlCrawlStatus.FAILED
    } else if (r.status >= 500) {
      status = UrlCrawlStatus.FAILED
    } else {
      status = UrlCrawlStatus.FAILED
    }

    return {
      status,
      statusCode: r.status,
      errorMessage: status === UrlCrawlStatus.SUCCESS || status === UrlCrawlStatus.SKIPPED
        ? undefined
        : `HTTP ${r.status} ${r.statusText || ''}`.trim(),
      responseTime,
      redirectCount,
      finalUrl,
    }
  } catch (e) {
    const responseTime = Date.now() - start
    const err = e as Error & { cause?: any }
    const msg = err.name === 'TimeoutError' || err.message.includes('timeout')
      ? 'Request timeout'
      : /ETIMEDOUT|ECONNRESET|ENOTFOUND|ECONNREFUSED/.test(err.message)
        ? `Network: ${err.message.split('\n')[0]}`
        : err.message.split('\n')[0]
    return {
      status: UrlCrawlStatus.FAILED,
      errorMessage: msg,
      responseTime,
      redirectCount,
      finalUrl,
    }
  }
}

// ---------- Fetch work queue ----------
async function getQueue(opts: ReturnType<typeof parseArgs>): Promise<any[]> {
  const where: any = {}
  if (opts.category) where.category = opts.category
  if (!opts.force) {
    const cutoff = new Date(Date.now() - DEFAULT_DAYS * 24 * 3600 * 1000)
    where.OR = [
      { status: UrlCrawlStatus.PENDING },
      { status: UrlCrawlStatus.FAILED, lastCheckedAt: { lt: cutoff } },
      { lastCheckedAt: null },
    ]
  } else {
    where.status = { in: [UrlCrawlStatus.PENDING, UrlCrawlStatus.FAILED] }
  }
  return prisma.urlCrawlRecord.findMany({
    where,
    take: opts.limit,
    orderBy: [{ status: 'asc' }, { lastCheckedAt: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, url: true, category: true, status: true, retryCount: true },
  })
}

// ---------- Concurrent processor ----------
async function processQueue(items: any[]): Promise<{ success: number; failed: number; skipped: number }> {
  const results = { success: 0, failed: 0, skipped: 0 }
  async function worker() {
    let item
    while ((item = items.shift()) !== undefined) {
      const { id, url, category, retryCount } = item
      try {
        const r = await checkUrl(url, category)
        await prisma.urlCrawlRecord.update({
          where: { id },
          data: {
            status: r.status,
            statusCode: r.statusCode ?? null,
            errorMessage: r.errorMessage ?? null,
            responseTime: r.responseTime,
            redirectCount: r.redirectCount,
            finalUrl: r.finalUrl ?? null,
            lastCheckedAt: new Date(),
            retryCount: (retryCount ?? 0) + 1,
          },
        })
        if (r.status === UrlCrawlStatus.SUCCESS) results.success++
        else if (r.status === UrlCrawlStatus.SKIPPED) results.skipped++
        else results.failed++
        const flag = r.status === UrlCrawlStatus.SUCCESS ? '✓'
          : r.status === UrlCrawlStatus.SKIPPED ? '⚑' : '✗'
        console.log(`  ${flag} ${r.statusCode ?? '---'} ${(r.responseTime + 'ms').padStart(7)} ${url}` +
          (r.errorMessage ? `  [${r.errorMessage}]` : ''))
      } catch (e) {
        results.failed++
        console.error(`  DB error saving ${url}:`, (e as Error).message)
      }
    }
  }
  const workers = Array.from({ length: CONCURRENCY }, () => worker())
  await Promise.all(workers)
  return results
}

// ---------- Summary ----------
async function printSummary() {
  const byCategory = await prisma.urlCrawlRecord.groupBy({
    by: ['category', 'status'],
    _count: true,
  })
  console.log('\n========================================')
  console.log('  UrlCrawlRecord Summary')
  console.log('========================================')
  const order: UrlCrawlStatus[] = [UrlCrawlStatus.PENDING, UrlCrawlStatus.SUCCESS, UrlCrawlStatus.FAILED, UrlCrawlStatus.SKIPPED]
  const cats = Object.values(UrlCrawlCategory)
  const header = ['Category', ...order.map(s => s.padEnd(8))].join(' | ')
  console.log(header)
  console.log('-'.repeat(header.length + 10))
  for (const cat of cats) {
    const row: string[] = [cat.padEnd(12)]
    for (const s of order) {
      const entry = byCategory.find(r => r.category === cat && r.status === s)
      row.push(String(entry?._count ?? 0).padEnd(8))
    }
    console.log(row.join(' | '))
  }
  console.log('-'.repeat(header.length + 10))
  const total = byCategory.reduce((a, b) => a + b._count, 0)
  console.log(`  Total records: ${total}`)
  console.log('========================================\n')
}

async function main() {
  const opts = parseArgs()
  console.log(`[Start] force=${opts.force} discover=${opts.discover} crawl=${opts.crawl} category=${opts.category ?? 'ALL'} limit=${opts.limit} days=${DEFAULT_DAYS}`)

  try {
    if (opts.discover) {
      const allUrls = await fetchSitemapUrls(SITEMAP_URL)
      const stats = await upsertDiscoveredUrls(allUrls)
      console.log('[Discover] categorized:')
      for (const [k, v] of stats) console.log(`  - ${k}: ${v}`)
    }

    if (opts.crawl) {
      const queue = await getQueue(opts)
      console.log(`[Crawl] Queue size: ${queue.length} (concurrency=${CONCURRENCY})`)
      const r = await processQueue(queue)
      console.log(`[Crawl] Done. success=${r.success} failed=${r.failed} skipped=${r.skipped}`)
    }

    await printSummary()
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(e => {
  console.error('[FATAL]', e)
  process.exit(1)
})
