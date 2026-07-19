import { NextRequest, NextResponse } from "next/server"

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

    const response = await fetch(`http://localhost:3000/api/categories?locale=${locale}`)
    const data = await response.json()
    const allCategories: CategoryNode[] = data.categories

    const buildTree = (parentId: string | null = null): CategoryNode[] => {
      return allCategories
        .filter(cat => {
          const catParentId = cat.parentId === 'None' ? null : cat.parentId ?? null
          return catParentId === parentId
        })
        .map((cat): CategoryNode => ({
          ...cat,
          children: buildTree(cat.id)
        }))
    }

    const categories = buildTree(null)

    return NextResponse.json({
      success: true,
      categories,
      locale,
      totalRootCategories: categories.length,
      source: 'non-cached categories API'
    })

  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
