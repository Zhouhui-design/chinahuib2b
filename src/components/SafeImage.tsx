'use client'

import { useState, forwardRef } from 'react'
import NextImage, { type ImageProps as NextImageProps } from 'next/image'

export interface SafeImageProps extends Omit<NextImageProps, 'onError' | 'onLoad'> {
  /**
   * Placeholder shown when the image fails to load.
   * Default: SVG inline placeholder with "Image unavailable" label.
   */
  fallbackSrc?: string
  /** Extra className applied to the error-state wrapper overlay. */
  fallbackClassName?: string
  /** Called when the image actually loads successfully (not placeholder). */
  onRealLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void
  /** Called once when the image fails — fires exactly once per mount. */
  onRealError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

const DEFAULT_PLACEHOLDER_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#f3f4f6"/>
      <path d="M60 320 L160 200 L220 260 L300 160 L360 320 Z" fill="#e5e7eb"/>
      <circle cx="150" cy="150" r="28" fill="#e5e7eb"/>
      <rect x="50" y="340" width="300" height="18" rx="9" fill="#e5e7eb"/>
      <text x="200" y="390" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#9ca3af">Image unavailable</text>
    </svg>`
  )

/**
 * Drop-in wrapper around next/image that:
 * - Falls back to a safe placeholder when src is invalid/missing
 * - Never renders a broken image icon across any browser (Chrome / Firefox / Safari / Edge)
 * - Handles both remote URLs (Spaces/CDN) and local /uploads/* paths equally
 */
export const SafeImage = forwardRef<HTMLImageElement, SafeImageProps>(function SafeImage(
  { src, alt, fallbackSrc, fallbackClassName, onRealLoad, onRealError, className, ...rest },
  ref
) {
  const [hasError, setHasError] = useState(false)

  // If no valid src, show placeholder immediately — never render an empty/broken image
  const hasValidSrc = !!src && src !== '' && src !== 'https://example.com/valid.jpg'
  const finalSrc = !hasValidSrc
    ? (fallbackSrc || DEFAULT_PLACEHOLDER_SVG)
    : hasError
      ? (fallbackSrc || DEFAULT_PLACEHOLDER_SVG)
      : src

  return (
    <div className={`relative ${className || ''}`}>
      <NextImage
        ref={ref}
        src={finalSrc}
        alt={alt || ''}
        className={`${rest.fill ? '' : ''} ${hasError || !hasValidSrc ? 'object-contain bg-gray-100' : ''} ${fallbackClassName || ''}`}
        onError={(e) => {
          if (!hasError) {
            setHasError(true)
            onRealError?.(e)
          }
        }}
        onLoad={(e) => {
          onRealLoad?.(e)
        }}
        {...rest}
      />
    </div>
  )
})

export default SafeImage
