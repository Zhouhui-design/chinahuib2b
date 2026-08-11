import { redis } from './redis'

/**
 * Cache utility functions for Redis
 */

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const

/**
 * Get cached data
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    if (!data) return null
    
    return JSON.parse(data) as T
  } catch (error) {
    console.error(`Cache GET error for key ${key}:`, error)
    return null
  }
}

/**
 * Set cached data with TTL
 */
export async function cacheSet(
  key: string,
  value: any,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<boolean> {
  try {
    const serialized = JSON.stringify(value)
    await redis.setEx(key, ttl, serialized)
    return true
  } catch (error) {
    console.error(`Cache SET error for key ${key}:`, error)
    return false
  }
}

/**
 * Delete cached data
 */
export async function cacheDelete(key: string): Promise<boolean> {
  try {
    await redis.del(key)
    return true
  } catch (error) {
    console.error(`Cache DELETE error for key ${key}:`, error)
    return false
  }
}

/**
 * Delete multiple keys by pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<boolean> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(keys)
    }
    return true
  } catch (error) {
    console.error(`Cache DELETE pattern error for ${pattern}:`, error)
    return false
  }
}

/**
 * Get or set cache (with fallback to fetch function)
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // Try to get from cache
  const cached = await cacheGet<T>(key)
  if (cached !== null) {
    return cached
  }

  // Fetch fresh data
  const data = await fetchFn()
  
  // Cache the result
  await cacheSet(key, data, ttl)
  
  return data
}

/**
 * Cache keys helpers
 */
export const CACHE_KEYS = {
  // Product caches
  product: (id: string) => `product:${id}`,
  productList: (page: number, limit: number, filters?: string) =>
    `products:list:${page}:${limit}${filters ? `:${filters}` : ''}`,
  popularProducts: (days: number = 7) => `products:popular:${days}`,

  // Category caches
  categoryTree: () => 'categories:tree',
  category: (slug: string) => `category:${slug}`,

  // Seller/Store caches
  seller: (id: string) => `seller:${id}`,
  sellerBySlug: (slug: string) => `seller:slug:${slug}`,
  sellerProducts: (sellerId: string) => `seller:${sellerId}:products`,
  storeBrochures: (sellerId: string) => `seller:${sellerId}:brochures`,

  // Booth / Exhibition caches
  booth: (id: string) => `booth:${id}`,
  boothList: (sellerId: string) => `booths:list:${sellerId}`,
  exhibition: (id: string) => `exhibition:${id}`,

  // User session caches
  userSession: (userId: string) => `session:${userId}`,
  userCart: (userId: string) => `cart:${userId}`,

  // Analytics caches
  productViews: (productId: string) => `analytics:views:${productId}`,
  dailyStats: (date: string) => `stats:daily:${date}`,
} as const

/**
 * Invalidate related caches when a product changes.
 * Also clears seller caches because store pages embed product lists
 * (store/[slug] page shows latest products from the seller).
 */
export async function invalidateProductCaches(productId: string, sellerId?: string) {
  const tasks: Promise<boolean>[] = [
    cacheDelete(CACHE_KEYS.product(productId)),
    cacheDeletePattern('products:list:*'),
    cacheDeletePattern('products:popular:*'),
  ]
  if (sellerId) {
    // Product changes affect the seller's store page (it shows latest products)
    tasks.push(cacheDelete(CACHE_KEYS.sellerProducts(sellerId)))
    tasks.push(cacheDeletePattern('seller:slug:*'))
  }
  await Promise.all(tasks)
}

/**
 * Invalidate all caches related to a seller / store.
 * Call this whenever SellerProfile fields change (logoUrl, bannerUrl,
 * companyPhotos, teamPhotos, verificationFiles, etc.) or when
 * booth/product data owned by this seller changes.
 */
export async function invalidateSellerCaches(sellerId: string, storeSlug?: string) {
  const tasks: Promise<boolean>[] = [
    cacheDelete(CACHE_KEYS.seller(sellerId)),
    cacheDelete(CACHE_KEYS.sellerProducts(sellerId)),
    cacheDelete(CACHE_KEYS.storeBrochures(sellerId)),
    // Booth list for this seller
    cacheDelete(CACHE_KEYS.boothList(sellerId)),
  ]
  // Also invalidate the slug-keyed cache so a renamed slug stops serving stale data
  if (storeSlug) {
    tasks.push(cacheDelete(CACHE_KEYS.sellerBySlug(storeSlug)))
  }
  // Slug renames can leave old-slug cache entries; clear them all defensively.
  // This is the key fix: store/[slug] page uses seller:slug:* keys with 24h TTL,
  // so without this, image fixes won't show up until the cache expires naturally.
  tasks.push(cacheDeletePattern('seller:slug:*'))
  await Promise.all(tasks)
}

/**
 * Invalidate caches related to a booth / exhibition.
 * Call this when a booth's logoUrl, bannerUrl, or product list changes.
 */
export async function invalidateBoothCaches(boothId: string, sellerId?: string) {
  const tasks: Promise<boolean>[] = [
    cacheDelete(CACHE_KEYS.booth(boothId)),
    cacheDelete(CACHE_KEYS.exhibition(boothId)),
    cacheDeletePattern('booths:list:*'),
  ]
  if (sellerId) {
    // Booth changes affect the seller's store page (it lists booths)
    tasks.push(cacheDelete(CACHE_KEYS.boothList(sellerId)))
    tasks.push(cacheDeletePattern('seller:slug:*'))
  }
  await Promise.all(tasks)
}

/**
 * Nuclear option: clear ALL image-related caches.
 * Use this when running database-wide image reference fixes (e.g. the
 * scan-missing-image-refs.sh script) to ensure every store page picks up
 * the corrected data immediately.
 */
export async function invalidateAllImageCaches() {
  await Promise.all([
    cacheDeletePattern('seller:*'),
    cacheDeletePattern('booth:*'),
    cacheDeletePattern('booths:*'),
    cacheDeletePattern('exhibition:*'),
    cacheDeletePattern('product:*'),
    cacheDeletePattern('products:*'),
  ])
}

export async function invalidateCategoryCaches() {
  await Promise.all([
    cacheDelete(CACHE_KEYS.categoryTree()),
    cacheDeletePattern('categories:tree:*'),
    cacheDeletePattern('category:*'),
  ])
}

/**
 * Track product views with Redis (for popular products)
 */
export async function trackProductView(productId: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const key = `views:${productId}:${today}`
    
    // Increment view count
    await redis.incr(key)
    
    // Set expiry to 7 days
    await redis.expire(key, 7 * 86400)
    
    // Also increment total views
    await redis.incr(`views:total:${productId}`)
  } catch (error) {
    console.error('Track view error:', error)
  }
}

/**
 * Get popular products based on view count
 */
export async function getPopularProducts(days: number = 7, limit: number = 10): Promise<string[]> {
  try {
    const keys: string[] = []
    const now = new Date()
    
    // Collect view keys for the past N days
    for (let i = 0; i < days; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      keys.push(`views:*:${dateStr}`)
    }
    
    // This is a simplified version - in production, use Redis sorted sets
    const allKeys = await Promise.all(
      keys.map(pattern => redis.keys(pattern))
    )
    
    // Flatten and get unique product IDs
    const productIds = new Set<string>()
    allKeys.flat().forEach(key => {
      const parts = key.split(':')
      if (parts.length >= 2 && parts[1]) {
        productIds.add(parts[1])
      }
    })
    
    return Array.from(productIds).slice(0, limit)
  } catch (error) {
    console.error('Get popular products error:', error)
    return []
  }
}

/**
 * Cache user session data
 */
export async function cacheUserSession(userId: string, data: any, ttl: number = CACHE_TTL.LONG) {
  return cacheSet(CACHE_KEYS.userSession(userId), data, ttl)
}

export async function getUserSession(userId: string) {
  return cacheGet(CACHE_KEYS.userSession(userId))
}

export async function clearUserSession(userId: string) {
  return cacheDelete(CACHE_KEYS.userSession(userId))
}

/**
 * Rate limiting with Redis
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowSeconds: number = 3600
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const key = `ratelimit:${identifier}`
    const current = await redis.incr(key)
    
    // Set expiry on first request
    if (current === 1) {
      await redis.expire(key, windowSeconds)
    }
    
    const remaining = Math.max(0, maxRequests - current)
    
    return {
      allowed: current <= maxRequests,
      remaining,
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    return { allowed: true, remaining: 0 } // Fail open
  }
}
