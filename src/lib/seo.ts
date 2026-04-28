import { prisma } from '@/lib/db'
import type { Metadata } from 'next'

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

    // Detect language from path or default to Chinese
    const isEnglish = pagePath.startsWith('/en') || pagePath === '/en'
    
    const title = isEnglish ? (config.titleEn || config.title) : (config.title || config.titleEn)
    const description = isEnglish ? (config.descriptionEn || config.description) : (config.description || config.descriptionEn)
    const keywords = isEnglish ? (config.keywordsEn || config.keywords) : (config.keywords || config.keywordsEn)

    const metadata: Metadata = {
      title: title || undefined,
      description: description || undefined,
      keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
    }

    return metadata
  } catch (error) {
    console.error('Failed to load SEO config:', error)
    return null
  }
}
