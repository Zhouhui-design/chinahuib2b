/**
 * Performance optimization utilities
 */

import { lazy, Suspense, useState, useEffect } from 'react'

/**
 * Lazy load a component with automatic code splitting
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc)
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <div className="animate-pulse bg-gray-200 h-48 rounded"></div>}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Check if user has slow connection
 */
export function isSlowConnection(): boolean {
  if (typeof window === 'undefined') return false
  
  const connection = (navigator as any).connection
  if (!connection) return false
  
  // Save-Data header or slow effective type
  return connection.saveData === true || 
         ['slow-2g', '2g', '3g'].includes(connection.effectiveType)
}

/**
 * Get optimal image quality based on connection
 */
export function getOptimalImageQuality(): number {
  if (isSlowConnection()) {
    return 60 // Lower quality for slow connections
  }
  return 80 // Default quality
}

/**
 * Preload critical resources
 */
export function preloadResource(url: string, as: 'image' | 'script' | 'style' | 'font') {
  if (typeof document === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = url
  
  if (as === 'font') {
    link.crossOrigin = 'anonymous'
  }
  
  document.head.appendChild(link)
}

/**
 * Prefetch page for faster navigation
 */
export function prefetchPage(path: string) {
  if (typeof window === 'undefined') return
  
  // Use Next.js router prefetch if available
  const router = (window as any).__NEXT_ROUTER__
  if (router && router.prefetch) {
    router.prefetch(path)
  }
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = { threshold: 0.1 }
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [ref, setRef] = useState<Element | null>(null)
  
  useEffect(() => {
    if (!ref) return
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)
    
    observer.observe(ref)
    
    return () => observer.disconnect()
  }, [ref, options])
  
  return { ref: setRef, isIntersecting }
}
