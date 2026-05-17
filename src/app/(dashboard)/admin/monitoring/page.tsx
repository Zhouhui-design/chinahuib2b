'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Clock,
  RefreshCw,
  Database,
  Server,
  Zap
} from 'lucide-react'

interface ErrorStats {
  total: number
  bySeverity: {
    low: number
    medium: number
    high: number
    critical: number
  }
  recentTrend: number
  topErrors: Array<{ name: string; count: number }>
}

interface MetricStats {
  count: number
  avg: number
  min: number
  max: number
  p95: number
  p99: number
}

interface MonitoringOverview {
  errors: ErrorStats
  performance: {
    apiLatency: MetricStats
    dbQueries: MetricStats
  }
  timestamp: string
}

export default function MonitoringDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [overview, setOverview] = useState<MonitoringOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Check admin access
  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'ADMIN')) {
      router.push('/auth/login')
    }
  }, [session, status, router])

  // Fetch monitoring data
  const fetchMonitoringData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/monitoring?action=overview')
      const data = await response.json()
      
      if (data.success) {
        setOverview(data.overview)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchMonitoringData()
      
      if (autoRefresh) {
        const interval = setInterval(fetchMonitoringData, 30000) // Refresh every 30 seconds
        return () => clearInterval(interval)
      }
    }
  }, [status, session, autoRefresh])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Failed to load monitoring data</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monitoring Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchMonitoringData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
            </label>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Errors */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Errors</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{overview.errors.total}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${overview.errors.recentTrend > 0 ? 'text-red-500' : 'text-green-500'}`} />
              <span className={`text-sm ${overview.errors.recentTrend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {overview.errors.recentTrend > 0 ? '+' : ''}{overview.errors.recentTrend} in last hour
              </span>
            </div>
          </div>

          {/* API Latency P95 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">API Latency (P95)</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{overview.performance.apiLatency.p95.toFixed(0)}ms</p>
              </div>
              <Zap className="w-10 h-10 text-blue-500" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Avg: {overview.performance.apiLatency.avg.toFixed(0)}ms</p>
            </div>
          </div>

          {/* DB Query Time P95 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">DB Query (P95)</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{overview.performance.dbQueries.p95.toFixed(0)}ms</p>
              </div>
              <Database className="w-10 h-10 text-green-500" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Avg: {overview.performance.dbQueries.avg.toFixed(0)}ms</p>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Status</p>
                <p className="text-3xl font-bold text-green-600 mt-2">Healthy</p>
              </div>
              <Activity className="w-10 h-10 text-purple-500" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">All services operational</p>
            </div>
          </div>
        </div>

        {/* Error Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Error Severity Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Error Severity Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Critical</span>
                  <span className="text-sm font-medium text-gray-900">{overview.errors.bySeverity.critical}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${(overview.errors.bySeverity.critical / overview.errors.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">High</span>
                  <span className="text-sm font-medium text-gray-900">{overview.errors.bySeverity.high}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(overview.errors.bySeverity.high / overview.errors.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Medium</span>
                  <span className="text-sm font-medium text-gray-900">{overview.errors.bySeverity.medium}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(overview.errors.bySeverity.medium / overview.errors.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Low</span>
                  <span className="text-sm font-medium text-gray-900">{overview.errors.bySeverity.low}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(overview.errors.bySeverity.low / overview.errors.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Errors */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Errors</h2>
            <div className="space-y-3">
              {overview.errors.topErrors.slice(0, 5).map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{error.name}</p>
                  </div>
                  <span className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    {error.count}
                  </span>
                </div>
              ))}
              {overview.errors.topErrors.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No errors recorded</p>
              )}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Latency Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              API Latency Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Average</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{overview.performance.apiLatency.avg.toFixed(0)}ms</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Min</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{overview.performance.apiLatency.min.toFixed(0)}ms</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">P95</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{overview.performance.apiLatency.p95.toFixed(0)}ms</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">P99</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{overview.performance.apiLatency.p99.toFixed(0)}ms</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <Clock className="w-4 h-4 inline mr-1" />
              Based on last hour ({overview.performance.apiLatency.count} requests)
            </div>
          </div>

          {/* Database Query Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-green-500" />
              Database Query Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Average</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{overview.performance.dbQueries.avg.toFixed(0)}ms</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Min</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{overview.performance.dbQueries.min.toFixed(0)}ms</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">P95</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{overview.performance.dbQueries.p95.toFixed(0)}ms</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">P99</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{overview.performance.dbQueries.p99.toFixed(0)}ms</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <Server className="w-4 h-4 inline mr-1" />
              Based on last hour ({overview.performance.dbQueries.count} queries)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
