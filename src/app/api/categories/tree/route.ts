import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

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

    const isRootCategory = (cat: any): boolean => {
      const parentId = cat.parentId
      return parentId === null || parentId === undefined || parentId === 'None' || parentId === ''
    }

    const buildTree = (parentId: string | null = null): CategoryNode[] => {
      return allCategories
        .filter(cat => {
          if (parentId === null) {
            return isRootCategory(cat)
          }
          const catParentId = cat.parentId ?? null
          return catParentId === parentId
        })
        .map((cat): CategoryNode => {
          const node = translateName(cat)
          node.children = buildTree(cat.id)
          return node
        })
    }

    const categories = buildTree(null)

    return NextResponse.json({
      success: true,
      categories,
      locale,
      totalRootCategories: allCategories.filter(isRootCategory).length
    })

  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
