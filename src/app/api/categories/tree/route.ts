import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// 获取完整的分类树结构（支持无限级）


export async function GET() {
  try {
    // 获取所有顶级分类（level 1）
    const rootCategories = await prisma.category.findMany({
      where: {
        level: 1
      },
      orderBy: { 
        name: 'asc' 
      }
    })

    // 递归加载子分类
    const categoriesWithChildren = await Promise.all(
      rootCategories.map(async (category) => {
        return await loadCategoryTree(category.id)
      })
    )

    return NextResponse.json({ 
      categories: categoriesWithChildren,
      success: true
    })
  } catch (error) {
    console.error('Fetch category tree error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch category tree',
      categories: []
    }, { status: 500 })
  }
}

// 递归函数：加载分类及其所有子分类
async function loadCategoryTree(parentId: string, depth: number = 1) {
  const MAX_DEPTH = 4 // 最大支持 4 级分类

  // 获取当前分类的详细信息
  const category = await prisma.category.findUnique({
    where: { id: parentId }
  })

  if (!category) return null

  // 如果未达到最大深度，加载子分类
  let children: any[] = []
  if (depth < MAX_DEPTH) {
    const childCategories = await prisma.category.findMany({
      where: { 
        parentId: parentId 
      },
      orderBy: { 
        name: 'asc' 
      }
    })

    // 递归加载每个子分类
    children = await Promise.all(
      childCategories.map(async (child) => {
        return await loadCategoryTree(child.id, depth + 1)
      })
    )

    // 过滤掉 null 值
    children = children.filter(Boolean)
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    level: category.level,
    children: children.length > 0 ? children : undefined
  }
}
