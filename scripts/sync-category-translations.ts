/**
 * Category Translation Sync Script
 * 
 * Auto-translates all category names to 13 supported languages using
 * Google Translate (free) / LibreTranslate fallback.
 * 
 * Usage:
 *   npx tsx scripts/sync-category-translations.ts           # Sync all (daily)
 *   npx tsx scripts/sync-category-translations.ts --force    # Force re-translate all
 *   npx tsx scripts/sync-category-translations.ts --dry-run  # Preview without saving
 */

import { PrismaClient } from '@prisma/client'
import { translateText } from '../src/lib/translation-service'

const prisma = new PrismaClient()

const SUPPORTED_LANGUAGES = ['en', 'zh', 'de', 'fr', 'es', 'ja', 'ko', 'ar', 'ru', 'pt', 'hi', 'th', 'vi'] as const
type LangCode = typeof SUPPORTED_LANGUAGES[number]

const STALE_HOURS = 24 // Re-translate if older than 24 hours

interface SyncOptions {
  force?: boolean
  dryRun?: boolean
}

/**
 * Check if translations are stale (older than STALE_HOURS)
 */
function isStale(translatedAt: Date | null): boolean {
  if (!translatedAt) return true
  const hoursSince = (Date.now() - translatedAt.getTime()) / (1000 * 60 * 60)
  return hoursSince >= STALE_HOURS
}

/**
 * Get the best source text for translation
 * Prefer Chinese name (original), fall back to English
 */
function getSourceText(category: { name: string; nameEn: string | null }): { text: string; lang: LangCode } {
  if (category.name && category.name.trim()) {
    return { text: category.name, lang: 'zh' }
  }
  if (category.nameEn && category.nameEn.trim()) {
    return { text: category.nameEn, lang: 'en' }
  }
  return { text: '', lang: 'en' }
}

/**
 * Translate a single category name to all languages
 */
async function translateCategory(
  category: { id: string; name: string; nameEn: string | null },
  existingTranslations: Record<string, string> | null,
  force: boolean
): Promise<Record<string, string>> {
  const { text: sourceText, lang: sourceLang } = getSourceText(category)
  
  if (!sourceText) {
    return existingTranslations || {}
  }

  const translations: Record<string, string> = { ...existingTranslations }
  
  // Always keep the source language as original
  translations[sourceLang] = sourceText

  // For Chinese source, keep name as zh; for English source, keep nameEn as en
  if (sourceLang === 'zh' && category.nameEn) {
    translations.en = category.nameEn
  } else if (sourceLang === 'en' && category.name) {
    translations.zh = category.name
  }

  // Translate to all other languages (with small delay to avoid rate limits)
  const langsToTranslate = SUPPORTED_LANGUAGES.filter(l => 
    l !== sourceLang && (force || !translations[l])
  )

  for (const targetLang of langsToTranslate) {
    // Skip if already translated and not forcing
    if (!force && translations[targetLang]) {
      continue
    }

    try {
      const result = await translateText(sourceText, targetLang, sourceLang)
      if (result.success && result.translatedText) {
        translations[targetLang] = result.translatedText
        console.log(`  ✅ ${targetLang}: ${result.translatedText}`)
      } else {
        // Fallback: use English or Chinese
        translations[targetLang] = translations.en || translations.zh || sourceText
        console.log(`  ⚠️ ${targetLang}: fallback (${result.error})`)
      }
    } catch (error) {
      translations[targetLang] = translations.en || translations.zh || sourceText
      console.log(`  ❌ ${targetLang}: error (${error instanceof Error ? error.message : 'unknown'})`)
    }

    // Small delay to avoid hitting rate limits (Google free tier)
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  return translations
}

/**
 * Main sync function
 */
async function syncCategoryTranslations(options: SyncOptions = {}) {
  const { force = false, dryRun = false } = options

  console.log('🌐 Category Translation Sync')
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : force ? 'FORCE' : 'STALE ONLY'}`)
  console.log(`   Languages: ${SUPPORTED_LANGUAGES.join(', ')}`)
  console.log('')

  // Fetch all categories
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

  console.log(`📋 Found ${categories.length} categories\n`)

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const category of categories) {
    const existing = category.translations as Record<string, string> | null
    const needsUpdate = force || isStale(category.translatedAt) || !existing

    if (!needsUpdate && existing) {
      // Check if all languages are present
      const missingLangs = SUPPORTED_LANGUAGES.filter(l => !existing[l])
      if (missingLangs.length === 0) {
        console.log(`⏭️  Skip: ${category.name} (up to date)`)
        skipped++
        continue
      }
    }

    console.log(`🔄 Translating: ${category.name}`)
    
    if (dryRun) {
      console.log(`   (dry run - would translate to ${SUPPORTED_LANGUAGES.length} languages)`)
      skipped++
      continue
    }

    try {
      const translations = await translateCategory(category, existing, force)
      
      await prisma.category.update({
        where: { id: category.id },
        data: {
          translations: translations,
          translatedAt: new Date(),
        },
      })
      
      updated++
      console.log(`   ✅ Saved (${Object.keys(translations).length} languages)\n`)
    } catch (error) {
      failed++
      console.error(`   ❌ Failed: ${error instanceof Error ? error.message : 'unknown'}\n`)
    }

    // Delay between categories to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n📊 Summary:')
  console.log(`   Updated: ${updated}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Failed:  ${failed}`)
  console.log(`   Total:   ${categories.length}`)

  return { updated, skipped, failed, total: categories.length }
}

// Run the script
const args = process.argv.slice(2)
const force = args.includes('--force')
const dryRun = args.includes('--dry-run')

syncCategoryTranslations({ force, dryRun })
  .then(async (result) => {
    await prisma.$disconnect()
    process.exit(result.failed > 0 ? 1 : 0)
  })
  .catch(async (error) => {
    console.error('Fatal error:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
