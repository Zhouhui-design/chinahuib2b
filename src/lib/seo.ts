import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import { languages } from './languages'

const BASE_URL = 'https://x2xhub.com'

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
    const config = await prisma.sEOConfig.findUnique({
      where: { 
        pagePath,
        isActive: true
      }
    })

    if (!config) {
      return null
    }

    const languageCode = extractLanguageFromPath(pagePath)
    const isEnglish = languageCode === 'en'
    
    const title = isEnglish ? (config.titleEn || config.title) : (config.title || config.titleEn)
    const description = isEnglish ? (config.descriptionEn || config.description) : (config.description || config.descriptionEn)
    const keywords = isEnglish ? (config.keywordsEn || config.keywords) : (config.keywords || config.keywordsEn)

    const alternates: Record<string, string> = {}
    languages.forEach(lang => {
      const langPath = lang.code === 'en' 
        ? pagePath.replace(/^\/en/, '') || '/'
        : `/${lang.code}${pagePath.replace(/^\/[a-z]{2}/, '')}`
      alternates[lang.code] = `${BASE_URL}${langPath}`
    })

    const metadata: Metadata = {
      title: title || undefined,
      description: description || undefined,
      keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
      alternates: {
        canonical: `${BASE_URL}${pagePath}`,
        languages: alternates,
      },
      openGraph: {
        title: title || undefined,
        description: description || undefined,
        url: `${BASE_URL}${pagePath}`,
      },
      twitter: {
        title: title || undefined,
        description: description || undefined,
      },
    }

    return metadata
  } catch (error) {
    console.error('Failed to load SEO config:', error)
    return null
  }
}

export function extractLanguageFromPath(path: string): string {
  const match = path.match(/^\/([a-z]{2})/)
  if (match && languages.some(lang => lang.code === match[1])) {
    return match[1]
  }
  return 'en'
}

export function buildLocalizedPath(path: string, languageCode: string): string {
  if (languageCode === 'en') {
    return path.replace(/^\/[a-z]{2}/, '') || '/'
  }
  const cleanPath = path.replace(/^\/[a-z]{2}/, '') || '/'
  return `/${languageCode}${cleanPath}`
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