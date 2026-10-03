/**
 * IndexNow + Bing Webmaster URL submission.
 *
 * Why this exists:
 * The legacy "ping" endpoints in seo-automation.ts are dead. Google retired
 * /ping?sitemap= in June 2023, Bing retired ping.aspx, and the DuckDuckGo /
 * Seznam / Naver / Yahoo entries were never submission endpoints at all --
 * they are plain SERP URLs, so hitting them did nothing but burn ~8 requests
 * of latency on every product save.
 *
 * IndexNow is the live replacement. One POST notifies Bing, Yandex, Seznam,
 * Naver and DuckDuckGo at once. Bing also exposes an authenticated SubmitUrl
 * API which we use as a second, stronger channel for Bing specifically.
 *
 * Both channels are best-effort: a failure here must never break the user's
 * save operation, so every function resolves rather than throws.
 */

const BASE_URL = 'https://x2xhub.com'

// Public key file must stay reachable at /<key>.txt for IndexNow to trust us.
const INDEXNOW_KEY = process.env['INDEXNOW_KEY'] || ''
const BING_API_KEY = process.env['BING_WEBMASTER_API_KEY'] || ''

// IndexNow is a shared protocol; posting to one endpoint syndicates to the
// rest. api.indexnow.org is the neutral aggregator.
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
const BING_SUBMIT_ENDPOINT = 'https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch'

export interface SubmissionResult {
  channel: 'indexnow' | 'bing-api'
  status: 'success' | 'error' | 'skipped'
  statusCode?: number
  message?: string
  urlCount: number
}

/** Reject anything that is not an absolute x2xhub.com URL. */
function sanitizeUrls(urls: string[]): string[] {
  const cleaned = urls
    .filter((u): u is string => typeof u === 'string' && u.length > 0)
    .map((u) => (u.startsWith('http') ? u : `${BASE_URL}${u.startsWith('/') ? '' : '/'}${u}`))
    .filter((u) => u.startsWith(`${BASE_URL}/`) || u === BASE_URL)
  return Array.from(new Set(cleaned))
}

async function postJson(
  endpoint: string,
  body: unknown,
  timeoutMs = 10000
): Promise<{ statusCode: number; body: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: 'no-store',
    })
    const text = await res.text().catch(() => '')
    return { statusCode: res.status, body: text.slice(0, 300) }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Notify IndexNow (Bing, Yandex, Seznam, Naver, DuckDuckGo) of changed URLs.
 * Accepts up to 10,000 URLs per call per the spec.
 */
export async function submitToIndexNow(urls: string[]): Promise<SubmissionResult> {
  const urlList = sanitizeUrls(urls)
  if (urlList.length === 0) {
    return { channel: 'indexnow', status: 'skipped', message: 'no valid urls', urlCount: 0 }
  }
  if (!INDEXNOW_KEY) {
    return { channel: 'indexnow', status: 'skipped', message: 'INDEXNOW_KEY not set', urlCount: urlList.length }
  }

  try {
    const { statusCode, body } = await postJson(INDEXNOW_ENDPOINT, {
      host: 'x2xhub.com',
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    })
    // 200 = accepted, 202 = accepted but key still being validated.
    const ok = statusCode === 200 || statusCode === 202
    return {
      channel: 'indexnow',
      status: ok ? 'success' : 'error',
      statusCode,
      ...(ok ? {} : { message: body }),
      urlCount: urlList.length,
    }
  } catch (error) {
    return {
      channel: 'indexnow',
      status: 'error',
      message: (error as Error).message,
      urlCount: urlList.length,
    }
  }
}

/**
 * Submit URLs through the authenticated Bing Webmaster API.
 * Quota is 100/day and 2400/month, so callers should batch rather than
 * fire one request per URL.
 */
export async function submitToBing(urls: string[]): Promise<SubmissionResult> {
  const urlList = sanitizeUrls(urls)
  if (urlList.length === 0) {
    return { channel: 'bing-api', status: 'skipped', message: 'no valid urls', urlCount: 0 }
  }
  if (!BING_API_KEY) {
    return { channel: 'bing-api', status: 'skipped', message: 'BING_WEBMASTER_API_KEY not set', urlCount: urlList.length }
  }

  try {
    const { statusCode, body } = await postJson(
      `${BING_SUBMIT_ENDPOINT}?apikey=${encodeURIComponent(BING_API_KEY)}`,
      { siteUrl: `${BASE_URL}/`, urlList }
    )
    // The API answers 200 with {"d":null} on success.
    const ok = statusCode === 200 && !body.includes('ErrorCode')
    return {
      channel: 'bing-api',
      status: ok ? 'success' : 'error',
      statusCode,
      ...(ok ? {} : { message: body }),
      urlCount: urlList.length,
    }
  } catch (error) {
    return {
      channel: 'bing-api',
      status: 'error',
      message: (error as Error).message,
      urlCount: urlList.length,
    }
  }
}

/** Fire both channels in parallel. Never throws. */
export async function submitUrls(urls: string[]): Promise<SubmissionResult[]> {
  const [indexnow, bing] = await Promise.all([submitToIndexNow(urls), submitToBing(urls)])
  return [indexnow, bing]
}

/**
 * Expand a locale-less path into the canonical URL that belongs in the index.
 * The sitemap publishes /en/... as canonical and points at other locales with
 * hreflang, so we submit the /en form and let the crawler follow alternates.
 */
export function canonicalUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${BASE_URL}/en${clean}`
}
