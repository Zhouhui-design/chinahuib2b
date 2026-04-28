'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Eye, Download, TrendingUp, Plus, HelpCircle } from 'lucide-react'
import OnboardingGuide from '@/components/seller/OnboardingGuide'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

type SellerDashboardProps = {
  initialData: {
    seller: any
    productCount: number
    totalViews: any
    totalDownloads: any
    recentProducts: any[]
  }
}

export default function SellerDashboardPage({ initialData }: SellerDashboardProps) {
  const language = useSellerLanguage()
  const [showOnboarding, setShowOnboarding] = useState(false)
  
  // Check if user is new (first time visiting dashboard)
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('seller_has_seen_onboarding')
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])
  
  const { seller, productCount, totalViews, totalDownloads, recentProducts } = initialData
  
  // Translations
  const t = {
    dashboard: language === 'zh' ? '仪表板' :
             language === 'ja' ? 'ダッシュボード' :
             language === 'ar' ? 'لوحة القيادة' :
             language === 'es' ? 'Panel de control' :
             language === 'fr' ? 'Tableau de bord' :
             language === 'de' ? 'Armaturenbrett' :
             language === 'ko' ? '대시보드' :
             language === 'ru' ? 'Панель приборов' :
             language === 'pt' ? 'Painel' :
             language === 'hi' ? 'डैशबोर्ड' :
             language === 'th' ? 'แผงควบคุม' :
             language === 'vi' ? 'Bảng điều khiển' :
             'Dashboard',
    welcomeBack: language === 'zh' ? '欢迎回来' :
                 language === 'ja' ? 'おかえりなさい' :
                 language === 'ar' ? 'مرحبًا بعودتك' :
                 language === 'es' ? 'Bienvenido de nuevo' :
                 language === 'fr' ? 'Bon retour' :
                 language === 'de' ? 'Willkommen zurück' :
                 language === 'ko' ? '다시 오신 것을 환영합니다' :
                 language === 'ru' ? 'С возвращением' :
                 language === 'pt' ? 'Bem-vindo de volta' :
                 language === 'hi' ? 'वापसी पर स्वागत है' :
                 language === 'th' ? 'ยินดีต้อนรับกลับ' :
                 language === 'vi' ? 'Chào mừng trở lại' :
                 'Welcome back',
    addProduct: language === 'zh' ? '添加产品' :
                language === 'ja' ? '製品を追加' :
                language === 'ar' ? 'إضافة منتج' :
                language === 'es' ? 'Agregar producto' :
                language === 'fr' ? 'Ajouter un produit' :
                language === 'de' ? 'Produkt hinzufügen' :
                language === 'ko' ? '제품 추가' :
                language === 'ru' ? 'Добавить продукт' :
                language === 'pt' ? 'Adicionar produto' :
                language === 'hi' ? 'उत्पाद जोड़ें' :
                language === 'th' ? 'เพิ่มสินค้า' :
                language === 'vi' ? 'Thêm sản phẩm' :
                'Add Product',
    totalProducts: language === 'zh' ? '产品总数' :
                   language === 'ja' ? '製品総数' :
                   language === 'ar' ? 'إجمالي المنتجات' :
                   language === 'es' ? 'Total de productos' :
                   language === 'fr' ? 'Total des produits' :
                   language === 'de' ? 'Gesamtprodukte' :
                   language === 'ko' ? '총 제품' :
                   language === 'ru' ? 'Всего продуктов' :
                   language === 'pt' ? 'Total de produtos' :
                   language === 'hi' ? 'कुल उत्पाद' :
                   language === 'th' ? 'สินค้าทั้งหมด' :
                   language === 'vi' ? 'Tổng số sản phẩm' :
                   'Total Products',
    viewAll: language === 'zh' ? '查看所有产品 →' :
             language === 'ja' ? 'すべての製品を表示 →' :
             language === 'ar' ? 'عرض جميع المنتجات →' :
             language === 'es' ? 'Ver todos los productos →' :
             language === 'fr' ? 'Voir tous les produits →' :
             language === 'de' ? 'Alle Produkte anzeigen →' :
             language === 'ko' ? '모든 제품 보기 →' :
             language === 'ru' ? 'Посмотреть все продукты →' :
             language === 'pt' ? 'Ver todos os produtos →' :
             language === 'hi' ? 'सभी उत्पाद देखें →' :
             language === 'th' ? 'ดูสินค้าทั้งหมด →' :
             language === 'vi' ? 'Xem tất cả sản phẩm →' :
             'View all products →',
    totalViews: language === 'zh' ? '总浏览量' :
                language === 'ja' ? '総閲覧数' :
                language === 'ar' ? 'إجمالي المشاهدات' :
                language === 'es' ? 'Vistas totales' :
                language === 'fr' ? 'Vues totales' :
                language === 'de' ? 'Gesamtansichten' :
                language === 'ko' ? '총 조회수' :
                language === 'ru' ? 'Всего просмотров' :
                language === 'pt' ? 'Visualizações totais' :
                language === 'hi' ? 'कुल दृश्य' :
                language === 'th' ? 'ยอดดูทั้งหมด' :
                language === 'vi' ? 'Tổng lượt xem' :
                'Total Views',
    totalDownloads: language === 'zh' ? '总下载量' :
                    language === 'ja' ? '総ダウンロード数' :
                    language === 'ar' ? 'إجمالي التنزيلات' :
                    language === 'es' ? 'Descargas totales' :
                    language === 'fr' ? 'Téléchargements totaux' :
                    language === 'de' ? 'Gesamtdownloads' :
                    language === 'ko' ? '총 다운로드' :
                    language === 'ru' ? 'Всего загрузок' :
                    language === 'pt' ? 'Downloads totais' :
                    language === 'hi' ? 'कुल डाउनलोड' :
                    language === 'th' ? 'ดาวน์โหลดทั้งหมด' :
                    language === 'vi' ? 'Tổng lượt tải xuống' :
                    'Total Downloads',
    recentProducts: language === 'zh' ? '最近的产品' :
                    language === 'ja' ? '最近の製品' :
                    language === 'ar' ? 'المنتجات الأخيرة' :
                    language === 'es' ? 'Productos recientes' :
                    language === 'fr' ? 'Produits récents' :
                    language === 'de' ? 'Neueste Produkte' :
                    language === 'ko' ? '최근 제품' :
                    language === 'ru' ? 'Недавние продукты' :
                    language === 'pt' ? 'Produtos recentes' :
                    language === 'hi' ? 'हाल के उत्पाद' :
                    language === 'th' ? 'สินค้าล่าสุด' :
                    language === 'vi' ? 'Sản phẩm gần đây' :
                    'Recent Products',
    noProducts: language === 'zh' ? '还没有产品。开始添加您的第一个产品吧！' :
                language === 'ja' ? 'まだ製品がありません。最初の製品を追加しましょう！' :
                language === 'ar' ? 'لا توجد منتجات بعد. ابدأ بإضافة منتجك الأول!' :
                language === 'es' ? 'Aún no hay productos. ¡Comienza agregando tu primer producto!' :
                language === 'fr' ? 'Aucun produit pour le moment. Commencez par ajouter votre premier produit !' :
                language === 'de' ? 'Noch keine Produkte. Beginnen Sie mit dem Hinzufügen Ihres ersten Produkts!' :
                language === 'ko' ? '아직 제품이 없습니다. 첫 번째 제품을 추가하세요!' :
                language === 'ru' ? 'Пока нет продуктов. Начните с добавления вашего первого продукта!' :
                language === 'pt' ? 'Ainda não há produtos. Comece adicionando seu primeiro produto!' :
                language === 'hi' ? 'अभी तक कोई उत्पाद नहीं। अपना पहला उत्पाद जोड़कर शुरू करें!' :
                language === 'th' ? 'ยังไม่มีสินค้า เริ่มด้วยการเพิ่มสินค้าชิ้นแรกของคุณ!' :
                language === 'vi' ? 'Chưa có sản phẩm. Hãy bắt đầu bằng cách thêm sản phẩm đầu tiên của bạn!' :
                'No products yet. Start by adding your first product!',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.dashboard}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t.welcomeBack}, {seller.companyName}
          </p>
        </div>
        <Link
          href="/seller/products/new"
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.addProduct}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.totalProducts}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{productCount}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <Link
            href="/seller/products"
            className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block"
          >
            {t.viewAll}
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.totalViews}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalViews._sum.viewCount || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>All time views</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Brochure Downloads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalDownloads._sum.downloadCount || 0}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm text-purple-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Total downloads</span>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">{t.recentProducts}</h2>
          <Link
            href="/seller/products"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all →
          </Link>
        </div>
        
        {recentProducts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentProducts.map((product: any) => (
              <div key={product.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.mainImageUrl ? (
                        <img
                          src={product.mainImageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{product.title}</h3>
                      <p className="text-sm text-gray-500">{product.category.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {product.viewCount} views • Created {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/products/${product.id}`}
                      target="_blank"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      View
                    </Link>
                    <Link
                      href={`/seller/products/${product.id}/edit`}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">{t.noProducts}</p>
            <Link
              href="/seller/products/new"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.addProduct}
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Manage Your Store</h3>
          <p className="text-blue-100 text-sm mb-4">
            Update your company profile, logo, and banner
          </p>
          <Link
            href="/seller/store"
            className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            Go to Store Settings
          </Link>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Upload Brochures</h3>
          <p className="text-purple-100 text-sm mb-4">
            Add product catalogs and company brochures
          </p>
          <Link
            href="/seller/brochures"
            className="inline-block bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
          >
            Manage Brochures
          </Link>
        </div>
      </div>
      
      {/* Onboarding Guide */}
      {showOnboarding && (
        <OnboardingGuide onClose={() => {
          setShowOnboarding(false)
          localStorage.setItem('seller_has_seen_onboarding', 'true')
        }} />
      )}
      
      {/* Floating Help Button */}
      {!showOnboarding && (
        <button
          onClick={() => setShowOnboarding(true)}
          className="fixed left-4 bottom-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all flex items-center space-x-2"
        >
          <HelpCircle className="w-6 h-6" />
          <span className="text-sm font-medium">Getting Started</span>
        </button>
      )}
    </div>
  )
}
