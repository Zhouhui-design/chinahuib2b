'use client'

import { useState } from 'react'
import { Package } from 'lucide-react'

/**
 * Banner image shown at top of store detail page.
 */
export function StoreBanner(props: {
  src: string
  companyName: string
}) {
  const [error, setError] = useState(false)
  if (!props.src || error) return null
  return (
    <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden mb-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={props.src}
        alt={props.companyName}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}

/**
 * Company logo shown next to company name.
 */
export function StoreLogo(props: {
  src: string
  companyName: string
}) {
  const [error, setError] = useState(false)
  if (!props.src || error) return null
  return (
    <div className="w-20 h-20 relative rounded-lg overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={props.src}
        alt={props.companyName}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}

export interface StoreProductCardImageProps {
  mainImageUrl: string
  title: string
  titleEn?: string | null
  locale: string
}

/**
 * Product card image used inside the "Latest Products" grid on store page.
 * Uses native <img> for reliability — next/image fill mode can produce 0-height
 * elements when the parent container sizing is computed by CSS (aspect-ratio).
 */
export function StoreProductCardImage(props: StoreProductCardImageProps) {
  const [error, setError] = useState(false)
  const alt = props.locale === 'zh' ? props.title : (props.titleEn || props.title)

  // If no valid image URL or load failed, show a placeholder
  if (!props.mainImageUrl || error) {
    return (
      <div className="aspect-square bg-gray-100 relative flex items-center justify-center">
        <Package className="w-8 h-8 text-gray-300" />
      </div>
    )
  }
  return (
    <div className="aspect-square bg-gray-100 relative overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={props.mainImageUrl}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setError(true)}
      />
    </div>
  )
}
