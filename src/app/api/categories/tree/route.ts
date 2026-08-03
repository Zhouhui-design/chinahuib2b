import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cacheGetOrSet, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

const SUPPORTED_LANGUAGES = ['en', 'zh', 'de', 'fr', 'es', 'ja', 'ko', 'ar', 'ru', 'pt', 'hi', 'th', 'vi']

interface CategoryNode {
  id: string
  name: string
  nameEn?: string | null
  originalName?: string
  slug: string
  level: number
  parentId?: string | null
  children?: CategoryNode[]
}

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'

    const categories = await cacheGetOrSet<CategoryNode[]>(
      `${CACHE_KEYS.categoryTree()}:${locale}`,
      async () => {
        const allCategories = await prisma.category.findMany({
          orderBy: [
            { level: 'asc' },
            { name: 'asc' },
          ],
        })

        const translateName = (cat: any): CategoryNode => ({
          id: cat.id,
          name: getLocalizedName(cat, locale),
          originalName: cat.name,
          nameEn: cat.nameEn || cat.name,
          slug: cat.slug,
          level: cat.level,
          parentId: cat.parentId,
        })

        // Normalize parentId: handle null, undefined, empty string, and 'None'
        const normalizeParentId = (pid: string | null | undefined): string | null => {
          if (pid === null || pid === undefined || pid === '' || pid === 'None') {
            return null
          }
          return pid
        }

        const buildTree = (parentId: string | null = null): CategoryNode[] => {
          return allCategories
            .filter(cat => normalizeParentId(cat.parentId) === parentId)
            .map((cat): CategoryNode => {
              const node = translateName(cat)
              node.children = buildTree(cat.id)
              return node
            })
        }

        return buildTree(null)
      },
      CACHE_TTL.LONG  // 1 hour cache
    )

    return NextResponse.json({
      success: true,
      categories,
      locale,
      totalRootCategories: categories.length,
      supportedLanguages: SUPPORTED_LANGUAGES,
    })

  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
