'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { assignUserToVariant, trackConversion as trackConv, Experiment } from '@/lib/ab-testing'

/**
 * React Hook for A/B Testing
 * Usage: const { variant, isLoading, trackConversion } = useABTest('experiment-id')
 */
export function useABTest(experimentId: string) {
  const { data: session } = useSession()
  const [variant, setVariant] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true)
        
        // Use user ID or anonymous ID
        const userId = session?.user?.id || getAnonymousId()
        
        if (!userId) {
          setError('No user ID available')
          setIsLoading(false)
          return
        }
        
        // Assign user to variant
        const assignedVariant = await assignUserToVariant(userId, experimentId)
        setVariant(assignedVariant)
      } catch (err) {
        console.error('A/B Test initialization error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    if (experimentId) {
      initialize()
    }
  }, [experimentId, session?.user?.id])

  // Track conversion
  const trackConversion = async (
    eventType: 'page_view' | 'click' | 'conversion' | 'revenue' | 'signup' | 'purchase' = 'conversion',
    value?: number,
    metadata?: Record<string, any>
  ) => {
    if (!variant) return
    
    const userId = session?.user?.id || getAnonymousId()
    
    try {
      await trackConv(userId, experimentId, eventType, value, metadata)
    } catch (err) {
      console.error('Failed to track conversion:', err)
    }
  }

  return { variant, isLoading, error, trackConversion }
}

/**
 * Get or create anonymous user ID
 */
function getAnonymousId(): string {
  let id = localStorage.getItem('anonymous_id')
  
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('anonymous_id', id)
  }
  
  return id
}

/**
 * Higher Order Component for A/B Testing
 * Renders different components based on variant assignment
 */
export function withABTest<P extends object>(
  experimentId: string,
  variants: Record<string, React.ComponentType<P>>
) {
  return function ABTestWrapper(props: P) {
    const { variant, isLoading } = useABTest(experimentId)

    if (isLoading) {
      return <div>Loading...</div>
    }

    if (!variant || !variants[variant]) {
      // Default to first variant if no assignment
      const defaultVariant = Object.keys(variants)[0]
      const Component = variants[defaultVariant]
      return <Component {...props} />
    }

    const Component = variants[variant]
    return <Component {...props} />
  }
}
