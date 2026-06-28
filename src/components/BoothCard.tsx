'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { LanguageCode } from '@/lib/languages'

interface Booth {
  id: string
  name: string
  names?: { [key: string]: string }
  exhibitionName: string
  exhibitionDates?: { start: string; end: string }
  location?: string
  logoUrl?: string
  bannerUrl?: string
  keywords?: string[]
  theme?: string
  layout?: string
  isActive: boolean
  isPublished: boolean
  createdAt: string
  seller: {
    id: string
    companyName: string
    country: string
    city: string
    logoUrl?: string
  }
  products: {
    id: string
    title: string
    mainImageUrl: string
    images: string[]
  }[]
}

export default function BoothCard({ booth, locale }: { booth: Booth; locale: LanguageCode }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const productImages = booth.products.slice(0, 10).flatMap(p => [p.mainImageUrl, ...p.images]).slice(0, 10)
  const currentImage = productImages[currentImageIndex] || ''

  const handlePrev = () => {
    setCurrentImageIndex(prev => prev === 0 ? (productImages.length - 1) : prev - 1)
  }

  const handleNext = () => {
    setCurrentImageIndex(prev => prev === (productImages.length - 1) ? 0 : prev + 1)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer">
      <div className="relative h-32 overflow-hidden">
        {booth.bannerUrl ? (
          <img
            src={booth.bannerUrl}
            alt="Booth Banner"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center">
            <span className="text-white text-lg font-semibold">{booth.exhibitionName}</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-3">
          {booth.logoUrl ? (
            <img
              src={booth.logoUrl}
              alt="Logo"
              className="h-12 w-12 rounded-lg object-contain bg-white p-1 shadow-lg"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-white p-2 shadow-lg flex items-center justify-center">
              <span className="text-xl">🏢</span>
            </div>
          )}
          <div>
            <h3 className="text-white font-semibold text-sm drop-shadow-lg line-clamp-1">{booth.name}</h3>
            <p className="text-blue-100 text-xs drop-shadow">{booth.seller.companyName}</p>
          </div>
        </div>
      </div>

      <div className="relative h-48 bg-gray-50">
        {productImages.length > 0 ? (
          <img
            src={currentImage}
            alt="Product"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>No images available</span>
          </div>
        )}
        
        {productImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {productImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {currentImageIndex + 1} / {productImages.length}
          </div>
        )}
      </div>

      {productImages.length > 1 && productImages.length <= 5 && (
        <div className="flex gap-1 p-2 bg-gray-100">
          {productImages.map((img, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
              className={`flex-1 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                index === currentImageIndex ? 'border-blue-500' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{booth.seller.city}, {booth.seller.country}</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{booth.products.length} Products</span>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{booth.exhibitionName}</p>
        
        {booth.keywords && booth.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {booth.keywords.slice(0, 3).map((keyword, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <Link
          href={`/exhibitions/${booth.id}`}
          className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold text-center transition-all duration-300 transform group-hover:scale-[1.02]"
        >
          View Booth
        </Link>
      </div>
    </div>
  )
}