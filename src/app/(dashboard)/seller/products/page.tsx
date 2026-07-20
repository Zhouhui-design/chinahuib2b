'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Plus, Edit, Trash2, Eye, AlertCircle, Bot, MoveHorizontal, X, Check } from 'lucide-react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

interface Booth {
  id: string
  name: string
  exhibitionName: string
  theme?: string
  colorScheme?: string
}

interface Product {
  id: string
  title: string
  mainImageUrl: string
  viewCount: number
  isActive: boolean
  isAIGenerated?: boolean
  price?: number
  currency?: string
  category?: { name: string } | string
  createdAt: string
  booth?: Booth
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  dbProductsCount?: number
  aiProductsCount?: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [booths, setBooths] = useState<Booth[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [moveProductId, setMoveProductId] = useState<string | null>(null)
  const [moveToBoothId, setMoveToBoothId] = useState<string | null>(null)
  const language = useSellerLanguage()

  const t = {
    myProducts: language === 'zh' ? '我的产品' :
                language === 'ja' ? '私の製品' :
                language === 'ar' ? 'منتجاتي' :
                language === 'es' ? 'Mis productos' :
                language === 'fr' ? 'Mes produits' :
                language === 'de' ? 'Meine Produkte' :
                language === 'ko' ? '내 제품' :
                language === 'ru' ? 'Мои товары' :
                language === 'pt' ? 'Meus produtos' :
                language === 'hi' ? 'मेरे उत्पाद' :
                language === 'th' ? 'สินค้าของฉัน' :
                language === 'vi' ? 'Sản phẩm của tôi' :
                'My Products',
    manageProducts: language === 'zh' ? '管理您的产品列表' :
                    language === 'ja' ? '製品リストを管理' :
                    language === 'ar' ? 'إدارة قائمة المنتجات' :
                    language === 'es' ? 'Gestionar mis productos' :
                    language === 'fr' ? 'Gérer mes produits' :
                    language === 'de' ? 'Meine Produkte verwalten' :
                    language === 'ko' ? '제품 목록 관리' :
                    language === 'ru' ? 'Управление товарами' :
                    language === 'pt' ? 'Gerenciar meus produtos' :
                    language === 'hi' ? 'अपने उत्पाद सूची का प्रबंधन करें' :
                    language === 'th' ? 'จัดการรายการสินค้า' :
                    language === 'vi' ? 'Quản lý danh sách sản phẩm' :
                    'Manage your product listings',
    aiProducts: language === 'zh' ? 'AI产品' :
                language === 'ja' ? 'AI製品' :
                language === 'ar' ? 'منتجات AI' :
                language === 'es' ? 'Productos AI' :
                language === 'fr' ? 'Produits AI' :
                language === 'de' ? 'AI-Produkte' :
                language === 'ko' ? 'AI 제품' :
                language === 'ru' ? 'AI товары' :
                language === 'pt' ? 'Produtos AI' :
                language === 'hi' ? 'AI उत्पाद' :
                language === 'th' ? 'ผลิตภัณฑ์ AI' :
                language === 'vi' ? 'Sản phẩm AI' :
                'AI Products',
    addProduct: language === 'zh' ? '添加产品' :
                language === 'ja' ? '製品を追加' :
                language === 'ar' ? 'إضافة منتج' :
                language === 'es' ? 'Agregar producto' :
                language === 'fr' ? 'Ajouter produit' :
                language === 'de' ? 'Produkt hinzufügen' :
                language === 'ko' ? '제품 추가' :
                language === 'ru' ? 'Добавить товар' :
                language === 'pt' ? 'Adicionar produto' :
                language === 'hi' ? 'उत्पाद जोड़ें' :
                language === 'th' ? 'เพิ่มสินค้า' :
                language === 'vi' ? 'Thêm sản phẩm' :
                'Add Product',
    product: language === 'zh' ? '产品' :
             language === 'ja' ? '製品' :
             language === 'ar' ? 'منتج' :
             language === 'es' ? 'Producto' :
             language === 'fr' ? 'Produit' :
             language === 'de' ? 'Produkt' :
             language === 'ko' ? '제품' :
             language === 'ru' ? 'Товар' :
             language === 'pt' ? 'Produto' :
             language === 'hi' ? 'उत्पाद' :
             language === 'th' ? 'สินค้า' :
             language === 'vi' ? 'Sản phẩm' :
             'Product',
    category: language === 'zh' ? '分类' :
              language === 'ja' ? 'カテゴリ' :
              language === 'ar' ? 'الفئة' :
              language === 'es' ? 'Categoría' :
              language === 'fr' ? 'Catégorie' :
              language === 'de' ? 'Kategorie' :
              language === 'ko' ? '카테고리' :
              language === 'ru' ? 'Категория' :
              language === 'pt' ? 'Categoria' :
              language === 'hi' ? 'श्रेणी' :
              language === 'th' ? 'หมวดหมู่' :
              language === 'vi' ? 'Danh mục' :
              'Category',
    exhibition: language === 'zh' ? '展会' :
                language === 'ja' ? '展示会' :
                language === 'ar' ? 'معرض' :
                language === 'es' ? 'Exhibición' :
                language === 'fr' ? 'Exposition' :
                language === 'de' ? 'Ausstellung' :
                language === 'ko' ? '전시회' :
                language === 'ru' ? 'Выставка' :
                language === 'pt' ? 'Exposição' :
                language === 'hi' ? 'प्रदर्शनी' :
                language === 'th' ? 'งานแสดงสินค้า' :
                language === 'vi' ? 'Triển lãm' :
                'Exhibition',
    price: language === 'zh' ? '价格' :
           language === 'ja' ? '価格' :
           language === 'ar' ? 'السعر' :
           language === 'es' ? 'Precio' :
           language === 'fr' ? 'Prix' :
           language === 'de' ? 'Preis' :
           language === 'ko' ? '가격' :
           language === 'ru' ? 'Цена' :
           language === 'pt' ? 'Preço' :
           language === 'hi' ? 'मूल्य' :
           language === 'th' ? 'ราคา' :
           language === 'vi' ? 'Giá' :
           'Price',
    views: language === 'zh' ? '浏览量' :
           language === 'ja' ? '閲覧数' :
           language === 'ar' ? 'المشاهدات' :
           language === 'es' ? 'Vistas' :
           language === 'fr' ? 'Vues' :
           language === 'de' ? 'Ansichten' :
           language === 'ko' ? '조회수' :
           language === 'ru' ? 'Просмотры' :
           language === 'pt' ? 'Visualizações' :
           language === 'hi' ? 'दृश्य' :
           language === 'th' ? 'จำนวนการดู' :
           language === 'vi' ? 'Lượt xem' :
           'Views',
    status: language === 'zh' ? '状态' :
            language === 'ja' ? 'ステータス' :
            language === 'ar' ? 'الحالة' :
            language === 'es' ? 'Estado' :
            language === 'fr' ? 'Statut' :
            language === 'de' ? 'Status' :
            language === 'ko' ? '상태' :
            language === 'ru' ? 'Статус' :
            language === 'pt' ? 'Status' :
            language === 'hi' ? 'स्थिति' :
            language === 'th' ? 'สถานะ' :
            language === 'vi' ? 'Trạng thái' :
            'Status',
    created: language === 'zh' ? '创建时间' :
             language === 'ja' ? '作成日' :
             language === 'ar' ? 'تاريخ الإنشاء' :
             language === 'es' ? 'Creado' :
             language === 'fr' ? 'Créé' :
             language === 'de' ? 'Erstellt' :
             language === 'ko' ? '생성일' :
             language === 'ru' ? 'Создано' :
             language === 'pt' ? 'Criado' :
             language === 'hi' ? 'बनाया गया' :
             language === 'th' ? 'สร้างเมื่อ' :
             language === 'vi' ? 'Tạo lúc' :
             'Created',
    actions: language === 'zh' ? '操作' :
             language === 'ja' ? 'アクション' :
             language === 'ar' ? 'إجراءات' :
             language === 'es' ? 'Acciones' :
             language === 'fr' ? 'Actions' :
             language === 'de' ? 'Aktionen' :
             language === 'ko' ? '행동' :
             language === 'ru' ? 'Действия' :
             language === 'pt' ? 'Ações' :
             language === 'hi' ? 'क्रियाएं' :
             language === 'th' ? 'การกระทำ' :
             language === 'vi' ? 'Hành động' :
             'Actions',
    tryAgain: language === 'zh' ? '重试' :
              language === 'ja' ? '再試行' :
              language === 'ar' ? 'إعادة المحاولة' :
              language === 'es' ? 'Intentar de nuevo' :
              language === 'fr' ? 'Réessayer' :
              language === 'de' ? 'Erneut versuchen' :
              language === 'ko' ? '다시 시도' :
              language === 'ru' ? 'Попробовать снова' :
              language === 'pt' ? 'Tentar novamente' :
              language === 'hi' ? 'पुनः प्रयास करें' :
              language === 'th' ? 'ลองอีกครั้ง' :
              language === 'vi' ? 'Thử lại' :
              'Try Again',
    active: language === 'zh' ? '已激活' :
            language === 'ja' ? 'アクティブ' :
            language === 'ar' ? 'نشط' :
            language === 'es' ? 'Activo' :
            language === 'fr' ? 'Actif' :
            language === 'de' ? 'Aktiv' :
            language === 'ko' ? '활성' :
            language === 'ru' ? 'Активен' :
            language === 'pt' ? 'Ativo' :
            language === 'hi' ? 'सक्रिय' :
            language === 'th' ? 'ใช้งาน' :
            language === 'vi' ? 'Hoạt động' :
            'Active',
    exhibitionBooths: language === 'zh' ? '我的展会展位' :
                      language === 'ja' ? '私の展示ブース' :
                      language === 'ar' ? 'أكشاف المعرض' :
                      language === 'es' ? 'Mis stands de exhibición' :
                      language === 'fr' ? 'Mes stands d\'exposition' :
                      language === 'de' ? 'Meine Ausstellungsstände' :
                      language === 'ko' ? '내 전시 부스' :
                      language === 'ru' ? 'Мои выставочные стенды' :
                      language === 'pt' ? 'Meus estandes' :
                      language === 'hi' ? 'मेरी प्रदर्शनी बूथ' :
                      language === 'th' ? 'บูธนิทรรศการของฉัน' :
                      language === 'vi' ? 'Booth triển lãm của tôi' :
                      'My Exhibition Booths',
    manageBooths: language === 'zh' ? '管理展位' :
                  language === 'ja' ? 'ブース管理' :
                  language === 'ar' ? 'إدارة الأكشاف' :
                  language === 'es' ? 'Gestionar stands' :
                  language === 'fr' ? 'Gérer les stands' :
                  language === 'de' ? 'Stände verwalten' :
                  language === 'ko' ? '부스 관리' :
                  language === 'ru' ? 'Управление стендами' :
                  language === 'pt' ? 'Gerenciar estandes' :
                  language === 'hi' ? 'बूथ प्रबंधन' :
                  language === 'th' ? 'จัดการบูธ' :
                  language === 'vi' ? 'Quản lý booth' :
                  'Manage Booths',
    showcaseProducts: language === 'zh' ? '管理您的贸易展会展位并展示产品' :
                      language === 'ja' ? '貿易ショーのブースを管理し、製品を展示' :
                      language === 'ar' ? 'إدارة أكشاف المعرض التجاري وعرض المنتجات' :
                      language === 'es' ? 'Gestionar sus stands de feria y mostrar productos' :
                      language === 'fr' ? 'Gérer vos stands de salon et présenter vos produits' :
                      language === 'de' ? 'Verwalten Sie Ihre Messestände und präsentieren Sie Produkte' :
                      language === 'ko' ? '무역 박람회 부스 관리 및 제품 전시' :
                      language === 'ru' ? 'Управление выставочными стендами и демонстрация продуктов' :
                      language === 'pt' ? 'Gerenciar seus estandes de feira e exibir produtos' :
                      language === 'hi' ? 'अपने व्यापार प्रदर्शनी बूथ का प्रबंधन करें और उत्पाद प्रदर्शित करें' :
                      language === 'th' ? 'จัดการบูธนิทรรศการการค้าและแสดงสินค้า' :
                      language === 'vi' ? 'Quản lý booth hội chợ thương mại và trưng bày sản phẩm' :
                      'Manage your trade show booths and showcase your products',
    moveToBooth: language === 'zh' ? '移动到展会' :
                 language === 'ja' ? 'ブースに移動' :
                 language === 'ar' ? 'نقل إلى الكشك' :
                 language === 'es' ? 'Mover a stand' :
                 language === 'fr' ? 'Déplacer au stand' :
                 language === 'de' ? 'Zu Stand verschieben' :
                 language === 'ko' ? '부스로 이동' :
                 language === 'ru' ? 'Переместить на стенд' :
                 language === 'pt' ? 'Mover para estande' :
                 language === 'hi' ? 'बूथ में स्थानांतरित करें' :
                 language === 'th' ? 'ย้ายไปยังบูธ' :
                 language === 'vi' ? 'Chuyển đến booth' :
                 'Move to Booth',
    selectBooth: language === 'zh' ? '选择展会' :
                 language === 'ja' ? 'ブースを選択' :
                 language === 'ar' ? 'اختر الكشك' :
                 language === 'es' ? 'Seleccionar stand' :
                 language === 'fr' ? 'Sélectionner le stand' :
                 language === 'de' ? 'Stand auswählen' :
                 language === 'ko' ? '부스 선택' :
                 language === 'ru' ? 'Выберите стенд' :
                 language === 'pt' ? 'Selecionar estande' :
                 language === 'hi' ? 'बूथ चुनें' :
                 language === 'th' ? 'เลือกบูธ' :
                 language === 'vi' ? 'Chọn booth' :
                 'Select Booth',
    moveSuccess: language === 'zh' ? '产品已成功移动到展会' :
                 language === 'ja' ? '製品はブースに正常に移動されました' :
                 language === 'ar' ? 'تم نقل المنتج بنجاح إلى الكشك' :
                 language === 'es' ? 'Producto movido exitosamente al stand' :
                 language === 'fr' ? 'Produit déplacé avec succès au stand' :
                 language === 'de' ? 'Produkt erfolgreich zum Stand verschoben' :
                 language === 'ko' ? '제품이 부스로 성공적으로 이동되었습니다' :
                 language === 'ru' ? 'Продукт успешно перемещен на стенд' :
                 language === 'pt' ? 'Produto movido com sucesso para o estande' :
                 language === 'hi' ? 'उत्पाद बूथ में सफलतापूर्वक स्थानांतरित हो गया है' :
                 language === 'th' ? 'ย้ายสินค้าสำเร็จ' :
                 language === 'vi' ? 'Chuyển sản phẩm thành công' :
                 'Product moved to booth successfully',
    view: language === 'zh' ? '查看' :
          language === 'ja' ? '表示' :
          language === 'ar' ? 'عرض' :
          language === 'es' ? 'Ver' :
          language === 'fr' ? 'Voir' :
          language === 'de' ? 'Ansehen' :
          language === 'ko' ? '보기' :
          language === 'ru' ? 'Просмотреть' :
          language === 'pt' ? 'Ver' :
          language === 'hi' ? 'देखें' :
          language === 'th' ? 'ดู' :
          language === 'vi' ? 'Xem' :
          'View',
    edit: language === 'zh' ? '编辑' :
          language === 'ja' ? '編集' :
          language === 'ar' ? 'تحرير' :
          language === 'es' ? 'Editar' :
          language === 'fr' ? 'Éditer' :
          language === 'de' ? 'Bearbeiten' :
          language === 'ko' ? '편집' :
          language === 'ru' ? 'Редактировать' :
          language === 'pt' ? 'Editar' :
          language === 'hi' ? 'संपादित करें' :
          language === 'th' ? 'แก้ไข' :
          language === 'vi' ? 'Chỉnh sửa' :
          'Edit',
    delete: language === 'zh' ? '删除' :
            language === 'ja' ? '削除' :
            language === 'ar' ? 'حذف' :
            language === 'es' ? 'Eliminar' :
            language === 'fr' ? 'Supprimer' :
            language === 'de' ? 'Löschen' :
            language === 'ko' ? '삭제' :
            language === 'ru' ? 'Удалить' :
            language === 'pt' ? 'Excluir' :
            language === 'hi' ? 'हटाना' :
            language === 'th' ? 'ลบ' :
            language === 'vi' ? 'Xóa' :
            'Delete',
    noProductsYet: language === 'zh' ? '还没有产品' :
                   language === 'ja' ? 'まだ製品がありません' :
                   language === 'ar' ? 'لا توجد منتجات حتى الآن' :
                   language === 'es' ? 'No hay productos todavía' :
                   language === 'fr' ? 'Pas de produits encore' :
                   language === 'de' ? 'Noch keine Produkte' :
                   language === 'ko' ? '제품이 없습니다' :
                   language === 'ru' ? 'Нет продуктов' :
                   language === 'pt' ? 'Sem produtos ainda' :
                   language === 'hi' ? 'अभी तक कोई उत्पाद नहीं' :
                   language === 'th' ? 'ยังไม่มีสินค้า' :
                   language === 'vi' ? 'Chưa có sản phẩm' :
                   'No products yet',
    startAdding: language === 'zh' ? '开始添加您的第一个产品，向买家展示' :
                language === 'ja' ? '最初の製品を追加して、買い手に見せましょう' :
                language === 'ar' ? 'ابدأ بإضافة أول منتجك لعرضه للمشترين' :
                language === 'es' ? 'Comienza agregando tu primer producto para mostrar a los compradores' :
                language === 'fr' ? 'Commencez par ajouter votre premier produit pour le présenter aux acheteurs' :
                language === 'de' ? 'Beginnen Sie mit dem Hinzufügen Ihres ersten Produkts' :
                language === 'ko' ? '첫 번째 제품을 추가하여 구매자에게 보여주세요' :
                language === 'ru' ? 'Начните с добавления первого продукта' :
                language === 'pt' ? 'Comece adicionando seu primeiro produto' :
                language === 'hi' ? 'अपना पहला उत्पाद जोड़कर खरीदारों को दिखाना शुरू करें' :
                language === 'th' ? 'เริ่มด้วยการเพิ่มสินค้าแรกของคุณ' :
                language === 'vi' ? 'Bắt đầu bằng cách thêm sản phẩm đầu tiên' :
                'Start by adding your first product to showcase to buyers.',
    createWithAI: language === 'zh' ? '用AI创建' :
                 language === 'ja' ? 'AIで作成' :
                 language === 'ar' ? 'إنشاء مع AI' :
                 language === 'es' ? 'Crear con AI' :
                 language === 'fr' ? 'Créer avec AI' :
                 language === 'de' ? 'Mit AI erstellen' :
                 language === 'ko' ? 'AI로 만들기' :
                 language === 'ru' ? 'Создать с AI' :
                 language === 'pt' ? 'Criar com AI' :
                 language === 'hi' ? 'AI से बनाएं' :
                 language === 'th' ? 'สร้างด้วย AI' :
                 language === 'vi' ? 'Tạo với AI' :
                 'Create with AI',
    addManually: language === 'zh' ? '手动添加' :
                language === 'ja' ? '手動で追加' :
                language === 'ar' ? 'إضافة يدوية' :
                language === 'es' ? 'Agregar manualmente' :
                language === 'fr' ? 'Ajouter manuellement' :
                language === 'de' ? 'Manuell hinzufügen' :
                language === 'ko' ? '수동 추가' :
                language === 'ru' ? 'Добавить вручную' :
                language === 'pt' ? 'Adicionar manualmente' :
                language === 'hi' ? 'मैन्युअल रूप से जोड़ें' :
                language === 'th' ? 'เพิ่มด้วยตนเอง' :
                language === 'vi' ? 'Thêm thủ công' :
                'Add Manually',
    cancel: language === 'zh' ? '取消' :
           language === 'ja' ? 'キャンセル' :
           language === 'ar' ? 'إلغاء' :
           language === 'es' ? 'Cancelar' :
           language === 'fr' ? 'Annuler' :
           language === 'de' ? 'Abbrechen' :
           language === 'ko' ? '취소' :
           language === 'ru' ? 'Отмена' :
           language === 'pt' ? 'Cancelar' :
           language === 'hi' ? 'रद्द करें' :
           language === 'th' ? 'ยกเลิก' :
           language === 'vi' ? 'Hủy' :
           'Cancel'
  }

  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/products?page=${page}&limit=20`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data.products)
      setBooths(data.booths || [])
      setPagination(data.pagination)
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (productId: string, productTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${productTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      setProducts(products.filter(p => p.id !== productId))

    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const handleMoveToBooth = async () => {
    if (!moveProductId || !moveToBoothId) return

    try {
      const response = await fetch(`/api/products/${moveProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boothId: moveToBoothId })
      })

      const data = await response.json()
      if (data.success) {
        setProducts(products.map(p => 
          p.id === moveProductId 
            ? { ...p, booth: booths.find(b => b.id === moveToBoothId) }
            : p
        ))
        alert(t.moveSuccess)
      } else {
        alert(data.error || 'Failed to move product')
      }
    } catch (error) {
      console.error('Error moving product:', error)
      alert('Failed to move product')
    } finally {
      setMoveProductId(null)
      setMoveToBoothId(null)
    }
  }

  const getCategoryName = (category: { name: string } | string | undefined): string => {
    if (!category) return 'Uncategorized'
    if (typeof category === 'string') return category
    return category.name
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Products</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={() => fetchProducts(currentPage)}
              className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
            >
              {t.tryAgain}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.myProducts}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t.manageProducts} ({pagination?.total || 0} {language === 'zh' ? '个' : language === 'ja' ? '個' : language === 'hi' ? 'कुल' : 'total'})
            {pagination?.aiProductsCount !== undefined && pagination.aiProductsCount > 0 && (
              <span className="ml-2 text-blue-600">
                ({pagination.dbProductsCount || 0} manual + {pagination.aiProductsCount} AI)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/seller/ai-management"
            className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Bot className="w-4 h-4 mr-2" />
            {t.aiProducts}
          </Link>
          <Link
            href="/seller/products/new"
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.addProduct}
          </Link>
        </div>
      </div>

      {products.length > 0 ? (
        <>
          {/* Exhibition Booths Section */}
          {booths.length > 0 && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center">
                    <span className="mr-2">🎪</span>
                    {t.exhibitionBooths}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">{t.showcaseProducts}</p>
                </div>
                <Link
                  href="/seller/booths"
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                >
                  {t.manageBooths}
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {booths.map((booth) => (
                  <div
                    key={booth.id}
                    className="bg-white/10 rounded-lg p-4 backdrop-blur"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{booth.name}</h3>
                        <p className="text-blue-100 text-sm">{booth.exhibitionName}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          booth.theme === 'Dark' ? 'bg-gray-800' :
                          booth.theme === 'Vibrant' ? 'bg-purple-500' :
                          booth.theme === 'Professional' ? 'bg-blue-700' :
                          'bg-gray-600'
                        }`}
                      >
                        {booth.theme || 'Light'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.product}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.category}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.exhibition}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.price}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.views}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.status}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.created}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {product.mainImageUrl ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.mainImageUrl}
                              alt={product.title}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {product.title}
                            {product.isAIGenerated && (
                              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center">
                                <Bot className="w-3 h-3 mr-1" />
                                AI
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCategoryName(product.category)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {product.booth ? (
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-1">🎪</span>
                            <span className="text-gray-900">{product.booth.exhibitionName || product.booth.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.price ? `${product.currency || 'USD'} ${product.price}` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Eye className="w-4 h-4 mr-1 text-gray-400" />
                        {product.viewCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? t.active : (language === 'zh' ? '未激活' : language === 'ja' ? '非アクティブ' : language === 'hi' ? 'असक्रिय' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/products/${product.id}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900"
                          title="View on site"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {!product.isAIGenerated && (
                          <Link
                            href={`/seller/products/${product.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
                        {booths.length > 0 && (
                          <button
                            onClick={() => setMoveProductId(product.id)}
                            className="text-green-600 hover:text-green-900"
                            title={t.moveToBooth}
                          >
                            <MoveHorizontal className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(product.id, product.title)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 sm:px-6 rounded-lg">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchProducts(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchProducts(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => fetchProducts(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => fetchProducts(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => fetchProducts(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noProductsYet}</h3>
          <p className="text-gray-600 mb-6">{t.startAdding}</p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/seller/ai-management"
              className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Bot className="w-5 h-5 mr-2" />
              {t.createWithAI}
            </Link>
            <Link
              href="/seller/products/new"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t.addManually}
            </Link>
          </div>
        </div>
      )}

      {/* Move to Booth Modal */}
      {moveProductId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t.moveToBooth}</h2>
              <button
                onClick={() => {
                  setMoveProductId(null)
                  setMoveToBoothId(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.selectBooth}
              </label>
              <select
                value={moveToBoothId || ''}
                onChange={(e) => setMoveToBoothId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t.selectBooth}</option>
                {booths.map((booth) => (
                  <option key={booth.id} value={booth.id}>
                    {booth.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setMoveProductId(null)
                  setMoveToBoothId(null)
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleMoveToBooth}
                disabled={!moveToBoothId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {t.moveToBooth}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}