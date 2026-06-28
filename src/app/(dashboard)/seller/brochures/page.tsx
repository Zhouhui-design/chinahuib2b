'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/ui/FileUpload'
import { Loader2, Trash2, Download, FileText, Plus, AlertCircle } from 'lucide-react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

interface Brochure {
  id: string
  title: string
  fileUrl: string
  downloadCount: number
  createdAt: string
}

interface UploadResult {
  success: boolean
}

export default function BrochuresPage() {
  const router = useRouter()
  const [brochures, setBrochures] = useState<Brochure[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const language = useSellerLanguage()

  const t = {
    brochureManager: language === 'zh' ? '手册管理' :
                     language === 'ja' ? 'パンフレット管理' :
                     language === 'ar' ? 'إدارة البروشرات' :
                     language === 'es' ? 'Gestor de folletos' :
                     language === 'fr' ? 'Gestionnaire de brochures' :
                     language === 'de' ? 'Broschüren-Manager' :
                     language === 'ko' ? '브로셔 관리자' :
                     language === 'ru' ? 'Менеджер брошюр' :
                     language === 'pt' ? 'Gerenciador de brochuras' :
                     language === 'hi' ? 'ब्रोशर प्रबंधक' :
                     language === 'th' ? 'จัดการโบรชัวร์' :
                     language === 'vi' ? 'Quản lý Sách tay' :
                     'Brochure Manager',
    uploadCatalogs: language === 'zh' ? '上传公司产品目录、认证文件和其他PDF文件供买家下载' :
                    language === 'ja' ? '会社カタログ、認証書類、その他のPDFファイルをアップロードして購入者がダウンロードできるようにします' :
                    language === 'ar' ? 'قم بتحميل كتالوجات الشركة ومستندات الشهادة وملفات PDF الأخرى لكي يتمكن المشترون من تنزيلها' :
                    language === 'es' ? 'Subir catálogos de empresa, documentos de certificación y otros archivos PDF para que los compradores los descarguen' :
                    language === 'fr' ? 'Téléchargez les catalogues d\'entreprise, les documents de certification et autres fichiers PDF pour que les acheteurs puissent les télécharger' :
                    language === 'de' ? 'Laden Sie Unternehmenskataloge, Zertifizierungsdokumente und andere PDF-Dateien hoch, damit Käufer sie herunterladen können' :
                    language === 'ko' ? '회사 카탈로그, 인증 문서 및 기타 PDF 파일을 업로드하여 구매자가 다운로드할 수 있도록 합니다' :
                    language === 'ru' ? 'Загружайте каталоги компаний, сертификаты и другие PDF-файлы для скачивания покупателями' :
                    language === 'pt' ? 'Envie catálogos da empresa, documentos de certificação e outros arquivos PDF para os compradores baixarem' :
                    language === 'hi' ? 'कंपनी कैटलॉग, प्रमाणन दस्तावेज और अन्य पीडीएफ फाइलें अपलोड करें ताकि खरीदार डाउनलोड कर सकें' :
                    language === 'th' ? 'อัปโหลดแคตตาล็อกบริษัท เอกสารรับรอง และไฟล์ PDF อื่นๆ สำหรับผู้ซื้อดาวน์โหลด' :
                    language === 'vi' ? 'Tải lên danh mục công ty, tài liệu chứng nhận và các tệp PDF khác để người mua tải xuống' :
                    'Upload company catalogs, certification documents, and other PDF files for buyers to download',
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
    uploadNew: language === 'zh' ? '上传新手册' :
               language === 'ja' ? '新しいパンフレットをアップロード' :
               language === 'ar' ? 'تحميل بروشور جديد' :
               language === 'es' ? 'Subir nuevo folleto' :
               language === 'fr' ? 'Télécharger une nouvelle brochure' :
               language === 'de' ? 'Neue Broschüre hochladen' :
               language === 'ko' ? '새 브로셔 업로드' :
               language === 'ru' ? 'Загрузить новую брошюру' :
               language === 'pt' ? 'Enviar nova brochura' :
               language === 'hi' ? 'नया ब्रोशर अपलोड करें' :
               language === 'th' ? 'อัปโหลดโบรชัวร์ใหม่' :
               language === 'vi' ? 'Tải lên Sách tay mới' :
               'Upload New Brochure',
    supportedFormat: language === 'zh' ? '支持格式：PDF • 最大文件大小：20MB • 文件将显示在您店铺的手册部分' :
                     language === 'ja' ? 'サポートされる形式: PDF • 最大ファイルサイズ: 20MB • ファイルはストアのパンフレットセクションに表示されます' :
                     language === 'ar' ? 'التنسيق المدعوم: PDF • الحجم الأقصى للملف: 20 ميجابايت • ستظهر الملفات في قسم البروشرات في متجرك' :
                     language === 'es' ? 'Formato compatible: PDF • Tamaño máximo de archivo: 20MB • Los archivos aparecerán en la sección de folletos de su tienda' :
                     language === 'fr' ? 'Format pris en charge : PDF • Taille maximale du fichier : 20 Mo • Les fichiers apparaîtront dans la section brochures de votre boutique' :
                     language === 'de' ? 'Unterstütztes Format: PDF • Maximale Dateigröße: 20MB • Dateien erscheinen im Broschüren-Bereich Ihres Stores' :
                     language === 'ko' ? '지원 형식: PDF • 최대 파일 크기: 20MB • 파일은 스토어의 브로셔 섹션에 표시됩니다' :
                     language === 'ru' ? 'Поддерживаемый формат: PDF • Максимальный размер файла: 20МБ • Файлы будут отображаться в разделе брошюр вашего магазина' :
                     language === 'pt' ? 'Formato suportado: PDF • Tamanho máximo do arquivo: 20MB • Os arquivos aparecerão na seção de brochuras da sua loja' :
                     language === 'hi' ? 'समर्थित प्रारूप: PDF • अधिकतम फ़ाइल आकार: 20MB • फ़ाइलें आपके स्टोर के ब्रोशर सेक्शन में दिखाई देंगी' :
                     language === 'th' ? 'รูปแบบที่รองรับ: PDF • ขนาดไฟล์สูงสุด: 20MB • ไฟล์จะปรากฏในส่วนโบรชัวร์ของร้านค้าของคุณ' :
                     language === 'vi' ? 'Định dạng hỗ trợ: PDF • Kích thước tệp tối đa: 20MB • Các tệp sẽ xuất hiện trong phần Sách tay của cửa hàng' :
                     'Supported format: PDF • Maximum file size: 20MB • Files will appear in your store\'s brochure section',
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
    uploadedBrochures: language === 'zh' ? '已上传的手册' :
                       language === 'ja' ? 'アップロードされたパンフレット' :
                       language === 'ar' ? 'البروشرات المحملة' :
                       language === 'es' ? 'Folletos subidos' :
                       language === 'fr' ? 'Brochures téléchargées' :
                       language === 'de' ? 'Hochgeladene Broschüren' :
                       language === 'ko' ? '업로드된 브로셔' :
                       language === 'ru' ? 'Загруженные брошюры' :
                       language === 'pt' ? 'Brochuras enviadas' :
                       language === 'hi' ? 'अपलोड किए गए ब्रोशर' :
                       language === 'th' ? 'โบรชัวร์ที่อัปโหลดแล้ว' :
                       language === 'vi' ? 'Sách tay đã tải lên' :
                       'Uploaded Brochures',
    noBrochures: language === 'zh' ? '暂无手册' :
                 language === 'ja' ? 'まだパンフレットはありません' :
                 language === 'ar' ? 'لا توجد بروشورات بعد' :
                 language === 'es' ? 'No hay folletos aún' :
                 language === 'fr' ? 'Aucune brochure pour le moment' :
                 language === 'de' ? 'Noch keine Broschüren' :
                 language === 'ko' ? '아직 브로셔가 없습니다' :
                 language === 'ru' ? 'Брошюр еще нет' :
                 language === 'pt' ? 'Nenhuma brochura ainda' :
                 language === 'hi' ? 'अभी तक कोई ब्रोशर नहीं' :
                 language === 'th' ? 'ยังไม่มีโบรชัวร์' :
                 language === 'vi' ? 'Chưa có Sách tay' :
                 'No brochures yet',
    uploadFirst: language === 'zh' ? '使用上方表单上传您的第一份手册' :
                 language === 'ja' ? '上記のフォームを使用して最初のパンフレットをアップロードしてください' :
                 language === 'ar' ? 'قم بتحميل أول بروشور باستخدام النموذج أعلاه' :
                 language === 'es' ? 'Sube tu primer folleto usando el formulario de arriba' :
                 language === 'fr' ? 'Téléchargez votre première brochure en utilisant le formulaire ci-dessus' :
                 language === 'de' ? 'Laden Sie Ihre erste Broschüre über das obige Formular hoch' :
                 language === 'ko' ? '위 양식을 사용하여 첫 번째 브로셔를 업로드하세요' :
                 language === 'ru' ? 'Загрузите вашу первую брошюру, используя форму выше' :
                 language === 'pt' ? 'Envie sua primeira brochura usando o formulário acima' :
                 language === 'hi' ? 'ऊपर दिए गए फॉर्म का उपयोग करके अपना पहला ब्रोशर अपलोड करें' :
                 language === 'th' ? 'อัปโหลดโบรชัวร์แรกของคุณโดยใช้ฟอร์มด้านบน' :
                 language === 'vi' ? 'Tải lên Sách tay đầu tiên của bạn bằng biểu mẫu ở trên' :
                 'Upload your first brochure using the form above',
    downloads: language === 'zh' ? '次下载' :
               language === 'ja' ? '回ダウンロード' :
               language === 'ar' ? 'مرة تنزيل' :
               language === 'es' ? 'descargas' :
               language === 'fr' ? 'téléchargements' :
               language === 'de' ? 'Downloads' :
               language === 'ko' ? '회 다운로드' :
               language === 'ru' ? 'загрузок' :
               language === 'pt' ? 'downloads' :
               language === 'hi' ? 'बार डाउनलोड' :
               language === 'th' ? 'ครั้งดาวน์โหลด' :
               language === 'vi' ? 'lượt tải xuống' :
               'downloads',
    deleteConfirm: (title: string) => language === 'zh' ? `确定要删除"${title}"吗？此操作无法撤销。` :
                                     language === 'ja' ? `"${title}"を削除してもよろしいですか？この操作は元に戻せません。` :
                                     language === 'ar' ? `هل أنت متأكد من حذف "${title}"؟ لا يمكن التراجع عن هذا الإجراء.` :
                                     language === 'es' ? `¿Está seguro de que desea eliminar "${title}"? Esta acción no se puede deshacer.` :
                                     language === 'fr' ? `Êtes-vous sûr de vouloir supprimer "${title}" ? Cette action ne peut pas être annulée.` :
                                     language === 'de' ? `Sind Sie sicher, dass Sie "${title}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.` :
                                     language === 'ko' ? `"${title}"을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.` :
                                     language === 'ru' ? `Вы уверены, что хотите удалить "${title}"? Это действие нельзя отменить.` :
                                     language === 'pt' ? `Tem certeza que deseja excluir "${title}"? Esta ação não pode ser desfeita.` :
                                     language === 'hi' ? `क्या आप "${title}" को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।` :
                                     language === 'th' ? `คุณแน่ใจหรือว่าต้องการลบ "${title}"? การกระทำนี้ไม่สามารถยกเลิกได้` :
                                     language === 'vi' ? `Bạn có chắc chắn muốn xóa "${title}" không? Hành động này không thể hoàn tác.` :
                                     `Are you sure you want to delete "${title}"? This action cannot be undone.`,
    deleteSuccess: language === 'zh' ? '手册删除成功' :
                   language === 'ja' ? 'パンフレットが正常に削除されました' :
                   language === 'ar' ? 'تم حذف البروشر بنجاح' :
                   language === 'es' ? 'Folleto eliminado correctamente' :
                   language === 'fr' ? 'Brochure supprimée avec succès' :
                   language === 'de' ? 'Broschüre erfolgreich gelöscht' :
                   language === 'ko' ? '브로셔가 성공적으로 삭제되었습니다' :
                   language === 'ru' ? 'Брошюра успешно удалена' :
                   language === 'pt' ? 'Brochura excluída com sucesso' :
                   language === 'hi' ? 'ब्रोशर सफलतापूर्वक हटा दिया गया' :
                   language === 'th' ? 'ลบโบรชัวร์สำเร็จ' :
                   language === 'vi' ? 'Xóa Sách tay thành công' :
                   'Brochure deleted successfully',
    deleteFailed: language === 'zh' ? '删除手册失败' :
                  language === 'ja' ? 'パンフレットの削除に失敗しました' :
                  language === 'ar' ? 'فشل حذف البروشر' :
                  language === 'es' ? 'Error al eliminar folleto' :
                  language === 'fr' ? 'Échec de la suppression de la brochure' :
                  language === 'de' ? 'Löschen der Broschüre fehlgeschlagen' :
                  language === 'ko' ? '브로셔 삭제에 실패했습니다' :
                  language === 'ru' ? 'Не удалось удалить брошюру' :
                  language === 'pt' ? 'Falha ao excluir brochura' :
                  language === 'hi' ? 'ब्रोशर हटाने में विफल' :
                  language === 'th' ? 'ลบโบรชัวร์ล้มเหลว' :
                  language === 'vi' ? 'Xóa Sách tay thất bại' :
                  'Failed to delete brochure',
    preview: language === 'zh' ? '预览/下载' :
             language === 'ja' ? 'プレビュー/ダウンロード' :
             language === 'ar' ? 'معاينة/تنزيل' :
             language === 'es' ? 'Vista previa/Descargar' :
             language === 'fr' ? 'Aperçu/Télécharger' :
             language === 'de' ? 'Vorschau/Herunterladen' :
             language === 'ko' ? '미리보기/다운로드' :
             language === 'ru' ? 'Предпросмотр/Скачать' :
             language === 'pt' ? 'Pré-visualizar/Fazer download' :
             language === 'hi' ? 'पूर्वावलोकन/डाउनलोड' :
             language === 'th' ? 'ดูตัวอย่าง/ดาวน์โหลด' :
             language === 'vi' ? 'Xem trước/Tải xuống' :
             'Preview/Download',
    delete: language === 'zh' ? '删除手册' :
            language === 'ja' ? 'パンフレットを削除' :
            language === 'ar' ? 'حذف البروشر' :
            language === 'es' ? 'Eliminar folleto' :
            language === 'fr' ? 'Supprimer la brochure' :
            language === 'de' ? 'Broschüre löschen' :
            language === 'ko' ? '브로셔 삭제' :
            language === 'ru' ? 'Удалить брошюру' :
            language === 'pt' ? 'Excluir brochura' :
            language === 'hi' ? 'ब्रोशर हटाएं' :
            language === 'th' ? 'ลบโบรชัวร์' :
            language === 'vi' ? 'Xóa Sách tay' :
            'Delete brochure'
  }

  // Load brochures list
  const loadBrochures = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/seller/brochures')
      
      if (!response.ok) {
        throw new Error('Failed to load brochures')
      }
      
      const data = await response.json()
      setBrochures(data.brochures)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brochures')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBrochures()
  }, [])

  // Delete brochure
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(t.deleteConfirm(title))) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/brochures/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete brochure')
      }

      // Update list (optimistic update)
      setBrochures(prev => prev.filter(b => b.id !== id))
      alert(t.deleteSuccess)
    } catch (err) {
      alert(err instanceof Error ? err.message : t.deleteFailed)
    } finally {
      setDeletingId(null)
    }
  }

  // Upload success callback
  const handleUploadSuccess = (data: UploadResult) => {
    setUploading(false)
    // Reload list after upload
    loadBrochures()
  }

  const handleUploadStart = () => {
    setUploading(true)
  }

  if (loading && brochures.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.brochureManager}</h1>
        <p className="text-sm text-gray-600 mt-1">
          {t.uploadCatalogs}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={loadBrochures}
              className="text-xs text-red-600 hover:text-red-700 underline mt-1"
            >
              {t.tryAgain}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Upload Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            {t.uploadNew}
          </h2>
          
          <FileUpload
            type="store_brochure"
            onUploadStart={handleUploadStart}
            onUploadSuccess={handleUploadSuccess}
          />
          
          <p className="text-xs text-gray-500 mt-3">
            {t.supportedFormat}
          </p>
          
          {uploading && (
            <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.uploading}
            </div>
          )}
        </div>

        {/* Uploaded Brochures List */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            {t.uploadedBrochures} ({brochures.length})
          </h2>

          {brochures.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2">{t.noBrochures}</p>
              <p className="text-sm text-gray-400">{t.uploadFirst}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {brochures.map((brochure) => (
                <div
                  key={brochure.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-10 h-10 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{brochure.title}</p>
                      <div className="flex gap-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {brochure.downloadCount} {t.downloads}
                        </span>
                        <span>
                          📅 {new Date(brochure.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <a
                      href={brochure.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title={t.preview}
                    >
                      <Download className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleDelete(brochure.id, brochure.title)}
                      disabled={deletingId === brochure.id}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title={t.delete}
                    >
                      {deletingId === brochure.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
