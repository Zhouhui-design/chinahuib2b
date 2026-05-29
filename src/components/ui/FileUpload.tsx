'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

interface FileUploadProps {
  type: 'product_image' | 'brochure' | 'store_brochure' | 'logo' | 'banner'
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
  const defaultAccept = type === 'brochure' || type === 'store_brochure' ? '.pdf' : 'image/*'
  const defaultMaxSize = type === 'brochure' || type === 'store_brochure' ? 20 : 5
  
  const fileAccept = accept || defaultAccept
  const maxFileSize = maxSizeMB || defaultMaxSize

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
        return <FileText className="w-8 h-8" />
      case 'logo':
      case 'banner':
      case 'product_image':
        return <ImageIcon className="w-8 h-8" />
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
      default:
        return t.uploadFile
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
              {fileAccept.includes('pdf') ? t.pdfOnly : t.imageTypes} • {t.maxSize(maxFileSize)}
              {multiple && ' ' + t.multipleAllowed}
            </p>
          </div>
        </div>
      </div>

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
