'use client'

import { useState, useEffect } from 'react'
import { Star, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import ReviewCard from './ReviewCard'
import type { Review } from '@prisma/client'

interface ReviewListProps {
  productId?: string
  sellerId?: string
}

interface ReviewData {
  reviews: (Review & {
    user: {
      id: string
      displayName?: string
      avatarUrl?: string
    }
  })[]
  total: number
  averageRating: number
  ratingCounts: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export default function ReviewList({ productId, sellerId }: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewData>({
    reviews: [],
    total: 0,
    averageRating: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(5)

  useEffect(() => {
    fetchReviews()
  }, [filterRating, page])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (productId) params.set('productId', productId)
      if (sellerId) params.set('sellerId', sellerId)
      if (filterRating) params.set('rating', filterRating.toString())
      params.set('page', page.toString())
      params.set('limit', limit.toString())

      const res = await fetch(`/api/reviews?${params}`)
      const data = await res.json()
      setReviews(data)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(reviews.total / limit)

  const ratingPercentages = {
    5: Math.round((reviews.ratingCounts[5] / reviews.total) * 100) || 0,
    4: Math.round((reviews.ratingCounts[4] / reviews.total) * 100) || 0,
    3: Math.round((reviews.ratingCounts[3] / reviews.total) * 100) || 0,
    2: Math.round((reviews.ratingCounts[2] / reviews.total) * 100) || 0,
    1: Math.round((reviews.ratingCounts[1] / reviews.total) * 100) || 0,
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <p className="text-gray-500 mt-1">
              {reviews.total} reviews - Average rating{' '}
              <span className="font-bold text-gray-900">{reviews.averageRating.toFixed(1)}</span>
            </p>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${
                  i < Math.floor(reviews.averageRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats & Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Rating Distribution */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${ratingPercentages[rating as keyof typeof ratingPercentages]}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {ratingPercentages[rating as keyof typeof ratingPercentages]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter */}
            <div className="flex-shrink-0">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter by Rating
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterRating(null)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filterRating === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(rating)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1 ${
                      filterRating === rating
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {rating}
                    <Star className={`w-4 h-4 ${filterRating === rating ? 'fill-white' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}