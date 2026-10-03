import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/admin/download-records
 * 管理员查看下载记录：哪个用户下载了哪个公司的哪个文件。
 * 支持分页 + 按卖家/用户过滤。
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '50')))
    const sellerId = searchParams.get('sellerId') || null
    const userId = searchParams.get('userId') || null
    const type = searchParams.get('type') || null

    const where: any = {}
    if (sellerId) where.sellerId = sellerId
    if (userId) where.userId = userId
    if (type === 'PRODUCT' || type === 'STORE') where.brochureType = type

    const [total, records] = await Promise.all([
      prisma.brochureDownload.count({ where }),
      prisma.brochureDownload.findMany({
        where,
        orderBy: { downloadedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, username: true, displayName: true, email: true, avatarUrl: true },
          },
          seller: {
            select: { id: true, companyName: true, storeSlug: true, userId: true },
          },
        },
      }),
    ])

    // 解析具体文件名（PRODUCT -> ProductBrochure, STORE -> StoreBrochure）
    const enriched = await Promise.all(
      records.map(async (r) => {
        let fileName: string | null = null
        let productTitle: string | null = null
        try {
          if (r.brochureType === 'PRODUCT') {
            const pb = await prisma.productBrochure.findUnique({
              where: { id: r.brochureId },
              select: { fileName: true, product: { select: { title: true } } },
            })
            fileName = pb?.fileName || null
            productTitle = pb?.product?.title || null
          } else {
            const sb = await prisma.storeBrochure.findUnique({
              where: { id: r.brochureId },
              select: { fileName: true, title: true },
            })
            fileName = sb?.fileName || sb?.title || null
          }
        } catch {}
        return {
          id: r.id,
          downloadedAt: r.downloadedAt,
          brochureType: r.brochureType,
          ipAddress: r.ipAddress,
          fileName,
          productTitle,
          user: r.user
            ? { id: r.user.id, name: r.user.displayName || r.user.username || r.user.email, email: r.user.email }
            : null,
          seller: r.seller
            ? { id: r.seller.id, companyName: r.seller.companyName, slug: r.seller.storeSlug }
            : null,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: { records: enriched, total, page, pageSize },
    })
  } catch (error) {
    console.error('Download records error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch download records', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
