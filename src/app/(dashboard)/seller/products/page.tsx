'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Plus, Edit, Trash2, Eye, AlertCircle, Bot, MoveHorizontal, X, Check, AlertTriangle } from 'lucide-react'
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
  const [viewStatsProductId, setViewStatsProductId] = useState<string | null>(null)
  const [viewStats, setViewStats] = useState<any>(null)
  const [viewStatsLoading, setViewStatsLoading] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false)
  const [batchDeleting, setBatchDeleting] = useState(false)
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
           'Cancel',
    viewStats: language === 'zh' ? '浏览统计' :
               language === 'ja' ? '閲覧統計' :
               language === 'ar' ? 'إحصاءات المشاهدات' :
               language === 'es' ? 'Estadísticas de vistas' :
               language === 'fr' ? 'Statistiques des vues' :
               language === 'de' ? 'Aufrufstatistiken' :
               language === 'ko' ? '조회 통계' :
               language === 'ru' ? 'Статистика просмотров' :
               language === 'pt' ? 'Estatísticas de visualizações' :
               language === 'hi' ? 'दृश्य आँकड़े' :
               language === 'th' ? 'สถิติการดู' :
               language === 'vi' ? 'Thống kê lượt xem' :
               'View Statistics',
    totalViews: language === 'zh' ? '总浏览量' :
                language === 'ja' ? '総閲覧数' :
                language === 'ar' ? 'إجمالي المشاهدات' :
                language === 'es' ? 'Total de vistas' :
                language === 'fr' ? 'Total des vues' :
                language === 'de' ? 'Gesamtaufrufe' :
                language === 'ko' ? '총 조회수' :
                language === 'ru' ? 'Всего просмотров' :
                language === 'pt' ? 'Total de visualizações' :
                language === 'hi' ? 'कुल दृश्य' :
                language === 'th' ? 'จำนวนการดูทั้งหมด' :
                language === 'vi' ? 'Tổng lượt xem' :
                'Total Views',
    selfViews: language === 'zh' ? '自己浏览' :
               language === 'ja' ? '自己の閲覧' :
               language === 'ar' ? 'مشاهدات ذاتية' :
               language === 'es' ? 'Vistas propias' :
               language === 'fr' ? 'Vues propres' :
               language === 'de' ? 'Eigene Aufrufe' :
               language === 'ko' ? '자신의 조회' :
               language === 'ru' ? 'Собственные просмотры' :
               language === 'pt' ? 'Visualizações próprias' :
               language === 'hi' ? 'स्वयं दृश्य' :
               language === 'th' ? 'การดูของตนเอง' :
               language === 'vi' ? 'Lượt xem của bản thân' :
               'Self Views',
    externalViews: language === 'zh' ? '外部浏览' :
                   language === 'ja' ? '外部の閲覧' :
                   language === 'ar' ? 'مشاهدات خارجية' :
                   language === 'es' ? 'Vistas externas' :
                   language === 'fr' ? 'Vues externes' :
                   language === 'de' ? 'Externe Aufrufe' :
                   language === 'ko' ? '외부 조회' :
                   language === 'ru' ? 'Внешние просмотры' :
                   language === 'pt' ? 'Visualizações externas' :
                   language === 'hi' ? 'बाहरी दृश्य' :
                   language === 'th' ? 'การดูจากภายนอก' :
                   language === 'vi' ? 'Lượt xem từ bên ngoài' :
                   'External Views',
    domesticViews: language === 'zh' ? '国内浏览' :
                   language === 'ja' ? '国内閲覧' :
                   language === 'ar' ? 'مشاهدات محلية' :
                   language === 'es' ? 'Vistas nacionales' :
                   language === 'fr' ? 'Vues nationales' :
                   language === 'de' ? 'Inländische Aufrufe' :
                   language === 'ko' ? '국내 조회' :
                   language === 'ru' ? 'Внутренние просмотры' :
                   language === 'pt' ? 'Visualizações nacionais' :
                   language === 'hi' ? 'घरेलू दृश्य' :
                   language === 'th' ? 'การดูในประเทศ' :
                   language === 'vi' ? 'Lượt xem trong nước' :
                   'Domestic Views',
    internationalViews: language === 'zh' ? '国际浏览' :
                        language === 'ja' ? '国際閲覧' :
                        language === 'ar' ? 'مشاهدات دولية' :
                        language === 'es' ? 'Vistas internacionales' :
                        language === 'fr' ? 'Vues internationales' :
                        language === 'de' ? 'Internationale Aufrufe' :
                        language === 'ko' ? '국제 조회' :
                        language === 'ru' ? 'Международные просмотры' :
                        language === 'pt' ? 'Visualizações internacionais' :
                        language === 'hi' ? 'अंतर्राष्ट्रीय दृश्य' :
                        language === 'th' ? 'การดูจากต่างประเทศ' :
                        language === 'vi' ? 'Lượt xem quốc tế' :
                        'International Views',
    topCountries: language === 'zh' ? '热门国家' :
                  language === 'ja' ? '人気の国' :
                  language === 'ar' ? 'الدول الشائعة' :
                  language === 'es' ? 'Países principales' :
                  language === 'fr' ? 'Principaux pays' :
                  language === 'de' ? 'Top-Länder' :
                  language === 'ko' ? '인기 국가' :
                  language === 'ru' ? 'Популярные страны' :
                  language === 'pt' ? 'Países principais' :
                  language === 'hi' ? 'विश्व के देश' :
                  language === 'th' ? 'ประเทศยอดนิยม' :
                  language === 'vi' ? 'Các quốc gia phổ biến' :
                  'Top Countries',
    recentVisitors: language === 'zh' ? '最近访客' :
                    language === 'ja' ? '最近の訪問者' :
                    language === 'ar' ? 'الزوار الأخيرون' :
                    language === 'es' ? 'Visitantes recientes' :
                    language === 'fr' ? 'Visiteurs récents' :
                    language === 'de' ? 'Letzte Besucher' :
                    language === 'ko' ? '최근 방문자' :
                    language === 'ru' ? 'Недавние посетители' :
                    language === 'pt' ? 'Visitantes recentes' :
                    language === 'hi' ? 'हाल के आगंतुक' :
                    language === 'th' ? 'ผู้เข้าชมล่าสุด' :
                    language === 'vi' ? 'Khách truy cập gần đây' :
                    'Recent Visitors',
    close: language === 'zh' ? '关闭' :
           language === 'ja' ? '閉じる' :
           language === 'ar' ? 'إغلاق' :
           language === 'es' ? 'Cerrar' :
           language === 'fr' ? 'Fermer' :
           language === 'de' ? 'Schließen' :
           language === 'ko' ? '닫기' :
           language === 'ru' ? 'Закрыть' :
           language === 'pt' ? 'Fechar' :
           language === 'hi' ? 'बंद करें' :
           language === 'th' ? 'ปิด' :
           language === 'vi' ? 'Đóng' :
           'Close',
    viewDetails: language === 'zh' ? '查看详情' :
                 language === 'ja' ? '詳細を表示' :
                 language === 'ar' ? 'عرض التفاصيل' :
                 language === 'es' ? 'Ver detalles' :
                 language === 'fr' ? 'Voir les détails' :
                 language === 'de' ? 'Details anzeigen' :
                 language === 'ko' ? '세부 정보 보기' :
                 language === 'ru' ? 'Посмотреть детали' :
                 language === 'pt' ? 'Ver detalhes' :
                 language === 'hi' ? 'विवरण देखें' :
                 language === 'th' ? 'ดูรายละเอียด' :
                 language === 'vi' ? 'Xem chi tiết' :
                 'View Details',
    noStats: language === 'zh' ? '暂无统计数据' :
             language === 'ja' ? '統計データがありません' :
             language === 'ar' ? 'لا توجد بيانات إحصاءية' :
             language === 'es' ? 'No hay datos estadísticos' :
             language === 'fr' ? 'Pas de données statistiques' :
             language === 'de' ? 'Keine Statistikdaten' :
             language === 'ko' ? '통계 데이터 없음' :
             language === 'ru' ? 'Нет статистических данных' :
             language === 'pt' ? 'Sem dados estatísticos' :
             language === 'hi' ? 'कोई आँकड़ा नहीं' :
             language === 'th' ? 'ไม่มีข้อมูลสถิติ' :
             language === 'vi' ? 'Không có dữ liệu thống kê' :
             'No statistics yet',
    selfViewLabel: language === 'zh' ? '自己' :
                   language === 'ja' ? '自己' :
                   language === 'ar' ? 'ذاتي' :
                   language === 'es' ? 'Propio' :
                   language === 'fr' ? 'Propre' :
                   language === 'de' ? 'Eigener' :
                   language === 'ko' ? '자신' :
                   language === 'ru' ? 'Свой' :
                   language === 'pt' ? 'Próprio' :
                   language === 'hi' ? 'स्वयं' :
                   language === 'th' ? 'ตนเอง' :
                   language === 'vi' ? 'Bản thân' :
                   'Self',
    externalViewLabel: language === 'zh' ? '外部' :
                       language === 'ja' ? '外部' :
                       language === 'ar' ? 'خارجي' :
                       language === 'es' ? 'Externo' :
                       language === 'fr' ? 'Externe' :
                       language === 'de' ? 'Extern' :
                       language === 'ko' ? '외부' :
                       language === 'ru' ? 'Внешний' :
                       language === 'pt' ? 'Externo' :
                       language === 'hi' ? 'बाहरी' :
                       language === 'th' ? 'ภายนอก' :
                       language === 'vi' ? 'Bên ngoài' :
                       'External',
    loading: language === 'zh' ? '加载中...' :
             language === 'ja' ? '読み込み中...' :
             language === 'ar' ? 'جاري التحميل...' :
             language === 'es' ? 'Cargando...' :
             language === 'fr' ? 'Chargement...' :
             language === 'de' ? 'Laden...' :
             language === 'ko' ? '로딩 중...' :
             language === 'ru' ? 'Загрузка...' :
             language === 'pt' ? 'Carregando...' :
             language === 'hi' ? 'लोड हो रहा है...' :
             language === 'th' ? 'กำลังโหลด...' :
             language === 'vi' ? 'Đang tải...' :
             'Loading...',
    batchDelete: language === 'zh' ? '批量删除' :
                 language === 'ja' ? '一括削除' :
                 language === 'ar' ? 'حذف جماعي' :
                 language === 'es' ? 'Eliminar en lote' :
                 language === 'fr' ? 'Supprimer en lot' :
                 language === 'de' ? 'Stapellöschung' :
                 language === 'ko' ? '일괄 삭제' :
                 language === 'ru' ? 'Массовое удаление' :
                 language === 'pt' ? 'Excluir em lote' :
                 language === 'hi' ? 'बल्क हटाएं' :
                 language === 'th' ? 'ลบเป็นชุด' :
                 language === 'vi' ? 'Xóa hàng loạt' :
                 'Batch Delete',
    selected: language === 'zh' ? '已选择' :
              language === 'ja' ? '選択中' :
              language === 'ar' ? 'محدد' :
              language === 'es' ? 'Seleccionados' :
              language === 'fr' ? 'Sélectionnés' :
              language === 'de' ? 'Ausgewählt' :
              language === 'ko' ? '선택됨' :
              language === 'ru' ? 'Выбрано' :
              language === 'pt' ? 'Selecionados' :
              language === 'hi' ? 'चयनित' :
              language === 'th' ? 'เลือกแล้ว' :
              language === 'vi' ? 'Đã chọn' :
              'Selected',
    items: language === 'zh' ? '项' :
           language === 'ja' ? '件' :
           language === 'ar' ? 'عنصر' :
           language === 'es' ? 'elementos' :
           language === 'fr' ? 'éléments' :
           language === 'de' ? 'Einträge' :
           language === 'ko' ? '개' :
           language === 'ru' ? 'шт.' :
           language === 'pt' ? 'itens' :
           language === 'hi' ? 'आइटम' :
           language === 'th' ? 'รายการ' :
           language === 'vi' ? 'mục' :
           'items',
    confirmBatchDeleteTitle: language === 'zh' ? '确认批量删除' :
                            language === 'ja' ? '一括削除の確認' :
                            language === 'ar' ? 'تأكيد الحذف الجماعي' :
                            language === 'es' ? 'Confirmar eliminación en lote' :
                            language === 'fr' ? 'Confirmer la suppression en lot' :
                            language === 'de' ? 'Stapellöschung bestätigen' :
                            language === 'ko' ? '일괄 삭제 확인' :
                            language === 'ru' ? 'Подтвердить массовое удаление' :
                            language === 'pt' ? 'Confirmar exclusão em lote' :
                            language === 'hi' ? 'बल्क हटाने की पुष्टि करें' :
                            language === 'th' ? 'ยืนยันการลบเป็นชุด' :
                            language === 'vi' ? 'Xác nhận xóa hàng loạt' :
                            'Confirm Batch Delete',
    confirmBatchDeleteMsg: language === 'zh' ? '确定要删除选中的 {count} 个产品吗？此操作不可撤销。' :
                           language === 'ja' ? '選択した {count} 個の製品を削除しますか？この操作は元に戻せません。' :
                           language === 'ar' ? 'هل أنت متأكد من حذف {count} منتجات محددة؟ لا يمكن التراجع عن هذا الإجراء.' :
                           language === 'es' ? '¿Está seguro de eliminar {count} productos seleccionados? Esta acción no se puede deshacer.' :
                           language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer les {count} produits sélectionnés ? Cette action est irréversible.' :
                           language === 'de' ? 'Möchten Sie {count} ausgewählte Produkte löschen? Diese Aktion kann nicht rückgängig gemacht werden.' :
                           language === 'ko' ? '선택한 {count}개 제품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.' :
                           language === 'ru' ? 'Вы уверены, что хотите удалить выбранные {count} продуктов? Это действие нельзя отменить.' :
                           language === 'pt' ? 'Tem certeza de que deseja excluir {count} produtos selecionados? Esta ação não pode ser desfeita.' :
                           language === 'hi' ? 'क्या आप {count} चयनित उत्पादों को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।' :
                           language === 'th' ? 'คุณแน่ใจหรือว่าต้องการลบสินค้า {count} รายการที่เลือก? การดำเนินการนี้ไม่สามารถยกเลิกได้' :
                           language === 'vi' ? 'Bạn có chắc muốn xóa {count} sản phẩm đã chọn? Hành động này không thể hoàn tác.' :
                           'Are you sure you want to delete the selected {count} products? This action cannot be undone.',
    batchDeleteWarning: language === 'zh' ? '此操作将永久删除选中的产品，包括相关图片和数据，且无法恢复。' :
                         language === 'ja' ? '選択した製品および関連する画像・データは完全に削除され、復元できません。' :
                         language === 'ar' ? 'سيتم حذف المنتجات المحددة نهائيًا بما في ذلك الصور والبيانات ذات الصلة، ولا يمكن استعادتها.' :
                         language === 'es' ? 'Esto eliminará permanentemente los productos seleccionados, incluidas las imágenes y datos relacionados, y no se puede deshacer.' :
                         language === 'fr' ? 'Cela supprimera définitivement les produits sélectionnés, y compris les images et données associées, et est irréversible.' :
                         language === 'de' ? 'Dadurch werden die ausgewählten Produkte einschließlich verwandter Bilder und Daten dauerhaft gelöscht und können nicht wiederhergestellt werden.' :
                         language === 'ko' ? '선택한 제품과 관련 이미지 및 데이터가 영구적으로 삭제되며 복원할 수 없습니다.' :
                         language === 'ru' ? 'Это навсегда удалит выбранные продукты, включая связанные изображения и данные, и не может быть отменено.' :
                         language === 'pt' ? 'Isso excluirá permanentemente os produtos selecionados, incluindo imagens e dados relacionados, e não pode ser desfeito.' :
                         language === 'hi' ? 'यह चयनित उत्पादों को स्थायी रूप से हटा देगा, जिसमें संबंधित चित्र और डेटा शामिल हैं, और इसे पूर्ववत नहीं किया जा सकता।' :
                         language === 'th' ? 'การดำเนินการนี้จะลบสินค้าที่เลือกอย่างถาวร รวมถึงรูปภาพและข้อมูลที่เกี่ยวข้อง และไม่สามารถยกเลิกได้' :
                         language === 'vi' ? 'Thao tác này sẽ xóa vĩnh viễn các sản phẩm đã chọn, bao gồm hình ảnh và dữ liệu liên quan, và không thể hoàn tác.' :
                         'This will permanently delete the selected products, including related images and data, and cannot be undone.',
    batchDeleteSuccess: language === 'zh' ? '成功删除 {count} 个产品' :
                        language === 'ja' ? '{count} 個の製品を削除しました' :
                        language === 'ar' ? 'تم حذف {count} منتجات بنجاح' :
                        language === 'es' ? '{count} productos eliminados con éxito' :
                        language === 'fr' ? '{count} produits supprimés avec succès' :
                        language === 'de' ? '{count} Produkte erfolgreich gelöscht' :
                        language === 'ko' ? '{count}개 제품 삭제 완료' :
                        language === 'ru' ? 'Успешно удалено {count} продуктов' :
                        language === 'pt' ? '{count} produtos excluídos com sucesso' :
                        language === 'hi' ? '{count} उत्पाद सफलतापूर्वक हटाए गए' :
                        language === 'th' ? 'ลบสินค้า {count} รายการสำเร็จ' :
                        language === 'vi' ? 'Đã xóa thành công {count} sản phẩm' :
                        'Successfully deleted {count} products',
    batchDeletePartial: language === 'zh' ? '部分删除成功：{success} 个成功，{failed} 个失败' :
                        language === 'ja' ? '部分的に削除：{success} 件成功、{failed} 件失敗' :
                        language === 'ar' ? 'حذف جزئي: {success} نجح، {failed} فشل' :
                        language === 'es' ? 'Eliminación parcial: {success} exitosos, {failed} fallidos' :
                        language === 'fr' ? 'Suppression partielle : {success} réussis, {failed} échoués' :
                        language === 'de' ? 'Teilweise gelöscht: {success} erfolgreich, {failed} fehlgeschlagen' :
                        language === 'ko' ? '부분 삭제: {success} 성공, {failed} 실패' :
                        language === 'ru' ? 'Частичное удаление: {success} успешно, {failed} с ошибкой' :
                        language === 'pt' ? 'Exclusão parcial: {success} com sucesso, {failed} falhas' :
                        language === 'hi' ? 'आंशिक हटाना: {success} सफल, {failed} विफल' :
                        language === 'th' ? 'ลบบางส่วน: {success} สำเร็จ, {failed} ล้มเหลว' :
                        language === 'vi' ? 'Xóa một phần: {success} thành công, {failed} thất bại' :
                        'Partial deletion: {success} succeeded, {failed} failed',
    batchDeleteFail: language === 'zh' ? '批量删除失败，请重试' :
                     language === 'ja' ? '一括削除に失敗しました。再試行してください。' :
                     language === 'ar' ? 'فشل الحذف الجماعي. يرجى المحاولة مرة أخرى.' :
                     language === 'es' ? 'Error en la eliminación en lote. Inténtelo de nuevo.' :
                     language === 'fr' ? 'Échec de la suppression en lot. Veuillez réessayer.' :
                     language === 'de' ? 'Stapellöschung fehlgeschlagen. Bitte erneut versuchen.' :
                     language === 'ko' ? '일괄 삭제 실패. 다시 시도해주세요.' :
                     language === 'ru' ? 'Массовое удаление не удалось. Повторите попытку.' :
                     language === 'pt' ? 'Falha na exclusão em lote. Tente novamente.' :
                     language === 'hi' ? 'बल्क हटाना विफल. कृपया पुनः प्रयास करें.' :
                     language === 'th' ? 'การลบเป็นชุดล้มเหลว โปรดลองอีกครั้ง' :
                     language === 'vi' ? 'Xóa hàng loạt thất bại. Vui lòng thử lại.' :
                     'Batch delete failed. Please try again.',
    deleting: language === 'zh' ? '删除中...' :
              language === 'ja' ? '削除中...' :
              language === 'ar' ? 'جاري الحذف...' :
              language === 'es' ? 'Eliminando...' :
              language === 'fr' ? 'Suppression...' :
              language === 'de' ? 'Wird gelöscht...' :
              language === 'ko' ? '삭제 중...' :
              language === 'ru' ? 'Удаление...' :
              language === 'pt' ? 'Excluindo...' :
              language === 'hi' ? 'हटा रहा है...' :
              language === 'th' ? 'กำลังลบ...' :
              language === 'vi' ? 'Đang xóa...' :
              'Deleting...'
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
      setSelectedProductIds(new Set())
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

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (products.length > 0 && products.every(p => selectedProductIds.has(p.id))) {
      setSelectedProductIds(new Set())
    } else {
      setSelectedProductIds(new Set(products.map(p => p.id)))
    }
  }

  const handleBatchDelete = async () => {
    const ids = Array.from(selectedProductIds)
    if (ids.length === 0) return

    setBatchDeleting(true)

    try {
      const results = await Promise.allSettled(
        ids.map(id => fetch(`/api/products/${id}`, { method: 'DELETE' }))
      )

      const successIds = new Set<string>()
      let failedCount = 0

      results.forEach((result, index) => {
        const id = ids[index]
        if (result.status === 'fulfilled' && result.value.ok && id) {
          successIds.add(id)
        } else {
          failedCount++
        }
      })

      setProducts(prev => prev.filter(p => !successIds.has(p.id)))

      const successCount = successIds.size
      if (failedCount === 0) {
        alert(t.batchDeleteSuccess.replace('{count}', String(successCount)))
      } else if (successCount === 0) {
        alert(t.batchDeleteFail)
      } else {
        alert(t.batchDeletePartial.replace('{success}', String(successCount)).replace('{failed}', String(failedCount)))
      }

      setSelectedProductIds(new Set())
      setShowBatchDeleteModal(false)
      fetchProducts(currentPage)
    } catch (error) {
      console.error('Error batch deleting products:', error)
      alert(t.batchDeleteFail)
    } finally {
      setBatchDeleting(false)
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
        const targetBooth = booths.find(b => b.id === moveToBoothId)
        setProducts(products.map(p =>
          p.id === moveProductId
            ? { ...p, ...(targetBooth ? { booth: targetBooth } : {}) }
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

  const fetchViewStats = async (productId: string) => {
    try {
      setViewStatsLoading(true)
      setViewStatsProductId(productId)
      
      const response = await fetch(`/api/seller/views?productId=${productId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch view stats')
      }
      
      const data = await response.json()
      setViewStats(data)
    } catch (err) {
      console.error('Error fetching view stats:', err)
      setViewStats(null)
    } finally {
      setViewStatsLoading(false)
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

          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            {selectedProductIds.size > 0 && (
              <div className="flex items-center justify-between bg-red-50 border-b border-red-200 px-6 py-3">
                <div className="flex items-center text-sm text-red-700 font-medium">
                  <Check className="w-4 h-4 mr-2" />
                  {t.selected} {selectedProductIds.size} {t.items}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedProductIds(new Set())}
                    className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={() => setShowBatchDeleteModal(true)}
                    className="flex items-center text-sm bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    {t.batchDelete}
                  </button>
                </div>
              </div>
            )}
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && products.every(p => selectedProductIds.has(p.id))}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.product}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t.category}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t.exhibition}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t.price}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t.views}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t.status}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t.created}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50 ${selectedProductIds.has(product.id) ? 'bg-red-50' : ''}`}>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.has(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
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
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCategoryName(product.category)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
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
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.price ? `${product.currency || 'USD'} ${product.price}` : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => fetchViewStats(product.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center cursor-pointer transition-colors"
                        title={t.viewDetails}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {product.viewCount}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? t.active : (language === 'zh' ? '未激活' : language === 'ja' ? '非アクティブ' : language === 'hi' ? 'असक्रिय' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
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

      {/* View Stats Modal */}
      {viewStatsProductId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{t.viewStats}</h2>
              <button
                onClick={() => {
                  setViewStatsProductId(null)
                  setViewStats(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewStatsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="ml-3 text-gray-600">{t.loading}</span>
              </div>
            ) : viewStats && viewStats.success ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">{t.totalViews}</p>
                    <p className="text-2xl font-bold text-blue-900">{viewStats.stats.totalViews}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">{t.selfViews}</p>
                    <p className="text-2xl font-bold text-green-900">{viewStats.stats.selfViews}</p>
                    <p className="text-xs text-green-600 mt-1">{viewStats.stats.selfViewPercentage}%</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-600 font-medium">{t.domesticViews}</p>
                    <p className="text-2xl font-bold text-orange-900">{viewStats.stats.domesticViews}</p>
                    <p className="text-xs text-orange-600 mt-1">{viewStats.stats.domesticPercentage}%</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 font-medium">{t.internationalViews}</p>
                    <p className="text-2xl font-bold text-purple-900">{viewStats.stats.internationalViews}</p>
                    <p className="text-xs text-purple-600 mt-1">{100 - viewStats.stats.domesticPercentage}%</p>
                  </div>
                </div>

                {/* External Views Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                        {t.selfViewLabel}: {viewStats.stats.selfViews}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {t.externalViewLabel}: {viewStats.stats.externalViews}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${viewStats.stats.selfViewPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>{t.selfViews}: {viewStats.stats.selfViewPercentage}%</span>
                    <span>{t.externalViews}: {100 - viewStats.stats.selfViewPercentage}%</span>
                  </div>
                </div>

                {/* Country Breakdown */}
                {viewStats.countryBreakdown && viewStats.countryBreakdown.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.topCountries}</h3>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {language === 'zh' ? '国家' : language === 'ja' ? '国' : 'Country'}
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t.totalViews}
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {language === 'zh' ? '占比' : language === 'ja' ? '割合' : 'Percentage'}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {viewStats.countryBreakdown.map((country: any, index: number) => (
                            <tr key={`${country.country}-${index}`} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-900">{country.country || '-'}</span>
                                  {country.countryCode && (
                                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                      {country.countryCode}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                                {country.count}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end">
                                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{
                                        width: `${viewStats.stats.totalViews > 0 ? Math.round((country.count / viewStats.stats.totalViews) * 100) : 0}%`
                                      }}
                                    />
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {viewStats.stats.totalViews > 0 ? Math.round((country.count / viewStats.stats.totalViews) * 100) : 0}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Recent Visitors */}
                {viewStats.recentVisitors && viewStats.recentVisitors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.recentVisitors}</h3>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {language === 'zh' ? '时间' : language === 'ja' ? '時間' : 'Time'}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {language === 'zh' ? '地区' : language === 'ja' ? '地域' : 'Region'}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {language === 'zh' ? '类型' : language === 'ja' ? 'タイプ' : 'Type'}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {viewStats.recentVisitors.map((visitor: any) => (
                            <tr key={visitor.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {new Date(visitor.createdAt).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {visitor.country || '-'}
                                  {visitor.city && <span className="text-gray-500">, {visitor.city}</span>}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {visitor.isSelfView ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {t.selfViewLabel}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {t.externalViewLabel}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {(!viewStats.countryBreakdown || viewStats.countryBreakdown.length === 0) &&
                 (!viewStats.recentVisitors || viewStats.recentVisitors.length === 0) &&
                 viewStats.stats.totalViews === 0 && (
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">{t.noStats}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">{t.noStats}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setViewStatsProductId(null)
                  setViewStats(null)
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Delete Confirmation Modal */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                {t.confirmBatchDeleteTitle}
              </h2>
              <button
                onClick={() => !batchDeleting && setShowBatchDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                disabled={batchDeleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                {t.confirmBatchDeleteMsg.replace('{count}', String(selectedProductIds.size))}
              </p>
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 flex items-start">
                  <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{t.batchDeleteWarning}</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowBatchDeleteModal(false)}
                disabled={batchDeleting}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={batchDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {batchDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {t.deleting}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {t.batchDelete} ({selectedProductIds.size})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}