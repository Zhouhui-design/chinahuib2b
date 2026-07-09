'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

interface FileUploadProps {
  type: 'product_image' | 'product_video' | 'product_document' | 'brochure' | 'store_brochure' | 'logo' | 'banner'
  productId?: string
  title?: string
  onUploadSuccess?: (data: any) => void
  onUploadStart?: () => void
  accept?: string
  maxSizeMB?: number
  multiple?: boolean
}

export default function FileUpload({
  type,
  productId,
  title,
  onUploadSuccess,
  onUploadStart,
  accept,
  maxSizeMB,
  multiple = false
}: FileUploadProps) {
  const language = useSellerLanguage()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set default accept and max size based on type
  const getDefaultAccept = () => {
    switch (type) {
      case 'brochure':
      case 'store_brochure':
        return '.pdf'
      case 'product_video':
        return 'video/*'
      case 'product_document':
        return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z'
      default:
        return 'image/*'
    }
  }
  
  const getDefaultMaxSize = () => {
    switch (type) {
      case 'product_video':
        return 100
      case 'product_document':
      case 'brochure':
      case 'store_brochure':
        return 50
      default:
        return 5
    }
  }
  
  const fileAccept = accept || getDefaultAccept()
  const maxFileSize = maxSizeMB || getDefaultMaxSize()

  const t = {
    uploadPDFBrochure: language === 'zh' ? '上传PDF手册' :
                       language === 'ja' ? 'PDFパンフレットをアップロード' :
                       language === 'ar' ? 'رفع كتيب PDF' :
                       language === 'es' ? 'Subir folleto PDF' :
                       language === 'fr' ? 'Télécharger le brochure PDF' :
                       language === 'de' ? 'PDF-Broschüre hochladen' :
                       language === 'ko' ? 'PDF 브로셔 업로드' :
                       language === 'ru' ? 'Загрузить PDF-буклет' :
                       language === 'pt' ? 'Enviar folheto PDF' :
                       language === 'hi' ? 'PDF ब्रोशर अपलोड करें' :
                       language === 'th' ? 'อัปโหลดโบรชัวร์ PDF' :
                       language === 'vi' ? 'Tải lên Sách tay PDF' :
                       'Upload PDF Brochure',
    
    uploadCompanyLogo: language === 'zh' ? '上传公司Logo' :
                       language === 'ja' ? '会社ロゴをアップロード' :
                       language === 'ar' ? 'رفع شعار الشركة' :
                       language === 'es' ? 'Subir logotipo de empresa' :
                       language === 'fr' ? 'Télécharger le logo de l\'entreprise' :
                       language === 'de' ? 'Firmensymbol hochladen' :
                       language === 'ko' ? '회사 로고 업로드' :
                       language === 'ru' ? 'Загрузить логотип компании' :
                       language === 'pt' ? 'Enviar logotipo da empresa' :
                       language === 'hi' ? 'कंपनी लोगो अपलोड करें' :
                       language === 'th' ? 'อัปโหลดโลโก้บริษัท' :
                       language === 'vi' ? 'Tải lên Logo công ty' :
                       'Upload Company Logo',
    
    uploadStoreBanner: language === 'zh' ? '上传店铺横幅' :
                       language === 'ja' ? 'ストアバナーをアップロード' :
                       language === 'ar' ? 'رفع لافتة المتجر' :
                       language === 'es' ? 'Subir banner de la tienda' :
                       language === 'fr' ? 'Télécharger la bannière de la boutique' :
                       language === 'de' ? 'Store-Banner hochladen' :
                       language === 'ko' ? '스토어 배너 업로드' :
                       language === 'ru' ? 'Загрузить баннер магазина' :
                       language === 'pt' ? 'Enviar banner da loja' :
                       language === 'hi' ? 'स्टोर बैनर अपलोड करें' :
                       language === 'th' ? 'อัปโหลดแบนเนอร์ร้าน' :
                       language === 'vi' ? 'Tải lên Banner cửa hàng' :
                       'Upload Store Banner',
    
    uploadProductImage: language === 'zh' ? '上传产品图片' :
                        language === 'ja' ? '製品画像をアップロード' :
                        language === 'ar' ? 'رفع صورة المنتج' :
                        language === 'es' ? 'Subir imagen del producto' :
                        language === 'fr' ? 'Télécharger l\'image du produit' :
                        language === 'de' ? 'Produktbild hochladen' :
                        language === 'ko' ? '제품 이미지 업로드' :
                        language === 'ru' ? 'Загрузить изображение товара' :
                        language === 'pt' ? 'Enviar imagem do produto' :
                        language === 'hi' ? 'उत्पाद छवि अपलोड करें' :
                        language === 'th' ? 'อัปโหลดรูปสินค้า' :
                        language === 'vi' ? 'Tải lên Hình ảnh sản phẩm' :
                        'Upload Product Image',
    
    uploadProductImages: language === 'zh' ? '上传产品图片' :
                         language === 'ja' ? '製品画像をアップロード' :
                         language === 'ar' ? 'رفع صور المنتج' :
                         language === 'es' ? 'Subir imágenes del producto' :
                         language === 'fr' ? 'Télécharger les images du produit' :
                         language === 'de' ? 'Produktbilder hochladen' :
                         language === 'ko' ? '제품 이미지 업로드' :
                         language === 'ru' ? 'Загрузить изображения товара' :
                         language === 'pt' ? 'Enviar imagens do produto' :
                         language === 'hi' ? 'उत्पाद छवियां अपलोड करें' :
                         language === 'th' ? 'อัปโหลดรูปสินค้า' :
                         language === 'vi' ? 'Tải lên Hình ảnh sản phẩm' :
                         'Upload Product Images',
    
    uploadFile: language === 'zh' ? '上传文件' :
                language === 'ja' ? 'ファイルをアップロード' :
                language === 'ar' ? 'رفع ملف' :
                language === 'es' ? 'Subir archivo' :
                language === 'fr' ? 'Télécharger un fichier' :
                language === 'de' ? 'Datei hochladen' :
                language === 'ko' ? '파일 업로드' :
                language === 'ru' ? 'Загрузить файл' :
                language === 'pt' ? 'Enviar arquivo' :
                language === 'hi' ? 'फ़ाइल अपलोड करें' :
                language === 'th' ? 'อัปโหลดไฟล์' :
                language === 'vi' ? 'Tải lên Tệp' :
                'Upload File',
    
    uploadProductVideo: language === 'zh' ? '上传产品视频' :
                        language === 'ja' ? '製品ビデオをアップロード' :
                        language === 'ar' ? 'رفع فيديو المنتج' :
                        language === 'es' ? 'Subir video del producto' :
                        language === 'fr' ? 'Télécharger la vidéo du produit' :
                        language === 'de' ? 'Produktvideo hochladen' :
                        language === 'ko' ? '제품 비디오 업로드' :
                        language === 'ru' ? 'Загрузить видео товара' :
                        language === 'pt' ? 'Enviar vídeo do produto' :
                        language === 'hi' ? 'उत्पाद वीडियो अपलोड करें' :
                        language === 'th' ? 'อัปโหลดวิดีโอสินค้า' :
                        language === 'vi' ? 'Tải lên Video sản phẩm' :
                        'Upload Product Video',
    
    uploadProductVideos: language === 'zh' ? '上传产品视频' :
                         language === 'ja' ? '製品ビデオをアップロード' :
                         language === 'ar' ? 'رفع فيديوهات المنتج' :
                         language === 'es' ? 'Subir videos del producto' :
                         language === 'fr' ? 'Télécharger les vidéos du produit' :
                         language === 'de' ? 'Produktvideos hochladen' :
                         language === 'ko' ? '제품 비디오 업로드' :
                         language === 'ru' ? 'Загрузить видео товаров' :
                         language === 'pt' ? 'Enviar vídeos do produto' :
                         language === 'hi' ? 'उत्पाद वीडियो अपलोड करें' :
                         language === 'th' ? 'อัปโหลดวิดีโอสินค้า' :
                         language === 'vi' ? 'Tải lên Video sản phẩm' :
                         'Upload Product Videos',
    
    uploadProductDocument: language === 'zh' ? '上传产品文档' :
                           language === 'ja' ? '製品ドキュメントをアップロード' :
                           language === 'ar' ? 'رفع وثيقة المنتج' :
                           language === 'es' ? 'Subir documento del producto' :
                           language === 'fr' ? 'Télécharger le document du produit' :
                           language === 'de' ? 'Produktdokument hochladen' :
                           language === 'ko' ? '제품 문서 업로드' :
                           language === 'ru' ? 'Загрузить документ товара' :
                           language === 'pt' ? 'Enviar documento do produto' :
                           language === 'hi' ? 'उत्पाद दस्तावेज अपलोड करें' :
                           language === 'th' ? 'อัปโหลดเอกสารสินค้า' :
                           language === 'vi' ? 'Tải lên Tài liệu sản phẩm' :
                           'Upload Product Document',
    
    uploadProductDocuments: language === 'zh' ? '上传产品文档' :
                            language === 'ja' ? '製品ドキュメントをアップロード' :
                            language === 'ar' ? 'رفع وثائق المنتج' :
                            language === 'es' ? 'Subir documentos del producto' :
                            language === 'fr' ? 'Télécharger les documents du produit' :
                            language === 'de' ? 'Produktdokumente hochladen' :
                            language === 'ko' ? '제품 문서 업로드' :
                            language === 'ru' ? 'Загрузить документы товара' :
                            language === 'pt' ? 'Enviar documentos do produto' :
                            language === 'hi' ? 'उत्पाद दस्तावेज अपलोड करें' :
                            language === 'th' ? 'อัปโหลดเอกสารสินค้า' :
                            language === 'vi' ? 'Tải lên Tài liệu sản phẩm' :
                            'Upload Product Documents',
    
    uploading: language === 'zh' ? '上传中...' :
               language === 'ja' ? 'アップロード中...' :
               language === 'ar' ? 'جارٍ الرفع...' :
               language === 'es' ? 'Subiendo...' :
               language === 'fr' ? 'Téléchargement...' :
               language === 'de' ? 'Hochladen...' :
               language === 'ko' ? '업로드 중...' :
               language === 'ru' ? 'Загрузка...' :
               language === 'pt' ? 'Enviando...' :
               language === 'hi' ? 'अपलोड हो रहा है...' :
               language === 'th' ? 'กำลังอัปโหลด...' :
               language === 'vi' ? 'Đang tải lên...' :
               'Uploading...',
    
    pdfOnly: language === 'zh' ? '仅支持PDF文件' :
             language === 'ja' ? 'PDFファイルのみ' :
             language === 'ar' ? 'ملفات PDF فقط' :
             language === 'es' ? 'Solo archivos PDF' :
             language === 'fr' ? 'Seuls les fichiers PDF' :
             language === 'de' ? 'Nur PDF-Dateien' :
             language === 'ko' ? 'PDF 파일만' :
             language === 'ru' ? 'Только PDF-файлы' :
             language === 'pt' ? 'Apenas arquivos PDF' :
             language === 'hi' ? 'केवल PDF फाइलें' :
             language === 'th' ? 'ไฟล์ PDF เท่านั้น' :
             language === 'vi' ? 'Chỉ tệp PDF' :
             'PDF files only',
    
    imageTypes: language === 'zh' ? 'JPG, PNG, WebP' :
                language === 'ja' ? 'JPG、PNG、WebP' :
                language === 'ar' ? 'JPG، PNG، WebP' :
                language === 'es' ? 'JPG, PNG, WebP' :
                language === 'fr' ? 'JPG, PNG, WebP' :
                language === 'de' ? 'JPG, PNG, WebP' :
                language === 'ko' ? 'JPG, PNG, WebP' :
                language === 'ru' ? 'JPG, PNG, WebP' :
                language === 'pt' ? 'JPG, PNG, WebP' :
                language === 'hi' ? 'JPG, PNG, WebP' :
                language === 'th' ? 'JPG, PNG, WebP' :
                language === 'vi' ? 'JPG, PNG, WebP' :
                'JPG, PNG, WebP',
    
    maxSize: (size: number) => language === 'zh' ? `最大${size}MB` :
                               language === 'ja' ? `最大${size}MB` :
                               language === 'ar' ? `الأقصى ${size} ميجابايت` :
                               language === 'es' ? `Max ${size}MB` :
                               language === 'fr' ? `Max ${size}Mo` :
                               language === 'de' ? `Max ${size}MB` :
                               language === 'ko' ? `최대 ${size}MB` :
                               language === 'ru' ? `Макс ${size}МБ` :
                               language === 'pt' ? `Max ${size}MB` :
                               language === 'hi' ? `अधिकतम ${size}MB` :
                               language === 'th' ? `สูงสุด ${size}MB` :
                               language === 'vi' ? `Tối đa ${size}MB` :
                               `Max ${size}MB`,
    
    multipleAllowed: language === 'zh' ? '• 支持多文件上传' :
                     language === 'ja' ? '• 複数ファイル可' :
                     language === 'ar' ? '• يمكن رفع ملفات متعددة' :
                     language === 'es' ? '• Se permiten varios archivos' :
                     language === 'fr' ? '• Plusieurs fichiers autorisés' :
                     language === 'de' ? '• Mehrere Dateien erlaubt' :
                     language === 'ko' ? '• 여러 파일 허용' :
                     language === 'ru' ? '• Разрешено несколько файлов' :
                     language === 'pt' ? '• Vários arquivos permitidos' :
                     language === 'hi' ? '• कई फाइलें अनुमत' :
                     language === 'th' ? '• อัปโหลดหลายไฟล์ได้' :
                     language === 'vi' ? '• Cho phép nhiều tệp' :
                     '• Multiple files allowed',
    
    successfullyUploaded: (count: number) => language === 'zh' ? `成功上传 ${count} 个文件` :
                                            language === 'ja' ? `${count}個のファイルを正常にアップロードしました` :
                                            language === 'ar' ? `تم رفع ${count} ملف بنجاح` :
                                            language === 'es' ? `Se subieron ${count} archivo(s) correctamente` :
                                            language === 'fr' ? `${count} fichier(s) téléchargé(s) avec succès` :
                                            language === 'de' ? `${count} Datei(en) erfolgreich hochgeladen` :
                                            language === 'ko' ? `${count}개의 파일이 성공적으로 업로드되었습니다` :
                                            language === 'ru' ? `${count} файл(а/ов) успешно загружено` :
                                            language === 'pt' ? `${count} arquivo(s) enviado(s) com sucesso` :
                                            language === 'hi' ? `${count} फ़ाइलें सफलतापूर्वक अपलोड हुईं` :
                                            language === 'th' ? `อัปโหลดไฟล์ ${count} ไฟล์สำเร็จ` :
                                            language === 'vi' ? `Tải thành công ${count} tệp` :
                                            `Successfully uploaded ${count} file(s)`,
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setError(null)
    setSuccess(null)
    setUploading(true)
    setProgress(0)
    
    // Call onUploadStart callback if provided
    if (onUploadStart) {
      onUploadStart()
    }

    try {
      const results = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file size
        if (file.size > maxFileSize * 1024 * 1024) {
          throw new Error(`File "${file.name}" is too large. Max size: ${maxFileSize}MB`)
        }

        // Create form data
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)
        if (productId) formData.append('productId', productId)
        if (title) formData.append('title', title)

        // Simulate progress (since fetch doesn't support upload progress natively)
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return prev
            }
            return prev + 10
          })
        }, 200)

        // Upload to API
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)
        setProgress(100)

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed')
        }

        results.push(data)
      }

      setSuccess(t.successfullyUploaded(files.length))
      setUploading(false)
      setProgress(0)

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(results.length === 1 ? results[0] : results)
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
      setProgress(0)
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'brochure':
      case 'product_document':
        return <FileText className="w-8 h-8" />
      case 'logo':
      case 'banner':
      case 'product_image':
        return <ImageIcon className="w-8 h-8" />
      case 'product_video':
        return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      default:
        return <Upload className="w-8 h-8" />
    }
  }

  const getLabel = () => {
    switch (type) {
      case 'brochure':
        return t.uploadPDFBrochure
      case 'logo':
        return t.uploadCompanyLogo
      case 'banner':
        return t.uploadStoreBanner
      case 'product_image':
        return multiple ? t.uploadProductImages : t.uploadProductImage
      case 'product_video':
        return multiple ? t.uploadProductVideos : t.uploadProductVideo
      case 'product_document':
        return multiple ? t.uploadProductDocuments : t.uploadProductDocument
      default:
        return t.uploadFile
    }
  }

  const getSizeTips = () => {
    switch (type) {
      case 'logo':
        return {
          title: language === 'zh' ? 'Logo 最佳实践' :
                 language === 'ja' ? 'ロゴの最適な実践' :
                 language === 'ar' ? 'أفضل ممارسات الشعار' :
                 language === 'es' ? 'Mejores prácticas para logo' :
                 language === 'fr' ? 'Bonnes pratiques pour le logo' :
                 language === 'de' ? 'Logo-Best Practices' :
                 language === 'ko' ? '로고 모범 사례' :
                 language === 'ru' ? 'Лучшие практики для логотипа' :
                 language === 'pt' ? 'Boas práticas para logo' :
                 language === 'hi' ? 'लोगो के लिए सर्वोत्तम प्रथाएं' :
                 language === 'th' ? 'ปฏิบัติที่ดีที่สุดสำหรับโลโก้' :
                 language === 'vi' ? 'Kiên nguyện tốt nhất cho Logo' :
                 'Logo Best Practices',
          tips: [
            { icon: '📐', text: language === 'zh' ? '最佳尺寸：200 × 200 像素' :
                               language === 'ja' ? '最適なサイズ：200 × 200 ピクセル' :
                               language === 'ar' ? 'الحجم الأمثل: 200 × 200 بكسل' :
                               language === 'es' ? 'Tamaño óptimo: 200 × 200 píxeles' :
                               language === 'fr' ? 'Taille optimale : 200 × 200 pixels' :
                               language === 'de' ? 'Optimale Größe: 200 × 200 Pixel' :
                               language === 'ko' ? '최적 크기: 200 × 200 픽셀' :
                               language === 'ru' ? 'Оптимальный размер: 200 × 200 пикселей' :
                               language === 'pt' ? 'Tamanho ideal: 200 × 200 pixels' :
                               language === 'hi' ? 'इष्टतम आकार: 200 × 200 पिक्सेल' :
                               language === 'th' ? 'ขนาดที่เหมาะสม: 200 × 200 พิกเซล' :
                               language === 'vi' ? 'Kích thước tối ưu: 200 × 200 pixel' :
                               'Optimal size: 200 × 200 pixels' },
            { icon: '🔲', text: language === 'zh' ? '推荐比例：正方形 (1:1)' :
                               language === 'ja' ? '推奨比率：正方形 (1:1)' :
                               language === 'ar' ? 'النسبة الموصى بها: مربع (1:1)' :
                               language === 'es' ? 'Relación recomendada: Cuadrado (1:1)' :
                               language === 'fr' ? 'Ratio recommandé : Carré (1:1)' :
                               language === 'de' ? 'Empfohlener Seitenverhältnis: Quadrat (1:1)' :
                               language === 'ko' ? '추천 비율: 정사각형 (1:1)' :
                               language === 'ru' ? 'Рекомендуемое соотношение: Квадрат (1:1)' :
                               language === 'pt' ? 'Proporção recomendada: Quadrado (1:1)' :
                               language === 'hi' ? 'सिफारिश किया गया अनुपात: वर्ग (1:1)' :
                               language === 'th' ? 'อัตราส่วนที่แนะนำ: สี่เหลี่ยมจัตุรัส (1:1)' :
                               language === 'vi' ? 'Tỷ lệ khuyến nghị: Vuông (1:1)' :
                               'Recommended ratio: Square (1:1)' },
            { icon: '🎨', text: language === 'zh' ? '建议使用 PNG 透明背景' :
                               language === 'ja' ? 'PNG透明背景の使用を推奨' :
                               language === 'ar' ? 'يوصى باستخدام خلفية شفافة PNG' :
                               language === 'es' ? 'Se recomienda fondo transparente PNG' :
                               language === 'fr' ? 'Recommandé : Fond transparent PNG' :
                               language === 'de' ? 'Empfohlen: PNG mit transparentem Hintergrund' :
                               language === 'ko' ? 'PNG 투명 배경 사용 권장' :
                               language === 'ru' ? 'Рекомендуется: PNG с прозрачным фоном' :
                               language === 'pt' ? 'Recomendado: Fundo transparente PNG' :
                               language === 'hi' ? 'PNG पारदर्शी पृष्ठभूमि का उपयोग करने की सलाह' :
                               language === 'th' ? 'แนะนำให้ใช้พื้นหลังโปร่งแสง PNG' :
                               language === 'vi' ? 'Khuyến nghị dùng nền trong PNG' :
                               'Recommended: PNG with transparent background' },
            { icon: '✨', text: language === 'zh' ? '设计简洁，确保小尺寸清晰可见' :
                               language === 'ja' ? 'デザインは単純に、小さいサイズでも明確に見えるように' :
                               language === 'ar' ? 'تصميم بسيط يضمن رؤية واضحة بالحجم الصغير' :
                               language === 'es' ? 'Diseño simple, asegurar claridad en tamaño reducido' :
                               language === 'fr' ? 'Design simple, assurer la clarté en petit format' :
                               language === 'de' ? 'Einfaches Design, sicherstellen der Klarheit in kleiner Größe' :
                               language === 'ko' ? '단순한 디자인, 작은 크기에서도 명확하게 보이도록' :
                               language === 'ru' ? 'Простой дизайн, обеспечить четкость при малом размере' :
                               language === 'pt' ? 'Design simples, garantir clareza em tamanho reduzido' :
                               language === 'hi' ? 'सरल डिजाइन, छोटे आकार में भी स्पष्ट दिखना सुनिश्चित करें' :
                               language === 'th' ? 'ออกแบบง่าย ตรวจสอบให้เห็นชัดเจนในขนาดเล็ก' :
                               language === 'vi' ? 'Thiết kế đơn giản, đảm bảo rõ ràng ở kích thước nhỏ' :
                               'Simple design, ensure clarity at small sizes' },
          ]
        }
      case 'banner':
        return {
          title: language === 'zh' ? '横幅最佳实践' :
                 language === 'ja' ? 'バナーの最適な実践' :
                 language === 'ar' ? 'أفضل ممارسات اللافتة' :
                 language === 'es' ? 'Mejores prácticas para banner' :
                 language === 'fr' ? 'Bonnes pratiques pour la bannière' :
                 language === 'de' ? 'Banner-Best Practices' :
                 language === 'ko' ? '배너 모범 사례' :
                 language === 'ru' ? 'Лучшие практики для баннера' :
                 language === 'pt' ? 'Boas práticas para banner' :
                 language === 'hi' ? 'बैनर के लिए सर्वोत्तम प्रथाएं' :
                 language === 'th' ? 'ปฏิบัติที่ดีที่สุดสำหรับแบนเนอร์' :
                 language === 'vi' ? 'Kiên nguyện tốt nhất cho Banner' :
                 'Banner Best Practices',
          tips: [
            { icon: '📐', text: language === 'zh' ? '最佳尺寸：1200 × 400 像素' :
                               language === 'ja' ? '最適なサイズ：1200 × 400 ピクセル' :
                               language === 'ar' ? 'الحجم الأمثل: 1200 × 400 بكسل' :
                               language === 'es' ? 'Tamaño óptimo: 1200 × 400 píxeles' :
                               language === 'fr' ? 'Taille optimale : 1200 × 400 pixels' :
                               language === 'de' ? 'Optimale Größe: 1200 × 400 Pixel' :
                               language === 'ko' ? '최적 크기: 1200 × 400 픽셀' :
                               language === 'ru' ? 'Оптимальный размер: 1200 × 400 пикселей' :
                               language === 'pt' ? 'Tamanho ideal: 1200 × 400 pixels' :
                               language === 'hi' ? 'इष्टतम आकार: 1200 × 400 पिक्सेल' :
                               language === 'th' ? 'ขนาดที่เหมาะสม: 1200 × 400 พิกเซล' :
                               language === 'vi' ? 'Kích thước tối ưu: 1200 × 400 pixel' :
                               'Optimal size: 1200 × 400 pixels' },
            { icon: '🔲', text: language === 'zh' ? '推荐比例：3:1 (宽:高)' :
                               language === 'ja' ? '推奨比率：3:1 (幅:高さ)' :
                               language === 'ar' ? 'النسبة الموصى بها: 3:1 (عرض:ارتفاع)' :
                               language === 'es' ? 'Relación recomendada: 3:1 (ancho:alto)' :
                               language === 'fr' ? 'Ratio recommandé : 3:1 (largeur:hauteur)' :
                               language === 'de' ? 'Empfohlener Seitenverhältnis: 3:1 (Breite:Höhe)' :
                               language === 'ko' ? '추천 비율: 3:1 (가로:세로)' :
                               language === 'ru' ? 'Рекомендуемое соотношение: 3:1 (ширина:высота)' :
                               language === 'pt' ? 'Proporção recomendada: 3:1 (largura:altura)' :
                               language === 'hi' ? 'सिफारिश किया गया अनुपात: 3:1 (चौड़ाई:ऊंचाई)' :
                               language === 'th' ? 'อัตราส่วนที่แนะนำ: 3:1 (กว้าง:สูง)' :
                               language === 'vi' ? 'Tỷ lệ khuyến nghị: 3:1 (rộng:cao)' :
                               'Recommended ratio: 3:1 (width:height)' },
            { icon: '⚠️', text: language === 'zh' ? '左侧预留80px空间用于显示Logo' :
                               language === 'ja' ? 'ロゴ表示用に左側に80pxのスペースを確保' :
                               language === 'ar' ? 'احفظ مساحة 80px على اليسار لعرض الشعار' :
                               language === 'es' ? 'Reservar 80px a la izquierda para el logo' :
                               language === 'fr' ? 'Réserver 80px à gauche pour le logo' :
                               language === 'de' ? '80px links reservieren für Logo-Anzeige' :
                               language === 'ko' ? '로고 표시를 위해 왼쪽에 80px 공간 예약' :
                               language === 'ru' ? 'Оставить 80px слева для отображения логотипа' :
                               language === 'pt' ? 'Reservar 80px à esquerda para o logo' :
                               language === 'hi' ? 'लोगो प्रदर्शित करने के लिए बाईं ओर 80px स्थान आरक्षित करें' :
                               language === 'th' ? 'เหลือช่องว่าง 80px ทางด้านซ้ายสำหรับแสดงโลโก้' :
                               language === 'vi' ? 'Để trống 80px bên trái để hiển thị Logo' :
                               'Reserve 80px on the left for logo display' },
            { icon: '🎨', text: language === 'zh' ? '使用渐变背景，保持文字可读' :
                               language === 'ja' ? 'グラデーション背景を使用し、テキストの読みやすさを保つ' :
                               language === 'ar' ? 'استخدام خلفية متدرجة، الحفاظ على قابلية قراءة النص' :
                               language === 'es' ? 'Usar fondo degradado, mantener legibilidad del texto' :
                               language === 'fr' ? 'Utiliser un fond dégradé, maintenir la lisibilité' :
                               language === 'de' ? 'Verwenden Sie einen Farbverlaufshintergrund, halten Sie die Lesbarkeit' :
                               language === 'ko' ? '그라데이션 배경 사용, 텍스트 가독성 유지' :
                               language === 'ru' ? 'Использовать градиентный фон, сохранять читаемость текста' :
                               language === 'pt' ? 'Usar fundo gradiente, manter legibilidade do texto' :
                               language === 'hi' ? 'ग्रेडिएंट बैकग्राउंड का उपयोग करें, टेक्स्ट की पठनीयता बनाए रखें' :
                               language === 'th' ? 'ใช้พื้นหลังไล่เฉดสี รักษาความสามารถในการอ่านข้อความ' :
                               language === 'vi' ? 'Sử dụng nền gradient, giữ khả năng đọc chữ' :
                               'Use gradient background, maintain text readability' },
          ]
        }
      case 'product_image':
        return {
          title: language === 'zh' ? '产品图片最佳实践' :
                 language === 'ja' ? '製品画像の最適な実践' :
                 language === 'ar' ? 'أفضل ممارسات صور المنتجات' :
                 language === 'es' ? 'Mejores prácticas para imágenes de producto' :
                 language === 'fr' ? 'Bonnes pratiques pour les images de produit' :
                 language === 'de' ? 'Produktbild-Best Practices' :
                 language === 'ko' ? '제품 이미지 모범 사례' :
                 language === 'ru' ? 'Лучшие практики для изображений товаров' :
                 language === 'pt' ? 'Boas práticas para imagens de produto' :
                 language === 'hi' ? 'उत्पाद छवि के लिए सर्वोत्तम प्रथाएं' :
                 language === 'th' ? 'ปฏิบัติที่ดีที่สุดสำหรับรูปสินค้า' :
                 language === 'vi' ? 'Kiên nguyện tốt nhất cho Hình ảnh sản phẩm' :
                 'Product Image Best Practices',
          tips: [
            { icon: '📐', text: language === 'zh' ? '最佳尺寸：800 × 800 像素以上' :
                               language === 'ja' ? '最適なサイズ：800 × 800 ピクセル以上' :
                               language === 'ar' ? 'الحجم الأمثل: 800 × 800 بكسل أو أكثر' :
                               language === 'es' ? 'Tamaño óptimo: 800 × 800 píxeles o más' :
                               language === 'fr' ? 'Taille optimale : 800 × 800 pixels ou plus' :
                               language === 'de' ? 'Optimale Größe: 800 × 800 Pixel oder mehr' :
                               language === 'ko' ? '최적 크기: 800 × 800 픽셀 이상' :
                               language === 'ru' ? 'Оптимальный размер: 800 × 800 пикселей и выше' :
                               language === 'pt' ? 'Tamanho ideal: 800 × 800 pixels ou mais' :
                               language === 'hi' ? 'इष्टतम आकार: 800 × 800 पिक्सेल या अधिक' :
                               language === 'th' ? 'ขนาดที่เหมาะสม: 800 × 800 พิกเซลขึ้นไป' :
                               language === 'vi' ? 'Kích thước tối ưu: 800 × 800 pixel trở lên' :
                               'Optimal size: 800 × 800 pixels or larger' },
            { icon: '🔲', text: language === 'zh' ? '推荐比例：正方形 (1:1) 或长方形' :
                               language === 'ja' ? '推奨比率：正方形 (1:1) または長方形' :
                               language === 'ar' ? 'النسبة الموصى بها: مربع (1:1) أو مستطيل' :
                               language === 'es' ? 'Relación recomendada: Cuadrado (1:1) o rectangular' :
                               language === 'fr' ? 'Ratio recommandé : Carré (1:1) ou rectangle' :
                               language === 'de' ? 'Empfohlener Seitenverhältnis: Quadrat (1:1) oder Rechteck' :
                               language === 'ko' ? '추천 비율: 정사각형 (1:1) 또는 직사각형' :
                               language === 'ru' ? 'Рекомендуемое соотношение: Квадрат (1:1) или прямоугольник' :
                               language === 'pt' ? 'Proporção recomendada: Quadrado (1:1) ou retangular' :
                               language === 'hi' ? 'सिफारिश किया गया अनुपात: वर्ग (1:1) या आयताकार' :
                               language === 'th' ? 'อัตราส่วนที่แนะนำ: สี่เหลี่ยมจัตุรัส (1:1) หรือสี่เหลี่ยมผืนผ้า' :
                               language === 'vi' ? 'Tỷ lệ khuyến nghị: Vuông (1:1) hoặc chữ nhật' :
                               'Recommended ratio: Square (1:1) or rectangular' },
            { icon: '🎨', text: language === 'zh' ? '纯色背景或白色背景更佳' :
                               language === 'ja' ? '単色背景または白背景が最適' :
                               language === 'ar' ? 'خلفية ملونة واحدة أو خلفية بيضاء أفضل' :
                               language === 'es' ? 'Mejor fondo de color sólido o blanco' :
                               language === 'fr' ? 'Meilleur avec fond uni ou blanc' :
                               language === 'de' ? 'Besser mit einfarbigem oder weißem Hintergrund' :
                               language === 'ko' ? '단색 배경 또는 흰색 배경이 더 좋음' :
                               language === 'ru' ? 'Лучше всего однородный или белый фон' :
                               language === 'pt' ? 'Melhor com fundo sólido ou branco' :
                               language === 'hi' ? 'एकल रंग का पृष्ठभूमि या सफेद पृष्ठभूमि बेहतर है' :
                               language === 'th' ? 'พื้นหลังสีเดียวหรือพื้นหลังสีขาวดีกว่า' :
                               language === 'vi' ? 'Nền đơn sắc hoặc nền trắng tốt hơn' :
                               'Solid color or white background preferred' },
            { icon: '✨', text: language === 'zh' ? '清晰对焦，良好光照' :
                               language === 'ja' ? '明確な焦点、適切な照明' :
                               language === 'ar' ? 'تركيز واضح، إضاءة جيدة' :
                               language === 'es' ? 'Enfoque nítido, buena iluminación' :
                               language === 'fr' ? 'Nettoyage de la mise au point, bonne illumination' :
                               language === 'de' ? 'Scharfer Fokus, gute Beleuchtung' :
                               language === 'ko' ? '선명한 초점, 좋은 조명' :
                               language === 'ru' ? 'Четкая фокусировка, хорошее освещение' :
                               language === 'pt' ? 'Foco nítido, boa iluminação' :
                               language === 'hi' ? 'स्पष्ट फोकस, अच्छी रोशनी' :
                               language === 'th' ? 'โฟกัสชัดเจน แสงสว่างดี' :
                               language === 'vi' ? 'Chụp nét rõ, ánh sáng tốt' :
                               'Sharp focus, good lighting' },
          ]
        }
      default:
        return null
    }
  }

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${uploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}
          ${error ? 'border-red-400 bg-red-50' : ''}
          ${success ? 'border-green-400 bg-green-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={fileAccept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-2">
          {uploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          ) : (
            <div className={`text-gray-400 ${error ? 'text-red-400' : ''} ${success ? 'text-green-600' : ''}`}>
              {getIcon()}
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-700">
              {uploading ? t.uploading : getLabel()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {type === 'product_video' ? (language === 'zh' ? 'MP4, MOV, AVI, WMV' :
                                           language === 'ja' ? 'MP4、MOV、AVI、WMV' :
                                           language === 'ar' ? 'MP4، MOV، AVI، WMV' :
                                           'MP4, MOV, AVI, WMV') :
               type === 'product_document' ? (language === 'zh' ? 'PDF, DOC, XLS, PPT, ZIP, RAR' :
                                              language === 'ja' ? 'PDF、DOC、XLS、PPT、ZIP、RAR' :
                                              language === 'ar' ? 'PDF، DOC، XLS، PPT، ZIP، RAR' :
                                              'PDF, DOC, XLS, PPT, ZIP, RAR') :
               fileAccept.includes('pdf') ? t.pdfOnly : t.imageTypes} • {t.maxSize(maxFileSize)}
              {multiple && ' ' + t.multipleAllowed}
            </p>
          </div>
        </div>
      </div>

      {/* Size Tips */}
      {getSizeTips() && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <span className="text-blue-600 mr-2">💡</span>
            <h4 className="font-semibold text-blue-800 text-sm">
              {getSizeTips()?.title}
            </h4>
          </div>
          <ul className="space-y-2">
            {getSizeTips()?.tips.map((tip, index) => (
              <li key={index} className="flex items-start text-sm text-blue-700">
                <span className="mr-2">{tip.icon}</span>
                <span>{tip.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && progress > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1 text-center">{progress}%</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">{error}</div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-3 flex items-start space-x-2 text-green-600 bg-green-50 p-3 rounded">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">{success}</div>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-400 hover:text-green-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
