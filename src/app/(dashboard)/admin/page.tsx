'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, FileText, BarChart3, Settings, Tag, TrendingUp, AlertCircle } from 'lucide-react'

type DashboardStats = {
  totalUsers: number
  totalAccounts: number
  aiAccounts: number
  totalProducts: number
  totalSellers: number
  activeUsers: number
  totalBooths: number
  totalExhibitions: number
  pendingSellerApprovals: number
  draftSellerApprovals: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAccounts: 0,
    aiAccounts: 0,
    totalProducts: 0,
    totalSellers: 0,
    activeUsers: 0,
    totalBooths: 0,
    totalExhibitions: 0,
    pendingSellerApprovals: 0,
    draftSellerApprovals: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch aggregated dashboard statistics
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const payload = await res.json()
          if (payload.success && payload.data) {
            setStats(payload.data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const quickActions = [
    {
      title: '用户管理',
      description: '查看和管理所有注册用户',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-500',
    },
    {
      title: '支付审核',
      description: '审核卖家提交的付款凭证',
      icon: FileText,
      href: '/admin/payment-proofs',
      color: 'bg-green-500',
    },
    {
      title: '系统监控',
      description: '查看系统性能和运行状态',
      icon: BarChart3,
      href: '/admin/monitoring',
      color: 'bg-purple-500',
    },
    {
      title: 'SEO 管理',
      description: '管理网站 SEO 配置',
      icon: Tag,
      href: '/admin/seo',
      color: 'bg-orange-500',
    },
    {
      title: 'A/B 测试',
      description: '配置和管理 A/B 测试',
      icon: Settings,
      href: '/admin/ab-testing',
      color: 'bg-pink-500',
    },
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">管理后台</h1>
        <p className="mt-2 text-gray-600">欢迎回来，管理员</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总用户数（独立主体）</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '-' : stats.totalUsers}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 space-y-1 text-xs text-gray-500">
            <div className="flex items-center">
              <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              <span className="text-green-600">
                24h 活跃 {loading ? '-' : stats.activeUsers}
              </span>
            </div>
            <div>
              AI 子账号：{loading ? '-' : stats.aiAccounts}（不算独立主体）
            </div>
            <div>
              账号总数：{loading ? '-' : stats.totalAccounts}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总产品数</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '-' : stats.totalProducts}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600">全量产品（含下架）</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">卖家数量（已认证）</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '-' : stats.totalSellers}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 space-y-1 text-xs text-gray-500">
            <div className="flex items-center">
              <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              <span className="text-green-600">
                展会：{loading ? '-' : stats.totalExhibitions}
              </span>
            </div>
            <div>
              待审核卖家：{loading ? '-' : stats.pendingSellerApprovals}
            </div>
            <div>
              草稿卖家：{loading ? '-' : stats.draftSellerApprovals}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">商铺 / 展位</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {loading ? '-' : stats.totalBooths}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              展会 {loading ? '-' : stats.totalExhibitions} 个上线
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start">
                <div className={`${action.color} p-3 rounded-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">最近活动</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>暂无最近活动记录</p>
          </div>
        </div>
      </div>
    </div>
  )
}