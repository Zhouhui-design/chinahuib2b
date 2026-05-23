import { NextRequest, NextResponse } from "next/server"
import { verifyAIApiKey } from '@/lib/ai-identity'

interface PricingRequest {
  product: {
    title?: string
    description?: string
    category?: string
    cost?: number
    targetMarket?: string
  }
  options?: {
    includeDiscount?: boolean
    currency?: string
    competitorPrices?: number[]
  }
}

interface PricingSuggestion {
  retailPrice: number
  wholesalePrice: number
  moqPrice: number
  currency: string
  profitMargin: number
  suggestedMOQ: number
  pricingTiers: Array<{
    quantity: string
    price: number
    discount: number
  }>
  marketAnalysis: {
    averagePrice: number
    lowestPrice: number
    highestPrice: number
    competitiveness: 'high' | 'medium' | 'low'
  }
  recommendations: string[]
}

function analyzeCompetitiveness(
  suggestedPrice: number,
  competitorPrices: number[]
): 'high' | 'medium' | 'low' {
  if (competitorPrices.length === 0) return 'medium'

  const avg = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
  const diff = ((suggestedPrice - avg) / avg) * 100

  if (diff < -10) return 'high'
  if (diff > 10) return 'low'
  return 'medium'
}

function generatePricingTiers(basePrice: number): Array<{quantity: string, price: number, discount: number}> {
  return [
    { quantity: '1-9', price: basePrice, discount: 0 },
    { quantity: '10-49', price: Math.round(basePrice * 0.95 * 100) / 100, discount: 5 },
    { quantity: '50-99', price: Math.round(basePrice * 0.90 * 100) / 100, discount: 10 },
    { quantity: '100-499', price: Math.round(basePrice * 0.85 * 100) / 100, discount: 15 },
    { quantity: '500+', price: Math.round(basePrice * 0.80 * 100) / 100, discount: 20 },
  ]
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let aiIdentity = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const apiKey = authHeader.replace('Bearer ', '')
      aiIdentity = await verifyAIApiKey(apiKey)
    }

    const body: PricingRequest = await request.json()
    const { product, options } = body

    if (!product) {
      return NextResponse.json(
        { error: 'Product information is required' },
        { status: 400 }
      )
    }

    const currency = options?.currency || 'USD'
    const competitorPrices = options?.competitorPrices || []
    const baseCost = product.cost || 10

    await new Promise(resolve => setTimeout(resolve, 1200))

    const costMultiplier = getCostMultiplier(product.category || 'default')
    const marketMultiplier = getMarketMultiplier(product.targetMarket || 'global')

    const baseRetailPrice = Math.round(baseCost * costMultiplier * marketMultiplier * 100) / 100
    const wholesalePrice = Math.round(baseRetailPrice * 0.7 * 100) / 100
    const moqPrice = Math.round(baseRetailPrice * 0.6 * 100) / 100

    const avgCompetitorPrice = competitorPrices.length > 0
      ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
      : baseRetailPrice

    const finalRetailPrice = Math.round(Math.max(baseRetailPrice, avgCompetitorPrice * 0.9) * 100) / 100
    const finalWholesalePrice = Math.round(finalRetailPrice * 0.7 * 100) / 100
    const finalMOQPrice = Math.round(finalRetailPrice * 0.6 * 100) / 100

    const profitMargin = Math.round(((finalRetailPrice - baseCost) / finalRetailPrice) * 100)

    const competitiveness = analyzeCompetitiveness(finalRetailPrice, competitorPrices)

    const recommendations = generateRecommendations(
      competitiveness,
      profitMargin,
      finalRetailPrice,
      avgCompetitorPrice
    )

    const pricingSuggestion: PricingSuggestion = {
      retailPrice: finalRetailPrice,
      wholesalePrice: finalWholesalePrice,
      moqPrice: finalMOQPrice,
      currency,
      profitMargin,
      suggestedMOQ: getSuggestedMOQ(product.category || 'default'),
      pricingTiers: generatePricingTiers(finalRetailPrice),
      marketAnalysis: {
        averagePrice: Math.round(avgCompetitorPrice * 100) / 100,
        lowestPrice: competitorPrices.length > 0 ? Math.min(...competitorPrices) : finalRetailPrice * 0.7,
        highestPrice: competitorPrices.length > 0 ? Math.max(...competitorPrices) : finalRetailPrice * 1.5,
        competitiveness
      },
      recommendations
    }

    return NextResponse.json({
      success: true,
      pricing: pricingSuggestion,
      metadata: {
        analyzedAt: new Date().toISOString(),
        aiPowered: !!aiIdentity,
        factors: {
          costBased: !!product.cost,
          categoryAdjusted: !!product.category,
          marketAdjusted: !!product.targetMarket,
          competitorBased: competitorPrices.length > 0
        }
      }
    })

  } catch (error) {
    console.error('AI Pricing suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to generate pricing suggestion' },
      { status: 500 }
    )
  }
}

function getCostMultiplier(category: string): number {
  const multipliers: Record<string, number> = {
    electronics: 3.5,
    clothing: 4.0,
    machinery: 2.5,
    food: 2.0,
    furniture: 2.8,
    toys: 3.0,
    default: 3.0
  }
  return multipliers[category.toLowerCase()] || multipliers['default']
}

function getMarketMultiplier(targetMarket: string): number {
  const multipliers: Record<string, number> = {
    'usa': 1.2,
    'europe': 1.15,
    'china': 0.7,
    'southeast-asia': 0.8,
    'middle-east': 0.9,
    'africa': 0.85,
    'global': 1.0
  }
  return multipliers[targetMarket.toLowerCase()] || multipliers['global']
}

function getSuggestedMOQ(category: string): number {
  const moqs: Record<string, number> = {
    electronics: 10,
    clothing: 100,
    machinery: 5,
    food: 50,
    furniture: 10,
    toys: 50,
    default: 20
  }
  return moqs[category.toLowerCase()] || moqs['default']
}

function generateRecommendations(
  competitiveness: string,
  profitMargin: number,
  price: number,
  avgCompetitor: number
): string[] {
  const recommendations: string[] = []

  if (profitMargin < 20) {
    recommendations.push('Consider increasing price to improve profit margin')
  } else if (profitMargin > 50) {
    recommendations.push('Your profit margin is excellent. Consider competitive pricing to gain market share')
  }

  if (competitiveness === 'high') {
    recommendations.push('Your pricing is very competitive. Focus on quality and service to differentiate')
  } else if (competitiveness === 'low') {
    recommendations.push('Your price is higher than market average. Highlight unique features to justify premium pricing')
  }

  if (price < avgCompetitor * 0.8) {
    recommendations.push('You may be underpricing. Consider gradual increases to improve perception')
  }

  recommendations.push('Offer bulk discounts to encourage larger orders')
  recommendations.push('Review competitor prices regularly to stay competitive')

  return recommendations
}