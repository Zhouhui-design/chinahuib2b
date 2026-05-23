import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"


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
      },
      orderBy: { name: 'asc' }
    })

    const translatedCategories = categories.map(cat => ({
      id: cat.id,
      name: locale === 'en' && cat.nameEn ? cat.nameEn : cat.name,
      originalName: cat.name,
      nameEn: cat.nameEn || cat.name,
      slug: cat.slug,
      level: cat.level,
      parentId: cat.parentId,
    }))

    return NextResponse.json({
      categories: translatedCategories,
      locale
    })
  } catch (error) {
    console.error('Fetch categories error:', error)
    return NextResponse.json({
      error: 'Failed to fetch categories'
    }, { status: 500 })
  }
}