import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface PricingRecommendation {
  productId: string
  currentPrice: number
  suggestedPrice: number
  reason: string
  confidence: number
  marketData: MarketData
}

interface MarketData {
  avgPrice: number
  minPrice: number
  maxPrice: number
  competitorCount: number
  priceRange: string
  trend: 'up' | 'down' | 'stable'
}

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

    const products = await prisma.product.findMany({
      where: { sellerId: seller.id },
      select: {
        id: true,
        title: true,
        price: true,
        categoryId: true,
        createdAt: true
      }
    })

    const recommendations: PricingRecommendation[] = []

    for (const product of products) {
      const marketData = await analyzeMarket(product.categoryId)
      const recommendation = generateRecommendation(product, marketData)
      recommendations.push(recommendation)
    }

    recommendations.sort((a, b) => b.confidence - a.confidence)

    return NextResponse.json({
      success: true,
      recommendations,
      summary: {
        totalProducts: products.length,
        needsAdjustment: recommendations.filter(r => r.suggestedPrice !== r.currentPrice).length,
        avgConfidence: Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / Math.max(1, recommendations.length))
      }
    })
  } catch (error) {
    console.error("Pricing API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch pricing recommendations", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

async function analyzeMarket(categoryId: string): Promise<MarketData> {
  const competitorProducts = await prisma.product.findMany({
    where: {
      categoryId,
      price: { not: null }
    },
    select: { price: true }
  })

  const prices = competitorProducts.map(p => Number(p.price || 0)).filter(p => p > 0)

  if (prices.length === 0) {
    return {
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      competitorCount: 0,
      priceRange: "N/A",
      trend: 'stable'
    }
  }

  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  const recentProducts = await prisma.product.findMany({
    where: {
      categoryId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    },
    select: { price: true, createdAt: true }
  })

  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (recentProducts.length >= 5) {
    const recentPrices = recentProducts.map(p => Number(p.price || 0)).filter(p => p > 0)
    const olderProducts = await prisma.product.findMany({
      where: {
        categoryId,
        createdAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      select: { price: true }
    })
    const olderPrices = olderProducts.map(p => Number(p.price || 0)).filter(p => p > 0)

    if (recentPrices.length > 0 && olderPrices.length > 0) {
      const recentAvg = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length
      const olderAvg = olderPrices.reduce((sum, p) => sum + p, 0) / olderPrices.length
      const change = ((recentAvg - olderAvg) / olderAvg) * 100

      if (change > 5) trend = 'up'
      else if (change < -5) trend = 'down'
    }
  }

  return {
    avgPrice: Math.round(avgPrice * 100) / 100,
    minPrice: Math.round(minPrice * 100) / 100,
    maxPrice: Math.round(maxPrice * 100) / 100,
    competitorCount: competitorProducts.length,
    priceRange: `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`,
    trend
  }
}

function generateRecommendation(product: { id: string; price: number | null }, marketData: MarketData): PricingRecommendation {
  const currentPrice = Number(product.price || 0)
  
  if (marketData.competitorCount === 0) {
    return {
      productId: product.id,
      currentPrice,
      suggestedPrice: currentPrice,
      reason: "Insufficient market data available",
      confidence: 30,
      marketData
    }
  }

  let suggestedPrice = currentPrice
  let reason = "Your price is competitive"
  let confidence = 70

  const avgPrice = marketData.avgPrice
  const minPrice = marketData.minPrice
  const maxPrice = marketData.maxPrice

  if (currentPrice === 0) {
    suggestedPrice = Math.round(avgPrice * 100) / 100
    reason = "No price set. Suggested price based on market average"
    confidence = 65
  } else if (currentPrice < minPrice * 0.9) {
    suggestedPrice = Math.round((minPrice * 0.95) * 100) / 100
    reason = "Price is significantly below market minimum. Consider increasing to improve perceived value."
    confidence = 85
  } else if (currentPrice > maxPrice * 1.1) {
    suggestedPrice = Math.round((maxPrice * 0.95) * 100) / 100
    reason = "Price is significantly above market maximum. Consider lowering to remain competitive."
    confidence = 80
  } else if (currentPrice < avgPrice * 0.8) {
    suggestedPrice = Math.round((avgPrice * 0.9) * 100) / 100
    reason = "Price is below market average. May consider a slight increase."
    confidence = 75
  } else if (currentPrice > avgPrice * 1.2) {
    suggestedPrice = Math.round((avgPrice * 1.1) * 100) / 100
    reason = "Price is above market average. Consider adjusting based on product quality and features."
    confidence = 75
  } else {
    suggestedPrice = currentPrice
    reason = "Price is within competitive range. Monitor market trends."
    confidence = 85
  }

  if (marketData.trend === 'up' && suggestedPrice === currentPrice) {
    suggestedPrice = Math.round((currentPrice * 1.03) * 100) / 100
    reason += " Market trend is upward, consider a small price increase."
    confidence += 5
  } else if (marketData.trend === 'down' && suggestedPrice === currentPrice) {
    suggestedPrice = Math.round((currentPrice * 0.97) * 100) / 100
    reason += " Market trend is downward, consider a small price decrease."
    confidence += 5
  }

  return {
    productId: product.id,
    currentPrice,
    suggestedPrice: Math.round(suggestedPrice * 100) / 100,
    reason,
    confidence: Math.min(100, Math.max(0, confidence)),
    marketData
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { productId, newPrice } = body

    if (!productId || newPrice === undefined) {
      return NextResponse.json({ error: "productId and newPrice are required" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product || product.sellerId !== seller.id) {
      return NextResponse.json({ error: "Product not found or not owned by seller" }, { status: 404 })
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { price: newPrice }
    })

    return NextResponse.json({
      success: true,
      message: "Price updated successfully",
      product: {
        id: updatedProduct.id,
        title: updatedProduct.title,
        price: updatedProduct.price
      }
    })
  } catch (error) {
    console.error("Update price error:", error)
    return NextResponse.json(
      { error: "Failed to update price", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
