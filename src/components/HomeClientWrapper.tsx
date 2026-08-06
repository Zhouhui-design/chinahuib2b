'use client'

import { usePageViewTracker } from '@/hooks/useBehaviorTracker'
import RecommendedProducts from '@/components/recommendations/RecommendedProducts'

interface HomeClientWrapperProps {
  userId: string | null
  locale: string
}

export default function HomeClientWrapper({ userId, locale }: HomeClientWrapperProps) {
  usePageViewTracker(userId, 'home')

  return (
    <>
      {userId && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
          <RecommendedProducts
            userId={userId}
            limit={8}
            title="Recommended for You"
          />
        </section>
      )}
    </>
  )
}
