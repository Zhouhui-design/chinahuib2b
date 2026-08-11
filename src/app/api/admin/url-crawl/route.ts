import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UrlCrawlCategory, UrlCrawlStatus } from '@prisma/client'

export const maxDuration = 180

/**
 * Admin URL Crawl Monitor API
 *
 * GET /api/admin/url-crawl
 *   ?action=summary                          → 各分类 PENDING/SUCCESS/FAILED/SKIPPED 统计
 *   ?action=list&category=X&status=S&page=1  → 分页列出记录 (default limit=20)
 *   ?action=list-failures                    → 最新失败记录（含错误信息，limit=50）
 *
 * POST /api/admin/url-crawl
 *   body: { action: 'discover' | 'crawl' | 'both' | 'force-all' }
 *         可选: { category, limit }
 *         → 后台触发抓取任务（不阻塞响应，返回 jobId）
 */

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'summary'

    if (action === 'summary') {
      const data = await prisma.urlCrawlRecord.groupBy({
        by: ['category', 'status'],
        _count: true,
      })
      const result: Record<string, Record<string, number>> = {}
      for (const c of Object.values(UrlCrawlCategory)) result[c] = {}
      for (const row of data) {
        result[row.category][row.status] = row._count
      }
      // totals per category
      const perCatTotals: Record<string, number> = {}
      for (const [c, m] of Object.entries(result)) {
        perCatTotals[c] = Object.values(m).reduce((a, b) => a + b, 0)
      }
      const lastCheck = await prisma.urlCrawlRecord.aggregate({
        _max: { lastCheckedAt: true },
      })
      return NextResponse.json({
        success: true,
        byCategory: result,
        perCategoryTotals: perCatTotals,
        totalRecords: Object.values(perCatTotals).reduce((a, b) => a + b, 0),
        lastCheckedAt: lastCheck._max.lastCheckedAt,
      })
    }

    if (action === 'list') {
      const category = searchParams.get('category') as UrlCrawlCategory | null
      const status = searchParams.get('status') as UrlCrawlStatus | null
      const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
      const where: any = {}
      if (category) where.category = category
      if (status) where.status = status
      const [records, total] = await Promise.all([
        prisma.urlCrawlRecord.findMany({
          where,
          orderBy: [{ status: 'asc' }, { lastCheckedAt: 'desc' }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.urlCrawlRecord.count({ where }),
      ])
      return NextResponse.json({ success: true, records, total, page, limit })
    }

    if (action === 'list-failures') {
      const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50')))
      const failures = await prisma.urlCrawlRecord.findMany({
        where: { status: UrlCrawlStatus.FAILED },
        orderBy: { lastCheckedAt: 'desc' },
        take: limit,
      })
      // Aggregate top error messages
      const byMsg: Record<string, number> = {}
      for (const f of failures) {
        const k = f.errorMessage || 'Unknown'
        byMsg[k] = (byMsg[k] || 0) + 1
      }
      return NextResponse.json({
        success: true,
        records: failures,
        topErrors: Object.entries(byMsg)
          .map(([message, count]) => ({ message, count }))
          .sort((a, b) => b.count - a.count),
      })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (error) {
    console.error('[admin/url-crawl GET error]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json().catch(() => ({}))
    const action: 'discover' | 'crawl' | 'both' | 'force-all' = body.action || 'both'
    const category = body.category as UrlCrawlCategory | null || null
    const limit = body.limit ? Math.min(1000, parseInt(body.limit)) : 500
    const days = body.days || 1

    // Run asynchronously via unawaited promise (best-effort for the single request context).
    // For true durability we'd use a queue, but this covers ~99% cases (maxDuration=180s).
    const triggerId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    console.log(`[admin/url-crawl] triggering ${action} id=${triggerId} category=${category ?? 'ALL'} limit=${limit}`)

    // We return quickly, then kick off work via dynamic import so Next.js doesn't block initial response
    // under edge runtime constraints.  Here we just return immediately and call runWorkerInBackground()
    // without awaiting — this is the best we can do without a real queue.
    void runWorkerInBackground({ action, category, limit, days })

    return NextResponse.json({
      success: true,
      jobId: triggerId,
      message: `Crawl job '${action}' triggered. Check summary endpoint in a few minutes for progress.`,
    })
  } catch (error) {
    console.error('[admin/url-crawl POST error]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function runWorkerInBackground(opts: {
  action: 'discover' | 'crawl' | 'both' | 'force-all'
  category: UrlCrawlCategory | null
  limit: number
  days: number
}) {
  try {
    // Use the project's configured prisma instance
    if (opts.action === 'discover' || opts.action === 'both' || opts.action === 'force-all') {
      const urls = await fetchSitemapFromRoute()
      const total = await upsertBulk(urls)
      console.log(`[bg-crawl] discover complete: ${total} URLs upserted`)
    }
    if (opts.action === 'crawl' || opts.action === 'both' || opts.action === 'force-all') {
      const queue = await pickQueue(opts)
      console.log(`[bg-crawl] picked queue size=${queue.length}`)
      const result = await processBulk(queue)
      console.log(`[bg-crawl] crawl complete: success=${result.success} failed=${result.failed} skipped=${result.skipped}`)
    }
  } catch (e) {
    console.error('[bg-crawl fatal]', e)
  }
}

async function fetchSitemapFromRoute(): Promise<string[]> {
  const sitemapUrl = process.env.SITEMAP_URL || 'https://x2xhub.com/sitemap.xml'
  const hostFilter = 'x2xhub.com'
  return (await collectUrlsRecursively(sitemapUrl, hostFilter, 0)).slice()
}

async function collectUrlsRecursively(sitemapUrl: string, hostFilter: string, depth: number): Promise<string[]> {
  if (depth > 3) return []
  try {
    const res = await fetch(sitemapUrl, {
      headers: { 'User-Agent': 'x2xhub-HealthCrawler/1.0', 'Accept': 'application/xml,text/xml,*/*' },
    })
    if (!res.ok) return []
    const text = await res.text()
    const locRegex = /<loc>([^<]+)<\/loc>/g
    const locs: string[] = []
    let m
    while ((m = locRegex.exec(text)) !== null) locs.push(m[1])
    const nested = locs.filter(u => /\.xml(\?|$)/i.test(u))
    const pages = locs.filter(u => !/\.xml(\?|$)/i.test(u))
    const nestedPages: string[] = []
    for (const n of nested) {
      nestedPages.push(...await collectUrlsRecursively(n, hostFilter, depth + 1))
    }
    return Array.from(new Set([...pages, ...nestedPages])).filter(u => {
      try { return new URL(u).hostname.includes(hostFilter) } catch { return false }
    })
  } catch {
    return []
  }
}

function classifyCategory(url: string): UrlCrawlCategory | null {
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/').filter(Boolean)
    const first = parts[0] || ''
    const hasLocalePrefix = /^[a-z]{2}(-[a-z]+)?$/i.test(first)
    const stripped = hasLocalePrefix ? '/' + parts.slice(1).join('/') : u.pathname
    const search = u.search || ''
    if (/^\/auth\b/.test(stripped)) return UrlCrawlCategory.AUTH
    if (search.length > 0 && /[?&](category|region|tag|sort|filter|page)=/i.test(search)
        && /^\/(products|marketplace|stores|sellers|exhibitions|search)\b/.test(stripped)) {
      return UrlCrawlCategory.FILTER
    }
    if (/^\/products\/[^?]/.test(stripped) && !search.includes('?category=')) {
      return UrlCrawlCategory.PRODUCT
    }
    if (first.endsWith('-chat-hall')) return UrlCrawlCategory.MARKETPLACE
    if (/^\/(marketplace|stores|sellers)\b/.test(stripped)) return UrlCrawlCategory.MARKETPLACE
    return UrlCrawlCategory.STATIC
  } catch { return null }
}

async function upsertBulk(urls: string[]): Promise<number> {
  let n = 0
  for (const url of urls) {
    const category = classifyCategory(url)
    if (!category) continue
    try {
      await prisma.urlCrawlRecord.upsert({
        where: { url },
        create: { url, category, status: UrlCrawlStatus.PENDING },
        update: {},
      })
      n++
    } catch {}
  }
  return n
}

async function pickQueue(opts: { action: string; category: UrlCrawlCategory | null; limit: number; days: number }): Promise<any[]> {
  const where: any = {}
  if (opts.category) where.category = opts.category
  const force = opts.action === 'force-all' || !!opts.force
  if (!force) {
    const cutoff = new Date(Date.now() - (opts.days || 1) * 24 * 3600 * 1000)
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

async function processBulk(items: any[]): Promise<{ success: number; failed: number; skipped: number }> {
  const CONC = 8
  const results = { success: 0, failed: 0, skipped: 0 }
  async function worker() {
    let item
    while ((item = items.shift()) !== undefined) {
      const { id, url, category, retryCount } = item
      try {
        const r = await checkOne(url, category)
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
      } catch {}
    }
  }
  await Promise.all(Array.from({ length: CONC }, () => worker()))
  return results
}

async function checkOne(url: string, category: UrlCrawlCategory) {
  const start = Date.now()
  let redirectCount = 0
  let finalUrl = url
  try {
    const doFetch = async (u: string) => fetch(u, {
      method: 'GET',
      redirect: 'manual',
      headers: { 'User-Agent': 'x2xhub-HealthCrawler/1.0', 'Accept-Language': 'en-US,en;q=0.5' },
      // @ts-expect-error
      signal: AbortSignal.timeout(20000),
    })
    let r = await doFetch(url)
    let safety = 0
    while ((r.status === 301 || r.status === 302 || r.status === 303 || r.status === 307 || r.status === 308) && safety < 5) {
      safety++
      const loc = r.headers.get('location')
      if (!loc) break
      redirectCount++
      finalUrl = new URL(loc, url).toString()
      r = await doFetch(finalUrl)
    }
    const responseTime = Date.now() - start
    let status: UrlCrawlStatus
    if (r.status >= 200 && r.status < 300) status = UrlCrawlStatus.SUCCESS
    else if (r.status >= 300 && r.status < 400) status = UrlCrawlStatus.FAILED
    else if (r.status === 401 || r.status === 403) {
      status = category === UrlCrawlCategory.AUTH ? UrlCrawlStatus.SKIPPED : UrlCrawlStatus.FAILED
    }
    else if (r.status >= 400) status = UrlCrawlStatus.FAILED
    else status = UrlCrawlStatus.FAILED
    return {
      status,
      statusCode: r.status,
      errorMessage: status === UrlCrawlStatus.SUCCESS || status === UrlCrawlStatus.SKIPPED
        ? undefined : `HTTP ${r.status} ${r.statusText || ''}`.trim(),
      responseTime,
      redirectCount,
      finalUrl,
    }
  } catch (e) {
    const err = e as Error
    const msg = err.name === 'TimeoutError' || err.message.includes('timeout')
      ? 'Request timeout'
      : err.message.split('\n')[0]
    return {
      status: UrlCrawlStatus.FAILED,
      errorMessage: msg,
      responseTime: Date.now() - start,
      redirectCount,
      finalUrl,
    }
  }
}
