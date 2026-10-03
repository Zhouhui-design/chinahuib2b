import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const period = searchParams.get('period') || '30'
    const periodDays = parseInt(period)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    const where: any = {
      sellerId: seller.id,
      createdAt: { gte: startDate }
    }

    if (productId) {
      where.productId = productId
    }

    const [
      totalViews,
      selfViews,
      externalViews,
      domesticViews,
      internationalViews,
      countryBreakdown,
      cityBreakdown,
      viewTypeBreakdown,
      recentVisitors,
      loggedInViews,
    ] = await Promise.all([
      prisma.visitor.count({ where }),
      prisma.visitor.count({ where: { ...where, isSelfView: true } }),
      prisma.visitor.count({ where: { ...where, isSelfView: false } }),
      prisma.visitor.count({ where: { ...where, countryCode: 'CN' } }),
      prisma.visitor.count({ where: { ...where, countryCode: { not: 'CN' } } }),
      prisma.visitor.groupBy({
        by: ['country', 'countryCode'],
        where,
        _count: true,
        orderBy: { _count: { country: 'desc' } },
        take: 20
      }),
      prisma.visitor.groupBy({
        by: ['country', 'city'],
        where: { ...where, countryCode: { not: 'CN' } },
        _count: true,
        orderBy: { _count: { city: 'desc' } },
        take: 20
      }),
      prisma.visitor.groupBy({
        by: ['viewType'],
        where,
        _count: true,
      }),
      prisma.visitor.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          viewer: {
            select: { id: true, username: true, displayName: true, email: true, avatarUrl: true },
          },
          product: { select: { title: true, id: true } },
        },
      }),
      prisma.visitor.count({ where: { ...where, viewerId: { not: null } } }),
    ])

    // 为每个登录访客查询是否下载过本卖家的文件
    const viewerIds = Array.from(
      new Set(recentVisitors.map((v) => v.viewerId).filter((id): id is string => !!id))
    )

    let downloadMap = new Map<string, number>()
    if (viewerIds.length > 0) {
      const downloads = await prisma.brochureDownload.findMany({
        where: {
          sellerId: seller.id,
          userId: { in: viewerIds },
        },
        select: { userId: true },
      })
      for (const d of downloads) {
        if (d.userId) downloadMap.set(d.userId, (downloadMap.get(d.userId) || 0) + 1)
      }
    }

    const typeCountMap: Record<string, number> = {}
    for (const t of viewTypeBreakdown) {
      typeCountMap[t.viewType] = t._count
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalViews,
        selfViews,
        externalViews,
        domesticViews,
        internationalViews,
        loggedInViews,
        selfViewPercentage: totalViews > 0 ? Math.round((selfViews / totalViews) * 100) : 0,
        domesticPercentage: totalViews > 0 ? Math.round((domesticViews / totalViews) * 100) : 0,
        // 分维度访问量
        storeViews: typeCountMap['STORE'] || 0,          // 公司信息访问
        boothViews: typeCountMap['BOOTH'] || 0,          // 展会访问
        productViews: typeCountMap['PRODUCT'] || 0,      // 产品访问
      },
      countryBreakdown: countryBreakdown.map(c => ({
        country: c.country,
        countryCode: c.countryCode,
        count: c._count
      })),
      cityBreakdown: cityBreakdown.map(c => ({
        country: c.country,
        city: c.city,
        count: c._count
      })),
      recentVisitors: recentVisitors.map(v => ({
        id: v.id,
        country: v.country,
        countryCode: v.countryCode,
        city: v.city,
        isSelfView: v.isSelfView,
        createdAt: v.createdAt,
        viewType: v.viewType,
        productTitle: v.product?.title || null,
        productId: v.product?.id || null,
        viewer: v.viewer
          ? {
              id: v.viewer.id,
              name: v.viewer.displayName || v.viewer.username || v.viewer.email,
              email: v.viewer.email,
              avatarUrl: v.viewer.avatarUrl,
            }
          : null,
        hasDownloaded: v.viewerId ? (downloadMap.get(v.viewerId) || 0) > 0 : false,
        downloadCount: v.viewerId ? (downloadMap.get(v.viewerId) || 0) : 0,
      }))
    })
  } catch (error) {
    console.error("Views stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch view stats", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
