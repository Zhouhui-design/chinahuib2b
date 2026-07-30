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
      recentVisitors
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
      prisma.visitor.findMany({
        where,
        select: {
          id: true,
          country: true,
          countryCode: true,
          city: true,
          isSelfView: true,
          createdAt: true,
          product: { select: { title: true, id: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalViews,
        selfViews,
        externalViews,
        domesticViews,
        internationalViews,
        selfViewPercentage: totalViews > 0 ? Math.round((selfViews / totalViews) * 100) : 0,
        domesticPercentage: totalViews > 0 ? Math.round((domesticViews / totalViews) * 100) : 0,
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
        productTitle: v.product?.title || 'Unknown Product',
        productId: v.product?.id
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