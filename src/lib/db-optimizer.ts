/**
 * Database Query Optimization Utilities
 */

import { prisma } from './db'

// Query performance tracking
interface QueryMetrics {
  query: string
  duration: number
  timestamp: Date
  slow: boolean
}

const SLOW_QUERY_THRESHOLD = 100 // ms
const queryMetrics: QueryMetrics[] = []

/**
 * Execute a query with performance monitoring
 */
export async function monitoredQuery<T>(
  name: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = Date.now()
  
  try {
    const result = await queryFn()
    const duration = Date.now() - start
    
    // Track metrics
    const metric: QueryMetrics = {
      query: name,
      duration,
      timestamp: new Date(),
      slow: duration > SLOW_QUERY_THRESHOLD,
    }
    
    queryMetrics.push(metric)
    
    // Keep only last 1000 metrics
    if (queryMetrics.length > 1000) {
      queryMetrics.shift()
    }
    
    // Log slow queries
    if (metric.slow) {
      console.warn(`⚠️ Slow query detected: ${name} took ${duration}ms`)
    }
    
    return result
  } catch (error) {
    const duration = Date.now() - start
    console.error(`❌ Query failed: ${name} (${duration}ms)`, error)
    throw error
  }
}

/**
 * Get query performance metrics
 */
export function getQueryMetrics(filter?: { slowOnly?: boolean; limit?: number }) {
  let metrics = queryMetrics
  
  if (filter?.slowOnly) {
    metrics = metrics.filter(m => m.slow)
  }
  
  const limit = filter?.limit || 50
  return metrics.slice(-limit).reverse()
}

/**
 * Reset query metrics
 */
export function resetQueryMetrics() {
  queryMetrics.length = 0
}

/**
 * Optimized product listing with pagination
 */
export async function getProductsOptimized(params: {
  page?: number
  limit?: number
  categoryId?: string
  sellerId?: string
  featured?: boolean
  search?: string
}) {
  const {
    page = 1,
    limit = 20,
    categoryId,
    sellerId,
    featured,
    search,
  } = params
  
  const skip = (page - 1) * limit
  
  return monitoredQuery('getProductsOptimized', async () => {
    const where: any = {
      isActive: true,
    }
    
    if (categoryId) where.categoryId = categoryId
    if (sellerId) where.sellerId = sellerId
    if (featured) where.isFeatured = true
    
    // Full-text search on title
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          },
          seller: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
              country: true,
            }
          }
        }
      }),
      prisma.product.count({ where })
    ])
    
    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }
  })
}

/**
 * Optimized seller profile with products
 */
export async function getSellerWithProducts(sellerId: string) {
  return monitoredQuery('getSellerWithProducts', async () => {
    const seller = await prisma.sellerProfile.findUnique({
      where: { id: sellerId, isActive: true },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 12, // Limit to prevent large payloads
          include: {
            category: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        storeBrochures: {
          orderBy: { sortOrder: 'asc' },
          take: 10
        }
      }
    })
    
    return seller
  })
}

/**
 * Get popular products by view count
 */
export async function getPopularProducts(limit: number = 10) {
  return monitoredQuery('getPopularProducts', async () => {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { viewCount: 'desc' },
      take: limit,
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        seller: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
          }
        }
      }
    })
    
    return products
  })
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit: number = 10) {
  return monitoredQuery('getFeaturedProducts', async () => {
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        seller: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
          }
        }
      }
    })
    
    return products
  })
}

/**
 * Increment product view count (optimized with self-view check)
 */
export async function incrementProductView(productId: string, viewerId?: string | null, sellerId?: string | null) {
  return monitoredQuery('incrementProductView', async () => {
    // Skip if this is a self-view
    if (viewerId && sellerId) {
      const seller = await prisma.sellerProfile.findUnique({
        where: { id: sellerId },
        select: { userId: true }
      })
      if (seller && seller.userId === viewerId) {
        return // self-view, don't count
      }
    }
    await prisma.product.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } }
    })
  })
}

/**
 * Get category tree (cached in production)
 */
export async function getCategoryTree() {
  return monitoredQuery('getCategoryTree', async () => {
    const categories = await prisma.category.findMany({
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    })
    
    // Build tree structure
    const buildTree = (parentId: string | null = null) => {
      return categories
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
          ...cat,
          children: buildTree(cat.id),
        }))
    }
    
    return buildTree(null)
  })
}

/**
 * Search products with full-text search
 */
export async function searchProducts(query: string, options?: {
  page?: number
  limit?: number
}) {
  const { page = 1, limit = 20 } = options || {}
  const skip = (page - 1) * limit
  
  return monitoredQuery('searchProducts', async () => {
    const where = {
      isActive: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { titleEn: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { viewCount: 'desc' }, // Sort by popularity
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          },
          seller: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
            }
          }
        }
      }),
      prisma.product.count({ where })
    ])
    
    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }
  })
}

/**
 * Get seller statistics
 */
export async function getSellerStats(sellerId: string) {
  return monitoredQuery('getSellerStats', async () => {
    const [productCount, totalViews, totalInquiries] = await Promise.all([
      prisma.product.count({
        where: { sellerId, isActive: true }
      }),
      prisma.product.aggregate({
        where: { sellerId, isActive: true },
        _sum: { viewCount: true }
      }),
      prisma.inquiry.count({
        where: { sellerId }
      })
    ])
    
    return {
      productCount,
      totalViews: totalViews._sum.viewCount || 0,
      totalInquiries,
    }
  })
}
