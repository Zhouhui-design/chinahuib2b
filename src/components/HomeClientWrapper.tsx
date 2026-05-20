/**
 * Home Page Client Wrapper
 * Handles client-side features like behavior tracking and recommendations
 */

'use client'

import { useEffect } from 'react'
import { useBehaviorTracker, usePageViewTracker } from '@/hooks/useBehaviorTracker'
import RecommendedProducts from '@/components/recommendations/RecommendedProducts'

interface HomeClientWrapperProps {
  userId: string | null
  locale: string
}

export default function HomeClientWrapper({ userId, locale }: HomeClientWrapperProps) {
  // Auto track page view
  usePageViewTracker(userId, 'home')
  
  const { trackProductView, trackSellerView } = useBehaviorTracker(userId)

  return (
    <>
      {/* AI Recommendations Section */}
      {userId && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
          <RecommendedProducts 
            userId={userId} 
            limit={8}
            title="Recommended for You"
          />
        </section>
      )}

      {/* Track interactions on product/seller clicks */}
      <div className="hidden" data-behavior-tracker
        data-track-product={(productId: string) => trackProductView(productId)}
        data-track-seller={(sellerId: string) => trackSellerView(sellerId)}
      />
    </>
  )
}
