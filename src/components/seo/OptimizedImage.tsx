'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface OptimizedImageProps {
  src: string
  webpSrc?: string
  alt?: string
  width?: number | string
  height?: number | string
  className?: string
  quality?: number
  priority?: boolean
  aspectRatio?: string
  fallbackSrc?: string
  onLoad?: () => void
  onError?: () => void
  [key: string]: any
}

export default function OptimizedImage({ 
  src, 
  webpSrc,
  alt = '',
  width,
  height,
  className = '',
  quality = 80,
  priority = false,
  aspectRatio,
  fallbackSrc,
  onLoad,
  onError,
  ...props 
}: OptimizedImageProps) {
  const [supportsWebP, setSupportsWebP] = useState(true)
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      setSupportsWebP(true)
    } else {
      setSupportsWebP(false)
    }
  }, [])

  useEffect(() => {
    if (!webpSrc && supportsWebP) {
      const webpVersion = src.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      if (webpVersion !== src) {
        setImageSrc(webpVersion)
      }
    } else if (webpSrc && supportsWebP) {
      setImageSrc(webpSrc)
    }
  }, [src, webpSrc, supportsWebP])

  useEffect(() => {
    if (priority) {
      setIsInView(true)
      return
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observerRef.current?.disconnect()
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.01,
      }
    )

    const img = imgRef.current
    if (img) {
      observerRef.current.observe(img)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [priority])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
    
    if (fallbackSrc) {
      setImageSrc(fallbackSrc)
    } else if (imageSrc !== src) {
      setImageSrc(src)
    }
  }, [fallbackSrc, imageSrc, src, onError])

  const loading = priority ? 'eager' : 'lazy'

  const baseStyle = aspectRatio 
    ? `aspect-[${aspectRatio}] object-cover` 
    : ''

  return (
    <div className={`relative overflow-hidden ${baseStyle}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}
      
      <div
        className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      >
        <img
          ref={imgRef}
          src={isInView ? imageSrc : ''}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full ${baseStyle} ${className}`}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </div>

      {hasError && !fallbackSrc && imageSrc === src && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  )
}