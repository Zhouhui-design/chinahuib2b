'use client'

import { useEffect } from 'react'

interface VisitorTrackerProps {
  productId: string
  sellerId: string
}

export default function VisitorTracker({ productId, sellerId }: VisitorTrackerProps) {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        await fetch('/api/visitors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId, sellerId }),
          credentials: 'include',
        })
      } catch (error) {
        console.error('Visitor tracking failed:', error)
      }
    }

    const timer = setTimeout(trackVisitor, 2000)

    return () => clearTimeout(timer)
  }, [productId, sellerId])

  return null
}
