/**
 * React Hook for tracking user behavior
 * Automatically tracks page views, product clicks, etc.
 */

import { useEffect, useCallback } from 'react';

export function useBehaviorTracker(userId: string | null) {
  /**
   * Track a user behavior event
   */
  const trackBehavior = useCallback(async (
    action: 'view' | 'inquiry' | 'favorite' | 'purchase',
    options?: {
      productId?: string;
      sellerId?: string;
      categoryId?: string;
      duration?: number;
    }
  ) => {
    if (!userId) return;

    try {
      await fetch('/api/recommendations/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          action,
          ...options,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('[Behavior Tracker] Failed to track:', error);
    }
  }, [userId]);

  /**
   * Track product view
   */
  const trackProductView = useCallback((productId: string, duration?: number) => {
    trackBehavior('view', { productId, ...(duration !== undefined && { duration }) });
  }, [trackBehavior]);

  /**
   * Track product inquiry
   */
  const trackProductInquiry = useCallback((productId: string) => {
    trackBehavior('inquiry', { productId });
  }, [trackBehavior]);

  /**
   * Track product favorite
   */
  const trackProductFavorite = useCallback((productId: string) => {
    trackBehavior('favorite', { productId });
  }, [trackBehavior]);

  /**
   * Track purchase
   */
  const trackPurchase = useCallback((productId: string) => {
    trackBehavior('purchase', { productId });
  }, [trackBehavior]);

  /**
   * Track seller view
   */
  const trackSellerView = useCallback((sellerId: string) => {
    trackBehavior('view', { sellerId });
  }, [trackBehavior]);

  /**
   * Track category view
   */
  const trackCategoryView = useCallback((categoryId: string) => {
    trackBehavior('view', { categoryId });
  }, [trackBehavior]);

  return {
    trackBehavior,
    trackProductView,
    trackProductInquiry,
    trackProductFavorite,
    trackPurchase,
    trackSellerView,
    trackCategoryView
  };
}

/**
 * Auto-track page views
 */
export function usePageViewTracker(userId: string | null, pageName: string) {
  const { trackBehavior } = useBehaviorTracker(userId);

  useEffect(() => {
    if (userId && pageName) {
      // Track page view with small delay to ensure page loaded
      const timer = setTimeout(() => {
        trackBehavior('view');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [userId, pageName, trackBehavior]);
}
