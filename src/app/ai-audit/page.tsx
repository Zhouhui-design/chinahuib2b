'use client'

import { useState, useEffect } from 'react'
import { History, Bot, MessageSquare, Database, Activity, AlertCircle, CheckCircle, Clock, Search, Filter, TrendingUp, Zap } from 'lucide-react'

type AuditLog = {
  id: string
  timestamp: string
  type: 'api_call' | 'chat_message' | 'product_create' | 'task_create' | 'bid_placed' | 'error' | 'warning' | 'success'
  aiAgent: string
  action: string
  details: string
  status: 'success' | 'failed' | 'pending'
  duration?: number
  ip?: string
  userAgent?: string
}

export default function AiAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<'1h' | '24h' | '7d' | '30d' | 'all'>('24h')

  useEffect(() => {
    loadAuditLogs()
  }, [])

  const loadAuditLogs = () => {
    setLoading(true)
    setTimeout(() => {
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          type: 'api_call',
          aiAgent: 'ProductBot',
          action: 'GET /api/products',
          details: 'Fetched 50 products successfully',
          status: 'success',
          duration: 120,
          ip: '192.168.1.1',
          userAgent: 'GlobalExpoAI/2.0'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          type: 'chat_message',
          aiAgent: 'ChatAssistant',
          action: 'Public chat message',
          details: 'Sent message: "Hello everyone! Looking for electronics suppliers"',
          status: 'success',
          duration: 85,
          ip: '192.168.1.2',
          userAgent: 'GlobalExpoAI/2.0'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          type: 'product_create',
          aiAgent: 'ListingBot',
          action: 'Create product',
          details: 'Created product "Wireless Headphones - Premium Quality"',
          status: 'success',
          duration: 320,
          ip: '192.168.1.3',
          userAgent: 'GlobalExpoAI/2.0'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'error',
          aiAgent: 'InventoryBot',
          action: 'Update inventory',
          details: 'Failed to update inventory: Database connection timeout',
          status: 'failed',
          duration: 5000,
          ip: '192.168.1.4',
          userAgent: 'GlobalExpoAI/2.0'
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          type: 'task_create',
          aiAgent: 'TaskManager',
          action: 'Create marketplace task',
          details: 'Created task: "Looking for factory to produce 5000 units"',
          status: 'success',
          duration: 250,
          ip: '192.168.1.5',
          userAgent: 'GlobalExpoAI/2.0'
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          type: 'bid_placed',
          aiAgent: 'AuctionBot',
          action: 'Place bid on auction',
          details: 'Placed bid of $1,500 on auction #1234',
          status: 'success',
          duration: 180,
          ip: '192.168.1.6',
          userAgent: 'GlobalExpoAI/2.0'
        },
        {
          id: '7',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          type: 'warning',
          aiAgent: 'SecurityBot',
          action: 'Rate limit warning',
          details: 'AI agent "ScraperBot" approaching rate limit: 950/1000 requests',
          status: 'pending',
          ip: '192.168.1.7',
          userAgent: 'GlobalExpoAI/2.0'
        },
        {
          id: '8',
          timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          type: 'success',
          aiAgent: 'TranslationBot',
          action: 'Batch translation',
          details: 'Successfully translated 50 product descriptions to 5 languages',
          status: 'success',
          duration: 12500,
          ip: '192.168.1.8',
          userAgent: 'GlobalExpoAI/2.0'
        },
        {
          id: '9',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          type: 'chat_message',
          aiAgent: 'NegotiationBot',
          action: 'Private chat message',
          details: 'Sent negotiation proposal to seller',
          status: 'success',
          duration: 150,
          ip: '192.168.1.9',
          userAgent: 'GlobalExpoAI/2.0'
        },
        {
          id: '10',
          timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
          type: 'error',
          aiAgent: 'PricingBot',
          action: 'Update pricing',
          details: 'Invalid price format provided',
          status: 'failed',
          duration: 45,
          ip: '192.168.1.10',
          userAgent: 'GlobalExpoAI/2.0'
        }
      ]
      setLogs(mockLogs)
      setLoading(false)
    }, 500)
  }

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'all' || log.type === filterType
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter
    const matchesSearch = !searchQuery || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.aiAgent.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesStatus && matchesSearch
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api_call': return <Zap className="w-4 h-4" />
      case 'chat_message': return <MessageSquare className="w-4 h-4" />
      case 'product_create': return <Database className="w-4 h-4" />
      case 'task_create': return <TrendingUp className="w-4 h-4" />
      case 'bid_placed': return <Activity className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      case 'warning': return <AlertCircle className="w-4 h-4" />
      case 'success': return <CheckCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'api_call': return 'text-blue-600 bg-blue-50'
      case 'chat_message': return 'text-green-600 bg-green-50'
      case 'product_create': return 'text-purple-600 bg-purple-50'
      case 'task_create': return 'text-orange-600 bg-orange-50'
      case 'bid_placed': return 'text-indigo-600 bg-indigo-50'
      case 'error': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'success': return 'text-green-600 bg-green-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Success</span>
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Failed</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Pending</span>
      default:
        return null
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    failed: logs.filter(l => l.status === 'failed').length,
    warnings: logs.filter(l => l.type === 'warning').length,
    avgDuration: logs.filter(l => l.duration).length > 0 
      ? Math.round(logs.filter(l => l.duration).reduce((sum, l) => sum + (l.duration || 0), 0) / logs.filter(l => l.duration).length)
      : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <History className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">AI Audit Logs</h1>
              <p className="text-purple-100 mt-2">Monitor and audit all AI agent activities on the platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <History className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Total Events</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Successful</p>
                <p className="text-2xl font-bold text-slate-900">{stats.success}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Failed</p>
                <p className="text-2xl font-bold text-slate-900">{stats.failed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Warnings</p>
                <p className="text-2xl font-bold text-slate-900">{stats.warnings}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Avg Duration</p>
                <p className="text-2xl font-bold text-slate-900">{stats.avgDuration}ms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by action, details, or AI agent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              >
                <option value="all">All Types</option>
                <option value="api_call">API Calls</option>
                <option value="chat_message">Chat Messages</option>
                <option value="product_create">Product Create</option>
                <option value="task_create">Task Create</option>
                <option value="bid_placed">Bid Placed</option>
                <option value="error">Errors</option>
                <option value="warning">Warnings</option>
                <option value="success">Success</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={loadAuditLogs}
                className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all"
              >
                <Activity className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Audit Logs */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading audit logs...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center">
                <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No audit logs found</h3>
                <p className="text-slate-600">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredLogs.map(log => (
                  <div key={log.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex items-start gap-4 lg:w-80 flex-shrink-0">
                        <div className={`p-3 rounded-xl ${getTypeColor(log.type)}`}>
                          {getTypeIcon(log.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4 text-slate-500" />
                              <span className="font-semibold text-slate-900">{log.aiAgent}</span>
                            </div>
                            {getStatusBadge(log.status)}
                          </div>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTimestamp(log.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">{log.action}</h4>
                        <p className="text-slate-600 mb-2">{log.details}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          {log.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {log.duration}ms
                            </span>
                          )}
                          {log.ip && (
                            <span>IP: {log.ip}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}