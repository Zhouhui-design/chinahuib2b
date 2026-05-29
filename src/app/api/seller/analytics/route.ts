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
    const period = searchParams.get('period') || '30' // days
    const periodDays = parseInt(period)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    const [
      products,
      totalProducts,
      totalViews,
      totalInquiries,
      recentInquiries,
      recentProducts,
      categoryBreakdown
    ] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId: seller.id },
        select: {
          id: true,
          title: true,
          viewCount: true,
          inquiryCount: true,
          createdAt: true
        },
        orderBy: { viewCount: 'desc' },
        take: 10
      }),

      prisma.product.count({ where: { sellerId: seller.id } }),

      prisma.product.aggregate({
        where: { sellerId: seller.id },
        _sum: { viewCount: true }
      }),

      prisma.inquiry.aggregate({
        where: {
          sellerId: seller.id,
          createdAt: { gte: startDate }
        },
        _count: true
      }),

      prisma.inquiry.findMany({
        where: {
          sellerId: seller.id,
          createdAt: { gte: startDate }
        },
        select: {
          id: true,
          message: true,
          createdAt: true,
          buyer: {
            select: {
              username: true,
              email: true,
              company: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      prisma.product.findMany({
        where: {
          sellerId: seller.id,
          createdAt: { gte: startDate }
        },
        select: {
          id: true,
          title: true,
          viewCount: true,
          inquiryCount: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      prisma.product.groupBy({
        by: ['categoryId'],
        where: { sellerId: seller.id },
        _count: true,
        orderBy: { _count: { categoryId: 'desc' } }
      }),
    ])

    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryBreakdown.map(c => c.categoryId) }
      },
      select: { id: true, name: true, nameEn: true }
    })

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat
      return acc
    }, {} as Record<string, any>)

    const topProducts = products.slice(0, 5)
    const lowProducts = products.slice(-5).reverse()

    const dailyStats = await getDailyStats(seller.id, startDate)

    return NextResponse.json({
      success: true,
      dashboard: {
        summary: {
          totalProducts,
          totalViews: totalViews._sum.viewCount || 0,
          totalInquiries: totalInquiries._count || 0,
          avgViewsPerProduct: totalProducts > 0 ? Math.round((totalViews._sum.viewCount || 0) / totalProducts) : 0,
          avgInquiriesPerProduct: totalProducts > 0 ? Math.round((totalInquiries._count || 0) / totalProducts) : 0
        },
        topProducts,
        lowProducts,
        recentInquiries,
        recentProducts,
        categoryBreakdown: categoryBreakdown.map(c => ({
          categoryId: c.categoryId,
          categoryName: categoryMap[c.categoryId]?.name || categoryMap[c.categoryId]?.nameEn || 'Unknown',
          productCount: c._count
        })),
        dailyStats,
        period: periodDays
      }
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

async function getDailyStats(sellerId: string, startDate: Date) {
  const [inquiries, products] = await Promise.all([
    prisma.inquiry.findMany({
      where: {
        sellerId,
        createdAt: { gte: startDate }
      },
      select: { createdAt: true }
    }),
    prisma.product.findMany({
      where: {
        sellerId,
        createdAt: { gte: startDate }
      },
      select: { createdAt: true, viewCount: true }
    })
  ])

  const dailyMap = new Map<string, { date: string; views: number; inquiries: number; products: number }>()

  const now = new Date()
  for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    dailyMap.set(dateStr, { date: dateStr, views: 0, inquiries: 0, products: 0 })
  }

  inquiries.forEach(inq => {
    const dateStr = inq.createdAt.toISOString().split('T')[0]
    if (dailyMap.has(dateStr)) {
      const day = dailyMap.get(dateStr)!
      day.inquiries++
    }
  })

  products.forEach(prod => {
    const dateStr = prod.createdAt.toISOString().split('T')[0]
    if (dailyMap.has(dateStr)) {
      const day = dailyMap.get(dateStr)!
      day.products++
      day.views += prod.viewCount || 0
    }
  })

  return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}
