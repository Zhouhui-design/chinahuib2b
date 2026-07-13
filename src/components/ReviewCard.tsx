'use client'

import { useState } from 'react'
import { Star, ThumbsUp, ChevronDown, ChevronUp, User } from 'lucide-react'
import type { Review } from '@prisma/client'

interface ReviewCardProps {
  review: Review & {
    user: {
      id: string
      displayName?: string
      avatarUrl?: string
    }
  }
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [helpful, setHelpful] = useState(false)

  const ratingStars = Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-5 h-5 ${
        i < (review.rating as number)
          ? 'text-yellow-400 fill-yellow-400'
          : 'text-gray-300'
      }`}
    />
  ))

  const isLong = review.content.length > 150

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            {review.user.avatarUrl ? (
              <img
                src={review.user.avatarUrl}
                alt={review.user.displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {review.user.displayName || 'Anonymous'}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        {review.isVerified && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Verified
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        {ratingStars}
        <span className="text-sm text-gray-500">({review.rating})</span>
      </div>

      <h3 className="font-bold text-gray-900 mb-2">{review.title}</h3>

      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">
          {isLong && !expanded
            ? `${review.content.slice(0, 150)}...`
            : review.content}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-2 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
          >
            {expanded ? (
              <>
                {review.content.length - 150} more
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                {review.content.length - 150} more
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      {review.images.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
          ))}
        </div>
      )}

      {review.replyContent && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-900 mb-1">
            Seller Response:
          </p>
          <p className="text-gray-700">{review.replyContent}</p>
          <p className="text-xs text-gray-500 mt-1">
            Replied on{' '}
            {review.repliedAt
              ? new Date(review.repliedAt).toLocaleDateString('zh-CN')
              : ''}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={() => {
            setHelpful(!helpful)
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            helpful
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${helpful ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">
            {helpful ? 'Helpful' : 'Helpful?'} ({review.helpfulCount})
          </span>
        </button>
      </div>
    </div>
  )
}