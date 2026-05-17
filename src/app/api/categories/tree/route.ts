import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cacheGetOrSet, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

interface CategoryNode {
  id: string
  name: string
  nameEn?: string | null
  slug: string
  level: number
  parentId?: string | null
  children?: CategoryNode[]
}

export async function GET(request: NextRequest) {
  try {
    // Use cache for category tree (changes infrequently)
    const categories = await cacheGetOrSet<CategoryNode[]>(
      CACHE_KEYS.categoryTree(),
      async () => {
        // Fetch all categories and build tree structure
        const allCategories = await prisma.category.findMany({
          orderBy: [
            { level: 'asc' },
            { name: 'asc' },
          ],
        })

        // Build hierarchical tree
        const buildTree = (parentId: string | null = null): CategoryNode[] => {
          return allCategories
            .filter(cat => cat.parentId === parentId)
            .map((cat): CategoryNode => ({
              id: cat.id,
              name: cat.name,
              nameEn: cat.nameEn,
              slug: cat.slug,
              level: cat.level,
              parentId: cat.parentId,
              children: buildTree(cat.id),
            }))
        }

        return buildTree(null)
      },
      CACHE_TTL.VERY_LONG // Cache for 24 hours (categories rarely change)
    )

    return NextResponse.json({ 
      success: true,
      categories 
    })

  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
