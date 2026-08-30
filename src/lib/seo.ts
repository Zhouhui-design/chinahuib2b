import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import { languages } from './languages'
import { getSeoMeta } from './seo-meta'

export const BASE_URL = 'https://x2xhub.com'

// Strip a leading locale segment ONLY when it is a real supported locale.
// Naive /^\/[a-z]{2}/ chopped 2 chars off top-level store slugs (/jhbz -> /bz).
function stripLocalePrefixInternal(path: string): string {
  const match = path.match(/^\/([a-z]{2})(\/.*)?$/)
  if (match && languages.some(lang => lang.code === match[1])) {
    return match[2] || '/'
  }
  return path || '/'
}

const REGION_CONFIG: Record<string, { country: string; currency: string; timezone: string }> = {
  us: { country: 'United States', currency: 'USD', timezone: 'America/New_York' },
  eu: { country: 'European Union', currency: 'EUR', timezone: 'Europe/Brussels' },
  fr: { country: 'France', currency: 'EUR', timezone: 'Europe/Paris' },
  de: { country: 'Germany', currency: 'EUR', timezone: 'Europe/Berlin' },
  uk: { country: 'United Kingdom', currency: 'GBP', timezone: 'Europe/London' },
  jp: { country: 'Japan', currency: 'JPY', timezone: 'Asia/Tokyo' },
  kr: { country: 'South Korea', currency: 'KRW', timezone: 'Asia/Seoul' },
  au: { country: 'Australia', currency: 'AUD', timezone: 'Australia/Sydney' },
}

export interface RegionInfo {
  code: string
  country: string
  currency: string
  timezone: string
}

export function getRegionInfo(regionCode: string): RegionInfo | null {
  const config = REGION_CONFIG[regionCode.toLowerCase()]
  if (!config) return null
  return { code: regionCode.toUpperCase(), ...config }
}

export function getSupportedRegions(): { code: string; name: string; country: string }[] {
  return Object.entries(REGION_CONFIG).map(([code, config]) => ({
    code,
    name: config.country,
    country: config.country,
  }))
}

export async function getSEOConfig(pagePath: string): Promise<Metadata | null> {
  try {
    const languageCode = extractLanguageFromPath(pagePath)
    
    let config
    try {
      config = await prisma.sEOConfig.findUnique({
        where: { 
          pagePath,
          isActive: true
        }
      })
    } catch (prismaError) {
      console.warn('SEO config not found in database, using default SEO meta')
    }

    let title: string | undefined
    let description: string | undefined
    let keywords: string[] | undefined

    if (config) {
      const isEnglish = languageCode === 'en'
      title = isEnglish ? (config.titleEn || config.title) : (config.title || config.titleEn)
      description = isEnglish ? (config.descriptionEn || config.description) : (config.description || config.descriptionEn)
      keywords = (isEnglish ? (config.keywordsEn || config.keywords) : (config.keywords || config.keywordsEn))?.split(',').map(k => k.trim())
    }

    const defaultMeta = getSeoMeta(languageCode)
    title = title || defaultMeta.title
    description = description || defaultMeta.description
    keywords = keywords || defaultMeta.keywords

    const alternates: Record<string, string> = {}
    const cleanPath = stripLocalePrefixInternal(pagePath)
    languages.forEach(lang => {
      const langPath = lang.code === 'en' 
        ? cleanPath
        : `/${lang.code}${cleanPath === '/' ? '' : cleanPath}`
      alternates[lang.code] = `${BASE_URL}${langPath}`
    })

    const metadata: Metadata = {
      title,
      description,
      keywords,
      alternates: {
        canonical: `${BASE_URL}${pagePath}`,
        languages: alternates,
      },
      openGraph: {
        title,
        description,
        url: `${BASE_URL}${pagePath}`,
      },
      twitter: {
        title,
        description,
      },
    }

    return metadata
  } catch (error) {
    console.error('Failed to load SEO config:', error)
    return null
  }
}

export function extractLanguageFromPath(path: string): string {
  const match = path.match(/^\/([a-z]{2})(?:\/|$)/)
  if (match && languages.some(lang => lang.code === match[1])) {
    return match[1]
  }
  return 'en'
}

/**
 * Strip a leading locale segment only when it is a REAL supported locale.
 * Naive /^\/[a-z]{2}/ chopped the first 2 chars off top-level store slugs
 * (e.g. /jhbz -> /bz), corrupting canonical + hreflang URLs.
 */
export function stripLocalePrefix(path: string): string {
  return stripLocalePrefixInternal(path)
}

export function buildLocalizedPath(path: string, languageCode: string): string {
  const cleanPath = stripLocalePrefix(path)
  if (languageCode === 'en') {
    return cleanPath
  }
  return `/${languageCode}${cleanPath === '/' ? '' : cleanPath}`
}

export function generateGeoTags(regionCode?: string): Record<string, string> {
  if (!regionCode) return {}
  
  const regionInfo = getRegionInfo(regionCode)
  if (!regionInfo) return {}
  
  const tags: Record<string, string> = {
    'geo.region': `US-${regionCode.toUpperCase()}`,
    'geo.placename': regionInfo.country,
    'geo.position': getGeoCoordinates(regionCode),
  }
  
  return tags
}

function getGeoCoordinates(regionCode: string): string {
  const coordinates: Record<string, string> = {
    us: '37.0902,-95.7129',
    eu: '50.5039,4.4699',
    fr: '46.2276,2.2137',
    de: '51.1657,10.4515',
    uk: '55.3781,-3.4360',
    jp: '36.2048,138.2529',
    kr: '35.9078,127.7669',
    au: '-25.2744,133.7751',
  }
  return coordinates[regionCode.toLowerCase()] || '37.0902,-95.7129'
}

export function generateHreflangLinks(pagePath: string): { lang: string; href: string }[] {
  const links: { lang: string; href: string }[] = []
  
  languages.forEach(lang => {
    const langPath = buildLocalizedPath(pagePath, lang.code)
    links.push({ lang: lang.code, href: `${BASE_URL}${langPath}` })
  })
  
  links.push({ lang: 'x-default', href: `${BASE_URL}${buildLocalizedPath(pagePath, 'en')}` })
  
  return links
}