'use client'

import { useState, useEffect } from 'react'

interface OptimizedImageProps {
  src: string
  webpSrc?: string
  alt?: string
  width?: number | string
  height?: number | string
  className?: string
  quality?: number
  priority?: boolean
  [key: string]: any
}

/**
 * OptimizedImage - 自动 WebP 转换 + 懒加载图片组件
 */
export default function OptimizedImage({ 
  src, 
  webpSrc,
  alt = '',
  width,
  height,
  className = '',
  quality = 80,
  priority = false,
  ...props 
}: OptimizedImageProps) {
  const [supportsWebP, setSupportsWebP] = useState(true)
  const [imageSrc, setImageSrc] = useState(src)

  useEffect(() => {
    // 检测 WebP 支持
    const canvas = document.createElement('canvas')
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      setSupportsWebP(true)
      if (webpSrc) {
        setImageSrc(webpSrc)
      }
    } else {
      setSupportsWebP(false)
    }
  }, [webpSrc])

  // 自动尝试将 .jpg/.png 转换为 .webp
  useEffect(() => {
    if (!webpSrc && supportsWebP) {
      const webpVersion = src.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      if (webpVersion !== src) {
        setImageSrc(webpVersion)
      }
    }
  }, [src, webpSrc, supportsWebP])

  const loading = priority ? 'eager' : 'lazy'

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      {...props}
    />
  )
}
