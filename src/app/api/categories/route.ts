import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const SUPPORTED_LANGUAGES = ['en', 'zh', 'de', 'fr', 'es', 'ja', 'ko', 'ar', 'ru', 'pt', 'hi', 'th', 'vi']

/**
 * Get the best available name for a category based on locale.
 * Priority: translations[locale] > nameEn (if en) > name (if zh) > nameEn > name
 */
function getLocalizedName(
  category: { name: string; nameEn: string | null; translations: any },
  locale: string
): string {
  const translations = category.translations as Record<string, string> | null
  
  // 1. Try the translations JSON field first (auto-translated)
  if (translations && translations[locale]) {
    return translations[locale]
  }
  
  // 2. Fall back to legacy fields
  if (locale === 'zh') {
    return category.name
  }
  if (locale === 'en') {
    return category.nameEn || category.name
  }
  
  // 3. For other languages without translation, fall back to English then Chinese
  if (translations?.en) return translations.en
  if (category.nameEn) return category.nameEn
  return category.name
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        nameEn: true,
        slug: true,
        level: true,
        parentId: true,
        model: true,
        modelEn: true,
        series: true,
        seriesEn: true,
        description: true,
        descriptionEn: true,
        translations: true,
      },
      orderBy: { name: 'asc' }
    })

    const translatedCategories = categories.map(cat => ({
      id: cat.id,
      name: getLocalizedName(cat, locale),
      originalName: cat.name,
      nameEn: cat.nameEn || cat.name,
      slug: cat.slug,
      level: cat.level,
      parentId: cat.parentId,
      model: cat.model,
      modelEn: cat.modelEn,
      series: cat.series,
      seriesEn: cat.seriesEn,
      description: cat.description,
      descriptionEn: cat.descriptionEn,
      translations: cat.translations,
    }))

    return NextResponse.json({
      categories: translatedCategories,
      locale,
      supportedLanguages: SUPPORTED_LANGUAGES,
    })
  } catch (error) {
    console.error('Fetch categories error:', error)
    return NextResponse.json({
      error: 'Failed to fetch categories'
    }, { status: 500 })
  }
}
