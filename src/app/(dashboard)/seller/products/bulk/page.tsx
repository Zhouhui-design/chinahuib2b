'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, X, CheckCircle, AlertCircle, Loader2, Download, Trash2, Plus } from 'lucide-react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

interface Category {
  id: string
  name: string
  nameEn?: string
}

interface ProductRow {
  id: string
  title: string
  description: string
  categoryId: string
  price: string
  moq: string
  supplyCapacity: string
  specifications: Array<{ key: string; value: string }>
  images: string[]
  error?: string
  status: 'pending' | 'success' | 'failed'
}

interface ProductResult {
  title: string
}

interface ProductPartial {
  title?: string
  description?: string
  categoryId?: string
  price?: string
  moq?: string
  supplyCapacity?: string
}

export default function BulkUploadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const language = useSellerLanguage()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [products, setProducts] = useState<ProductRow[]>([])
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null)

  const t = {
    pageTitle: language === 'zh' ? '批量上传产品' :
              language === 'ja' ? '一括製品アップロード' :
              language === 'ar' ? 'تحميل المنتجات بالجملة' :
              language === 'es' ? 'Subir Productos en Volumen' :
              language === 'fr' ? 'Télécharger des Produits en Masse' :
              language === 'de' ? 'Massenprodukt-Upload' :
              language === 'ko' ? '대량 제품 업로드' :
              language === 'ru' ? 'Массовая Загрузка Товаров' :
              language === 'pt' ? 'Upload de Produtos em Massa' :
              language === 'hi' ? 'बल्क उत्पाद अपलोड' :
              language === 'th' ? 'อัปโหลดสินค้าจำนวนมาก' :
              language === 'vi' ? 'Tải lên sản phẩm hàng loạt' :
              'Bulk Upload Products',
    downloadTemplate: language === 'zh' ? '下载模板' :
                     language === 'ja' ? 'テンプレートをダウンロード' :
                     language === 'ar' ? 'تحميل النموذج' :
                     language === 'es' ? 'Descargar Plantilla' :
                     language === 'fr' ? 'Télécharger le Modèle' :
                     language === 'de' ? 'Vorlage Herunterladen' :
                     language === 'ko' ? '템플릿 다운로드' :
                     language === 'ru' ? 'Скачать Шаблон' :
                     language === 'pt' ? 'Baixar Modelo' :
                     language === 'hi' ? 'टेम्पलेट डाउनलोड करें' :
                     language === 'th' ? 'ดาวน์โหลดเทมเพลต' :
                     language === 'vi' ? 'Tải xuống mẫu' :
                     'Download Template',
    uploadInstructions: language === 'zh' ? '上传说明' :
                       language === 'ja' ? 'アップロード手順' :
                       language === 'ar' ? 'تعليمات الرفع' :
                       language === 'es' ? 'Instrucciones de Carga' :
                       language === 'fr' ? 'Instructions de Téléversement' :
                       language === 'de' ? 'Upload-Anleitung' :
                       language === 'ko' ? '업로드 지침' :
                       language === 'ru' ? 'Инструкции по Загрузке' :
                       language === 'pt' ? 'Instruções de Upload' :
                       language === 'hi' ? 'अपलोड निर्देश' :
                       language === 'th' ? 'คำแนะนำการอัปโหลด' :
                       language === 'vi' ? 'Hướng dẫn tải lên' :
                       'Upload Instructions',
    instructionText: language === 'zh' ? '1. 下载Excel模板文件\n2. 填写产品信息（标题、描述、分类等）\n3. 保存文件\n4. 点击"选择文件"按钮上传' :
                     language === 'ja' ? '1. Excelテンプレートをダウンロード\n2. 製品情報（タイトル、説明、カテゴリなど）を入力\n3. ファイルを保存\n4. 「ファイルを選択」ボタンをクリックしてアップロード' :
                     language === 'ar' ? '1. تحميل قالب Excel\n2. ملء معلومات المنتج (العنوان ، الوصف ، الفئة ، إلخ)\n3. حفظ الملف\n4. انقر على زر "اختيار ملف" للتحميل' :
                     language === 'es' ? '1. Descargar plantilla de Excel\n2. Completar información del producto (título, descripción, categoría, etc.)\n3. Guardar archivo\n4. Haga clic en el botón "Elegir archivo" para cargar' :
                     language === 'fr' ? '1. Télécharger le modèle Excel\n2. Remplir les informations du produit (titre, description, catégorie, etc.)\n3. Enregistrer le fichier\n4. Cliquer sur le bouton "Choisir un fichier" pour télécharger' :
                     language === 'de' ? '1. Excel-Vorlage herunterladen\n2. Produktinformationen ausfüllen (Titel, Beschreibung, Kategorie usw.)\n3. Datei speichern\n4. Klicken Sie auf "Datei auswählen", um hochzuladen' :
                     language === 'ko' ? '1. Excel 템플릿 다운로드\n2. 제품 정보 입력 (제목, 설명, 카테고리 등)\n3. 파일 저장\n4. "파일 선택" 버튼을 클릭하여 업로드' :
                     language === 'ru' ? '1. Скачать шаблон Excel\n2. Заполнить информацию о продукте (название, описание, категория и т.д.)\n3. Сохранить файл\n4. Нажать кнопку "Выбрать файл" для загрузки' :
                     language === 'pt' ? '1. Baixar modelo Excel\n2. Preencher informações do produto (título, descrição, categoria, etc.)\n3. Salvar arquivo\n4. Clicar no botão "Escolher arquivo" para carregar' :
                     language === 'hi' ? '1. Excel टेम्पलेट डाउनलोड करें\n2. उत्पाद जानकारी भरें (शीर्षक, विवरण, श्रेणी, आदि)\n3. फ़ाइल सहेजें\n4. अपलोड करने के लिए "फ़ाइल चुनें" बटन पर क्लिक करें' :
                     language === 'th' ? '1. ดาวน์โหลดเทมเพลต Excel\n2. กรอกข้อมูลผลิตภัณฑ์ (ชื่อ, คำอธิบาย, หมวดหมู่, ฯลฯ)\n3. บันทึกไฟล์\n4. คลิกปุ่ม "เลือกไฟล์" เพื่ออัปโหลด' :
                     language === 'vi' ? '1. Tải xuống mẫu Excel\n2. Điền thông tin sản phẩm (tên, mô tả, danh mục, v.v.)\n3. Lưu tệp\n4. Nhấp vào nút "Chọn tệp" để tải lên' :
                     '1. Download Excel template\n2. Fill in product information (title, description, category, etc.)\n3. Save file\n4. Click "Choose File" button to upload',
    selectFile: language === 'zh' ? '选择文件' :
                language === 'ja' ? 'ファイルを選択' :
                language === 'ar' ? 'اختيار ملف' :
                language === 'es' ? 'Elegir Archivo' :
                language === 'fr' ? 'Choisir un Fichier' :
                language === 'de' ? 'Datei Auswählen' :
                language === 'ko' ? '파일 선택' :
                language === 'ru' ? 'Выбрать Файл' :
                language === 'pt' ? 'Escolher Arquivo' :
                language === 'hi' ? 'फ़ाइल चुनें' :
                language === 'th' ? 'เลือกไฟล์' :
                language === 'vi' ? 'Chọn tệp' :
                'Choose File',
    uploading: language === 'zh' ? '上传中...' :
               language === 'ja' ? 'アップロード中...' :
               language === 'ar' ? 'جارٍ الرفع...' :
               language === 'es' ? 'Subiendo...' :
               language === 'fr' ? 'Téléversement...' :
               language === 'de' ? 'Hochladen...' :
               language === 'ko' ? '업로드 중...' :
               language === 'ru' ? 'Загрузка...' :
               language === 'pt' ? 'Enviando...' :
               language === 'hi' ? 'अपलोड हो रहा है...' :
               language === 'th' ? 'กำลังอัปโหลด...' :
               language === 'vi' ? 'Đang tải lên...' :
               'Uploading...',
    uploadProducts: language === 'zh' ? '上传产品' :
                    language === 'ja' ? '製品をアップロード' :
                    language === 'ar' ? 'تحميل المنتجات' :
                    language === 'es' ? 'Subir Productos' :
                    language === 'fr' ? 'Télécharger les Produits' :
                    language === 'de' ? 'Produkte Hochladen' :
                    language === 'ko' ? '제품 업로드' :
                    language === 'ru' ? 'Загрузить Товары' :
                    language === 'pt' ? 'Enviar Produtos' :
                    language === 'hi' ? 'उत्पाद अपलोड करें' :
                    language === 'th' ? 'อัปโหลดผลิตภัณฑ์' :
                    language === 'vi' ? 'Tải lên sản phẩm' :
                    'Upload Products',
    successCount: language === 'zh' ? '成功' :
                  language === 'ja' ? '成功' :
                  language === 'ar' ? 'نجاح' :
                  language === 'es' ? 'Éxito' :
                  language === 'fr' ? 'Succès' :
                  language === 'de' ? 'Erfolg' :
                  language === 'ko' ? '성공' :
                  language === 'ru' ? 'Успех' :
                  language === 'pt' ? 'Sucesso' :
                  language === 'hi' ? 'सफलता' :
                  language === 'th' ? 'ความสำเร็จ' :
                  language === 'vi' ? 'Thành công' :
                  'Success',
    failedCount: language === 'zh' ? '失败' :
                 language === 'ja' ? '失敗' :
                 language === 'ar' ? 'فشل' :
                 language === 'es' ? 'Fallido' :
                 language === 'fr' ? 'Échec' :
                 language === 'de' ? 'Fehler' :
                 language === 'ko' ? '실패' :
                 language === 'ru' ? 'Ошибка' :
                 language === 'pt' ? 'Falha' :
                 language === 'hi' ? 'विफल' :
                 language === 'th' ? 'ล้มเหลว' :
                 language === 'vi' ? 'Thất bại' :
                 'Failed',
    goToProducts: language === 'zh' ? '前往产品列表' :
                  language === 'ja' ? '製品一覧へ' :
                  language === 'ar' ? 'الذهاب إلى قائمة المنتجات' :
                  language === 'es' ? 'Ir a la Lista de Productos' :
                  language === 'fr' ? 'Aller à la Liste des Produits' :
                  language === 'de' ? 'Zur Produktliste' :
                  language === 'ko' ? '제품 목록으로 이동' :
                  language === 'ru' ? 'Перейти к Списку Продуктов' :
                  language === 'pt' ? 'Ir para Lista de Produtos' :
                  language === 'hi' ? 'उत्पाद सूची पर जाएं' :
                  language === 'th' ? 'ไปที่รายการผลิตภัณฑ์' :
                  language === 'vi' ? 'Đi đến Danh sách Sản phẩm' :
                  'Go to Products',
    noProducts: language === 'zh' ? '没有待上传的产品' :
                language === 'ja' ? 'アップロードする製品がありません' :
                language === 'ar' ? 'لا توجد منتجات للرفع' :
                language === 'es' ? 'No hay productos para subir' :
                language === 'fr' ? 'Aucun produit à télécharger' :
                language === 'de' ? 'Keine Produkte zum Hochladen' :
                language === 'ko' ? '업로드할 제품이 없습니다' :
                language === 'ru' ? 'Нет товаров для загрузки' :
                language === 'pt' ? 'Nenhum produto para enviar' :
                language === 'hi' ? 'अपलोड के लिए कोई उत्पाद नहीं' :
                language === 'th' ? 'ไม่มีผลิตภัณฑ์ที่ต้องอัปโหลด' :
                language === 'vi' ? 'Không có sản phẩm nào để tải lên' :
                'No products to upload',
    preview: language === 'zh' ? '预览' :
             language === 'ja' ? 'プレビュー' :
             language === 'ar' ? 'معاينة' :
             language === 'es' ? 'Vista Previa' :
             language === 'fr' ? 'Aperçu' :
             language === 'de' ? 'Vorschau' :
             language === 'ko' ? '미리보기' :
             language === 'ru' ? 'Предпросмотр' :
             language === 'pt' ? 'Pré-visualizar' :
             language === 'hi' ? 'पूर्वावलोकन' :
             language === 'th' ? 'ตัวอย่าง' :
             language === 'vi' ? 'Xem trước' :
             'Preview',
    remove: language === 'zh' ? '移除' :
            language === 'ja' ? '削除' :
            language === 'ar' ? 'إزالة' :
            language === 'es' ? 'Eliminar' :
            language === 'fr' ? 'Supprimer' :
            language === 'de' ? 'Entfernen' :
            language === 'ko' ? '제거' :
            language === 'ru' ? 'Удалить' :
            language === 'pt' ? 'Remover' :
            language === 'hi' ? 'हटाना' :
            language === 'th' ? 'ลบ' :
            language === 'vi' ? 'Xóa' :
            'Remove',
    addManually: language === 'zh' ? '手动添加产品' :
                 language === 'ja' ? '手動で製品を追加' :
                 language === 'ar' ? 'إضافة منتج يدويًا' :
                 language === 'es' ? 'Agregar Producto Manualmente' :
                 language === 'fr' ? 'Ajouter un Produit Manuellement' :
                 language === 'de' ? 'Produkt Manuell Hinzufügen' :
                 language === 'ko' ? '수동으로 제품 추가' :
                 language === 'ru' ? 'Добавить Товар Вручную' :
                 language === 'pt' ? 'Adicionar Produto Manualmente' :
                 language === 'hi' ? 'मैन्युअल रूप से उत्पाद जोड़ें' :
                 language === 'th' ? 'เพิ่มผลิตภัณฑ์ด้วยตนเอง' :
                 language === 'vi' ? 'Thêm sản phẩm thủ công' :
                 'Add Product Manually',
    title: language === 'zh' ? '标题' :
           language === 'ja' ? 'タイトル' :
           language === 'ar' ? 'العنوان' :
           language === 'es' ? 'Título' :
           language === 'fr' ? 'Titre' :
           language === 'de' ? 'Titel' :
           language === 'ko' ? '제목' :
           language === 'ru' ? 'Название' :
           language === 'pt' ? 'Título' :
           language === 'hi' ? 'शीर्षक' :
           language === 'th' ? 'ชื่อ' :
           language === 'vi' ? 'Tiêu đề' :
           'Title',
    description: language === 'zh' ? '描述' :
                 language === 'ja' ? '説明' :
                 language === 'ar' ? 'الوصف' :
                 language === 'es' ? 'Descripción' :
                 language === 'fr' ? 'Description' :
                 language === 'de' ? 'Beschreibung' :
                 language === 'ko' ? '설명' :
                 language === 'ru' ? 'Описание' :
                 language === 'pt' ? 'Descrição' :
                 language === 'hi' ? 'विवरण' :
                 language === 'th' ? 'คำอธิบาย' :
                 language === 'vi' ? 'Mô tả' :
                 'Description',
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
    selectCategory: language === 'zh' ? '选择分类' :
                    language === 'ja' ? 'カテゴリを選択' :
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
                    'Select Category',
    price: language === 'zh' ? '价格' :
           language === 'ja' ? '価格' :
           language === 'ar' ? 'السعر' :
           language === 'es' ? 'Precio' :
           language === 'fr' ? 'Prix' :
           language === 'de' ? 'Preis' :
           language === 'ko' ? '가격' :
           language === 'ru' ? 'Цена' :
           language === 'pt' ? 'Preço' :
           language === 'hi' ? 'कीमत' :
           language === 'th' ? 'ราคา' :
           language === 'vi' ? 'Giá' :
           'Price',
    moq: language === 'zh' ? '最小订单' :
         language === 'ja' ? '最小注文' :
         language === 'ar' ? 'الحد الأدنى للطلب' :
         language === 'es' ? 'Cantidad Mínima' :
         language === 'fr' ? 'Qté Minimum' :
         language === 'de' ? 'Mindestbestellung' :
         language === 'ko' ? '최소 주문' :
         language === 'ru' ? 'Мин. Заказ' :
         language === 'pt' ? 'Qtd Mínima' :
         language === 'hi' ? 'न्यूनतम ऑर्डर' :
         language === 'th' ? 'จำนวนขั้นต่ำ' :
         language === 'vi' ? 'Đơn hàng tối thiểu' :
         'MOQ',
    supplyCapacity: language === 'zh' ? '供货能力' :
                    language === 'ja' ? '供給能力' :
                    language === 'ar' ? 'قدرة التوريد' :
                    language === 'es' ? 'Capacidad de Suministro' :
                    language === 'fr' ? 'Capacité d\'Approvisionnement' :
                    language === 'de' ? 'Lieferfähigkeit' :
                    language === 'ko' ? '공급 능력' :
                    language === 'ru' ? 'Возможности Поставки' :
                    language === 'pt' ? 'Capacidade de Fornecimento' :
                    language === 'hi' ? 'आपूर्ति क्षमता' :
                    language === 'th' ? 'ความสามารถในการจัดหา' :
                    language === 'vi' ? 'Khả năng cung cấp' :
                    'Supply Capacity',
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
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const rows = text.split('\n').filter(row => row.trim())

        if (rows.length < 2) {
          setLoading(false)
          return
        }

        const headers = rows[0].split(',').map(h => h.trim().toLowerCase())
        const newProducts: ProductRow[] = []

        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(',').map(v => v.trim())
          const product: ProductPartial = {}

          headers.forEach((header, index) => {
            if (header === 'title') product.title = values[index] || ''
            if (header === 'description') product.description = values[index] || ''
            if (header === 'category') product.categoryId = values[index] || ''
            if (header === 'price') product.price = values[index] || ''
            if (header === 'moq') product.moq = values[index] || '1'
            if (header === 'supplycapacity') product.supplyCapacity = values[index] || ''
          })

          if (product.title) {
            newProducts.push({
              id: `temp-${Date.now()}-${i}`,
              title: product.title,
              description: product.description || '',
              categoryId: product.categoryId || '',
              price: product.price || '',
              moq: product.moq || '1',
              supplyCapacity: product.supplyCapacity || '',
              specifications: [],
              images: [],
              status: 'pending'
            })
          }
        }

        setProducts(prev => [...prev, ...newProducts])
      } catch (error) {
        console.error('Parse error:', error)
      } finally {
        setLoading(false)
      }
    }

    reader.readAsText(file)
  }

  const handleAddManual = () => {
    setProducts(prev => [...prev, {
      id: `manual-${Date.now()}`,
      title: '',
      description: '',
      categoryId: '',
      price: '',
      moq: '1',
      supplyCapacity: '',
      specifications: [],
      images: [],
      status: 'pending'
    }])
  }

  const updateProduct = <K extends keyof ProductRow>(id: string, field: K, value: ProductRow[K]) => {
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const handleUploadAll = async () => {
    const validProducts = products.filter(p => p.title.trim() && p.categoryId.trim())
    if (validProducts.length === 0) return

    setUploading(true)

    try {
      const productsData = validProducts.map(p => ({
        title: p.title,
        description: p.description,
        categoryId: p.categoryId,
        minOrderQty: parseInt(p.moq) || 1,
        supplyCapacity: p.supplyCapacity,
        specifications: p.specifications,
        images: p.images
      }))

      const res = await fetch('/api/seller/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: productsData })
      })

      const data = await res.json()

      if (data.results) {
        setResults({
          success: data.results.createdCount,
          failed: data.results.failedCount
        })

        setProducts(prev => prev.map(p => {
          const successItem = (data.results.success as ProductResult[]).find(s => s.title === p.title)
          const failedItem = (data.results.failed as ProductResult[]).find(s => s.title === p.title)
          if (successItem) return { ...p, status: 'success' as const }
          if (failedItem) return { ...p, status: 'failed' as const, error: failedItem.error }
          return p
        }))
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template = 'title,description,category,price,moq,supplycapacity\nExample Product,This is an example product description,Electronics,99.99,10,1000 per month'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/seller/products" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {results && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="text-green-800 font-medium">
                {t.successCount}: {results.success} | {t.failedCount}: {results.failed}
              </p>
              <Link href="/seller/products" className="text-green-700 hover:text-green-800 underline mt-1 inline-block">
                {t.goToProducts}
              </Link>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            {t.uploadInstructions}
          </h2>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 whitespace-pre-line text-sm text-gray-700">
            {t.instructionText}
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={downloadTemplate}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {t.downloadTemplate}
            </button>

            <label className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              {loading ? t.uploading : t.selectFile}
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={loading}
              />
            </label>

            <button
              onClick={handleAddManual}
              className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.addManually}
            </button>

            {products.length > 0 && (
              <button
                onClick={handleUploadAll}
                disabled={uploading || products.filter(p => p.status === 'pending').length === 0}
                className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.uploading}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {t.uploadProducts} ({products.filter(p => p.status === 'pending').length})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {products.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.title}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.category}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.price}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.moq}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.supplyCapacity}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className={product.status === 'success' ? 'bg-green-50' : product.status === 'failed' ? 'bg-red-50' : ''}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={product.title}
                          onChange={(e) => updateProduct(product.id, 'title', e.target.value)}
                          disabled={product.status !== 'pending'}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          placeholder={t.title}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={product.categoryId}
                          onChange={(e) => updateProduct(product.id, 'categoryId', e.target.value)}
                          disabled={product.status !== 'pending'}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">{t.selectCategory}</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={product.price}
                          onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                          disabled={product.status !== 'pending'}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          placeholder={t.price}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={product.moq}
                          onChange={(e) => updateProduct(product.id, 'moq', e.target.value)}
                          disabled={product.status !== 'pending'}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          min="1"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={product.supplyCapacity}
                          onChange={(e) => updateProduct(product.id, 'supplyCapacity', e.target.value)}
                          disabled={product.status !== 'pending'}
                          className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          placeholder={t.supplyCapacity}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {product.status === 'success' && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {product.status === 'failed' && (
                            <span className="text-red-600 cursor-help" title={product.error}>✕</span>
                          )}
                          {product.status === 'pending' && (
                            <button
                              onClick={() => removeProduct(product.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t.noProducts}</p>
          </div>
        )}
      </div>
    </div>
  )
}