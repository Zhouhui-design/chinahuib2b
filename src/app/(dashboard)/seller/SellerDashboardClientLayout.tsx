'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Store, FileText, Settings, BarChart3, LogOut, HelpCircle } from 'lucide-react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'
import LanguageSwitcher from '@/components/language/LanguageSwitcher'

type SellerDashboardClientLayoutProps = {
  children: React.ReactNode
  currentLanguage: string
  onSignOut: () => Promise<void>
}

export default function SellerDashboardClientLayout({ 
  children, 
  currentLanguage,
  onSignOut
}: SellerDashboardClientLayoutProps) {
  const language = useSellerLanguage()
  const pathname = usePathname()
  
  // Translations for sidebar and common elements
  const t = {
    dashboard: language === 'zh' ? '仪表板' :
               language === 'ja' ? 'ダッシュボード' :
               language === 'ar' ? 'لوحة القيادة' :
               language === 'es' ? 'Panel' :
               language === 'fr' ? 'Tableau de bord' :
               language === 'de' ? 'Armaturenbrett' :
               language === 'ko' ? '대시보드' :
               language === 'ru' ? 'Панель' :
               language === 'pt' ? 'Painel' :
               language === 'hi' ? 'डैशबोर्ड' :
               language === 'th' ? 'แผงควบคุม' :
               language === 'vi' ? 'Bảng điều khiển' :
               'Dashboard',
    
    products: language === 'zh' ? '产品' :
              language === 'ja' ? '製品' :
              language === 'ar' ? 'المنتجات' :
              language === 'es' ? 'Productos' :
              language === 'fr' ? 'Produits' :
              language === 'de' ? 'Produkte' :
              language === 'ko' ? '제품' :
              language === 'ru' ? 'Продукты' :
              language === 'pt' ? 'Produtos' :
              language === 'hi' ? 'उत्पाद' :
              language === 'th' ? 'สินค้า' :
              language === 'vi' ? 'Sản phẩm' :
              'Products',
    
    storeProfile: language === 'zh' ? '店铺资料' :
                  language === 'ja' ? '店舗プロフィール' :
                  language === 'ar' ? 'ملف المتجر' :
                  language === 'es' ? 'Perfil de la tienda' :
                  language === 'fr' ? 'Profil du magasin' :
                  language === 'de' ? 'Store-Profil' :
                  language === 'ko' ? '스토어 프로필' :
                  language === 'ru' ? 'Профиль магазина' :
                  language === 'pt' ? 'Perfil da loja' :
                  language === 'hi' ? 'स्टोर प्रोफ़ाइल' :
                  language === 'th' ? 'โปรไฟล์ร้าน' :
                  language === 'vi' ? 'Hồ sơ cửa hàng' :
                  'Store Profile',
    
    brochures: language === 'zh' ? '宣传册' :
               language === 'ja' ? 'パンフレット' :
               language === 'ar' ? 'الكتيبات' :
               language === 'es' ? 'Folletos' :
               language === 'fr' ? 'Brochures' :
               language === 'de' ? 'Broschüren' :
               language === 'ko' ? '브로셔' :
               language === 'ru' ? 'Брошюры' :
               language === 'pt' ? 'Folhetos' :
               language === 'hi' ? 'ब्रोशर' :
               language === 'th' ? 'โบรชัวร์' :
               language === 'vi' ? 'Tài liệu' :
               'Brochures',
    
    settings: language === 'zh' ? '设置' :
              language === 'ja' ? '設定' :
              language === 'ar' ? 'الإعدادات' :
              language === 'es' ? 'Configuración' :
              language === 'fr' ? 'Paramètres' :
              language === 'de' ? 'Einstellungen' :
              language === 'ko' ? '설정' :
              language === 'ru' ? 'Настройки' :
              language === 'pt' ? 'Configurações' :
              language === 'hi' ? 'सेटिंग्स' :
              language === 'th' ? 'การตั้งค่า' :
              language === 'vi' ? 'Cài đặt' :
              'Settings',
    
    quickStats: language === 'zh' ? '快速统计' :
                language === 'ja' ? 'クイック統計' :
                language === 'ar' ? 'إحصائيات سريعة' :
                language === 'es' ? 'Estadísticas rápidas' :
                language === 'fr' ? 'Statistiques rapides' :
                language === 'de' ? 'Schnellstatistik' :
                language === 'ko' ? '빠른 통계' :
                language === 'ru' ? 'Быстрая статистика' :
                language === 'pt' ? 'Estatísticas rápidas' :
                language === 'hi' ? 'त्वरित आंकड़े' :
                language === 'th' ? 'สถิติด่วน' :
                language === 'vi' ? 'Thống kê nhanh' :
                'Quick Stats',
    
    helpGuide: language === 'zh' ? '帮助指南' :
               language === 'ja' ? 'ヘルプガイド' :
               language === 'ar' ? 'دليل المساعدة' :
               language === 'es' ? 'Guía de ayuda' :
               language === 'fr' ? 'Guide d\'aide' :
               language === 'de' ? 'Hilfeleitfaden' :
               language === 'ko' ? '도움말 가이드' :
               language === 'ru' ? 'Справочное руководство' :
               language === 'pt' ? 'Guia de ajuda' :
               language === 'hi' ? 'सहायता गाइड' :
               language === 'th' ? 'คู่มือช่วยเหลือ' :
               language === 'vi' ? 'Hướng dẫn trợ giúp' :
               'Help Guide',
    
    viewPublicSite: language === 'zh' ? '查看公开网站' :
                    language === 'ja' ? '公開サイトを見る' :
                    language === 'ar' ? 'عرض الموقع العام' :
                    language === 'es' ? 'Ver sitio público' :
                    language === 'fr' ? 'Voir le site public' :
                    language === 'de' ? 'Öffentliche Seite ansehen' :
                    language === 'ko' ? '공개 사이트 보기' :
                    language === 'ru' ? 'Просмотреть публичный сайт' :
                    language === 'pt' ? 'Ver site público' :
                    language === 'hi' ? 'सार्वजनिक साइट देखें' :
                    language === 'th' ? 'ดูไซต์สาธารณะ' :
                    language === 'vi' ? 'Xem trang công khai' :
                    'View Public Site',
    
    logout: language === 'zh' ? '退出登录' :
            language === 'ja' ? 'ログアウト' :
            language === 'ar' ? 'تسجيل الخروج' :
            language === 'es' ? 'Cerrar sesión' :
            language === 'fr' ? 'Déconnexion' :
            language === 'de' ? 'Abmelden' :
            language === 'ko' ? '로그아웃' :
            language === 'ru' ? 'Выйти' :
            language === 'pt' ? 'Sair' :
            language === 'hi' ? 'लॉग आउट' :
            language === 'th' ? 'ออกจากระบบ' :
            language === 'vi' ? 'Đăng xuất' :
            'Logout',
  }
  
  const isActive = (path: string) => pathname === path
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                {language === 'zh' ? '全球博览网络' :
                 language === 'ja' ? 'グローバルエキスポネットワーク' :
                 language === 'ar' ? 'شبكة المعرض العالمية' :
                 language === 'es' ? 'Red Global de Exposiciones' :
                 language === 'fr' ? 'Réseau Mondial d\'Expositions' :
                 language === 'de' ? 'Globales Messenetzwerk' :
                 language === 'ko' ? '글로벌 엑스포 네트워크' :
                 language === 'ru' ? 'Глобальная выставочная сеть' :
                 language === 'pt' ? 'Rede Global de Exposições' :
                 language === 'hi' ? 'वैश्विक एक्सपो नेटवर्क' :
                 language === 'th' ? 'เครือข่ายงานแสดงสินค้าทั่วโลก' :
                 language === 'vi' ? 'Mạng lưới Triển lãm Toàn cầu' :
                 'Global Expo Network'}
              </Link>
              <span className="ml-4 text-sm text-gray-500">
                {language === 'zh' ? '卖家仪表板' :
                 language === 'ja' ? '販売者ダッシュボード' :
                 language === 'ar' ? 'لوحة تحكم البائع' :
                 language === 'es' ? 'Panel del Vendedor' :
                 language === 'fr' ? 'Tableau de Bord du Vendeur' :
                 language === 'de' ? 'Verkäufer-Dashboard' :
                 language === 'ko' ? '판매자 대시보드' :
                 language === 'ru' ? 'Панель продавца' :
                 language === 'pt' ? 'Painel do Vendedor' :
                 language === 'hi' ? 'विक्रेता डैशबोर्ड' :
                 language === 'th' ? 'แผงควบคุมผู้ขาย' :
                 language === 'vi' ? 'Bảng điều khiển Người bán' :
                 'Seller Dashboard'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher currentLocale={language as any} />
              
              {/* Help Guide Link */}
              <Link
                href="/seller/guide"
                className="flex items-center text-sm text-gray-600 hover:text-blue-600"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                {t.helpGuide}
              </Link>
              
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                {t.viewPublicSite}
              </Link>
              <form action={onSignOut}>
                <button
                  type="submit"
                  className="flex items-center text-sm text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  {t.logout}
                </button>
              </form>
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
                href="/seller"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/seller')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                {t.dashboard}
              </Link>
              
              <Link
                href="/seller/products"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/seller/products') || pathname.startsWith('/seller/products/')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5 mr-3" />
                {t.products}
              </Link>
              
              <Link
                href="/seller/store"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/seller/store')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Store className="w-5 h-5 mr-3" />
                {t.storeProfile}
              </Link>
              
              <Link
                href="/seller/brochures"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/seller/brochures')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5 mr-3" />
                {t.brochures}
              </Link>
              
              <Link
                href="/seller/settings"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/seller/settings')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5 mr-3" />
                {t.settings}
              </Link>
            </nav>

            {/* Quick Stats - Will be populated by child components */}
            <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {t.quickStats}
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-500 text-xs">
                  {language === 'zh' ? '统计数据将在仪表板页面显示' : 'Stats will appear on dashboard page'}
                </p>
              </div>
            </div>
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
