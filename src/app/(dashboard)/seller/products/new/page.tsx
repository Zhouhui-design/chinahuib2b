'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/ui/FileUpload'
import MultilingualInput from '@/components/ui/MultilingualInput'
import { ArrowLeft, Save, X, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

interface Category {
  id: string
  name: string
  nameEn?: string
  level: number
  parentId?: string | null
  children?: Category[]
}

interface Unit {
  id: string
  name: string
  nameEn: string
  symbol?: string
}

interface UploadedFile {
  url: string
}

export default function AddProductPage() {
  const router = useRouter()
  const language = useSellerLanguage()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedLevel1, setSelectedLevel1] = useState('')
  const [selectedLevel2, setSelectedLevel2] = useState('')
  const [selectedLevel3, setSelectedLevel3] = useState('')
  const [selectedLevel4, setSelectedLevel4] = useState('')
  const [selectedLevel5, setSelectedLevel5] = useState('')

  const [title, setTitle] = useState('')
  const [titles, setTitles] = useState<Record<string, string>>({})
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const [minOrderQty, setMinOrderQty] = useState<number | ''>('')
  const [minOrderUnitId, setMinOrderUnitId] = useState<string>('')
  const [supplyCapacity, setSupplyCapacity] = useState('')
  const [supplyCapacityUnitId, setSupplyCapacityUnitId] = useState<string>('')
  const [units, setUnits] = useState<Unit[]>([])
  const [images, setImages] = useState<string[]>([])
  const [mainImageUrl, setMainImageUrl] = useState('')
  const [videos, setVideos] = useState<string[]>([])
  const [documents, setDocuments] = useState<Array<{url: string, name: string, type: string, size: number}>>([])
  const [specifications, setSpecifications] = useState<Array<{key: string, value: string}>>([
    { key: '', value: '' }
  ])
  const [draftId, setDraftId] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [acceptsOEM, setAcceptsOEM] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  // 分类快捷创建弹窗状态
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryNameEn, setNewCategoryNameEn] = useState('')
  const [newCategoryParentId, setNewCategoryParentId] = useState('')
  const [myCategories, setMyCategories] = useState<Category[]>([])
  const [creatingCategory, setCreatingCategory] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const loadedDraftId = params.get('draftId')
    if (loadedDraftId) {
      loadDraft(loadedDraftId)
    }
  }, [])

  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/units')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setUnits(data.data)
        }
      }
    } catch (err) {
      console.error('Failed to fetch units:', err)
    }
  }

  useEffect(() => {
    if (!title && !description && !categoryId) return
    const timer = setTimeout(() => {
      autoSaveDraft()
    }, 5000)
    return () => clearTimeout(timer)
  }, [title, categoryId, description, minOrderQty, supplyCapacity, minOrderUnitId, supplyCapacityUnitId, images, videos, documents, specifications])

  const loadDraft = async (id: string) => {
    try {
      const res = await fetch(`/api/seller/products/drafts?draftId=${id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.drafts && data.drafts.length > 0) {
          const draft = data.drafts[0]
          const pd = draft.productData
          if (pd) {
            setTitle(pd.title || '')
            setCategoryId(pd.categoryId || '')
            setDescription(pd.description || '')
            setTitles(pd.titles || {})
            setDescriptions(pd.descriptions || {})
            setMinOrderQty(pd.minOrderQty || '')
            setMinOrderUnitId(pd.minOrderUnitId || '')
            setSupplyCapacity(pd.supplyCapacity || '')
            setSupplyCapacityUnitId(pd.supplyCapacityUnitId || '')
            setImages(pd.images || [])
            setMainImageUrl(pd.mainImageUrl || '')
            setVideos(pd.videos || [])
            setDocuments(pd.documents || [])
            setSpecifications(pd.specifications || [{ key: '', value: '' }])
            setDraftId(draft.id)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error)
    }
  }

  const autoSaveDraft = async () => {
    const productData = {
      title, categoryId, description, minOrderQty, minOrderUnitId, supplyCapacity, supplyCapacityUnitId, images, mainImageUrl,
      videos, documents,
      specifications: specifications.filter(s => s.key.trim() && s.value.trim())
    }
    if (!title.trim() && !description.trim()) return
    setIsSavingDraft(true)
    try {
      const res = await fetch('/api/seller/products/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId, productData }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.draftId && !draftId) {
          setDraftId(data.draftId)
          const url = new URL(window.location.href)
          url.searchParams.set('draftId', data.draftId)
          window.history.replaceState({}, '', url.toString())
        }
        setLastSaved(new Date())
      }
    } catch (error) {
      console.error('Auto-save draft failed:', error)
    } finally {
      setIsSavingDraft(false)
    }
  }

  const saveDraftManually = async () => {
    await autoSaveDraft()
  }

  useEffect(() => {
    fetchCategories()
  }, [language])

  const t = {
    pageTitle: language === 'zh' ? '添加新产品' :
              language === 'ja' ? '新規製品追加' :
              language === 'ar' ? 'إضافة منتج جديد' :
              language === 'es' ? 'Agregar nuevo producto' :
              language === 'fr' ? 'Ajouter un nouveau produit' :
              language === 'de' ? 'Neues Produkt hinzufügen' :
              language === 'ko' ? '새 제품 추가' :
              language === 'ru' ? 'Добавить новый товар' :
              language === 'pt' ? 'Adicionar novo produto' :
              language === 'hi' ? 'नया उत्पाद जोड़ें' :
              language === 'th' ? 'เพิ่มสินค้าใหม่' :
              language === 'vi' ? 'Thêm sản phẩm mới' :
              'Add New Product',
    pageSubtitle: language === 'zh' ? '为您的店铺创建新的产品列表' :
                 language === 'ja' ? 'ストアに新しい製品リストを作成' :
                 language === 'ar' ? 'إنشاء قائمة منتجات جديدة لمتجرك' :
                 language === 'es' ? 'Crear una nueva lista de productos para tu tienda' :
                 language === 'fr' ? 'Créer une nouvelle liste de produits pour votre boutique' :
                 language === 'de' ? 'Erstellen Sie eine neue Produktliste für Ihren Shop' :
                 language === 'ko' ? '스토어용 새 제품 목록 만들기' :
                 language === 'ru' ? 'Создайте новый список товаров для вашего магазина' :
                 language === 'pt' ? 'Criar uma nova lista de produtos para sua loja' :
                 language === 'hi' ? 'अपनी दुकान के लिए एक नया उत्पाद सूची बनाएं' :
                 language === 'th' ? 'สร้างรายการสินค้าใหม่สำหรับร้านค้าของคุณ' :
                 language === 'vi' ? 'Tạo danh sách sản phẩm mới cho cửa hàng của bạn' :
                 'Create a new product listing for your store',
    basicInfo: language === 'zh' ? '基本信息' :
               language === 'ja' ? '基本情報' :
               language === 'ar' ? 'المعلومات الأساسية' :
               language === 'es' ? 'Información básica' :
               language === 'fr' ? 'Informations de base' :
               language === 'de' ? 'Grundinformationen' :
               language === 'ko' ? '기본 정보' :
               language === 'ru' ? 'Базовая информация' :
               language === 'pt' ? 'Informações básicas' :
               language === 'hi' ? 'बुनियादी जानकारी' :
               language === 'th' ? 'ข้อมูลพื้นฐาน' :
               language === 'vi' ? 'Thông tin cơ bản' :
               'Basic Information',
    productTitle: language === 'zh' ? '产品标题 *' :
                  language === 'ja' ? '製品名 *' :
                  language === 'ar' ? 'عنوان المنتج *' :
                  language === 'es' ? 'Título del producto *' :
                  language === 'fr' ? 'Titre du produit *' :
                  language === 'de' ? 'Produkttitel *' :
                  language === 'ko' ? '제품명 *' :
                  language === 'ru' ? 'Название товара *' :
                  language === 'pt' ? 'Título do produto *' :
                  language === 'hi' ? 'उत्पाद शीर्षक *' :
                  language === 'th' ? 'ชื่อสินค้า *' :
                  language === 'vi' ? 'Tên sản phẩm *' :
                  'Product Title *',
    titlePlaceholder: language === 'zh' ? '输入产品标题' :
                      language === 'ja' ? '製品名を入力' :
                      language === 'ar' ? 'إدخال عنوان المنتج' :
                      language === 'es' ? 'Ingrese el título del producto' :
                      language === 'fr' ? 'Entrez le titre du produit' :
                      language === 'de' ? 'Produkttitel eingeben' :
                      language === 'ko' ? '제품명 입력' :
                      language === 'ru' ? 'Введите название товара' :
                      language === 'pt' ? 'Digite o título do produto' :
                      language === 'hi' ? 'उत्पाद शीर्षक दर्ज करें' :
                      language === 'th' ? 'ใส่ชื่อสินค้า' :
                      language === 'vi' ? 'Nhập tên sản phẩm' :
                      'Enter product title',
    category: language === 'zh' ? '分类 *' :
              language === 'ja' ? 'カテゴリー *' :
              language === 'ar' ? 'الفئة *' :
              language === 'es' ? 'Categoría *' :
              language === 'fr' ? 'Catégorie *' :
              language === 'de' ? 'Kategorie *' :
              language === 'ko' ? '카테고리 *' :
              language === 'ru' ? 'Категория *' :
              language === 'pt' ? 'Categoria *' :
              language === 'hi' ? 'श्रेणी *' :
              language === 'th' ? 'หมวดหมู่ *' :
              language === 'vi' ? 'Danh mục *' :
              'Category *',
    selectCategory: language === 'zh' ? '选择分类' :
                    language === 'ja' ? 'カテゴリーを選択' :
                    language === 'ar' ? 'اختر الفئة' :
                    language === 'es' ? 'Seleccionar categoría' :
                    language === 'fr' ? 'Sélectionner une catégorie' :
                    language === 'de' ? 'Kategorie auswählen' :
                    language === 'ko' ? '카테고리 선택' :
                    language === 'ru' ? 'Выберите категорию' :
                    language === 'pt' ? 'Selecionar categoria' :
                    language === 'hi' ? 'श्रेणी चुनें' :
                    language === 'th' ? 'เลือกหมวดหมู่' :
                    language === 'vi' ? 'Chọn danh mục' :
                    'Select a category',
    description: language === 'zh' ? '产品描述' :
                 language === 'ja' ? '製品説明' :
                 language === 'ar' ? 'وصف المنتج' :
                 language === 'es' ? 'Descripción del producto' :
                 language === 'fr' ? 'Description du produit' :
                 language === 'de' ? 'Produktbeschreibung' :
                 language === 'ko' ? '제품 설명' :
                 language === 'ru' ? 'Описание товара' :
                 language === 'pt' ? 'Descrição do produto' :
                 language === 'hi' ? 'उत्पाद विवरण' :
                 language === 'th' ? 'คำอธิบายสินค้า' :
                 language === 'vi' ? 'Mô tả sản phẩm' :
                 'Description',
    descriptionPlaceholder: language === 'zh' ? '描述您的产品...' :
                           language === 'ja' ? '製品の説明...' :
                           language === 'ar' ? 'وصف منتجك...' :
                           language === 'es' ? 'Describa su producto...' :
                           language === 'fr' ? 'Décrivez votre produit...' :
                           language === 'de' ? 'Beschreiben Sie Ihr Produkt...' :
                           language === 'ko' ? '제품 설명...' :
                           language === 'ru' ? 'Опишите ваш товар...' :
                           language === 'pt' ? 'Descreva seu produto...' :
                           language === 'hi' ? 'अपने उत्पाद का वर्णन करें...' :
                           language === 'th' ? 'อธิบายสินค้าของคุณ...' :
                           language === 'vi' ? 'Mô tả sản phẩm của bạn...' :
                           'Describe your product...',
    productImages: language === 'zh' ? '产品图片' :
                   language === 'ja' ? '製品画像' :
                   language === 'ar' ? 'صور المنتج' :
                   language === 'es' ? 'Imágenes del producto' :
                   language === 'fr' ? 'Images du produit' :
                   language === 'de' ? 'Produktbilder' :
                   language === 'ko' ? '제품 이미지' :
                   language === 'ru' ? 'Изображения товара' :
                   language === 'pt' ? 'Imagens do produto' :
                   language === 'hi' ? 'उत्पाद छवियां' :
                   language === 'th' ? 'รูปภาพสินค้า' :
                   language === 'vi' ? 'Hình ảnh sản phẩm' :
                   'Product Images',
    setAsMain: language === 'zh' ? '设为主图' :
               language === 'ja' ? 'メイン画像に設定' :
               language === 'ar' ? 'تعيين كصورة رئيسية' :
               language === 'es' ? 'Establecer como principal' :
               language === 'fr' ? 'Définir comme principale' :
               language === 'de' ? 'Als Hauptbild festlegen' :
               language === 'ko' ? '메인 이미지로 설정' :
               language === 'ru' ? 'Установить как главное изображение' :
               language === 'pt' ? 'Definir como imagem principal' :
               language === 'hi' ? 'मुख्य छवि के रूप में सेट करें' :
               language === 'th' ? 'ตั้งเป็นรูปหลัก' :
               language === 'vi' ? 'Đặt làm ảnh chính' :
               'Set as Main',
    main: language === 'zh' ? '主图' :
          language === 'ja' ? 'メイン' :
          language === 'ar' ? 'الرئيسية' :
          language === 'es' ? 'Principal' :
          language === 'fr' ? 'Principale' :
          language === 'de' ? 'Hauptbild' :
          language === 'ko' ? '메인' :
          language === 'ru' ? 'Главное' :
          language === 'pt' ? 'Principal' :
          language === 'hi' ? 'मुख्य' :
          language === 'th' ? 'หลัก' :
          language === 'vi' ? 'Chính' :
          'Main',
    specifications: language === 'zh' ? '规格参数' :
                    language === 'ja' ? '仕様' :
                    language === 'ar' ? 'المواصفات' :
                    language === 'es' ? 'Especificaciones' :
                    language === 'fr' ? 'Spécifications' :
                    language === 'de' ? 'Spezifikationen' :
                    language === 'ko' ? '사양' :
                    language === 'ru' ? 'Характеристики' :
                    language === 'pt' ? 'Especificações' :
                    language === 'hi' ? 'विनिर्देश' :
                    language === 'th' ? 'ข้อมูลจำเพาะ' :
                    language === 'vi' ? 'Thông số kỹ thuật' :
                    'Specifications',
    addSpec: language === 'zh' ? '添加规格' :
             language === 'ja' ? '仕様を追加' :
             language === 'ar' ? 'إضافة مواصفة' :
             language === 'es' ? 'Agregar especificación' :
             language === 'fr' ? 'Ajouter une spécification' :
             language === 'de' ? 'Spezifikation hinzufügen' :
             language === 'ko' ? '사양 추가' :
             language === 'ru' ? 'Добавить характеристику' :
             language === 'pt' ? 'Adicionar especificação' :
             language === 'hi' ? 'विनिर्देश जोड़ें' :
             language === 'th' ? 'เพิ่มข้อมูลจำเพาะ' :
             language === 'vi' ? 'Thêm thông số' :
             'Add Spec',
    specKeyPlaceholder: language === 'zh' ? '参数名（如：颜色）' :
                         language === 'ja' ? 'パラメータ名（例：色）' :
                         language === 'ar' ? 'اسم المعلمة (مثال: اللون)' :
                         language === 'es' ? 'Nombre del parámetro (ej: Color)' :
                         language === 'fr' ? 'Nom du paramètre (ex: Couleur)' :
                         language === 'de' ? 'Parametername (z.B. Farbe)' :
                         language === 'ko' ? '파라미터 이름 (예: 색상)' :
                         language === 'ru' ? 'Название параметра (например: Цвет)' :
                         language === 'pt' ? 'Nome do parâmetro (ex: Cor)' :
                         language === 'hi' ? 'पैरामीटर का नाम (उदाहरण: रंग)' :
                         language === 'th' ? 'ชื่อพารามิเตอร์ (เช่น: สี)' :
                         language === 'vi' ? 'Tên tham số (ví dụ: Màu sắc)' :
                         'Key (e.g., Color)',
    specValuePlaceholder: language === 'zh' ? '参数值（如：红色）' :
                          language === 'ja' ? 'パラメータ値（例：赤）' :
                          language === 'ar' ? 'قيمة المعلمة (مثال: أحمر)' :
                          language === 'es' ? 'Valor del parámetro (ej: Rojo)' :
                          language === 'fr' ? 'Valeur du paramètre (ex: Rouge)' :
                          language === 'de' ? 'Parameterwert (z.B. Rot)' :
                          language === 'ko' ? '파라미터 값 (예: 빨간색)' :
                          language === 'ru' ? 'Значение параметра (например: Красный)' :
                          language === 'pt' ? 'Valor do parâmetro (ex: Vermelho)' :
                          language === 'hi' ? 'पैरामीटर का मान (उदाहरण: लाल)' :
                          language === 'th' ? 'ค่าพารามิเตอร์ (เช่น: แดง)' :
                          language === 'vi' ? 'Giá trị tham số (ví dụ: Đỏ)' :
                          'Value (e.g., Red)',
    orderSupplyInfo: language === 'zh' ? '订单与供应信息' :
                     language === 'ja' ? '注文・供給情報' :
                     language === 'ar' ? 'معلومات الطلب والتوريد' :
                     language === 'es' ? 'Información de pedido y suministro' :
                     language === 'fr' ? 'Informations de commande et d\'approvisionnement' :
                     language === 'de' ? 'Bestell- und Lieferinformationen' :
                     language === 'ko' ? '주문 및 공급 정보' :
                     language === 'ru' ? 'Информация о заказе и поставках' :
                     language === 'pt' ? 'Informações de pedido e fornecimento' :
                     language === 'hi' ? 'ऑर्डर और आपूर्ति जानकारी' :
                     language === 'th' ? 'ข้อมูลการสั่งซื้อและการจัดหา' :
                     language === 'vi' ? 'Thông tin đặt hàng và cung cấp' :
                     'Order & Supply Information',
    minOrderQty: language === 'zh' ? '最小起订量' :
                 language === 'ja' ? '最小注文数' :
                 language === 'ar' ? 'الحد الأدنى للطلب' :
                 language === 'es' ? 'Cantidad mínima de pedido' :
                 language === 'fr' ? 'Quantité minimum de commande' :
                 language === 'de' ? 'Mindestbestellmenge' :
                 language === 'ko' ? '최소 주문 수량' :
                 language === 'ru' ? 'Минимальное количество заказа' :
                 language === 'pt' ? 'Quantidade mínima de pedido' :
                 language === 'hi' ? 'न्यूनतम ऑर्डर मात्रा' :
                 language === 'th' ? 'จำนวนสั่งซื้อขั้นต่ำ' :
                 language === 'vi' ? 'Số lượng đặt hàng tối thiểu' :
                 'Minimum Order Quantity',
    minOrderQtyPlaceholder: language === 'zh' ? '例如：100' :
                             language === 'ja' ? '例：100' :
                             language === 'ar' ? 'مثال: 100' :
                             language === 'es' ? 'ej: 100' :
                             language === 'fr' ? 'ex: 100' :
                             language === 'de' ? 'z.B. 100' :
                             language === 'ko' ? '예: 100' :
                             language === 'ru' ? 'например: 100' :
                             language === 'pt' ? 'ex: 100' :
                             language === 'hi' ? 'उदाहरण: 100' :
                             language === 'th' ? 'เช่น: 100' :
                             language === 'vi' ? 'ví dụ: 100' :
                             'e.g., 100',
    supplyCapacity: language === 'zh' ? '供货能力' :
                    language === 'ja' ? '供給能力' :
                    language === 'ar' ? 'القدرة على التوريد' :
                    language === 'es' ? 'Capacidad de suministro' :
                    language === 'fr' ? 'Capacité d\'approvisionnement' :
                    language === 'de' ? 'Lieferfähigkeit' :
                    language === 'ko' ? '공급 능력' :
                    language === 'ru' ? 'Возможности поставки' :
                    language === 'pt' ? 'Capacidade de fornecimento' :
                    language === 'hi' ? 'आपूर्ति क्षमता' :
                    language === 'th' ? 'ความสามารถในการจัดหา' :
                    language === 'vi' ? 'Khả năng cung cấp' :
                    'Supply Capacity',
    supplyCapacityPlaceholder: language === 'zh' ? '例如：10000件/月' :
                               language === 'ja' ? '例：10000個/月' :
                               language === 'ar' ? 'مثال: 10000 قطعة/شهر' :
                               language === 'es' ? 'ej: 10000 piezas/mes' :
                               language === 'fr' ? 'ex: 10000 pièces/mois' :
                               language === 'de' ? 'z.B. 10000 Stück/Monat' :
                               language === 'ko' ? '예: 10000개/월' :
                               language === 'ru' ? 'например: 10000 шт./месяц' :
                               language === 'pt' ? 'ex: 10000 peças/mês' :
                               language === 'hi' ? 'उदाहरण: 10000 नग/महीना' :
                               language === 'th' ? 'เช่น: 10000 ชิ้น/เดือน' :
                               language === 'vi' ? 'ví dụ: 10000 cái/tháng' :
                               'e.g., 10000 pieces/month',
    acceptsOEM: language === 'zh' ? '是否接受OEM' :
                language === 'ja' ? 'OEM受け入れ可' :
                language === 'ar' ? 'قبول OEM' :
                language === 'es' ? 'Acepta OEM' :
                language === 'fr' ? 'Accepte OEM' :
                language === 'de' ? 'OEM akzeptieren' :
                language === 'ko' ? 'OEM 수용 여부' :
                language === 'ru' ? 'Принимает OEM' :
                language === 'pt' ? 'Aceita OEM' :
                language === 'hi' ? 'OEM स्वीकार करता है' :
                language === 'th' ? 'ยอมรับ OEM หรือไม่' :
                language === 'vi' ? 'Chấp nhận OEM' :
                'Accepts OEM',
    youtubeUrl: language === 'zh' ? 'YouTube链接' :
                language === 'ja' ? 'YouTubeリンク' :
                language === 'ar' ? 'رابط YouTube' :
                language === 'es' ? 'Enlace de YouTube' :
                language === 'fr' ? 'Lien YouTube' :
                language === 'de' ? 'YouTube-Link' :
                language === 'ko' ? 'YouTube 링크' :
                language === 'ru' ? 'Ссылка на YouTube' :
                language === 'pt' ? 'Link do YouTube' :
                language === 'hi' ? 'YouTube लिंक' :
                language === 'th' ? 'ลิงก์ YouTube' :
                language === 'vi' ? 'Liên kết YouTube' :
                'YouTube URL',
    yes: language === 'zh' ? '是' :
         language === 'ja' ? 'はい' :
         language === 'ar' ? 'نعم' :
         language === 'es' ? 'Sí' :
         language === 'fr' ? 'Oui' :
         language === 'de' ? 'Ja' :
         language === 'ko' ? '예' :
         language === 'ru' ? 'Да' :
         language === 'pt' ? 'Sim' :
         language === 'hi' ? 'हां' :
         language === 'th' ? 'ใช่' :
         language === 'vi' ? 'Có' :
         'Yes',
    no: language === 'zh' ? '否' :
        language === 'ja' ? 'いいえ' :
        language === 'ar' ? 'لا' :
        language === 'es' ? 'No' :
        language === 'fr' ? 'Non' :
        language === 'de' ? 'Nein' :
        language === 'ko' ? '아니요' :
        language === 'ru' ? 'Нет' :
        language === 'pt' ? 'Não' :
        language === 'hi' ? 'नहीं' :
        language === 'th' ? 'ไม่' :
        language === 'vi' ? 'Không' :
        'No',
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
            language === 'vi' ? 'Hủy bỏ' :
            'Cancel',
    creating: language === 'zh' ? '创建中...' :
              language === 'ja' ? '作成中...' :
              language === 'ar' ? 'جارٍ الإنشاء...' :
              language === 'es' ? 'Creando...' :
              language === 'fr' ? 'Création...' :
              language === 'de' ? 'Erstellen...' :
              language === 'ko' ? '생성 중...' :
              language === 'ru' ? 'Создание...' :
              language === 'pt' ? 'Criando...' :
              language === 'hi' ? 'बनाया जा रहा है...' :
              language === 'th' ? 'กำลังสร้าง...' :
              language === 'vi' ? 'Đang tạo...' :
              'Creating...',
    createProduct: language === 'zh' ? '创建产品' :
                   language === 'ja' ? '製品作成' :
                   language === 'ar' ? 'إنشاء المنتج' :
                   language === 'es' ? 'Crear producto' :
                   language === 'fr' ? 'Créer le produit' :
                   language === 'de' ? 'Produkt erstellen' :
                   language === 'ko' ? '제품 만들기' :
                   language === 'ru' ? 'Создать товар' :
                   language === 'pt' ? 'Criar produto' :
                   language === 'hi' ? 'उत्पाद बनाएं' :
                   language === 'th' ? 'สร้างสินค้า' :
                   language === 'vi' ? 'Tạo sản phẩm' :
                   'Create Product',
    productTitleRequired: language === 'zh' ? '产品标题为必填项' :
                         language === 'ja' ? '製品名は必須です' :
                         language === 'ar' ? 'عنوان المنتج مطلوب' :
                         language === 'es' ? 'El título del producto es obligatorio' :
                         language === 'fr' ? 'Le titre du produit est obligatoire' :
                         language === 'de' ? 'Produkttitel ist erforderlich' :
                         language === 'ko' ? '제품명은 필수입니다' :
                         language === 'ru' ? 'Название товара обязательно' :
                         language === 'pt' ? 'O título do produto é obrigatório' :
                         language === 'hi' ? 'उत्पाद शीर्षक आवश्यक है' :
                         language === 'th' ? 'ชื่อสินค้าเป็นสิ่งจำเป็น' :
                         language === 'vi' ? 'Tên sản phẩm là bắt buộc' :
                         'Product title is required',
    selectCategoryError: language === 'zh' ? '请选择分类' :
                         language === 'ja' ? 'カテゴリーを選択してください' :
                         language === 'ar' ? 'يرجى اختيار الفئة' :
                         language === 'es' ? 'Por favor seleccione una categoría' :
                         language === 'fr' ? 'Veuillez sélectionner une catégorie' :
                         language === 'de' ? 'Bitte wählen Sie eine Kategorie' :
                         language === 'ko' ? '카테고리를 선택해 주세요' :
                         language === 'ru' ? 'Пожалуйста, выберите категорию' :
                         language === 'pt' ? 'Por favor selecione uma categoria' :
                         language === 'hi' ? 'कृपया एक श्रेणी चुनें' :
                         language === 'th' ? 'กรุณาเลือกหมวดหมู่' :
                         language === 'vi' ? 'Vui lòng chọn danh mục' :
                         'Please select a category',
    uploadAtLeastOneImage: language === 'zh' ? '请至少上传一张产品图片' :
                           language === 'ja' ? '少なくとも1つの製品画像をアップロードしてください' :
                           language === 'ar' ? 'يرجى رفع صورة منتج واحدة على الأقل' :
                           language === 'es' ? 'Por favor cargue al menos una imagen de producto' :
                           language === 'fr' ? 'Veuillez télécharger au moins une image de produit' :
                           language === 'de' ? 'Bitte laden Sie mindestens ein Produktbild hoch' :
                           language === 'ko' ? '최소 1개의 제품 이미지를 업로드해 주세요' :
                           language === 'ru' ? 'Пожалуйста, загрузите хотя бы одно изображение товара' :
                           language === 'pt' ? 'Por favor, carregue pelo menos uma imagem do produto' :
                           language === 'hi' ? 'कृपया कम से कम एक उत्पाद छवि अपलोड करें' :
                           language === 'th' ? 'กรุณาอัปโหลดรูปสินค้อลงอย่างน้อยหนึ่งรูป' :
                           language === 'vi' ? 'Vui lòng tải lên ít nhất một hình ảnh sản phẩm' :
                           'Please upload at least one product image',
    productCreatedSuccess: language === 'zh' ? '产品创建成功！' :
                            language === 'ja' ? '製品の作成に成功しました！' :
                            language === 'ar' ? 'تم إنشاء المنتج بنجاح!' :
                            language === 'es' ? '¡Producto creado con éxito!' :
                            language === 'fr' ? 'Produit créé avec succès!' :
                            language === 'de' ? 'Produkt erfolgreich erstellt!' :
                            language === 'ko' ? '제품이 성공적으로 생성되었습니다!' :
                            language === 'ru' ? 'Товар успешно создан!' :
                            language === 'pt' ? 'Produto criado com sucesso!' :
                            language === 'hi' ? 'उत्पाद सफलतापूर्वक बनाया गया!' :
                            language === 'th' ? 'สร้างสินค้าสำเร็จ!' :
                            language === 'vi' ? 'Tạo sản phẩm thành công!' :
                            'Product created successfully!',
    productImage: language === 'zh' ? '产品' :
                  language === 'ja' ? '製品' :
                  language === 'ar' ? 'المنتج' :
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
    keywords: language === 'zh' ? '关键词' :
              language === 'ja' ? 'キーワード' :
              language === 'ar' ? 'الكلمات الرئيسية' :
              language === 'es' ? 'Palabras clave' :
              language === 'fr' ? 'Mots-clés' :
              language === 'de' ? 'Schlüsselwörter' :
              language === 'ko' ? '키워드' :
              language === 'ru' ? 'Ключевые слова' :
              language === 'pt' ? 'Palavras-chave' :
              language === 'hi' ? 'कीवर्ड' :
              language === 'th' ? 'คีย์เวิร์ด' :
              language === 'vi' ? 'Từ khóa' :
              'Keywords',
    addKeyword: language === 'zh' ? '添加' :
                language === 'ja' ? '追加' :
                language === 'ar' ? 'إضافة' :
                language === 'es' ? 'Añadir' :
                language === 'fr' ? 'Ajouter' :
                language === 'de' ? 'Hinzufügen' :
                language === 'ko' ? '추가' :
                language === 'ru' ? 'Добавить' :
                language === 'pt' ? 'Adicionar' :
                language === 'hi' ? 'जोड़ें' :
                language === 'th' ? 'เพิ่ม' :
                language === 'vi' ? 'Thêm' :
                'Add',
    keywordsHint: language === 'zh' ? '输入关键词后按回车添加，最多 50 个，提升产品搜索曝光' :
                  language === 'ja' ? 'キーワードを入力してEnterを押すと追加、最大50件、検索露出を向上' :
                  language === 'ar' ? 'اكتب الكلمة واضغط Enter للإضافة، بحد أقصى 50، لتحسين البحث' :
                  language === 'es' ? 'Escribe y presiona Enter para añadir, máx. 50, mejora la búsqueda' :
                  language === 'fr' ? 'Saisir et appuyer sur Entrée, max. 50, améliore la recherche' :
                  language === 'de' ? 'Eingeben und Enter drücken, max. 50, verbessert die Suche' :
                  language === 'ko' ? '입력 후 Enter, 최대 50개, 검색 노출 향상' :
                  language === 'ru' ? 'Введите и нажмите Enter, макс. 50, улучшает поиск' :
                  language === 'pt' ? 'Digite e pressione Enter, máx. 50, melhora a busca' :
                  language === 'hi' ? 'टाइप करें और Enter दबाएं, अधिकतम 50, खोज बेहतर करता है' :
                  language === 'th' ? 'พิมพ์แล้วกด Enter, สูงสุด 50, ช่วยให้ค้นหาเจอง่ายขึ้น' :
                  language === 'vi' ? 'Nhập và nhấn Enter, tối đa 50, cải thiện tìm kiếm' :
                  'Type keyword and press Enter. Max 50. Improves search visibility.',
    createCategory: language === 'zh' ? '新建分类' :
                    language === 'ja' ? '新規カテゴリー' :
                    language === 'ar' ? 'إنشاء فئة' :
                    language === 'es' ? 'Crear categoría' :
                    language === 'fr' ? 'Créer catégorie' :
                    language === 'de' ? 'Kategorie erstellen' :
                    language === 'ko' ? '카테고리 생성' :
                    language === 'ru' ? 'Создать категорию' :
                    language === 'pt' ? 'Criar categoria' :
                    language === 'hi' ? 'श्रेणी बनाएं' :
                    language === 'th' ? 'สร้างหมวดหมู่' :
                    language === 'vi' ? 'Tạo danh mục' :
                    'New Category',
    categoryName: language === 'zh' ? '分类名称' :
                  language === 'ja' ? 'カテゴリー名' :
                  language === 'ar' ? 'اسم الفئة' :
                  language === 'es' ? 'Nombre' :
                  language === 'fr' ? 'Nom' :
                  language === 'de' ? 'Name' :
                  language === 'ko' ? '이름' :
                  language === 'ru' ? 'Название' :
                  language === 'pt' ? 'Nome' :
                  language === 'hi' ? 'नाम' :
                  language === 'th' ? 'ชื่อ' :
                  language === 'vi' ? 'Tên' :
                  'Category Name',
    parentCategory: language === 'zh' ? '上级分类' :
                    language === 'ja' ? '親カテゴリー' :
                    language === 'ar' ? 'الفئة الأم' :
                    language === 'es' ? 'Categoría padre' :
                    language === 'fr' ? 'Catégorie parente' :
                    language === 'de' ? 'Übergeordnete Kategorie' :
                    language === 'ko' ? '상위 카테고리' :
                    language === 'ru' ? 'Родительская категория' :
                    language === 'pt' ? 'Categoria pai' :
                    language === 'hi' ? 'मूल श्रेणी' :
                    language === 'th' ? 'หมวดหมู่หลัก' :
                    language === 'vi' ? 'Danh mục cha' :
                    'Parent Category',
    myCategories: language === 'zh' ? '我的分类' :
                  language === 'ja' ? 'マイカテゴリー' :
                  language === 'ar' ? 'فئاتي' :
                  language === 'es' ? 'Mis categorías' :
                  language === 'fr' ? 'Mes catégories' :
                  language === 'de' ? 'Meine Kategorien' :
                  language === 'ko' ? '내 카테고리' :
                  language === 'ru' ? 'Мои категории' :
                  language === 'pt' ? 'Minhas categorias' :
                  language === 'hi' ? 'मेरी श्रेणियां' :
                  language === 'th' ? 'หมวดหมู่ของฉัน' :
                  language === 'vi' ? 'Danh mục của tôi' :
                  'My Categories',
    createSuccess: language === 'zh' ? '创建成功' :
                   language === 'ja' ? '作成成功' :
                   language === 'ar' ? 'تم الإنشاء' :
                   language === 'es' ? 'Creado' :
                   language === 'fr' ? 'Créé' :
                   language === 'de' ? 'Erstellt' :
                   language === 'ko' ? '생성됨' :
                   language === 'ru' ? 'Создано' :
                   language === 'pt' ? 'Criado' :
                   language === 'hi' ? 'बनाया गया' :
                   language === 'th' ? 'สร้างแล้ว' :
                   language === 'vi' ? 'Đã tạo' :
                   'Created',
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories/tree?locale=${language}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  // 关键词输入：回车或点击添加，去重
  const addKeyword = () => {
    const trimmed = keywordInput.trim()
    if (!trimmed) return
    if (keywords.includes(trimmed)) {
      setKeywordInput('')
      return
    }
    if (keywords.length >= 50) return
    setKeywords(prev => [...prev, trimmed])
    setKeywordInput('')
  }

  const removeKeyword = (kw: string) => {
    setKeywords(prev => prev.filter(k => k !== kw))
  }

  // 加载当前卖家已创建的分类（弹窗内"我的分类"列表）
  const fetchMyCategories = async () => {
    try {
      const response = await fetch('/api/seller/categories')
      if (response.ok) {
        const data = await response.json()
        if (data.success) setMyCategories(data.categories)
      }
    } catch (err) {
      console.error('Failed to fetch my categories:', err)
    }
  }

  // 创建新分类（弹窗提交），成功后自动选中级联选择器
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    setCreatingCategory(true)
    try {
      // 推断 level：有父级则 = 父级 level + 1，否则 = 1
      let level = 1
      if (newCategoryParentId) {
        const findLevel = (nodes: Category[]): number => {
          for (const n of nodes) {
            if (n.id === newCategoryParentId) return n.level + 1
            const found = findLevel(n.children || [])
            if (found > 0) return found
          }
          return 0
        }
        level = findLevel(categories) || 1
      }
      if (level > 5) {
        alert(language === 'zh' ? '最多支持 5 级分类' : 'Max 5 levels')
        return
      }

      const response = await fetch('/api/seller/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          nameEn: newCategoryNameEn.trim() || undefined,
          level,
          parentId: newCategoryParentId || undefined,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed')
      }

      const data = await response.json()
      const created = data.category

      // 刷新分类树和"我的分类"
      await fetchCategories()
      await fetchMyCategories()

      // 自动选中新创建的分类到对应层级
      if (level === 1) setSelectedLevel1(created.id)
      else if (level === 2) setSelectedLevel2(created.id)
      else if (level === 3) setSelectedLevel3(created.id)
      else if (level === 4) setSelectedLevel4(created.id)
      else if (level === 5) setSelectedLevel5(created.id)

      // 重置弹窗
      setNewCategoryName('')
      setNewCategoryNameEn('')
      setNewCategoryParentId('')
      setShowCategoryModal(false)
      alert(t.createSuccess)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed')
    } finally {
      setCreatingCategory(false)
    }
  }

  useEffect(() => {
    setSelectedLevel2('')
    setSelectedLevel3('')
    setSelectedLevel4('')
    setSelectedLevel5('')
    setCategoryId('')
  }, [selectedLevel1])

  useEffect(() => {
    setSelectedLevel3('')
    setSelectedLevel4('')
    setSelectedLevel5('')
    setCategoryId('')
  }, [selectedLevel2])

  useEffect(() => {
    setSelectedLevel4('')
    setSelectedLevel5('')
    setCategoryId('')
  }, [selectedLevel3])

  useEffect(() => {
    setSelectedLevel5('')
    setCategoryId('')
  }, [selectedLevel4])

  useEffect(() => {
    if (selectedLevel5) {
      setCategoryId(selectedLevel5)
    } else if (selectedLevel4) {
      setCategoryId(selectedLevel4)
    } else if (selectedLevel3) {
      setCategoryId(selectedLevel3)
    } else if (selectedLevel2) {
      setCategoryId(selectedLevel2)
    } else if (selectedLevel1) {
      setCategoryId(selectedLevel1)
    }
  }, [selectedLevel1, selectedLevel2, selectedLevel3, selectedLevel4, selectedLevel5])

  const getChildren = (parentId: string): Category[] => {
    const findChildren = (nodes: Category[]): Category[] => {
      for (const node of nodes) {
        if (node.id === parentId) {
          return node.children || []
        }
        const found = findChildren(node.children || [])
        if (found.length > 0) return found
      }
      return []
    }
    return findChildren(categories)
  }

  const getLevel1Categories = () => categories.filter(c => c.level === 1)

  const handleImageUpload = (data: UploadedFile | UploadedFile[]) => {
    const newImages = Array.isArray(data) ? data.map((d) => d.url) : [data.url]
    setImages(prev => [...prev, ...newImages])

    if (!mainImageUrl && newImages.length > 0) {
      setMainImageUrl(newImages[0] || '')
    }
  }

  const handleVideoUpload = (data: UploadedFile | UploadedFile[]) => {
    const newVideos = Array.isArray(data) ? data.map((d) => d.url) : [data.url]
    setVideos(prev => [...prev, ...newVideos])
  }

  const handleDocumentUpload = (data: any | any[]) => {
    const newDocs = Array.isArray(data) ? data : [data]
    const docObjects = newDocs.map(d => ({
      url: d.url,
      name: d.filename || d.name || 'document',
      type: d.type || 'document',
      size: d.size || 0
    }))
    setDocuments(prev => [...prev, ...docObjects])
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)

    if (mainImageUrl === images[index]) {
      setMainImageUrl(newImages[0] || '')
    }
  }

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index)
    setVideos(newVideos)
  }

  const removeDocument = (index: number) => {
    const newDocs = documents.filter((_, i) => i !== index)
    setDocuments(newDocs)
  }

  const setAsMainImage = (index: number) => {
    setMainImageUrl(images[index] || '')
  }

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }])
  }

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index))
  }

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = specifications.map((spec, i) =>
      i === index ? { ...spec, [field]: value } : spec
    )
    setSpecifications(newSpecs)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError(t.productTitleRequired)
      return
    }

    if (!categoryId) {
      setError(t.selectCategoryError)
      return
    }

    if (images.length === 0) {
      setError(t.uploadAtLeastOneImage)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const specsObj = specifications.reduce((acc, spec) => {
        if (spec.key.trim() && spec.value.trim()) {
          acc[spec.key.trim()] = spec.value.trim()
        }
        return acc
      }, {} as Record<string, string>)

      const productData = {
        title,
        titles: Object.keys(titles).length > 0 ? titles : undefined,
        categoryId,
        description,
        descriptions: Object.keys(descriptions).length > 0 ? descriptions : undefined,
        minOrderQty: minOrderQty || undefined,
        minOrderUnitId: minOrderUnitId || undefined,
        supplyCapacity: supplyCapacity || undefined,
        supplyCapacityUnitId: supplyCapacityUnitId || undefined,
        images,
        mainImageUrl,
        videos: videos.length > 0 ? videos : undefined,
        documents: documents.length > 0 ? documents : undefined,
        specifications: Object.keys(specsObj).length > 0 ? specsObj : undefined,
        acceptsOEM,
        youtubeUrl: youtubeUrl || undefined,
        keywords: keywords.length > 0 ? keywords : undefined,
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product')
      }

      alert(t.productCreatedSuccess)
      router.push('/seller/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/seller/products"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {t.pageSubtitle}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t.basicInfo}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.productTitle}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.titlePlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {t.category}
              </label>
              <button
                type="button"
                onClick={() => {
                  fetchMyCategories()
                  // 默认父级为当前已选最深层级
                  if (selectedLevel5) setNewCategoryParentId(selectedLevel5)
                  else if (selectedLevel4) setNewCategoryParentId(selectedLevel4)
                  else if (selectedLevel3) setNewCategoryParentId(selectedLevel3)
                  else if (selectedLevel2) setNewCategoryParentId(selectedLevel2)
                  else if (selectedLevel1) setNewCategoryParentId(selectedLevel1)
                  else setNewCategoryParentId('')
                  setShowCategoryModal(true)
                }}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                {t.createCategory}
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-medium w-12">L1</span>
                <select
                  value={selectedLevel1}
                  onChange={(e) => setSelectedLevel1(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{language === 'zh' ? '选择一级分类' : 'Select L1 category'}</option>
                  {getLevel1Categories().map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedLevel1 && (
                <div className="flex items-center space-x-2 pl-4">
                  <span className="text-xs text-gray-500 font-medium w-12">L2</span>
                  <select
                    value={selectedLevel2}
                    onChange={(e) => setSelectedLevel2(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{language === 'zh' ? '选择二级分类' : 'Select L2 category'}</option>
                    {getChildren(selectedLevel1).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedLevel2 && getChildren(selectedLevel2).length > 0 && (
                <div className="flex items-center space-x-2 pl-8">
                  <span className="text-xs text-gray-500 font-medium w-12">L3</span>
                  <select
                    value={selectedLevel3}
                    onChange={(e) => setSelectedLevel3(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{language === 'zh' ? '选择三级分类' : 'Select L3 category'}</option>
                    {getChildren(selectedLevel2).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedLevel3 && getChildren(selectedLevel3).length > 0 && (
                <div className="flex items-center space-x-2 pl-12">
                  <span className="text-xs text-gray-500 font-medium w-12">L4</span>
                  <select
                    value={selectedLevel4}
                    onChange={(e) => setSelectedLevel4(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{language === 'zh' ? '选择四级分类' : 'Select L4 category'}</option>
                    {getChildren(selectedLevel3).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedLevel4 && getChildren(selectedLevel4).length > 0 && (
                <div className="flex items-center space-x-2 pl-16">
                  <span className="text-xs text-gray-500 font-medium w-12">L5</span>
                  <select
                    value={selectedLevel5}
                    onChange={(e) => setSelectedLevel5(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{language === 'zh' ? '选择五级分类' : 'Select L5 category'}</option>
                    {getChildren(selectedLevel4).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.description}
            </label>
            {Object.keys(descriptions).length > 0 ? (
              <MultilingualInput
                value={descriptions}
                onChange={(val) => setDescriptions(val)}
                label=""
                rows={4}
              />
            ) : (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.descriptionPlaceholder}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {Object.keys(descriptions).length === 0 && (
              <p className="text-xs text-blue-600 mt-1">
                💡 Tip: Enable multi-language editing for global buyers
              </p>
            )}
          </div>

          {/* 关键词输入：复用 booths 页面的 tag 模式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.keywords}
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                placeholder={language === 'zh' ? '输入关键词后按回车添加' : 'Type keyword and press Enter'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {t.addKeyword}
              </button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">{t.keywordsHint}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t.productImages}</h2>

          <FileUpload
            type="product_image"
            multiple={true}
            onUploadSuccess={handleImageUpload}
          />

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <div className={`w-full aspect-square rounded-lg border-2 overflow-hidden ${
                    mainImageUrl === img ? 'border-blue-500' : 'border-gray-200'
                  }`}>
                    <img
                      src={img}
                      alt={`${t.productImage} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.parentElement?.querySelector('.image-placeholder')?.classList.remove('hidden')
                      }}
                    />
                    <div className="image-placeholder hidden w-full h-full flex items-center justify-center bg-gray-100">
                      <ImageIcon className="w-10 h-10 text-gray-400" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      {mainImageUrl !== img && (
                        <button
                          type="button"
                          onClick={() => setAsMainImage(index)}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          {t.setAsMain}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {mainImageUrl === img && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {t.main}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'zh' ? '产品视频' :
             language === 'ja' ? '製品ビデオ' :
             language === 'ar' ? 'فيديو المنتج' :
             language === 'es' ? 'Video del producto' :
             language === 'fr' ? 'Vidéo du produit' :
             language === 'de' ? 'Produktvideo' :
             language === 'ko' ? '제품 비디오' :
             language === 'ru' ? 'Видео товара' :
             language === 'pt' ? 'Vídeo do produto' :
             language === 'hi' ? 'उत्पाद वीडियो' :
             language === 'th' ? 'วิดีโอสินค้า' :
             language === 'vi' ? 'Video sản phẩm' :
             'Product Videos'}
          </h2>
          <p className="text-xs text-gray-500">
            {language === 'zh' ? '支持 MP4、MOV、AVI 等格式，最大 100MB（选填）' :
             language === 'ja' ? 'MP4、MOV、AVIなどの形式に対応、最大100MB（任意）' :
             language === 'ar' ? 'يدعم تنسيقات MP4 و MOV و AVI، الحد الأقصى 100 ميجابايت (اختياري)' :
             'Supports MP4, MOV, AVI, max 100MB (optional)'}
          </p>

          <FileUpload
            type="product_video"
            multiple={true}
            onUploadSuccess={handleVideoUpload}
          />

          {videos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {videos.map((video, index) => (
                <div key={index} className="relative group">
                  <div className="w-full aspect-video bg-gray-900 rounded-lg border-2 border-gray-200 overflow-hidden">
                    <video
                      src={video}
                      controls
                      className="w-full h-full"
                      poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23374151'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded truncate">
                    {language === 'zh' ? '视频' : 'Video'} {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'zh' ? '产品文档' :
             language === 'ja' ? '製品ドキュメント' :
             language === 'ar' ? 'وثائق المنتج' :
             language === 'es' ? 'Documentos del producto' :
             language === 'fr' ? 'Documents du produit' :
             language === 'de' ? 'Produktdokumente' :
             language === 'ko' ? '제품 문서' :
             language === 'ru' ? 'Документы товара' :
             language === 'pt' ? 'Documentos do produto' :
             language === 'hi' ? 'उत्पाद दस्तावेज' :
             language === 'th' ? 'เอกสารสินค้า' :
             language === 'vi' ? 'Tài liệu sản phẩm' :
             'Product Documents'}
          </h2>
          <p className="text-xs text-gray-500">
            {language === 'zh' ? '支持 PDF、DOC、XLS、PPT、ZIP、RAR 等格式，最大 50MB（选填）' :
             language === 'ja' ? 'PDF、DOC、XLS、PPT、ZIP、RARなどの形式に対応、最大50MB（任意）' :
             language === 'ar' ? 'يدعم تنسيقات PDF و DOC و XLS و PPT و ZIP و RAR، الحد الأقصى 50 ميجابايت (اختياري)' :
             'Supports PDF, DOC, XLS, PPT, ZIP, RAR, max 50MB (optional)'}
          </p>

          <FileUpload
            type="product_document"
            multiple={true}
            onUploadSuccess={handleDocumentUpload}
          />

          {documents.length > 0 && (
            <div className="space-y-2 mt-4">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {doc.size > 1024 * 1024 
                          ? `${(doc.size / (1024 * 1024)).toFixed(2)} MB` 
                          : `${(doc.size / 1024).toFixed(1)} KB`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={doc.url}
                      download
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {language === 'zh' ? '下载' :
                       language === 'ja' ? 'ダウンロード' :
                       language === 'ar' ? 'تنزيل' :
                       'Download'}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">{t.specifications}</h2>
            <button
              type="button"
              onClick={addSpecification}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              {t.addSpec}
            </button>
          </div>

          <div className="space-y-2">
            {specifications.map((spec, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                  placeholder={t.specKeyPlaceholder}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  placeholder={t.specValuePlaceholder}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {specifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t.orderSupplyInfo}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.minOrderQty}
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={minOrderQty}
                  onChange={(e) => setMinOrderQty(e.target.value ? Number(e.target.value) : '')}
                  placeholder={t.minOrderQtyPlaceholder}
                  min="1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={minOrderUnitId}
                  onChange={(e) => setMinOrderUnitId(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{language === 'zh' ? '选择单位' : 'Select Unit'}</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {language === 'zh' ? unit.name : unit.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.supplyCapacity}
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={supplyCapacity}
                  onChange={(e) => setSupplyCapacity(e.target.value)}
                  placeholder={t.supplyCapacityPlaceholder}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={supplyCapacityUnitId}
                  onChange={(e) => setSupplyCapacityUnitId(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{language === 'zh' ? '选择单位' : 'Select Unit'}</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {language === 'zh' ? unit.name : unit.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.acceptsOEM}
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="acceptsOEM"
                  value="yes"
                  checked={acceptsOEM === true}
                  onChange={() => setAcceptsOEM(true)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{t.yes}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="acceptsOEM"
                  value="no"
                  checked={acceptsOEM === false}
                  onChange={() => setAcceptsOEM(false)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{t.no}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.youtubeUrl}
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/seller/products"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t.cancel}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {t.creating}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t.createProduct}
              </>
            )}
          </button>
        </div>
      </form>

      {/* 分类快捷创建弹窗 */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{t.createCategory}</h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.categoryName} *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t.categoryName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'zh' ? '英文名称' : 'English Name'}
                </label>
                <input
                  type="text"
                  value={newCategoryNameEn}
                  onChange={(e) => setNewCategoryNameEn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="English Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.parentCategory}
                </label>
                <select
                  value={newCategoryParentId}
                  onChange={(e) => setNewCategoryParentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{language === 'zh' ? '无（作为一级分类）' : 'None (as L1)'}</option>
                  {categories.filter(c => c.level < 5).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {'　'.repeat(cat.level - 1)}L{cat.level} {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'zh' ? '新分类将作为所选父级的下级（自动推断层级）' : 'New category will be a child of selected parent (level auto-inferred)'}
                </p>
              </div>

              {/* 我的分类快捷列表 */}
              {myCategories.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">{t.myCategories}</p>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {myCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (cat.level === 1) setSelectedLevel1(cat.id)
                          else if (cat.level === 2) setSelectedLevel2(cat.id)
                          else if (cat.level === 3) setSelectedLevel3(cat.id)
                          else if (cat.level === 4) setSelectedLevel4(cat.id)
                          else if (cat.level === 5) setSelectedLevel5(cat.id)
                          setShowCategoryModal(false)
                        }}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded transition-colors"
                      >
                        L{cat.level} {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={creatingCategory || !newCategoryName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                {creatingCategory ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {language === 'zh' ? '创建' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}