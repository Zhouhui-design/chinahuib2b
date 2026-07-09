'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Settings, BarChart3, LogOut, HelpCircle, Globe, FileText, Tag, Home, ChevronRight, Menu, Users, Folder, Building2, CreditCard } from 'lucide-react'

type AdminDashboardClientLayoutProps = {
  children: React.ReactNode
}

export default function AdminDashboardClientLayout({ 
  children 
}: AdminDashboardClientLayoutProps) {
  const pathname = usePathname()
  const [showQuickMenu, setShowQuickMenu] = useState(false)

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
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Global Expo Network
              </Link>
              <span className="ml-4 text-sm text-gray-500">
                {t.dashboard}
              </span>
            </div>
            <div className="flex items-center space-x-4">
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
                系统概览
              </Link>
              
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
                href="/admin/payment-proofs"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/admin/payment-proofs')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5 mr-3" />
                {t.paymentProofs}
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
                组织信息审核
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
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
