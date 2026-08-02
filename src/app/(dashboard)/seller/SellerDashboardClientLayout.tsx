'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Store, FileText, Settings, BarChart3, LogOut, HelpCircle, Building2, Home, ChevronRight, Menu, Bot, MessageCircle } from 'lucide-react'
import { languages, type LanguageCode } from '@/lib/languages'
import LanguageSwitcher from '@/components/language/LanguageSwitcher'
import UpdateNotification from '@/components/UpdateNotification'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

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
  const [showQuickMenu, setShowQuickMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Poll unread message count for inbox badge (near-real-time notification)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/chat/unread-count', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          if (data?.success?.data) {
            setUnreadCount(data.data.unreadCount || 0)
          }
        }
      } catch (e) {
        // Silent
      }
    }
    fetchUnread()
    timer = setInterval(fetchUnread, 30000) // Poll every 30s
    return () => { if (timer) clearInterval(timer) }
  }, [])
  
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
    
    booths: language === 'zh' ? '展位管理' :
            language === 'ja' ? 'ブース管理' :
            language === 'ar' ? 'إدارة المحطات' :
            language === 'es' ? 'Gestión de Puestos' :
            language === 'fr' ? 'Gestion des stands' :
            language === 'de' ? 'Standverwaltung' :
            language === 'ko' ? '부스 관리' :
            language === 'ru' ? 'Управление стендами' :
            language === 'pt' ? 'Gerenciamento de Cabines' :
            language === 'hi' ? 'बूथ प्रबंधन' :
            language === 'th' ? 'การจัดการบูธ' :
            language === 'vi' ? 'Quản lý gian hàng' :
            'Booths',
    
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
            
    home: language === 'zh' ? '首页' :
          language === 'ja' ? 'ホーム' :
          language === 'ar' ? 'الرئيسية' :
          language === 'es' ? 'Inicio' :
          language === 'fr' ? 'Accueil' :
          language === 'de' ? 'Startseite' :
          language === 'ko' ? '홈' :
          language === 'ru' ? 'Главная' :
          language === 'pt' ? 'Início' :
          language === 'hi' ? 'होम' :
          language === 'th' ? 'หน้าแรก' :
          language === 'vi' ? 'Trang chủ' :
          'Home',
          
    quickMenu: language === 'zh' ? '快捷菜单' :
               language === 'ja' ? 'クイックメニュー' :
               language === 'ar' ? 'قائمة سريعة' :
               language === 'es' ? 'Menú Rápido' :
               language === 'fr' ? 'Menu Rapide' :
               language === 'de' ? 'Schnellmenü' :
               language === 'ko' ? '빠른 메뉴' :
               language === 'ru' ? 'Быстрое меню' :
               language === 'pt' ? 'Menu Rápido' :
               language === 'hi' ? 'द्रुत मेनू' :
               language === 'th' ? 'เมนูเร็ว' :
               language === 'vi' ? 'Menu Nhanh' :
               'Quick Menu',
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
                {language === 'zh' ? '心海环球' :
                 language === 'ja' ? '心海グローバル' :
                 language === 'ar' ? 'القلب البحري العالمي' :
                 language === 'es' ? 'CorazónMar Global' :
                 language === 'fr' ? 'CœurMer Mondial' :
                 language === 'de' ? 'Meerherz Global' :
                 language === 'ko' ? '심해글로벌' :
                 language === 'ru' ? 'МорскоеСердце Глобал' :
                 language === 'pt' ? 'CoraçãoMar Global' :
                 language === 'hi' ? 'समुद्र-हृदय ग्लोबल' :
                 language === 'th' ? 'หัวใจทะเลโลก' :
                 language === 'vi' ? 'TráiTimBiển ToànCầu' :
                 'SeaHeart Global'}
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
              <LanguageSwitcher currentLocale={language as LanguageCode} />
              
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

      {/* Breadcrumb Navigation */}
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center space-x-1 overflow-x-auto">
              <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors shrink-0">
                <Home className="w-4 h-4" />
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              <Link href="/seller" className="text-gray-600 hover:text-blue-600 text-sm shrink-0">
                {t.dashboard}
              </Link>
              {pathname !== '/seller' && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-800 font-medium text-sm shrink-0">
                    {pathname.includes('/products') ? t.products :
                     pathname.includes('/store') ? t.storeProfile :
                     pathname.includes('/brochures') ? t.brochures :
                     pathname.includes('/booths') ? t.booths :
                     pathname.includes('/settings') ? t.settings :
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
                      {language === 'zh' ? '聊天广场' : language === 'ja' ? 'チャットホール' : language === 'ar' ? 'ساحة الدردشة' : language === 'es' ? 'Plaza de Chat' : language === 'fr' ? 'Hall de Chat' : language === 'de' ? 'Chat-Halle' : language === 'ko' ? '채팅 홀' : language === 'ru' ? 'Чат-зал' : language === 'pt' ? 'Sala de Chat' : language === 'hi' ? 'चैट हॉल' : language === 'th' ? 'ช่องแชท' : language === 'vi' ? 'Khu vực Chat' : 'Chat Hall'}
                    </Link>
                    <Link href="/products" onClick={() => setShowQuickMenu(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Package className="w-4 h-4 mr-2" />
                      {t.products}
                    </Link>
                    <Link href="/stores" onClick={() => setShowQuickMenu(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Store className="w-4 h-4 mr-2" />
                      {language === 'zh' ? '参展商' : language === 'ja' ? '出展者' : language === 'ar' ? 'المُعرضون' : language === 'es' ? 'Expositores' : language === 'fr' ? 'Exposants' : language === 'de' ? 'Aussteller' : language === 'ko' ? '출展자' : language === 'ru' ? 'Участники' : language === 'pt' ? 'Expositores' : language === 'hi' ? 'प्रदर्शनकर्ता' : language === 'th' ? 'ผู้เข้าร่วมแสดงสินค้า' : language === 'vi' ? 'Nhà triển lãm' : 'Exhibitors'}
                    </Link>
                    <div className="border-t border-gray-200 my-1" />
                    <Link href={`/${language}/buyer/profile`} onClick={() => setShowQuickMenu(false)} className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {language === 'zh' ? '买家中心' : language === 'ja' ? 'バイヤーセンター' : language === 'ar' ? 'مركز المشتري' : language === 'es' ? 'Centro de Comprador' : language === 'fr' ? 'Centre de l\'Acheteur' : language === 'de' ? 'Käuferzentrum' : language === 'ko' ? '바이어 센터' : language === 'ru' ? 'Центр покупателя' : language === 'pt' ? 'Centro do Comprador' : language === 'hi' ? 'खरीदार केंद्र' : language === 'th' ? 'ศูนย์ผู้ซื้อ' : language === 'vi' ? 'Trung tâm Người mua' : 'Buyer Center'}
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
          <aside className="w-56 flex-shrink-0">
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
                href="/seller/messages"
                className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/seller/messages')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-3" />
                  {language === 'zh' ? '消息' :
                   language === 'ja' ? 'メッセージ' :
                   language === 'ar' ? 'الرسائل' :
                   language === 'es' ? 'Mensajes' :
                   language === 'fr' ? 'Messages' :
                   language === 'de' ? 'Nachrichten' :
                   language === 'ko' ? '메시지' :
                   language === 'ru' ? 'Сообщения' :
                   language === 'pt' ? 'Mensagens' :
                   language === 'hi' ? 'संदेश' :
                   language === 'th' ? 'ข้อความ' :
                   language === 'vi' ? 'Tin nhắn' :
                   'Messages'}
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
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
                href="/seller/booths"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/seller/booths')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Building2 className="w-5 h-5 mr-3" />
                {t.booths}
              </Link>
              
              <Link
                href="/seller/ai-accounts"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/seller/ai-accounts')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bot className="w-5 h-5 mr-3" />
                {language === 'zh' ? 'AI 账号' :
                 language === 'ja' ? 'AIアカウント' :
                 language === 'ar' ? 'حسابات AI' :
                 language === 'es' ? 'Cuentas AI' :
                 language === 'fr' ? 'Comptes AI' :
                 language === 'de' ? 'AI-Konten' :
                 language === 'ko' ? 'AI 계정' :
                 language === 'ru' ? 'AI-аккаунты' :
                 language === 'pt' ? 'Contas AI' :
                 language === 'hi' ? 'AI खाते' :
                 language === 'th' ? 'บัญชี AI' :
                 language === 'vi' ? 'Tài khoản AI' :
                 'AI Accounts'}
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
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
      
      {/* Update Notification */}
      <UpdateNotification language={language} />
    </div>
  )
}
