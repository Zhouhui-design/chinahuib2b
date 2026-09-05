/**
 * Unified hreflang / canonical generator
 *
 * Why this exists:
 * Before this module, hreflang was produced in two places at once
 * (root layout metadata + a hand-written <link> loop in <head>), which
 * emitted every tag twice AND hard-coded every href to the site root.
 * That made Google see 13 pages that all claim to be translations of the
 * homepage, so the whole hreflang cluster was ignored.
 *
 * Rule: hreflang alternates must point at the SAME page in each language,
 * never at the homepage.
 */

import { languages, defaultLanguage } from '@/lib/languages'

export const BASE_URL = 'https://x2xhub.com'

/** All supported locale codes, e.g. ['en','zh','es',...] */
export const LOCALE_CODES = languages.map((l) => l.code) as string[]

/**
 * Strip a leading locale segment from a pathname.
 * '/de/marketplace' -> '/marketplace'
 * '/zh'             -> ''
 * '/marketplace'    -> '/marketplace'
 */
export function stripLocale(pathname: string): string {
  const raw = pathname || '/'
  const clean = raw.split('?')[0]?.split('#')[0] ?? '/'
  const m = clean.match(/^\/([a-z]{2})(?:\/(.*))?$/i)
  const head = m?.[1]
  if (head && LOCALE_CODES.includes(head.toLowerCase())) {
    const rest = m?.[2]
    return rest ? `/${rest}` : ''
  }
  return clean === '/' ? '' : clean
}

/**
 * Build an absolute URL for a given locale + locale-free path.
 * Every locale keeps its prefix (including 'en') so that one URL shape
 * maps to exactly one canonical, avoiding the /stores vs /en/stores split.
 */
export function localeUrl(locale: string, restPath: string): string {
  const rest = restPath && !restPath.startsWith('/') ? `/${restPath}` : restPath
  return `${BASE_URL}/${locale}${rest || ''}`
}

/**
 * Build the alternates map for Next.js Metadata.
 * Pass the CURRENT pathname (with or without locale prefix).
 */
export function buildAlternates(pathname: string): {
  canonical: string
  languages: Record<string, string>
} {
  const rest = stripLocale(pathname)
  const currentLocale = detectLocale(pathname)

  const langMap: Record<string, string> = {}
  for (const code of LOCALE_CODES) {
    langMap[code] = localeUrl(code, rest)
  }
  // x-default points at the default language version of THIS page.
  langMap['x-default'] = localeUrl(defaultLanguage, rest)

  return {
    canonical: localeUrl(currentLocale, rest),
    languages: langMap,
  }
}

/** Read the locale out of a pathname, falling back to the default language. */
export function detectLocale(pathname: string): string {
  const raw = pathname || '/'
  const clean = raw.split('?')[0] ?? '/'
  const m = clean.match(/^\/([a-z]{2})(?:\/|$)/i)
  const head = m?.[1]
  if (head && LOCALE_CODES.includes(head.toLowerCase())) return head.toLowerCase()
  return defaultLanguage
}

/** Locales that need right-to-left rendering. */
const RTL_LOCALES = new Set(['ar'])

/** dir attribute for <html>. */
export function localeDir(locale: string): 'ltr' | 'rtl' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'
}
