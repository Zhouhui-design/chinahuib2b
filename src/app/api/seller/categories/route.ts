import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { resolveSellerFromRequest } from '@/lib/category-auth'
import { invalidateCategoryCaches } from '@/lib/cache'

/**
 * 卖家分类管理 API
 *
 * POST /api/seller/categories
 *   - 卖家（含 AI Agent via API Key）创建自定义分类
 *   - 创建后默认 status=APPROVED，自动同步到系统分类池
 *   - 调用 invalidateCategoryCaches() 让 /api/categories/tree 立即刷新
 *
 * GET /api/seller/categories
 *   - 返回当前卖家提交的所有分类（供产品页弹窗显示"我的分类"）
 */

const sellerCategorySchema = z.object({
  name: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional().nullable(),
  level: z.number().int().min(1).max(5),
  parentId: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  modelEn: z.string().optional().nullable(),
  series: z.string().optional().nullable(),
  seriesEn: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  hsCode: z.string().optional().nullable(),
  translations: z.record(z.string(), z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { seller, submitterUserId, authMethod } = await resolveSellerFromRequest(request)

    if (!seller) {
      return NextResponse.json(
        { error: '卖家资料不存在，请先完善卖家信息' },
        { status: 404 }
      )
    }

    if (!submitterUserId) {
      return NextResponse.json(
        { error: '未认证' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = sellerCategorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: '参数校验失败', details: validation.error.issues },
        { status: 400 }
      )
    }

    const data = validation.data

    // 校验：level > 1 必须有 parentId
    if (data.level > 1 && !data.parentId?.trim()) {
      return NextResponse.json(
        { error: '非一级分类必须选择上级分类' },
        { status: 400 }
      )
    }

    // 校验父分类存在且 status=APPROVED（防止挂在 REJECTED 分类下）
    if (data.parentId?.trim()) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId.trim() },
      })
      if (!parent) {
        return NextResponse.json(
          { error: '上级分类不存在' },
          { status: 400 }
        )
      }
      if (parent.status === 'REJECTED') {
        return NextResponse.json(
          { error: '上级分类已被禁用' },
          { status: 400 }
        )
      }
      // 校验层级一致：父分类 level 必须是当前 level - 1
      if (parent.level !== data.level - 1) {
        return NextResponse.json(
          { error: `上级分类层级应为 ${data.level - 1}` },
          { status: 400 }
        )
      }
    }

    // slug 生成（与 admin route 一致的去重逻辑）
    let slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (!slug) {
      slug = `category-${Date.now()}`
    }
    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    // 创建：默认 source=SELLER, status=APPROVED（实现"自动同步"）
    const createData: any = {
      name: data.name,
      slug,
      level: data.level,
      source: 'SELLER',
      ownerId: seller.id,
      submittedById: submitterUserId,
      submittedAt: new Date(),
      status: 'APPROVED',
    }
    if (data.nameEn) createData.nameEn = data.nameEn
    if (data.parentId?.trim()) createData.parentId = data.parentId.trim()
    if (data.model) createData.model = data.model
    if (data.modelEn) createData.modelEn = data.modelEn
    if (data.series) createData.series = data.series
    if (data.seriesEn) createData.seriesEn = data.seriesEn
    if (data.description) createData.description = data.description
    if (data.descriptionEn) createData.descriptionEn = data.descriptionEn
    if (data.hsCode) createData.hsCode = data.hsCode
    if (data.translations) createData.translations = data.translations

    const category = await prisma.category.create({ data: createData })

    // 失效分类树缓存，让 /api/categories/tree 立即看到新分类
    await invalidateCategoryCaches()

    console.log(`[SellerCategories] 创建成功: ${category.id} by seller=${seller.id} submitter=${submitterUserId} via ${authMethod}`)

    return NextResponse.json({
      success: true,
      category,
    }, { status: 201 })
  } catch (error) {
    console.error('[SellerCategories] Create error:', error)
    return NextResponse.json(
      { error: '创建分类失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { seller } = await resolveSellerFromRequest(request)

    if (!seller) {
      return NextResponse.json(
        { error: '卖家资料不存在' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'zh'

    const categories = await prisma.category.findMany({
      where: { ownerId: seller.id },
      include: {
        parent: { select: { id: true, name: true, nameEn: true } },
      },
      orderBy: [
        { level: 'asc' },
        { submittedAt: 'desc' },
      ],
    })

    const localizedCategories = categories.map(cat => ({
      id: cat.id,
      name: locale === 'en' && cat.nameEn ? cat.nameEn : cat.name,
      nameEn: cat.nameEn || cat.name,
      slug: cat.slug,
      level: cat.level,
      parentId: cat.parentId,
      parent: cat.parent ? {
        id: cat.parent.id,
        name: locale === 'en' && cat.parent.nameEn ? cat.parent.nameEn : cat.parent.name,
      } : null,
      status: cat.status,
      source: cat.source,
      submittedAt: cat.submittedAt,
      rejectionReason: cat.rejectionReason,
    }))

    return NextResponse.json({
      success: true,
      categories: localizedCategories,
      total: localizedCategories.length,
    })
  } catch (error) {
    console.error('[SellerCategories] List error:', error)
    return NextResponse.json(
      { error: '获取分类列表失败' },
      { status: 500 }
    )
  }
}
