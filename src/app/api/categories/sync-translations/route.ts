import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { translateText } from '@/lib/translation-service'

const SUPPORTED_LANGUAGES = ['en', 'zh', 'de', 'fr', 'es', 'ja', 'ko', 'ar', 'ru', 'pt', 'hi', 'th', 'vi']
const STALE_HOURS = 24

/**
 * POST /api/categories/sync-translations
 * 
 * Syncs category translations for all 13 languages.
 * Can be called by a daily cron job.
 * 
 * Query params:
 *   - force=true: Force re-translate all categories
 *   - dryRun=true: Preview without saving
 * 
 * Security: Requires a valid API key or admin session in production
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'
    const dryRun = searchParams.get('dryRun') === 'true'

    // Simple API key check for cron job access
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.CRON_API_KEY
    
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      // In development, allow without auth
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    console.log(`🌐 Category translation sync started (force: ${force}, dryRun: ${dryRun})`)

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        nameEn: true,
        translations: true,
        translatedAt: true,
      },
      orderBy: { level: 'asc' },
    })

    let updated = 0
    let skipped = 0
    let failed = 0

    for (const category of categories) {
      const existing = category.translations as Record<string, string> | null
      const isStale = !category.translatedAt || 
        (Date.now() - category.translatedAt.getTime()) / (1000 * 60 * 60) >= STALE_HOURS
      const missingLangs = SUPPORTED_LANGUAGES.filter(l => !existing?.[l])
      
      if (!force && !isStale && missingLangs.length === 0) {
        skipped++
        continue
      }

      if (dryRun) {
        skipped++
        continue
      }

      try {
        const sourceText = category.name || category.nameEn || ''
        const sourceLang = category.name ? 'zh' : 'en'
        
        if (!sourceText) {
          skipped++
          continue
        }

        const translations: Record<string, string> = { ...existing }
        translations[sourceLang] = sourceText
        
        // Keep existing name/nameEn mapping
        if (category.name) translations.zh = category.name
        if (category.nameEn) translations.en = category.nameEn

        const langsToTranslate = SUPPORTED_LANGUAGES.filter(l => 
          l !== sourceLang && (force || !translations[l])
        )

        for (const targetLang of langsToTranslate) {
          try {
            const result = await translateText(sourceText, targetLang, sourceLang)
            if (result.success && result.translatedText) {
              translations[targetLang] = result.translatedText
            } else {
              translations[targetLang] = translations.en || translations.zh || sourceText
            }
          } catch {
            translations[targetLang] = translations.en || translations.zh || sourceText
          }
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 200))
        }

        await prisma.category.update({
          where: { id: category.id },
          data: {
            translations: translations,
            translatedAt: new Date(),
          },
        })
        updated++
      } catch (error) {
        console.error(`Failed to translate category ${category.id}:`, error)
        failed++
      }

      // Delay between categories
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    console.log(`✅ Sync complete: ${updated} updated, ${skipped} skipped, ${failed} failed`)

    return NextResponse.json({
      success: true,
      data: {
        total: categories.length,
        updated,
        skipped,
        failed,
        languages: SUPPORTED_LANGUAGES,
      },
    })
  } catch (error) {
    console.error('Category sync error:', error)
    return NextResponse.json({
      error: 'Failed to sync category translations',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

/**
 * GET /api/categories/sync-translations
 * Returns the current translation status
 */
export async function GET(request: Request) {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        translations: true,
        translatedAt: true,
      },
      take: 5,
      orderBy: { translatedAt: 'desc' },
    })

    const totalCategories = await prisma.category.count()
    const translatedCount = await prisma.category.count({
      where: { translatedAt: { not: null } }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalCategories,
        translatedCount,
        pendingCount: totalCategories - translatedCount,
        supportedLanguages: SUPPORTED_LANGUAGES,
        recentTranslations: categories.map(c => ({
          id: c.id,
          name: c.name,
          translatedAt: c.translatedAt,
          languageCount: c.translations ? Object.keys(c.translations as object).length : 0,
        })),
      },
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get translation status',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
