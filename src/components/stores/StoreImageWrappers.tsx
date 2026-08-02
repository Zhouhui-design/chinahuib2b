'use client'

import SafeImage from '@/components/SafeImage'

/**
 * Banner image shown at top of store detail page.
 * Wrapped client-side so SafeImage's onError fallback fires in every browser.
 */
export function StoreBanner(props: {
  src: string
  companyName: string
}) {
  if (!props.src) return null
  return (
    <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden mb-8">
      <SafeImage
        src={props.src}
        alt={props.companyName}
        fill
        className="object-cover"
        sizes="100vw"
        priority
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
  if (!props.src) return null
  return (
    <div className="w-20 h-20 relative rounded-lg overflow-hidden">
      <SafeImage
        src={props.src}
        alt={props.companyName}
        fill
        className="object-cover"
        sizes="80px"
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
 */
export function StoreProductCardImage(props: StoreProductCardImageProps) {
  const alt = props.locale === 'zh' ? props.title : (props.titleEn || props.title)
  return (
    <div className="aspect-square bg-gray-100 relative">
      <SafeImage
        src={props.mainImageUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes="300px"
        loading="lazy"
      />
    </div>
  )
}
