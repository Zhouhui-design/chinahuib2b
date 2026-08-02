/**
 * Server-side locale detection for routes that have no locale segment in the URL
 * (e.g. the slug-based store page at /store/[slug] reached via /<slug>).
 *
 * Priority:
 *   1. NEXT_LOCALE cookie (explicit user choice via LanguageSwitcher)
 *   2. Accept-Language header
 *   3. defaultLanguage
 */

import { cookies, headers } from 'next/headers'
import { languages, defaultLanguage, type LanguageCode } from './languages'

export async function detectLocale(): Promise<LanguageCode> {
  // 1. Cookie
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  if (cookieLocale && languages.some(l => l.code === cookieLocale)) {
    return cookieLocale as LanguageCode
  }

  // 2. Accept-Language header
  const headerStore = await headers()
  const acceptLang = headerStore.get('accept-language') || ''
  if (acceptLang) {
    const prefs = acceptLang
      .split(',')
      .map(p => p.trim().split(';')[0].split('-')[0].toLowerCase())
    for (const pref of prefs) {
      const match = languages.find(l => l.code === pref)
      if (match) return match.code
    }
  }

  // 3. Fallback
  return defaultLanguage
}

/**
 * Get a localized description from the seller's multi-language `descriptions` JSON.
 * Priority: current locale → English → Chinese → first available → legacy `description`.
 */
export function getLocalizedDescription(
  seller: { descriptions?: any; description?: string | null },
  locale: string,
): string {
  let display = ''

  if (seller.descriptions && typeof seller.descriptions === 'object') {
    if (seller.descriptions[locale]) {
      display = seller.descriptions[locale]
    } else if (seller.descriptions['en']) {
      display = seller.descriptions['en']
    } else if (seller.descriptions['zh']) {
      display = seller.descriptions['zh']
    } else {
      const firstLang = Object.keys(seller.descriptions)[0]
      if (firstLang) display = seller.descriptions[firstLang] || ''
    }
  }

  if (!display && seller.description) {
    display = seller.description
  }

  return display
}
