import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cacheGetOrSet, cacheSet, cacheDelete, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const refresh = searchParams.get('refresh') === 'true'

    const cacheKey = `${CACHE_KEYS.categoryTree()}:${locale}`
    
    if (refresh) {
      await cacheDelete(cacheKey)
      await cacheDelete(`${CACHE_KEYS.categoryTree()}:${locale}`)
    }

    const fetchCategories = async () => {
      const allCategories = await prisma.category.findMany({
        orderBy: [
          { level: 'asc' },
          { name: 'asc' },
        ],
      })

      const translateName = (cat: any): CategoryNode => ({
        id: cat.id,
        name: locale === 'en' && cat.nameEn ? cat.nameEn : cat.name,
        originalName: cat.name,
        nameEn: cat.nameEn || cat.name,
        slug: cat.slug,
        level: cat.level,
        parentId: cat.parentId,
      })

      const buildTree = (parentId: string | null = null): CategoryNode[] => {
        return allCategories
          .filter(cat => {
            const catParentId = cat.parentId ?? null
            return catParentId === parentId
          })
          .map((cat): CategoryNode => {
            const node = translateName(cat)
            node.children = buildTree(cat.id)
            return node
          })
      }

      return buildTree(null)
    }

    let categories: CategoryNode[]
    
    if (refresh) {
      await cacheDelete(cacheKey)
      categories = await fetchCategories()
      await cacheSet(cacheKey, categories, CACHE_TTL.VERY_LONG)
    } else {
      categories = await cacheGetOrSet<CategoryNode[]>(
        cacheKey,
        fetchCategories,
        CACHE_TTL.VERY_LONG
      )
    }

    return NextResponse.json({
      success: true,
      categories,
      locale
    })

  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}