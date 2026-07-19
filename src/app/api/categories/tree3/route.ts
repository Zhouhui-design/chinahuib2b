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

    const translatedCategories = allCategories.map(cat => ({
      id: cat.id,
      name: locale === 'en' && cat.nameEn ? cat.nameEn : cat.name,
      originalName: cat.name,
      nameEn: cat.nameEn || cat.name,
      slug: cat.slug,
      level: cat.level,
      parentId: cat.parentId === 'None' ? null : cat.parentId ?? null,
    }))

    const buildTree = (parentId: string | null = null): CategoryNode[] => {
      return translatedCategories
        .filter(cat => cat.parentId === parentId)
        .map((cat): CategoryNode => ({
          id: cat.id,
          name: cat.name,
          nameEn: cat.nameEn,
          originalName: cat.originalName,
          slug: cat.slug,
          level: cat.level,
          parentId: cat.parentId,
          children: buildTree(cat.id)
        }))
    }

    const categories = buildTree(null)

    return NextResponse.json({
      success: true,
      categories,
      locale,
      totalRootCategories: categories.length,
      endpoint: 'tree3'
    })

  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
