/**
 * Product Detail Page Client Component
 * Integrates AI recommendations and behavior tracking
 */

'use client'

import { useEffect, useState } from 'react'
import { useBehaviorTracker, usePageViewTracker } from '@/hooks/useBehaviorTracker'
import RecommendedProducts from '@/components/recommendations/RecommendedProducts'

interface ProductDetailClientProps {
  productId: string
  userId: string | null
  locale: string
}

export default function ProductDetailClient({ 
  productId, 
  userId, 
  locale 
}: ProductDetailClientProps) {
  const [viewDuration, setViewDuration] = useState(0)
  
  // Auto track page view
  usePageViewTracker(userId, `product-${productId}`)
  
  const { trackProductView, trackProductInquiry, trackProductFavorite } = useBehaviorTracker(userId)

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        await fetch('/api/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
          keepalive: true
        })
      } catch (error) {
        console.error('[Visitor Tracker] Failed to track:', error)
      }
    }

    trackVisitor()
  }, [productId])

  useEffect(() => {
    if (!userId || !productId) return

    const interval = setInterval(() => {
      setViewDuration(prev => prev + 1)
    }, 1000)

    return () => {
      if (viewDuration > 5) {
        trackProductView(productId, viewDuration)
      }
      clearInterval(interval)
    }
  }, [userId, productId, viewDuration, trackProductView])

  // Handler functions for user actions
  const handleInquiry = () => {
    trackProductInquiry(productId)
    // ... inquiry logic
  }

  const handleFavorite = () => {
    trackProductFavorite(productId)
    // ... favorite logic
  }

  return (
    <>
      {/* Action buttons with tracking */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleInquiry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold transition-colors"
        >
          Send Inquiry
        </button>
        <button
          onClick={handleFavorite}
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-semibold transition-colors"
        >
          Add to Favorites
        </button>
      </div>

      {/* AI Recommendations - Similar Products */}
      {userId && (
        <section className="mt-16 pt-12 border-t border-gray-200">
          <RecommendedProducts 
            userId={userId} 
            limit={6}
            title="You May Also Like"
          />
        </section>
      )}
    </>
  )
}
