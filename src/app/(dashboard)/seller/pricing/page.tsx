'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Target,
  RefreshCw,
  Check,
  AlertTriangle,
  Zap,
  ShoppingCart
} from 'lucide-react'

interface PricingRecommendation {
  productId: string
  currentPrice: number
  suggestedPrice: number
  reason: string
  confidence: number
  marketData: {
    avgPrice: number
    minPrice: number
    maxPrice: number
    competitorCount: number
    priceRange: string
    trend: 'up' | 'down' | 'stable'
  }
}

export default function PricingDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<PricingRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [appliedPrice, setAppliedPrice] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'SELLER')) {
      router.push('/auth/login')
    }
  }, [session, status, router])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/seller/pricing')
      const result = await response.json()

      if (result.success) {
        setRecommendations(result.recommendations)
      }
    } catch (error) {
      console.error('Failed to fetch pricing recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'SELLER') {
      fetchRecommendations()
    }
  }, [status, session])

  const applyPrice = async (productId: string, newPrice: number) => {
    try {
      const response = await fetch('/api/seller/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, newPrice })
      })

      const result = await response.json()

      if (result.success) {
        setAppliedPrice(productId)
        setTimeout(() => setAppliedPrice(null), 3000)
        fetchRecommendations()
      }
    } catch (error) {
      console.error('Failed to apply price:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing market prices...</p>
        </div>
      </div>
    )
  }

  const needsAdjustment = recommendations.filter(r => r.suggestedPrice !== r.currentPrice)
  const optimized = recommendations.filter(r => r.suggestedPrice === r.currentPrice)

  const getStatusColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100'
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'Upward'
      case 'down':
        return 'Downward'
      default:
        return 'Stable'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">💰 Smart Pricing</h1>
          <p className="text-sm text-gray-500 mt-1">
            AI-powered pricing recommendations based on market analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Need Adjustment</p>
                <p className="text-2xl font-bold text-orange-600">{needsAdjustment.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Optimized</p>
                <p className="text-2xl font-bold text-green-600">{optimized.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pricing Recommendations</h2>
              <button
                onClick={fetchRecommendations}
                className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="divide-y">
            {recommendations.map((rec) => (
              <div key={rec.productId} className="p-6 hover:bg-gray-50 transition">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="font-semibold text-gray-900">Product #{rec.productId.slice(-8)}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rec.confidence)}`}>
                        {rec.confidence}% Confidence
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Current Price</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${rec.currentPrice.toFixed(2)}
                        </p>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Suggested Price</p>
                        <p className="text-lg font-bold text-blue-600">
                          ${rec.suggestedPrice.toFixed(2)}
                        </p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Market Average</p>
                        <p className="text-lg font-semibold text-gray-700">
                          ${rec.marketData.avgPrice.toFixed(2)}
                        </p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Competitors</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-gray-700">{rec.marketData.competitorCount}</span>
                          {getTrendIcon(rec.marketData.trend)}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{rec.reason}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Price Range: ${rec.marketData.priceRange}</span>
                      <span>Trend: {getTrendLabel(rec.marketData.trend)}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {rec.currentPrice !== rec.suggestedPrice && (
                      <button
                        onClick={() => applyPrice(rec.productId, rec.suggestedPrice)}
                        disabled={appliedPrice === rec.productId}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                          appliedPrice === rec.productId
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {appliedPrice === rec.productId ? (
                          <>
                            <Check className="w-5 h-5" />
                            Applied!
                          </>
                        ) : (
                          <>
                            <Target className="w-5 h-5" />
                            Apply ${rec.suggestedPrice.toFixed(2)}
                          </>
                        )}
                      </button>
                    )}
                    {rec.currentPrice === rec.suggestedPrice && (
                      <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg">
                        <Zap className="w-5 h-5" />
                        Optimized!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recommendations.length === 0 && (
            <div className="p-12 text-center">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No pricing recommendations available</p>
              <p className="text-sm text-gray-400 mt-2">Add some products to get started</p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">1</span>
              <div>
                <p className="font-medium text-blue-900">Market Analysis</p>
                <p className="text-sm text-blue-700">We analyze prices of similar products across the platform</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">2</span>
              <div>
                <p className="font-medium text-blue-900">Trend Detection</p>
                <p className="text-sm text-blue-700">We track price trends to predict market movements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">3</span>
              <div>
                <p className="font-medium text-blue-900">Smart Recommendations</p>
                <p className="text-sm text-blue-700">AI generates optimal pricing suggestions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
