'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bot, Sparkles, ArrowLeft, Save, Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'

interface Category {
  id: string
  name: string
  nameEn?: string
}

interface AIAgent {
  id: string
  name: string
  description?: string
  capabilities: string[]
}

interface GeneratedProduct {
  name: string
  description: string
  price: number
  currency: string
  category: string
  images: string[]
  moq: number
  specifications: Record<string, string>
  languages: string[]
}

export default function NewAIProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [language, setLanguage] = useState('en')

  const [agents, setAgents] = useState<AIAgent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingAgents, setLoadingAgents] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [productInput, setProductInput] = useState({
    categoryId: '',
    briefDescription: '',
  })

  const [generatedProduct, setGeneratedProduct] = useState<GeneratedProduct | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const t = {
    pageTitle: language === 'zh' ? '🤖 AI 智能创建产品' :
              language === 'ja' ? '🤖 AI 製品作成' :
              language === 'ar' ? '🤖 إنشاء منتج بالذكاء الاصطناعي' :
              language === 'es' ? '🤖 Crear Producto con IA' :
              language === 'fr' ? '🤖 Créer un Produit avec IA' :
              language === 'de' ? '🤖 KI-Produkterstellung' :
              language === 'ko' ? '🤖 AI 제품 만들기' :
              language === 'ru' ? '🤖 Создание Продукта с AI' :
              language === 'pt' ? '🤖 Criar Produto com IA' :
              language === 'hi' ? '🤖 AI से उत्पाद बनाएं' :
              language === 'th' ? '🤖 สร้างผลิตภัณฑ์ด้วย AI' :
              language === 'vi' ? '🤖 Tạo Sản phẩm với AI' :
              '🤖 AI Smart Product Creation',
    backToProducts: language === 'zh' ? '← 返回产品列表' :
                    language === 'ja' ? '← 製品一覧に戻る' :
                    language === 'ar' ? '← العودة إلى قائمة المنتجات' :
                    language === 'es' ? '← Volver a la Lista de Productos' :
                    language === 'fr' ? '← Retour à la Liste des Produits' :
                    language === 'de' ? '← Zurück zur Produktliste' :
                    language === 'ko' ? '← 제품 목록으로 돌아가기' :
                    language === 'ru' ? '← Вернуться к Списку Продуктов' :
                    language === 'pt' ? '← Voltar à Lista de Produtos' :
                    language === 'hi' ? '← उत्पाद सूची पर वापस जाएं' :
                    language === 'th' ? '← กลับไปที่รายการผลิตภัณฑ์' :
                    language === 'vi' ? '← Quay lại Danh sách Sản phẩm' :
                    '← Back to Products',
    selectAgent: language === 'zh' ? '选择 AI 代理' :
                 language === 'ja' ? 'AI エージェントを選択' :
                 language === 'ar' ? 'اختر وكيل الذكاء الاصطناعي' :
                 language === 'es' ? 'Seleccionar Agente de IA' :
                 language === 'fr' ? 'Sélectionner un Agent IA' :
                 language === 'de' ? 'KI-Agent Auswählen' :
                 language === 'ko' ? 'AI 에이전트 선택' :
                 language === 'ru' ? 'Выбрать AI-Агента' :
                 language === 'pt' ? 'Selecionar Agente de IA' :
                 language === 'hi' ? 'AI एजेंट चुनें' :
                 language === 'th' ? 'เลือกตัวแทน AI' :
                 language === 'vi' ? 'Chọn Đại lý AI' :
                 'Select AI Agent',
    selectAgentPlaceholder: language === 'zh' ? '请选择一个 AI 代理来创建产品' :
                            language === 'ja' ? '製品を作成するAIエージェントを選択してください' :
                            language === 'ar' ? 'اختر وكيل الذكاء الاصطناعي لإنشاء منتج' :
                            language === 'es' ? 'Seleccione un agente de IA para crear el producto' :
                            language === 'fr' ? 'Sélectionnez un agent IA pour créer le produit' :
                            language === 'de' ? 'Wählen Sie einen KI-Agenten zum Erstellen des Produkts' :
                            language === 'ko' ? '제품을 만들 AI 에이전트를 선택하세요' :
                            language === 'ru' ? 'Выберите AI-агента для создания продукта' :
                            language === 'pt' ? 'Selecione um agente de IA para criar o produto' :
                            language === 'hi' ? 'उत्पाद बनाने के लिए एक AI एजेंट चुनें' :
                            language === 'th' ? 'เลือกตัวแทน AI เพื่อสร้างผลิตภัณฑ์' :
                            language === 'vi' ? 'Chọn đại lý AI để tạo sản phẩm' :
                            'Select an AI agent to create product',
    noAgents: language === 'zh' ? '没有可用的 AI 代理' :
              language === 'ja' ? '利用可能なAIエージェントがありません' :
              language === 'ar' ? 'لا يوجد وكلاء ذكاء اصطناعي متاحون' :
              language === 'es' ? 'No hay agentes de IA disponibles' :
              language === 'fr' ? 'Aucun agent IA disponible' :
              language === 'de' ? 'Keine KI-Agenten verfügbar' :
              language === 'ko' ? '사용 가능한 AI 에이전트가 없습니다' :
              language === 'ru' ? 'Нет доступных AI-агентов' :
              language === 'pt' ? 'Nenhum agente de IA disponível' :
              language === 'hi' ? 'कोई AI एजेंट उपलब्ध नहीं है' :
              language === 'th' ? 'ไม่มีตัวแทน AI ที่พร้อมใช้งาน' :
              language === 'vi' ? 'Không có đại lý AI nào khả dụng' :
              'No AI agents available',
    createAgentFirst: language === 'zh' ? '请先创建一个 AI 代理' :
                     language === 'ja' ? '最初にAIエージェントを作成してください' :
                     language === 'ar' ? 'يرجى إنشاء وكيل ذكاء اصطناعي أولاً' :
                     language === 'es' ? 'Por favor cree un agente de IA primero' :
                     language === 'fr' ? 'Veuillez créer un agent IA d\'abord' :
                     language === 'de' ? 'Bitte erstellen Sie zuerst einen KI-Agenten' :
                     language === 'ko' ? '먼저 AI 에이전트를 만드세요' :
                     language === 'ru' ? 'Пожалуйста, сначала создайте AI-агента' :
                     language === 'pt' ? 'Por favor, crie um agente de IA primeiro' :
                     language === 'hi' ? 'कृपया पहले एक AI एजेंट बनाएं' :
                     language === 'th' ? 'โปรดสร้างตัวแทน AI ก่อน' :
                     language === 'vi' ? 'Vui lòng tạo đại lý AI trước' :
                     'Please create an AI agent first',
    productInfo: language === 'zh' ? '产品信息' :
                language === 'ja' ? '製品情報' :
                language === 'ar' ? 'معلومات المنتج' :
                language === 'es' ? 'Información del Producto' :
                language === 'fr' ? 'Informations sur le Produit' :
                language === 'de' ? 'Produktinformationen' :
                language === 'ko' ? '제품 정보' :
                language === 'ru' ? 'Информация о Продукте' :
                language === 'pt' ? 'Informações do Produto' :
                language === 'hi' ? 'उत्पाद जानकारी' :
                language === 'th' ? 'ข้อมูลผลิตภัณฑ์' :
                language === 'vi' ? 'Thông tin Sản phẩm' :
                'Product Information',
    category: language === 'zh' ? '产品分类' :
              language === 'ja' ? '製品カテゴリ' :
              language === 'ar' ? 'فئة المنتج' :
              language === 'es' ? 'Categoría del Producto' :
              language === 'fr' ? 'Catégorie du Produit' :
              language === 'de' ? 'Produktkategorie' :
              language === 'ko' ? '제품 카테고리' :
              language === 'ru' ? 'Категория Продукта' :
              language === 'pt' ? 'Categoria do Produto' :
              language === 'hi' ? 'उत्पाद श्रेणी' :
              language === 'th' ? 'หมวดหมู่ผลิตภัณฑ์' :
              language === 'vi' ? 'Danh mục Sản phẩm' :
              'Category',
    selectCategory: language === 'zh' ? '选择产品分类' :
                    language === 'ja' ? '製品カテゴリを選択' :
                    language === 'ar' ? 'اختر فئة المنتج' :
                    language === 'es' ? 'Seleccionar Categoría del Producto' :
                    language === 'fr' ? 'Sélectionner la Catégorie du Produit' :
                    language === 'de' ? 'Produktkategorie Auswählen' :
                    language === 'ko' ? '제품 카테고리 선택' :
                    language === 'ru' ? 'Выбрать Категорию Продукта' :
                    language === 'pt' ? 'Selecionar Categoria do Produto' :
                    language === 'hi' ? 'उत्पाद श्रेणी चुनें' :
                    language === 'th' ? 'เลือกหมวดหมู่ผลิตภัณฑ์' :
                    language === 'vi' ? 'Chọn Danh mục Sản phẩm' :
                    'Select Category',
    briefDescription: language === 'zh' ? '产品简单描述' :
                       language === 'ja' ? '製品の簡単な説明' :
                       language === 'ar' ? 'وصف موجز للمنتج' :
                       language === 'es' ? 'Descripción Breve del Producto' :
                       language === 'fr' ? 'Brève Description du Produit' :
                       language === 'de' ? 'Kurze Produktbeschreibung' :
                       language === 'ko' ? '제품简要 설명' :
                       language === 'ru' ? 'Краткое Описание Продукта' :
                       language === 'pt' ? 'Breve Descrição do Produto' :
                       language === 'hi' ? 'उत्पाद का संक्षिप्त विवरण' :
                       language === 'th' ? 'คำอธิบายสั้นๆ ของผลิตภัณฑ์' :
                       language === 'vi' ? 'Mô tả ngắn gọn về sản phẩm' :
                       'Brief Description',
    briefPlaceholder: language === 'zh' ? '描述您想销售的产品，例如：高品质无线蓝牙耳机，支持降噪功能...' :
                      language === 'ja' ? '出售したい製品を説明してください。例：高品質なワイヤレスBluetoothヘッドフォン、アクティブノイズキャンセリング対応...' :
                      language === 'ar' ? 'صِف المنتج الذي تريد بيعه، مثل: سماعات أذن بلوتوث لاسلكية عالية الجودة مع خاصية إلغاء الضوضاء...' :
                      language === 'es' ? 'Describa el producto que desea vender, por ejemplo: Auriculares Bluetooth inalámbricos de alta calidad con cancelación de ruido...' :
                      language === 'fr' ? 'Décrivez le produit que vous souhaitez vendre, par exemple: Écouteurs Bluetooth sans fil de haute qualité avec suppression du bruit...' :
                      language === 'de' ? 'Beschreiben Sie das Produkt, das Sie verkaufen möchten, z.B.: Hochwertige kabellose Bluetooth-Kopfhörer mit Geräuschunterdrückung...' :
                      language === 'ko' ? '판매할 제품을 설명하세요. 예: 고급 무선 블루투스 이어폰, 노이즈 캔슬링 기능 지원...' :
                      language === 'ru' ? 'Опишите продукт, который хотите продать, например: Высококачественные беспроводные Bluetooth-наушники с шумоподавлением...' :
                      language === 'pt' ? 'Descreva o produto que deseja vender, por exemplo: Fones de ouvido Bluetooth sem fio de alta qualidade com cancelamento de ruído...' :
                      language === 'hi' ? 'उत्पाद का वर्णन करें जिसे आप बेचना चाहते हैं, उदाहरण: उच्च गुणवत्ता वाले वायरलेस ब्लूटूथ हेडफोन जिसमें शोर रद्द करने की सुविधा है...' :
                      language === 'th' ? 'อธิบายผลิตภัณฑ์ที่คุณต้องการขาย เช่น: หูฟังบลูทูธไร้สายคุณภาพสูงพร้อมฟังก์ชันตัดเสียงรบกวน...' :
                      language === 'vi' ? 'Mô tả sản phẩm bạn muốn bán, ví dụ: Tai nghe Bluetooth không dây chất lượng cao có tính năng khử tiếng ồn...' :
                      'Describe the product you want to sell, e.g.: High-quality wireless Bluetooth earphones with noise-cancelling feature...',
    generateWithAI: language === 'zh' ? '✨ 使用 AI 生成完整产品信息' :
                   language === 'ja' ? '✨ AIで完全な製品情報を生成' :
                   language === 'ar' ? '✨ استخدام الذكاء الاصطناعي لتوليد معلومات المنتج الكاملة' :
                   language === 'es' ? '✨ Usar IA para Generar Información Completa del Producto' :
                   language === 'fr' ? '✨ Utiliser l\'IA pour Générer les Informations Complètes du Produit' :
                   language === 'de' ? '✨ KI verwenden, um vollständige Produktinformationen zu generieren' :
                   language === 'ko' ? '✨ AI를 사용하여 완전한 제품 정보 생성' :
                   language === 'ru' ? '✨ Использовать AI для создания полной информации о продукте' :
                   language === 'pt' ? '✨ Usar IA para Gerar Informações Completas do Produto' :
                   language === 'hi' ? '✨ AI का उपयोग करके पूर्ण उत्पाद जानकारी तैयार करें' :
                   language === 'th' ? '✨ ใช้ AI เพื่อสร้างข้อมูลผลิตภัณฑ์ที่สมบูรณ์' :
                   language === 'vi' ? '✨ Sử dụng AI để tạo thông tin sản phẩm đầy đủ' :
                   '✨ Generate Complete Product Info with AI',
    generating: language === 'zh' ? 'AI 正在生成产品信息...' :
               language === 'ja' ? 'AIが製品情報を生成中...' :
               language === 'ar' ? 'الذكاء الاصطناعي يولد معلومات المنتج...' :
               language === 'es' ? 'IA generando información del producto...' :
               language === 'fr' ? 'IA en train de générer les informations du produit...' :
               language === 'de' ? 'KI generiert Produktinformationen...' :
               language === 'ko' ? 'AI가 제품 정보를 생성 중...' :
               language === 'ru' ? 'AI генерирует информацию о продукте...' :
               language === 'pt' ? 'IA gerando informações do produto...' :
               language === 'hi' ? 'AI उत्पाद जानकारी तैयार कर रहा है...' :
               language === 'th' ? 'AI กำลังสร้างข้อมูลผลิตภัณฑ์...' :
               language === 'vi' ? 'AI đang tạo thông tin sản phẩm...' :
               'AI is generating product information...',
    generatedProduct: language === 'zh' ? '🎉 AI 已生成产品信息' :
                     language === 'ja' ? '🎉 AIが製品情報を生成しました' :
                     language === 'ar' ? '🎉 أنشأ الذكاء الاصطناعي معلومات المنتج' :
                     language === 'es' ? '🎉 La IA ha generado la información del producto' :
                     language === 'fr' ? '🎉 L\'IA a généré les informations du produit' :
                     language === 'de' ? '🎉 KI hat Produktinformationen generiert' :
                     language === 'ko' ? '🎉 AI가 제품 정보를 생성했습니다' :
                     language === 'ru' ? '🎉 AI создал информацию о продукте' :
                     language === 'pt' ? '🎉 A IA gerou as informações do produto' :
                     language === 'hi' ? '🎉 AI ने उत्पाद जानकारी तैयार की' :
                     language === 'th' ? '🎉 AI สร้างข้อมูลผลิตภัณฑ์แล้ว' :
                     language === 'vi' ? '🎉 AI đã tạo thông tin sản phẩm' :
                     '🎉 AI Generated Product Information',
    reviewAndEdit: language === 'zh' ? '请审核并编辑生成的内容' :
                  language === 'ja' ? '生成されたコンテンツをレビューして編集してください' :
                  language === 'ar' ? 'يرجى مراجعة وتحرير المحتوى المُنشأ' :
                  language === 'es' ? 'Por favor revise y edite el contenido generado' :
                  language === 'fr' ? 'Veuillez examiner et modifier le contenu généré' :
                  language === 'de' ? 'Bitte überprüfen und bearbeiten Sie die generierten Inhalte' :
                  language === 'ko' ? '생성된 콘텐츠를 검토하고 편집하세요' :
                  language === 'ru' ? 'Пожалуйста, просмотрите и отредактируйте сгенерированный контент' :
                  language === 'pt' ? 'Por favor, revise e edite o conteúdo gerado' :
                  language === 'hi' ? 'कृपया उत्पन्न सामग्री की समीक्षा करें और संपादित करें' :
                  language === 'th' ? 'โปรดตรวจสอบและแก้ไขเนื้อหาที่สร้างขึ้น' :
                  language === 'vi' ? 'Vui lòng xem lại và chỉnh sửa nội dung đã tạo' :
                  'Please review and edit the generated content',
    productName: language === 'zh' ? '产品名称' :
                 language === 'ja' ? '製品名' :
                 language === 'ar' ? 'اسم المنتج' :
                 language === 'es' ? 'Nombre del Producto' :
                 language === 'fr' ? 'Nom du Produit' :
                 language === 'de' ? 'Produktname' :
                 language === 'ko' ? '제품명' :
                 language === 'ru' ? 'Название Продукта' :
                 language === 'pt' ? 'Nome do Produto' :
                 language === 'hi' ? 'उत्पाद का नाम' :
                 language === 'th' ? 'ชื่อผลิตภัณฑ์' :
                 language === 'vi' ? 'Tên sản phẩm' :
                 'Product Name',
    description: language === 'zh' ? '产品描述' :
                 language === 'ja' ? '製品説明' :
                 language === 'ar' ? 'وصف المنتج' :
                 language === 'es' ? 'Descripción del Producto' :
                 language === 'fr' ? 'Description du Produit' :
                 language === 'de' ? 'Produktbeschreibung' :
                 language === 'ko' ? '제품 설명' :
                 language === 'ru' ? 'Описание Продукта' :
                 language === 'pt' ? 'Descrição do Produto' :
                 language === 'hi' ? 'उत्पाद विवरण' :
                 language === 'th' ? 'คำอธิบายผลิตภัณฑ์' :
                 language === 'vi' ? 'Mô tả sản phẩm' :
                 'Description',
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
    currency: language === 'zh' ? '货币' :
              language === 'ja' ? '通貨' :
              language === 'ar' ? 'العملة' :
              language === 'es' ? 'Moneda' :
              language === 'fr' ? 'Devise' :
              language === 'de' ? 'Währung' :
              language === 'ko' ? '통화' :
              language === 'ru' ? 'Валюта' :
              language === 'pt' ? 'Moeda' :
              language === 'hi' ? 'मुद्रा' :
              language === 'th' ? 'สกุลเงิน' :
              language === 'vi' ? 'Tiền tệ' :
              'Currency',
    minOrderQty: language === 'zh' ? '最小订单量' :
                  language === 'ja' ? '最小注文数' :
                  language === 'ar' ? 'الحد الأدنى للطلب' :
                  language === 'es' ? 'Cantidad Mínima de Pedido' :
                  language === 'fr' ? 'Quantité Minimum de Commande' :
                  language === 'de' ? 'Mindestbestellmenge' :
                  language === 'ko' ? '최소 주문 수량' :
                  language === 'ru' ? 'Минимальное Количество Заказа' :
                  language === 'pt' ? 'Quantidade Mínima de Pedido' :
                  language === 'hi' ? 'न्यूनतम ऑर्डर मात्रा' :
                  language === 'th' ? 'จำนวนสั่งซื้อขั้นต่ำ' :
                  language === 'vi' ? 'Số lượng đặt hàng tối thiểu' :
                  'Min Order Qty',
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
    createProduct: language === 'zh' ? '创建产品' :
                   language === 'ja' ? '製品を作成' :
                   language === 'ar' ? 'إنشاء المنتج' :
                   language === 'es' ? 'Crear Producto' :
                   language === 'fr' ? 'Créer le Produit' :
                   language === 'de' ? 'Produkt Erstellen' :
                   language === 'ko' ? '제품 만들기' :
                   language === 'ru' ? 'Создать Продукт' :
                   language === 'pt' ? 'Criar Produto' :
                   language === 'hi' ? 'उत्पाद बनाएं' :
                   language === 'th' ? 'สร้างผลิตภัณฑ์' :
                   language === 'vi' ? 'Tạo sản phẩm' :
                   'Create Product',
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
    productCreated: language === 'zh' ? '✅ 产品创建成功！' :
                    language === 'ja' ? '✅ 製品が作成されました！' :
                    language === 'ar' ? '✅ تم إنشاء المنتج بنجاح!' :
                    language === 'es' ? '✅ ¡Producto creado con éxito!' :
                    language === 'fr' ? '✅ Produit créé avec succès!' :
                    language === 'de' ? '✅ Produkt erfolgreich erstellt!' :
                    language === 'ko' ? '✅ 제품이 성공적으로 생성되었습니다!' :
                    language === 'ru' ? '✅ Продукт успешно создан!' :
                    language === 'pt' ? '✅ Produto criado com sucesso!' :
                    language === 'hi' ? '✅ उत्पाद सफलतापूर्वक बनाया गया!' :
                    language === 'th' ? '✅ สร้างผลิตภัณฑ์สำเร็จ!' :
                    language === 'vi' ? '✅ Tạo sản phẩm thành công!' :
                    '✅ Product created successfully!',
    viewProduct: language === 'zh' ? '查看产品' :
                 language === 'ja' ? '製品を表示' :
                 language === 'ar' ? 'عرض المنتج' :
                 language === 'es' ? 'Ver Producto' :
                 language === 'fr' ? 'Voir le Produit' :
                 language === 'de' ? 'Produkt Anzeigen' :
                 language === 'ko' ? '제품 보기' :
                 language === 'ru' ? 'Посмотреть Продукт' :
                 language === 'pt' ? 'Ver Produto' :
                 language === 'hi' ? 'उत्पाद देखें' :
                 language === 'th' ? 'ดูผลิตภัณฑ์' :
                 language === 'vi' ? 'Xem sản phẩm' :
                 'View Product',
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
    addMore: language === 'zh' ? '继续添加更多产品' :
            language === 'ja' ? '更多製品を追加' :
            language === 'ar' ? 'إضافة المزيد من المنتجات' :
            language === 'es' ? 'Agregar Más Productos' :
            language === 'fr' ? 'Ajouter Plus de Produits' :
            language === 'de' ? 'Mehr Produkte Hinzufügen' :
            language === 'ko' ? '더 많은 제품 추가' :
            language === 'ru' ? 'Добавить Еще Продуктов' :
            language === 'pt' ? 'Adicionar Mais Produtos' :
            language === 'hi' ? 'और उत्पाद जोड़ें' :
            language === 'th' ? 'เพิ่มผลิตภัณฑ์เพิ่มเติม' :
            language === 'vi' ? 'Thêm nhiều sản phẩm hơn' :
            'Add More Products',
    fillRequired: language === 'zh' ? '请填写所有必填字段' :
                  language === 'ja' ? 'すべての必須フィールドに入力してください' :
                  language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' :
                  language === 'es' ? 'Por favor llene todos los campos requeridos' :
                  language === 'fr' ? 'Veuillez remplir tous les champs requis' :
                  language === 'de' ? 'Bitte füllen Sie alle erforderlichen Felder aus' :
                  language === 'ko' ? '모든 필수 필드를 입력하세요' :
                  language === 'ru' ? 'Пожалуйста, заполните все обязательные поля' :
                  language === 'pt' ? 'Por favor, preencha todos os campos obrigatórios' :
                  language === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें' :
                  language === 'th' ? 'โปรดกรอกข้อมูลในช่องที่จำเป็นทั้งหมด' :
                  language === 'vi' ? 'Vui lòng điền vào tất cả các trường bắt buộc' :
                  'Please fill in all required fields',
  }

  useEffect(() => {
    const cookies = document.cookie.split(';')
    const langCookie = cookies.find(c => c.trim().startsWith('language='))
    if (langCookie) {
      const lang = langCookie.split('=')[1]
      setLanguage(lang || 'en')
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchAgents()
      fetchCategories()
    }
  }, [session?.user?.id])

  const fetchAgents = async () => {
    setLoadingAgents(true)
    try {
      const res = await fetch(`/api/ai/agents?ownerId=${session?.user?.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.data?.agents) {
          setAgents(data.data.agents)
          if (data.data.agents.length > 0) {
            setSelectedAgent(data.data.agents[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoadingAgents(false)
    }
  }

  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedAgent || !productInput.categoryId || !productInput.briefDescription) {
      setError(t.fillRequired)
      return
    }

    setIsGenerating(true)
    setError(null)

    const agent = agents.find(a => a.id === selectedAgent)
    const category = categories.find(c => c.id === productInput.categoryId)

    await new Promise(resolve => setTimeout(resolve, 2000))

    const mockGenerated: GeneratedProduct = {
      name: productInput.briefDescription.split('，')[0].split(',')[0] || productInput.briefDescription.substring(0, 50),
      description: `${productInput.briefDescription}\n\nThis premium product is designed with cutting-edge technology to meet your business needs. Features excellent quality, competitive pricing, and reliable performance. Suitable for wholesale and retail.`,
      price: Math.floor(Math.random() * 500) + 50,
      currency: 'USD',
      category: category?.name || productInput.categoryId,
      images: [],
      moq: Math.floor(Math.random() * 100) + 10,
      specifications: {
        'Material': 'High Quality',
        'Origin': 'China',
        'Certification': 'CE, FCC, RoHS',
        'Warranty': '1 Year',
      },
      languages: [language],
    }

    setGeneratedProduct(mockGenerated)
    setIsGenerating(false)
  }

  const handleCreateProduct = async () => {
    if (!generatedProduct || !selectedAgent) return

    setIsCreating(true)
    setError(null)

    try {
      const agent = agents.find(a => a.id === selectedAgent)

      const res = await fetch('/api/ai/seller/product/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${agent?.capabilities?.[0] || 'demo_api_key'}`
        },
        body: JSON.stringify({
          sellerId: session?.user?.id,
          name: generatedProduct.name,
          description: generatedProduct.description,
          price: generatedProduct.price,
          currency: generatedProduct.currency,
          category: generatedProduct.category,
          images: generatedProduct.images,
          moq: generatedProduct.moq,
          specifications: generatedProduct.specifications,
          languages: generatedProduct.languages,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSuccess(t.productCreated)
        setGeneratedProduct(null)
        setProductInput({ categoryId: '', briefDescription: '' })

        setTimeout(() => {
          router.push('/seller/products')
        }, 2000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create product')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create product')
    } finally {
      setIsCreating(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="text-green-800 font-medium">{success}</p>
              <div className="mt-2 flex space-x-3">
                <Link href="/seller/products" className="text-green-700 hover:text-green-800 underline">
                  {t.goToProducts}
                </Link>
                <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-800 underline">
                  {t.addMore}
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bot className="w-5 h-5 mr-2 text-purple-600" />
              {t.selectAgent}
            </h2>

            {loadingAgents ? (
              <div className="flex items-center text-gray-500">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading agents...
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">{t.noAgents}</p>
                <Link
                  href="/seller/ai-management"
                  className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  {t.createAgentFirst}
                </Link>
              </div>
            ) : (
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">{t.selectAgentPlaceholder}</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} {agent.description ? `- ${agent.description}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
              {t.productInfo}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.category} *
                </label>
                {loadingCategories ? (
                  <div className="flex items-center text-gray-500">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Loading categories...
                  </div>
                ) : (
                  <select
                    value={productInput.categoryId}
                    onChange={(e) => setProductInput({ ...productInput, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t.selectCategory}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.briefDescription} *
                </label>
                <textarea
                  value={productInput.briefDescription}
                  onChange={(e) => setProductInput({ ...productInput, briefDescription: e.target.value })}
                  placeholder={t.briefPlaceholder}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={!selectedAgent || !productInput.categoryId || !productInput.briefDescription || isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t.generating}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {t.generateWithAI}
                  </>
                )}
              </button>
            </div>
          </div>

          {generatedProduct && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                {t.generatedProduct}
              </h2>
              <p className="text-sm text-gray-500 mb-6">{t.reviewAndEdit}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.productName} *</label>
                  <input
                    type="text"
                    value={generatedProduct.name}
                    onChange={(e) => setGeneratedProduct({ ...generatedProduct, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.description} *</label>
                  <textarea
                    value={generatedProduct.description}
                    onChange={(e) => setGeneratedProduct({ ...generatedProduct, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.price} *</label>
                    <input
                      type="number"
                      value={generatedProduct.price}
                      onChange={(e) => setGeneratedProduct({ ...generatedProduct, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.currency}</label>
                    <select
                      value={generatedProduct.currency}
                      onChange={(e) => setGeneratedProduct({ ...generatedProduct, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="CNY">CNY</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.minOrderQty}</label>
                  <input
                    type="number"
                    value={generatedProduct.moq}
                    onChange={(e) => setGeneratedProduct({ ...generatedProduct, moq: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.specifications}</label>
                  <div className="space-y-2">
                    {Object.entries(generatedProduct.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newSpecs = { ...generatedProduct.specifications }
                            delete newSpecs[key]
                            newSpecs[e.target.value] = value
                            setGeneratedProduct({ ...generatedProduct, specifications: newSpecs })
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Key"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => {
                            setGeneratedProduct({
                              ...generatedProduct,
                              specifications: {
                                ...generatedProduct.specifications,
                                [key]: e.target.value,
                              },
                            })
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Value"
                        />
                        <button
                          onClick={() => {
                            const newSpecs = { ...generatedProduct.specifications }
                            delete newSpecs[key]
                            setGeneratedProduct({ ...generatedProduct, specifications: newSpecs })
                          }}
                          className="px-3 py-2 text-red-600 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setGeneratedProduct({
                          ...generatedProduct,
                          specifications: {
                            ...generatedProduct.specifications,
                            '': '',
                          },
                        })
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Add Specification
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCreateProduct}
                    disabled={isCreating}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t.creating}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {t.createProduct}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}