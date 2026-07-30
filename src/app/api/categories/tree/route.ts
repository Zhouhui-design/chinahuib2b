import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cacheGetOrSet, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

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
          name: locale === 'zh' ? cat.name : (cat.nameEn || cat.name),
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
      CACHE_TTL.LONG  // Reduced from VERY_LONG (24h) to LONG (1h) to avoid stale cache
    )

    return NextResponse.json({
      success: true,
      categories,
      locale,
      totalRootCategories: categories.length,
    })

  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
