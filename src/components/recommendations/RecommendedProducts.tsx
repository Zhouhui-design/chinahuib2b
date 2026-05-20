/**
 * Recommended Products Component
 * Displays AI-powered product recommendations
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Recommendation {
  itemId: string
  score: number
  reason: string
  type: 'product' | 'seller' | 'category'
}

interface RecommendedProductsProps {
  userId: string | null
  limit?: number
  title?: string
}

export default function RecommendedProducts({ 
  userId, 
  limit = 8,
  title = 'Recommended for You'
}: RecommendedProductsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchRecommendations()
    } else {
      setLoading(false)
    }
  }, [userId])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/recommendations/products?userId=${userId}&limit=${limit}`
      )
      const data = await response.json()
      
      if (data.success) {
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error('[RecommendedProducts] Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!userId) {
    return null
  }

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">{title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded mb-4"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <span className="text-sm text-gray-500">
            Powered by AI ✨
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommendations.map((rec, index) => (
            <Link
              key={rec.itemId}
              href={`/products/${rec.itemId}`}
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={`/images/products/${rec.itemId}.jpg`}
                  alt={`Product ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    // Fallback to placeholder
                    e.currentTarget.src = '/images/placeholder-product.png'
                  }}
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-sm mb-2 line-clamp-2">
                  Product {index + 1}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-bold">
                    $ {(Math.random() * 100 + 10).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {rec.reason}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={fetchRecommendations}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Recommendations
          </button>
        </div>
      </div>
    </section>
  )
}
