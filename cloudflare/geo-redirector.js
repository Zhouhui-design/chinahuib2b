addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // Skip static/API paths — pass straight to origin
  // NOTE: .xml is included alongside .txt/.html so search-engine verification
  // files (BingSiteAuth.xml, sitemap variants) return 200 at the root path.
  // Previously only .txt/.html were exempt, so BingSiteAuth.xml was 302'd to
  // /<lang>/BingSiteAuth.xml and 404'd, blocking Bing site verification.
  if (path.startsWith('/api/') || path.startsWith('/_next/') || path.startsWith('/uploads/') || path.startsWith('/sitemap') || path.startsWith('/robots.txt') || path.startsWith('/google') || path.startsWith('/favicon.ico') || path.startsWith('/icons/') || path.startsWith('/sw.js') || path.startsWith('/llms') || /\.(txt|html|xml|json|ico|png|svg|webmanifest)$/i.test(path)) {
    return fetch(request)
  }

  // RSC / Next.js router requests must pass through to the origin WITHOUT any
  // locale redirect: a 302 on an RSC fetch breaks App Router client navigation
  // and can make the browser render the raw flight payload (0:{"b":"build-..."}).
  // Origin middleware rewrites a bare "/" to the locale, which is correct.
  const isNextRouterRequest =
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-Prefetch') === '1' ||
    request.headers.has('Next-Router-State-Tree') ||
    url.searchParams.has('_rsc')
  if (isNextRouterRequest) {
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
    // Real app routes that must never be treated as store slugs.
    'contact','dashboard','wallet',
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

  // Search-engine crawlers must never be geo-redirected.
  //
  // Bingbot and Googlebot crawl mostly from US IPs, so geo routing sent them
  // to /en — but any crawl from a European PoP landed on /de, making the same
  // URL answer in a different language per request. That splits the hreflang
  // cluster and buries the canonical. Crawlers get the x-default locale, and
  // the hreflang tags then advertise every other language.
  const ua = request.headers.get('user-agent') || ''
  const isCrawler = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|showyoubot|outbrain|pinterest|vkshare|w3c_validator|whatsapp|telegram|gptbot|oai-searchbot|chatgpt-user|claudebot|claude-web|anthropic-ai|perplexitybot|amazonbot|ccbot|bytespider|applebot|petalbot|seznambot|duckduckbot|yandex|baiduspider/i.test(ua)

  // Geo-based locale detection for non-slug paths.
  //
  // 2026-09-07 fix — the previous map had three wrong ISO 3166-1 keys that
  // silently mis-routed real visitors:
  //   'VI':'vi'  VI is the U.S. Virgin Islands, not Vietnam (VN).
  //   'AR':'ar'  AR is Argentina, a Spanish-speaking country, not Arabic.
  //              Argentine buyers were served the Arabic UI, RTL layout included.
  //   'HI':'hi'  HI is not a country code at all. India is IN.
  // So Vietnamese, Arabic and Hindi were unreachable by geo, while Argentina
  // got Arabic. Those three keys are corrected and the map now lists every
  // country explicitly instead of leaning on the `|| 'en'` fallback.
  const geo = request.cf?.country || 'US'
  const langMap = {
    // English — core anglophone markets plus the large English-language
    // B2B sourcing markets that previously only worked by accident.
    'US':'en','GB':'en','AU':'en','CA':'en','IE':'en','NZ':'en',
    'IN':'en','PK':'en','BD':'en','LK':'en','NP':'en',
    'NG':'en','GH':'en','KE':'en','UG':'en','TZ':'en','ZA':'en','ZW':'en',
    'PH':'en','SG':'en','MY':'en','HK':'zh',
    'IL':'en','MT':'en','CY':'en',

    // Chinese
    'CN':'zh','TW':'zh','MO':'zh',

    // Spanish — Spain plus Latin America. AR belongs here, not in Arabic.
    'ES':'es','MX':'es','AR':'es','CO':'es','CL':'es','PE':'es','VE':'es',
    'EC':'es','GT':'es','CU':'es','BO':'es','DO':'es','HN':'es','PY':'es',
    'SV':'es','NI':'es','CR':'es','PA':'es','UY':'es','GQ':'es',

    // Portuguese
    'PT':'pt','BR':'pt','AO':'pt','MZ':'pt','CV':'pt',

    // French
    'FR':'fr','BE':'fr','LU':'fr','MC':'fr','SN':'fr','CI':'fr','CM':'fr',
    'ML':'fr','BF':'fr','NE':'fr','TD':'fr','MG':'fr','CD':'fr','CG':'fr',
    'GA':'fr','BJ':'fr','TG':'fr','GN':'fr','RW':'fr','HT':'fr',

    // German
    'DE':'de','AT':'de','CH':'de','LI':'de',

    // Japanese / Korean
    'JP':'ja','KR':'ko','KP':'ko',

    // Russian — CIS states where Russian is the common business language.
    'RU':'ru','BY':'ru','KZ':'ru','KG':'ru','TJ':'ru','UZ':'ru',
    'AM':'ru','AZ':'ru','MD':'ru','GE':'ru','TM':'ru',

    // Arabic — the actual Arabic-speaking countries.
    'SA':'ar','AE':'ar','EG':'ar','QA':'ar','KW':'ar','BH':'ar','OM':'ar',
    'JO':'ar','LB':'ar','IQ':'ar','SY':'ar','YE':'ar','PS':'ar',
    'MA':'ar','DZ':'ar','TN':'ar','LY':'ar','SD':'ar','MR':'ar','SO':'ar','DJ':'ar',

    // Hindi — India is IN, but India defaults to English above because
    // English is the working language of Indian B2B trade. Hindi stays
    // available through the language switcher and hreflang.

    // Thai / Vietnamese — VN is Vietnam. VI was the wrong key.
    'TH':'th','VN':'vi',
  }
  const defaultLang = isCrawler ? 'en' : (langMap[geo] || 'en')

  if (path === '/' || path === '') {
    return Response.redirect(`https://x2xhub.com/${defaultLang}/`, 302)
  }

  // Multi-segment path without locale prefix → add locale
  if (!path.match(/^\/[a-z]{2}(\/|$)/)) {
    return Response.redirect(`https://x2xhub.com/${defaultLang}${path}`, 302)
  }

  return fetch(request)
}
