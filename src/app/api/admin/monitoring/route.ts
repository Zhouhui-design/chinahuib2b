import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { 
  getRecentErrors, 
  getErrorStats, 
  clearOldErrors,
  getMetrics,
  getMetricStats,
  ErrorSeverity 
} from '@/lib/monitoring'

/**
 * Monitoring dashboard API
 * Only accessible by admin users
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'overview'
    
    switch (action) {
      case 'errors':
        // Get recent errors
        const limit = parseInt(searchParams.get('limit') || '50')
        const severity = searchParams.get('severity') as ErrorSeverity | null
        const since = searchParams.get('since') ? new Date(searchParams.get('since')!) : undefined
        
        const errors = getRecentErrors({ limit, severity: severity || undefined, since })
        
        return NextResponse.json({
          success: true,
          errors,
          count: errors.length,
        })
      
      case 'error-stats':
        // Get error statistics
        const stats = getErrorStats()
        
        return NextResponse.json({
          success: true,
          stats,
        })
      
      case 'metrics':
        // Get performance metrics
        const metricName = searchParams.get('name') || undefined
        const metricLimit = parseInt(searchParams.get('limit') || '100')
        
        const metrics = getMetrics({
          name: metricName,
          limit: metricLimit,
        })
        
        return NextResponse.json({
          success: true,
          metrics,
          count: metrics.length,
        })
      
      case 'metric-stats':
        // Get metric statistics
        const name = searchParams.get('name')
        const windowMs = parseInt(searchParams.get('window') || '3600000') // 1 hour default
        
        if (!name) {
          return NextResponse.json(
            { error: 'Metric name is required' },
            { status: 400 }
          )
        }
        
        const metricStats = getMetricStats(name, windowMs)
        
        return NextResponse.json({
          success: true,
          name,
          stats: metricStats,
        })
      
      case 'clear-errors':
        // Clear old errors
        const days = parseInt(searchParams.get('days') || '7')
        const olderThan = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        const cleared = clearOldErrors(olderThan)
        
        return NextResponse.json({
          success: true,
          message: `Cleared ${cleared} errors older than ${days} days`,
        })
      
      case 'overview':
      default:
        // Get monitoring overview
        const errorStats = getErrorStats()
        const apiLatency = getMetricStats('api_request', 3600000)
        const dbQueries = getMetricStats('db_query', 3600000)
        
        return NextResponse.json({
          success: true,
          overview: {
            errors: errorStats,
            performance: {
              apiLatency,
              dbQueries,
            },
            timestamp: new Date().toISOString(),
          }
        })
    }
  } catch (error) {
    console.error('Monitoring API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch monitoring data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
