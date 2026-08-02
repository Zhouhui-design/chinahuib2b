'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Settings, BarChart3, LogOut, HelpCircle, Globe, FileText, Tag, Home,
  ChevronRight, Menu, Users, Folder, Building2, CreditCard,
  Bell, AlertCircle, MessageSquare, X, Gavel, Truck, Share2
} from 'lucide-react'

type NotificationItem = {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  link?: string
}

type PendingCounts = {
  freightInquiries: number
  paymentProofs: number
  sellerVerifications: number
  auctionListings: number
}

export default function AdminDashboardClientLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [showQuickMenu, setShowQuickMenu] = useState(false)

  const [pendingCounts, setPendingCounts] = useState<PendingCounts>({
    freightInquiries: 0,
    paymentProofs: 0,
    sellerVerifications: 0,
    auctionListings: 0,
  })
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [popup, setPopup] = useState<NotificationItem | null>(null)

  const totalPending =
    pendingCounts.freightInquiries +
    pendingCounts.paymentProofs +
    pendingCounts.sellerVerifications +
    pendingCounts.auctionListings

  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        const res = await fetch('/api/admin/pending-counts')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            setPendingCounts(data.data)
          }
        }
      } catch {}
    }
    fetchPendingCounts()
    const interval = setInterval(fetchPendingCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/admin/notifications?unread=true')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.notifications) {
            setNotifications((prev) => {
              const existingIds = new Set(prev.map((n) => n.id))
              const newOnes = data.notifications.filter(
                (n: NotificationItem) => !existingIds.has(n.id)
              )
              if (newOnes.length > 0) {
                const latest = newOnes[0]
                setPopup(latest)
                setTimeout(() => setPopup(null), 5000)
              }
              return [...newOnes, ...prev]
            })
          }
        }
      } catch {}
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'POST',
      })
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        )
      }
    } catch {}
  }, [])

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'POST',
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      }
    } catch {}
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  const t = {
    dashboard: '管理后台',
    users: '用户管理',
    seo: 'SEO 管理',
    monitoring: '系统监控',
    paymentProofs: '支付审核',
    abTesting: 'A/B 测试',
    logout: '退出登录',
    home: '首页',
    quickMenu: '快捷菜单',
    chatHall: '聊天广场',
    products: '产品',
    stores: '参展商',
    notifications: '通知中心',
    auctionListings: '拍卖列表管理',
    freightInquiries: '货代询价管理',
    sellerVerifications: '组织信息审核',
    systemOverview: '系统概览',
    noNotifications: '暂无新通知',
    markAllRead: '全部已读',
    viewAll: '查看全部',
  }

  const Badge = ({ count, className = '' }: { count: number; className?: string }) => {
    if (count <= 0) return null
    return (
      <span
        className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-red-500 rounded-full ${className}`}
      >
        {count > 99 ? '99+' : count}
      </span>
    )
  }

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'warning':
      case 'error':
        return <AlertCircle className="w-5 h-5 text-amber-500" />
      case 'success':
        return <MessageSquare className="w-5 h-5 text-green-500" />
      default:
        return <MessageSquare className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                SeaHeart Global | 心海环球
              </Link>
              <span className="ml-4 text-sm text-gray-500">
                {t.dashboard}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className="relative flex items-center justify-center w-9 h-9 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title={t.notifications}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotificationPanel && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotificationPanel(false)}
                    />
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-800">{t.notifications}</h3>
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {t.markAllRead}
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotificationPanel(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Bell className="w-10 h-10 mb-3 opacity-50" />
                            <p className="text-sm">{t.noNotifications}</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.slice(0, 10).map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => {
                                  if (!notification.isRead) {
                                    markAsRead(notification.id)
                                  }
                                  setShowNotificationPanel(false)
                                }}
                                className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                  !notification.isRead ? 'bg-blue-50/40' : ''
                                }`}
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    {new Date(notification.createdAt).toLocaleString('zh-CN')}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="flex-shrink-0 w-2 h-2 mt-1.5 bg-blue-500 rounded-full" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {notifications.length > 10 && (
                        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                          <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
                            {t.viewAll}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <Link
                href="/admin/guide"
                className="flex items-center text-sm text-gray-600 hover:text-blue-600"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                帮助
              </Link>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                查看公开网站
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center text-sm text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-1" />
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb Navigation */}
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center space-x-1 overflow-x-auto">
              <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors shrink-0">
                <Home className="w-4 h-4" />
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              <Link href="/admin" className="text-gray-600 hover:text-blue-600 text-sm shrink-0">
                {t.dashboard}
              </Link>
              {pathname !== '/admin' && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-800 font-medium text-sm shrink-0">
                    {pathname.includes('/seo') ? t.seo :
                     pathname.includes('/monitoring') ? t.monitoring :
                     pathname.includes('/payment-proofs') ? t.paymentProofs :
                     pathname.includes('/ab-testing') ? t.abTesting :
                     pathname.includes('/users') ? t.users :
                     pathname.includes('/categories') ? '分类管理' :
                     pathname.includes('/seller-profiles') ? '组织信息审核' :
                     pathname.split('/').pop()}
                  </span>
                </>
              )}
            </div>

            {/* Quick Menu */}
            <div className="relative">
              <button
                onClick={() => setShowQuickMenu(!showQuickMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                title={t.quickMenu}
              >
                <Menu className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 hidden sm:inline">{t.quickMenu}</span>
              </button>

              {showQuickMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowQuickMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                    <Link href="/" onClick={() => setShowQuickMenu(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Home className="w-4 h-4 mr-2" />
                      {t.home}
                    </Link>
                    <Link href="/chat-hall" onClick={() => setShowQuickMenu(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      {t.chatHall}
                    </Link>
                    <Link href="/products" onClick={() => setShowQuickMenu(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <FileText className="w-4 h-4 mr-2" />
                      {t.products}
                    </Link>
                    <Link href="/stores" onClick={() => setShowQuickMenu(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Globe className="w-4 h-4 mr-2" />
                      {t.stores}
                    </Link>
                    <div className="border-t border-gray-200 my-1" />
                    <Link href="/seller" onClick={() => setShowQuickMenu(false)} className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      卖家中心
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              <Link
                href="/admin"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                <span className="flex-1">{t.systemOverview}</span>
                <Badge count={totalPending} />
              </Link>

              <Link
                href="/admin/auction-listings"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin/auction-listings')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Gavel className="w-5 h-5 mr-3" />
                <span className="flex-1">{t.auctionListings}</span>
                <Badge count={pendingCounts.auctionListings} />
              </Link>

              <Link
                href="/admin/freight-inquiries"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin/freight-inquiries')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Truck className="w-5 h-5 mr-3" />
                <span className="flex-1">{t.freightInquiries}</span>
                <Badge count={pendingCounts.freightInquiries} />
              </Link>

              <Link
                href="/admin/payment-proofs"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin/payment-proofs')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5 mr-3" />
                <span className="flex-1">{t.paymentProofs}</span>
                <Badge count={pendingCounts.paymentProofs} />
              </Link>

              <Link
                href="/admin/seller-profiles"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin/seller-profiles')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Building2 className="w-5 h-5 mr-3" />
                <span className="flex-1">{t.sellerVerifications}</span>
                <Badge count={pendingCounts.sellerVerifications} />
              </Link>

              <div className="my-3 border-t border-gray-200" />

              <Link
                href="/admin/users"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin/users')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="w-5 h-5 mr-3" />
                {t.users}
              </Link>

              <Link
                href="/admin/seo"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin/seo')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Tag className="w-5 h-5 mr-3" />
                {t.seo}
              </Link>

              <Link
                href="/admin/monitoring"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin/monitoring')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                {t.monitoring}
              </Link>

              <Link
                href="/admin/ab-testing"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin/ab-testing')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5 mr-3" />
                {t.abTesting}
              </Link>

              <Link
                href="/admin/categories"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin/categories')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Folder className="w-5 h-5 mr-3" />
                分类管理
              </Link>

              <Link
                href="/admin/units"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin/units')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="w-5 h-5 mr-3" />
                单位管理
              </Link>

              <Link
                href="/admin/payment-config"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin/payment-config')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="w-5 h-5 mr-3" />
                收款配置
              </Link>

              <Link
                href="/admin/verification"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin/verification')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Globe className="w-5 h-5 mr-3" />
                平台审核管理
              </Link>

              <Link
                href="/admin/maintenance"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin/maintenance')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5 mr-3" />
                维护通知管理
              </Link>

              <Link
                href="/admin/assign-data"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin/assign-data')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Share2 className="w-5 h-5 mr-3" />
                数据分配管理
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>

      {/* Real-time Popup Notification */}
      {popup && (
        <div className="fixed bottom-6 right-6 z-49 max-w-sm w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in">
          <div className="flex items-start gap-3 p-4">
            <div className="flex-shrink-0">
              {getNotificationIcon(popup.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {popup.title}
                </h4>
                <button
                  onClick={() => setPopup(null)}
                  className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {popup.message}
              </p>
              {popup.link && (
                <Link
                  href={popup.link}
                  onClick={() => setPopup(null)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                >
                  查看详情 →
                </Link>
              )}
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 animate-progress" />
        </div>
      )}
    </div>
  )
}