/**
 * Cloudflare Worker: geo-redirector
 *
 * Deployed at: x2xhub.com/* (Workers Route)
 * Purpose: Geo-based locale detection + store slug passthrough
 *
 * - Skips static/API paths (pass to origin)
 * - Detects store slugs (GitHub-style URLs like /huihuan or /huihuan.com)
 *   and passes them to origin for Next.js middleware to rewrite
 * - For non-slug paths without locale prefix, redirects to geo-detected locale
 *
 * Supports .com suffix on store slugs for company website validity
 * on external platforms (e.g. x2xhub.com/huihuan.com).
 *
 * Deploy via Cloudflare API:
 *   PUT /accounts/{account_id}/workers/scripts/geo-redirector
 *   Format: Service Worker (non-module), body_part: "worker.js"
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // Skip static/API paths — pass straight to origin
  if (path.startsWith('/api/') || path.startsWith('/_next/') || path.startsWith('/uploads/') || path.startsWith('/sitemap.xml') || path.startsWith('/robots.txt') || path.startsWith('/google') || path.startsWith('/favicon.ico') || path.startsWith('/icons/') || path.startsWith('/sw.js') || path.startsWith('/llms')) {
    return fetch(request)
  }

  // Reserved top-level paths (not store slugs)
  const RESERVED = new Set([
    'store','stores','products','exhibitions','marketplace','auction',
    'api','api-docs','api-keys','auth','admin','seller','buyer',
    'profile','team-chat','chat-hall','blog','booths','categories',
    'ai-register','ai-audit','test-components','test-seo','download',
    'about','investment','partner-recruitment','auction-screen',
    'service-worker','sw','pwasw','uploads','health','maintenance',
    'legal','checkout','cart','wishlist','favorites','notifications',
    'mcp','docs','debug','diagnostic','recommendations','reviews',
  ])

  // Supported language codes (2-letter — not slugs)
  const LANGS = new Set(['en','zh','es','fr','de','ja','ko','ar','ru','pt','hi','th','vi'])

  // Strip optional .com suffix for slug validation (URL keeps .com in browser bar)
  const stripComSuffix = (s) => s.replace(/\.com$/i, '')

  // Single-segment path: could be a store slug (e.g. /huihuan or /huihuan.com)
  // If it looks like a slug, pass to origin so Next.js middleware can
  // rewrite it to /store/<slug> and keep the URL bar clean (GitHub-style).
  // Also supports .com suffix for company website validity on external platforms.
  const singleSegment = path.match(/^\/([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)(\.com)?$/i)
  if (singleSegment) {
    const slug = stripComSuffix(singleSegment[1] + (singleSegment[2] || ''))
    const looksLikeSlug =
      slug.length >= 1 && slug.length <= 39 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(slug) &&
      !RESERVED.has(slug.toLowerCase()) &&
      !/^\d+$/.test(slug) &&
      !LANGS.has(slug)
    if (looksLikeSlug) {
      return fetch(request)
    }
  }

  // Geo-based locale detection for non-slug paths
  const geo = request.cf?.country || 'US'
  const langMap = {
    'US':'en','GB':'en','AU':'en','CA':'en',
    'FR':'fr','DE':'de','JP':'ja','KR':'ko',
    'CN':'zh','TW':'zh','HK':'zh',
    'ES':'es','PT':'pt','RU':'ru',
    'TH':'th','VI':'vi','AR':'ar','HI':'hi',
  }
  const defaultLang = langMap[geo] || 'en'

  if (path === '/' || path === '') {
    return Response.redirect(`https://x2xhub.com/${defaultLang}/`, 302)
  }

  // Multi-segment path without locale prefix → add locale
  if (!path.match(/^\/[a-z]{2}(\/|$)/)) {
    return Response.redirect(`https://x2xhub.com/${defaultLang}${path}`, 302)
  }

  return fetch(request)
}
