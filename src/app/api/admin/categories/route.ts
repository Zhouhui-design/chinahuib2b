import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { invalidateCategoryCaches } from "@/lib/cache"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'zh'

    const categories = await prisma.category.findMany({
      include: {
        children: true,
        parent: true,
        owner: { select: { id: true, companyName: true } },
        submitter: { select: { id: true, username: true, isAI: true } },
      },
      orderBy: { level: 'asc' },
    })

    const translatedCategories = categories.map(cat => ({
      id: cat.id,
      name: locale === 'en' && cat.nameEn ? cat.nameEn : cat.name,
      nameEn: cat.nameEn || cat.name,
      originalName: cat.name,
      slug: cat.slug,
      level: cat.level,
      parentId: cat.parentId,
      parent: cat.parent ? {
        id: cat.parent.id,
        name: locale === 'en' && cat.parent.nameEn ? cat.parent.nameEn : cat.parent.name,
      } : null,
      hsCode: cat.hsCode,
      model: cat.model,
      modelEn: cat.modelEn,
      series: cat.series,
      seriesEn: cat.seriesEn,
      description: cat.description,
      descriptionEn: cat.descriptionEn,
      childrenCount: cat.children.length,
      // 新增：来源与归属字段
      source: cat.source,
      status: cat.status,
      ownerId: cat.ownerId,
      ownerName: cat.owner?.companyName || null,
      submittedById: cat.submittedById,
      submittedByUsername: cat.submitter?.username || null,
      submittedByIsAI: cat.submitter?.isAI || false,
      submittedAt: cat.submittedAt,
      reviewedAt: cat.reviewedAt,
      rejectionReason: cat.rejectionReason,
    }))

    return NextResponse.json({
      categories: translatedCategories,
      locale,
    })
  } catch (error) {
    console.error('Fetch categories error:', error)
    return NextResponse.json({
      error: 'Failed to fetch categories',
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Create category request body:', body)
    
    const { name, nameEn, level, parentId, hsCode, model, modelEn, series, seriesEn, description, descriptionEn } = body

    if (!name || level === undefined) {
      console.log('Validation failed: name=', name, 'level=', level)
      return NextResponse.json({ error: 'Name and level are required' }, { status: 400 })
    }

    let slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    if (!slug) {
      slug = `category-${Date.now()}`
    }

    const existing = await prisma.category.findUnique({
      where: { slug },
    })

    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    const category = await prisma.category.create({
      data: {
        name,
        nameEn,
        slug,
        level,
        ...(parentId && parentId.trim() ? { parent: { connect: { id: parentId.trim() } } } : {}),
        hsCode,
        model,
        modelEn,
        series,
        seriesEn,
        description,
        descriptionEn,
        // 管理员创建的分类默认为系统预置
        source: 'SYSTEM',
        status: 'APPROVED',
      },
    })

    await invalidateCategoryCaches()

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json({
      error: 'Failed to create category',
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, nameEn, level, parentId, hsCode, model, modelEn, series, seriesEn, description, descriptionEn } = body

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 })
    }

    const existing = await prisma.category.findUnique({
      where: { id },
    })

    console.log('Update category - existing:', existing)
    console.log('Update category - incoming name:', name, 'level:', level, 'parentId:', parentId)

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    console.log('Update category - existing.slug:', existing.slug, 'new slug:', slug)

    if (existing.slug !== slug) {
      const slugExists = await prisma.category.findFirst({
        where: { slug, id: { not: id } },
      })
      console.log('Update category - slugExists:', slugExists)

      if (slugExists) {
        return NextResponse.json({ error: 'Another category with this name already exists' }, { status: 400 })
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        nameEn,
        slug,
        level,
        ...(parentId && parentId.trim() ? { parent: { connect: { id: parentId.trim() } } } : { parent: { disconnect: true } }),
        hsCode,
        model,
        modelEn,
        series,
        seriesEn,
        description,
        descriptionEn,
      },
    })

    await invalidateCategoryCaches()

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json({
      error: 'Failed to update category',
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const hasChildren = await prisma.category.findFirst({
      where: { parentId: id },
    })

    if (hasChildren) {
      return NextResponse.json({ error: 'Cannot delete category with children' }, { status: 400 })
    }

    const hasProducts = await prisma.product.findFirst({
      where: { categoryId: id },
    })

    if (hasProducts) {
      return NextResponse.json({ error: 'Cannot delete category with products' }, { status: 400 })
    }

    await prisma.category.delete({
      where: { id },
    })

    await invalidateCategoryCaches()

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({
      error: 'Failed to delete category',
    }, { status: 500 })
  }
}