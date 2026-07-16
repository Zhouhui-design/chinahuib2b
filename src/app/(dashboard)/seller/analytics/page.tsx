'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  TrendingUp,
  Eye,
  MessageSquare,
  Package,
  ArrowUp,
  ArrowDown,
  Calendar,
  RefreshCw,
  Users,
  ShoppingBag,
  Globe
} from 'lucide-react'

interface DashboardData {
  summary: {
    totalProducts: number
    totalViews: number
    totalInquiries: number
    avgViewsPerProduct: number
    avgInquiriesPerProduct: number
  }
  topProducts: Array<{
    id: string
    title: string
    viewCount: number
    inquiryCount: number
  }>
  lowProducts: Array<{
    id: string
    title: string
    viewCount: number
    inquiryCount: number
  }>
  recentInquiries: Array<{
    id: string
    message: string
    createdAt: string
    buyer: {
      username: string
      email: string
      company?: string
    }
  }>
  recentProducts: Array<{
    id: string
    title: string
    viewCount: number
    inquiryCount: number
    createdAt: string
  }>
  categoryBreakdown: Array<{
    categoryId: string
    categoryName: string
    productCount: number
  }>
  dailyStats: Array<{
    date: string
    views: number
    inquiries: number
    products: number
  }>
  visitorByCountry: Array<{
    country: string
    countryCode: string
    count: number
  }>
  period: number
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export default function AnalyticsDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'SELLER')) {
      router.push('/auth/login')
    }
  }, [session, status, router])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/seller/analytics?period=${period}`)
      const result = await response.json()

      if (result.success) {
        setData(result.dashboard)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'SELLER') {
      fetchAnalytics()
    }
  }, [status, session, period])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    )
  }

  const pieData = data.categoryBreakdown.slice(0, 8).map((cat, index) => ({
    name: cat.categoryName,
    value: cat.productCount,
    color: COLORS[index % COLORS.length]
  }))

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Products"
            value={data.summary.totalProducts}
            icon={<Package className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Total Views"
            value={data.summary.totalViews}
            icon={<Eye className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="Total Inquiries"
            value={data.summary.totalInquiries}
            icon={<MessageSquare className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Avg Views/Product"
            value={data.summary.avgViewsPerProduct}
            icon={<TrendingUp className="w-6 h-6" />}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" />
              Daily Views & Inquiries
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value: string) => formatDate(value)}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value: string) => new Date(value).toLocaleDateString()}
                  />
                  <Line type="monotone" dataKey="views" stroke="#8B5CF6" strokeWidth={2} name="Views" />
                  <Line type="monotone" dataKey="inquiries" stroke="#10B981" strokeWidth={2} name="Inquiries" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-green-500" />
              Products by Category
            </h2>
            <div className="h-80 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }: { name: string; percent: number }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Top 5 Products (Most Views)
            </h2>
            <div className="space-y-3">
              {data.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full font-bold text-sm">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.title}</p>
                      <p className="text-sm text-gray-500">{product.inquiryCount} inquiries</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-purple-600">
                    <Eye className="w-4 h-4" />
                    <span className="font-semibold">{product.viewCount}</span>
                  </div>
                </div>
              ))}
              {data.topProducts.length === 0 && (
                <p className="text-gray-500 text-center py-8">No products yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-500" />
              Recent Inquiries
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 text-sm">{inquiry.buyer.username}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{inquiry.message}</p>
                </div>
              ))}
              {data.recentInquiries.length === 0 && (
                <p className="text-gray-500 text-center py-8">No inquiries yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Recently Added Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.recentProducts.map((product) => (
                <div key={product.id} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2 truncate">{product.title}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {product.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" /> {product.inquiryCount}
                    </span>
                    <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {data.recentProducts.length === 0 && (
                <p className="text-gray-500 text-center py-8 col-span-3">No recent products</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500" />
              Visitors by Country
            </h2>
            {data.visitorByCountry && data.visitorByCountry.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.visitorByCountry.slice(0, 10).map((v, i) => ({
                        name: v.country,
                        value: v.count,
                        color: COLORS[i % COLORS.length]
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }: { name: string; percent?: number }) => `${name} (${(percent || 0) * 100 > 0 ? ((percent || 0) * 100).toFixed(0) : '0'}%)`}
                    >
                      {data.visitorByCountry.slice(0, 10).map((v, i) => (
                        <Cell key={`cell-${v.countryCode}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No visitor location data available yet</p>
              </div>
            )}
          </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  }

  const colorClasses = colorMap[color] || colorMap.blue
  const borderClass = colorClasses.split(' ')[1].replace('border', 'border-')

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${borderClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
