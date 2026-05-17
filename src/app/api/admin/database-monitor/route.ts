import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getQueryMetrics, resetQueryMetrics } from '@/lib/db-optimizer'
import { prisma } from "@/lib/db"

/**
 * Database monitoring and analytics API
 * Only accessible by admin users
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Only admins can access this
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    switch (action) {
      case 'metrics':
        // Get query performance metrics
        const slowOnly = searchParams.get('slowOnly') === 'true'
        const limit = parseInt(searchParams.get('limit') || '50')
        
        const metrics = getQueryMetrics({ slowOnly, limit })
        
        return NextResponse.json({
          success: true,
          metrics,
          summary: {
            total: metrics.length,
            slow: metrics.filter(m => m.slow).length,
            averageDuration: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length || 0,
          }
        })
      
      case 'reset':
        // Reset query metrics
        resetQueryMetrics()
        return NextResponse.json({ success: true, message: 'Metrics reset' })
      
      case 'stats':
        // Get database statistics
        const stats = await getDatabaseStats()
        return NextResponse.json({ success: true, stats })
      
      case 'indexes':
        // Get index usage statistics
        const indexes = await getIndexStats()
        return NextResponse.json({ success: true, indexes })
      
      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: metrics, reset, stats, or indexes' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Database monitor error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch database metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Get database table statistics
 */
async function getDatabaseStats() {
  try {
    // Get record counts for main tables
    const [
      userCount,
      sellerCount,
      productCount,
      categoryCount,
      inquiryCount,
      brochureDownloadCount,
      paymentProofCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.sellerProfile.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.inquiry.count(),
      prisma.brochureDownload.count(),
      prisma.paymentProof.count(),
    ])
    
    // Get active vs inactive products
    const [activeProducts, inactiveProducts] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: false } }),
    ])
    
    // Get subscription breakdown
    const subscriptionBreakdown = await prisma.sellerProfile.groupBy({
      by: ['subscriptionStatus'],
      _count: true,
    })
    
    return {
      tables: {
        users: userCount,
        sellers: sellerCount,
        products: {
          total: productCount,
          active: activeProducts,
          inactive: inactiveProducts,
        },
        categories: categoryCount,
        inquiries: inquiryCount,
        brochureDownloads: brochureDownloadCount,
        paymentProofs: paymentProofCount,
      },
      subscriptions: subscriptionBreakdown,
    }
  } catch (error) {
    console.error('Failed to get database stats:', error)
    throw error
  }
}

/**
 * Get index usage statistics (PostgreSQL specific)
 */
async function getIndexStats() {
  try {
    // Query PostgreSQL system catalogs for index stats
    const result = await prisma.$queryRaw`
      SELECT
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC
      LIMIT 50
    `
    
    return result
  } catch (error) {
    console.error('Failed to get index stats:', error)
    return []
  }
}
