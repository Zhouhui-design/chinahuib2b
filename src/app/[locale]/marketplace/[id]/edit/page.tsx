/**
 * Edit Task Page
 * 允许任务发布者编辑自己的任务，包含文件上传功能
 *
 * 上传限制由 src/lib/upload-limits.ts 集中管理，方便以后调整。
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Save, AlertCircle, X, Upload, Image as ImageIcon, FileText, FileVideo, FileArchive, Film } from 'lucide-react'
import {
  ATTACHMENT_LIMITS,
  MAX_TOTAL_ATTACHMENTS,
  validateFile,
  formatFileSize,
  getCountDescription,
  getExtension,
  type AttachmentTypeKey,
  type AttachmentTypeLimit,
} from '@/lib/upload-limits'

interface FormDataType {
  title: string
  description: string
  type: string
  budget: string
  price: string
  currency: string
  unit: string
  minOrderQty: string
  deadline: string
  contactInfo: string
}

interface Attachment {
  id: string
  url: string
  fileName: string
  type: 'image' | 'video' | 'file' | 'drawing' | 'compressed'
  size?: number
  isNew?: boolean // 标记是新上传的（vs 已有的）
}

type AttachmentCategory = 'image' | 'video' | 'file' | 'compressed'

export default function EditTaskPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params['locale'] as string) || 'en'
  const taskId = params['id'] as string

  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    description: '',
    type: 'MANUFACTURING',
    budget: '',
    price: '',
    currency: 'USD',
    unit: '',
    minOrderQty: '',
    deadline: '',
    contactInfo: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [authError, setAuthError] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [removedUrls, setRemovedUrls] = useState<string[]>([]) // 标记需要从任务中移除的旧附件 URL

  // 各类型上传状态
  const [uploadingState, setUploadingState] = useState<Record<AttachmentCategory, boolean>>({
    image: false,
    video: false,
    file: false,
    compressed: false,
  })

  // 文件输入引用
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const compressedInputRef = useRef<HTMLInputElement>(null)

  // 多语言标签
  const t = {
    title: locale === 'zh' ? '编辑信息' : locale === 'de' ? 'Information bearbeiten' : locale === 'ar' ? 'تعديل المعلومات' : 'Edit Task',
    back: locale === 'zh' ? '← 返回详情' : locale === 'de' ? '← Zurück zu Details' : locale === 'ar' ? '← العودة إلى التفاصيل' : '← Back to Details',
    taskTitle: locale === 'zh' ? '标题' : locale === 'de' ? 'Titel' : locale === 'ar' ? 'العنوان' : 'Title',
    description: locale === 'zh' ? '详细描述' : locale === 'de' ? 'Beschreibung' : locale === 'ar' ? 'الوصف' : 'Description',
    type: locale === 'zh' ? '类型' : locale === 'de' ? 'Typ' : locale === 'ar' ? 'النوع' : 'Type',
    manufacturing: locale === 'zh' ? '制造' : locale === 'de' ? 'Herstellung' : locale === 'ar' ? 'تصنيع' : 'Manufacturing',
    productSale: locale === 'zh' ? '产品销售' : locale === 'de' ? 'Produktverkauf' : locale === 'ar' ? 'مبيعات المنتجات' : 'Product Sale',
    service: locale === 'zh' ? '服务' : locale === 'de' ? 'Service' : locale === 'ar' ? 'خدمة' : 'Service',
    budget: locale === 'zh' ? '预算' : locale === 'de' ? 'Budget' : locale === 'ar' ? 'الميزانية' : 'Budget',
    price: locale === 'zh' ? '单价' : locale === 'de' ? 'Stückpreis' : locale === 'ar' ? 'سعر الوحدة' : 'Unit Price',
    currency: locale === 'zh' ? '货币' : locale === 'de' ? 'Währung' : locale === 'ar' ? 'العملة' : 'Currency',
    unit: locale === 'zh' ? '单位' : locale === 'de' ? 'Einheit' : locale === 'ar' ? 'الوحدة' : 'Unit',
    minOrderQty: locale === 'zh' ? '最小起订量' : locale === 'de' ? 'Mindestbestellmenge' : locale === 'ar' ? 'الحد الأدنى للكمية' : 'Min Order Qty',
    deadline: locale === 'zh' ? '截止日期' : locale === 'de' ? 'Frist' : locale === 'ar' ? 'الموعد النهائي' : 'Deadline',
    contactInfo: locale === 'zh' ? '联系信息' : locale === 'de' ? 'Kontaktinformation' : locale === 'ar' ? 'معلومات الاتصال' : 'Contact Info',
    save: locale === 'zh' ? '保存更改' : locale === 'de' ? 'Änderungen speichern' : locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes',
    saving: locale === 'zh' ? '保存中...' : locale === 'de' ? 'Speichern...' : locale === 'ar' ? 'جاري الحفظ...' : 'Saving...',
    titleRequired: locale === 'zh' ? '请输入标题' : locale === 'de' ? 'Bitte Titel eingeben' : locale === 'ar' ? 'يرجى إدخال العنوان' : 'Title is required',
    descriptionRequired: locale === 'zh' ? '请输入描述' : locale === 'de' ? 'Bitte Beschreibung eingeben' : locale === 'ar' ? 'يرجى إدخال الوصف' : 'Description is required',
    saveSuccess: locale === 'zh' ? '保存成功！' : locale === 'de' ? 'Erfolgreich gespeichert!' : locale === 'ar' ? 'تم الحفظ بنجاح!' : 'Saved successfully!',
    saveFailed: locale === 'zh' ? '保存失败' : locale === 'de' ? 'Speichern fehlgeschlagen' : locale === 'ar' ? 'فشل الحفظ' : 'Failed to save',
    loadingTask: locale === 'zh' ? '加载中...' : locale === 'de' ? 'Wird geladen...' : locale === 'ar' ? 'جاري التحميل...' : 'Loading...',
    notOwner: locale === 'zh' ? '您无权编辑此信息，只能编辑自己发布的信息' : locale === 'de' ? 'Sie sind nicht berechtigt, diese Information zu bearbeiten. Sie können nur Ihre eigenen Informationen bearbeiten.' : locale === 'ar' ? 'ليس لديك صلاحية تعديل هذه المعلومات. يمكنك فقط تعديل معلوماتك الخاصة' : 'You are not authorized to edit this task. You can only edit your own tasks.',
    notLoggedIn: locale === 'zh' ? '请先登录' : locale === 'de' ? 'Bitte zuerst anmelden' : locale === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first',
    // 附件上传标签
    attachments: locale === 'zh' ? '附件' : locale === 'de' ? 'Anhänge' : locale === 'ar' ? 'المرفقات' : 'Attachments',
    uploadImages: locale === 'zh' ? '上传图片' : locale === 'de' ? 'Bilder hochladen' : locale === 'ar' ? 'رفع الصور' : 'Upload Images',
    uploadVideos: locale === 'zh' ? '上传视频' : locale === 'de' ? 'Videos hochladen' : locale === 'ar' ? 'رفع الفيديوهات' : 'Upload Videos',
    uploadFiles: locale === 'zh' ? '上传文档' : locale === 'de' ? 'Dokumente hochladen' : locale === 'ar' ? 'رفع المستندات' : 'Upload Documents',
    uploadCompressed: locale === 'zh' ? '上传压缩包' : locale === 'de' ? 'Archiv hochladen' : locale === 'ar' ? 'رفع الملفات المضغوطة' : 'Upload Archives',
    maxTotal: locale === 'zh' ? `最多 ${MAX_TOTAL_ATTACHMENTS} 个附件` : locale === 'de' ? `Max. ${MAX_TOTAL_ATTACHMENTS} Anhänge` : locale === 'ar' ? `بحد أقصى ${MAX_TOTAL_ATTACHMENTS} مرفقات` : `Max ${MAX_TOTAL_ATTACHMENTS} attachments total`,
    uploadFailed: locale === 'zh' ? '上传失败' : locale === 'de' ? 'Upload fehlgeschlagen' : locale === 'ar' ? 'فشل الرفع' : 'Upload failed',
    removeSuccess: locale === 'zh' ? '已移除' : locale === 'de' ? 'Entfernt' : locale === 'ar' ? 'تمت الإزالة' : 'Removed',
    totalAttachments: locale === 'zh' ? '当前附件' : locale === 'de' ? 'Aktuelle Anhänge' : locale === 'ar' ? 'المرفقات الحالية' : 'Current Attachments',
    clickToUpload: locale === 'zh' ? '点击上传' : locale === 'de' ? 'Klicken zum Hochladen' : locale === 'ar' ? 'انقر للرفع' : 'Click to upload',
    remaining: locale === 'zh' ? '剩余' : locale === 'de' ? 'Verbleibend' : locale === 'ar' ? 'متبقٍ' : 'remaining',
  }

  // 根据文件 URL 推断附件类型（用于加载已有附件）
  const inferTypeFromUrl = (url: string): Attachment['type'] => {
    const ext = getExtension(url)
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) return 'image'
    if (['.mp4', '.mov', '.webm', '.avi'].includes(ext)) return 'video'
    if (['.zip', '.rar', '.7z'].includes(ext)) return 'compressed'
    if (['.dwg', '.dxf'].includes(ext)) return 'drawing'
    return 'file'
  }

  // 附件类型到分类的映射（用于计数）
  const typeToCategory = (type: Attachment['type']): AttachmentCategory | null => {
    if (type === 'image' || type === 'video' || type === 'file' || type === 'compressed') {
      return type
    }
    return null // drawing 不在可上传分类中
  }

  // 加载任务数据
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/marketplace/tasks/${taskId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch task')
        }

        if (data.success && data.data) {
          const task = data.data
          setFormData({
            title: task.title || '',
            description: task.description || '',
            type: task.type || 'MANUFACTURING',
            budget: task.budget ? String(task.budget) : '',
            price: task.price ? String(task.price) : '',
            currency: task.currency || 'USD',
            unit: task.unit || '',
            minOrderQty: task.minOrderQty ? String(task.minOrderQty) : '',
            deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] || '' : '',
            contactInfo: task.contactInfo || '',
          })

          // 加载已有附件
          if (task.attachments && Array.isArray(task.attachments)) {
            const existingAttachments: Attachment[] = task.attachments
              .filter((url: unknown): url is string => typeof url === 'string' && url.length > 0)
              .map((url: string, index: number) => {
                const fileName = url.split('/').pop() || `file-${index}`
                return {
                  id: `existing-${index}-${Date.now()}`,
                  url,
                  fileName,
                  type: inferTypeFromUrl(url),
                  isNew: false,
                }
              })
            setAttachments(existingAttachments)
          }
        }
      } catch (err) {
        console.error('Error fetching task:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch task')
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [taskId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  /**
   * 获取指定类型的当前附件数量
   */
  const getCountByType = (type: Attachment['type']): number => {
    return attachments.filter(a => a.type === type).length
  }

  /**
   * 处理文件上传
   * 应用前端限制验证：文件大小、类型、数量配额
   */
  const handleFileUpload = async (
    files: FileList | null,
    attachmentType: AttachmentCategory
  ) => {
    if (!files || files.length === 0) return

    const limit = ATTACHMENT_LIMITS[attachmentType]
    if (!limit) return
    const typeKey = attachmentType

    setUploadingState(prev => ({ ...prev, [typeKey]: true }))

    try {
      const fileList = Array.from(files)
      const currentCount = getCountByType(attachmentType)
      const totalCurrent = attachments.length
      const errors: string[] = []

      // 检查总数限制
      if (totalCurrent + fileList.length > MAX_TOTAL_ATTACHMENTS) {
        const allowed = MAX_TOTAL_ATTACHMENTS - totalCurrent
        if (allowed <= 0) {
          alert(`${t.maxTotal}\n${t.totalAttachments}: ${totalCurrent}/${MAX_TOTAL_ATTACHMENTS}`)
          return
        }
        alert(`${t.maxTotal}\n${t.remaining}: ${allowed}`)
        // 截取允许的数量
        fileList.splice(allowed)
      }

      // 检查单类型数量限制
      const remainingForType = limit.maxCount - currentCount
      if (remainingForType <= 0) {
        alert(`${attachmentType}: ${getCountDescription(attachmentType, currentCount)}\n${t.remaining}: 0`)
        return
      }
      if (fileList.length > remainingForType) {
        alert(`${attachmentType}: ${getCountDescription(attachmentType, currentCount)}\n${t.remaining}: ${remainingForType}`)
        fileList.splice(remainingForType)
      }

      // 逐个验证并上传
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        if (!file) continue

        // 前端验证
        const validationError = validateFile(file, attachmentType)
        if (validationError) {
          errors.push(validationError)
          continue
        }

        const uploadFormData = new FormData()
        uploadFormData.append('file', file)
        uploadFormData.append('type', limit.apiType)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || t.uploadFailed)
        }

        setAttachments(prev => [...prev, {
          id: `${Date.now()}-${i}-${Math.random()}`,
          url: data.url,
          fileName: file.name,
          type: attachmentType,
          size: file.size,
          isNew: true,
        }])
      }

      if (errors.length > 0) {
        alert(errors.join('\n'))
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert(err instanceof Error ? err.message : t.uploadFailed)
    } finally {
      setUploadingState(prev => ({ ...prev, [typeKey]: false }))
      // 重置 input 以便可以重复选择同一文件
      if (typeKey === 'image' && imageInputRef.current) imageInputRef.current.value = ''
      if (typeKey === 'video' && videoInputRef.current) videoInputRef.current.value = ''
      if (typeKey === 'file' && fileInputRef.current) fileInputRef.current.value = ''
      if (typeKey === 'compressed' && compressedInputRef.current) compressedInputRef.current.value = ''
    }
  }

  /**
   * 移除附件
   * 新上传的直接移除，已有的标记为待删除
   */
  const removeAttachment = (id: string) => {
    const attachment = attachments.find(a => a.id === id)
    if (!attachment) return

    if (!attachment.isNew) {
      // 已有附件，标记为待删除
      setRemovedUrls(prev => [...prev, attachment.url])
    }
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      setError(t.titleRequired)
      return
    }

    try {
      setSaving(true)
      setError('')

      // 收集所有保留的附件 URL
      const attachmentUrls = attachments.map(att => att.url)

      const response = await fetch(`/api/marketplace/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          budget: formData.budget || null,
          price: formData.price || null,
          currency: formData.currency,
          unit: formData.unit || null,
          minOrderQty: formData.minOrderQty || null,
          deadline: formData.deadline || null,
          contactInfo: formData.contactInfo || null,
          attachments: attachmentUrls,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setAuthError(true)
          setError(t.notLoggedIn)
          return
        }
        if (response.status === 403) {
          setAuthError(true)
          setError(t.notOwner)
          return
        }
        throw new Error(data.error || t.saveFailed)
      }

      if (data.success) {
        alert(t.saveSuccess)
        router.push(`/${locale}/marketplace/${taskId}`)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          {t.loadingTask}
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-6">{error}</p>
          <Link
            href={`/${locale}/marketplace/${taskId}`}
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {t.back}
          </Link>
        </div>
      </div>
    )
  }

  // 各上传区域的配置
  const uploadAreas: Array<{
    type: AttachmentCategory
    label: string
    icon: typeof ImageIcon
    accept: string
    inputRef: React.RefObject<HTMLInputElement | null>
    iconColor: string
  }> = [
    {
      type: 'image',
      label: t.uploadImages,
      icon: ImageIcon,
      accept: ATTACHMENT_LIMITS['image'].allowedExtensions.join(','),
      inputRef: imageInputRef,
      iconColor: 'text-green-500',
    },
    {
      type: 'video',
      label: t.uploadVideos,
      icon: FileVideo,
      accept: ATTACHMENT_LIMITS['video'].allowedExtensions.join(','),
      inputRef: videoInputRef,
      iconColor: 'text-purple-500',
    },
    {
      type: 'file',
      label: t.uploadFiles,
      icon: FileText,
      accept: ATTACHMENT_LIMITS['file'].allowedExtensions.join(','),
      inputRef: fileInputRef,
      iconColor: 'text-blue-500',
    },
    {
      type: 'compressed',
      label: t.uploadCompressed,
      icon: FileArchive,
      accept: ATTACHMENT_LIMITS['compressed'].allowedExtensions.join(','),
      inputRef: compressedInputRef,
      iconColor: 'text-orange-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/${locale}/marketplace/${taskId}`}
            className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block"
          >
            {t.back}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.taskTitle} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.description} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.type}
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MANUFACTURING">{t.manufacturing}</option>
              <option value="PRODUCT_SALE">{t.productSale}</option>
              <option value="SERVICE">{t.service}</option>
            </select>
          </div>

          {/* 价格和预算 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.budget}
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.price}
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 货币和单位 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.currency}
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CNY">CNY</option>
                <option value="JPY">JPY</option>
                <option value="KRW">KRW</option>
                <option value="GBP">GBP</option>
                <option value="AED">AED</option>
                <option value="SAR">SAR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.unit}
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="ton, piece, kg..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 最小起订量和截止日期 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.minOrderQty}
              </label>
              <input
                type="number"
                name="minOrderQty"
                value={formData.minOrderQty}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.deadline}
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 联系信息 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.contactInfo}
            </label>
            <textarea
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              rows={3}
              placeholder="email: xxx@xxx.com tel: xxxxxxxx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ===== 附件上传区域 ===== */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {t.attachments}
              </label>
              <span className="text-xs text-gray-500">
                {t.totalAttachments}: {attachments.length} / {MAX_TOTAL_ATTACHMENTS} · {t.maxTotal}
              </span>
            </div>

            {/* 上传区域网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {uploadAreas.map((area) => {
                const Icon = area.icon
                const isUploading = uploadingState[area.type]
                const currentCount = getCountByType(area.type)
                const limit = ATTACHMENT_LIMITS[area.type]
                const isFull = currentCount >= limit.maxCount
                const isDisabled = isUploading || isFull || attachments.length >= MAX_TOTAL_ATTACHMENTS

                return (
                  <div
                    key={area.type}
                    onClick={() => !isDisabled && area.inputRef.current?.click()}
                    className={`
                      border-2 border-dashed rounded-lg p-4 text-center transition-all
                      ${isDisabled
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                      }
                      ${isUploading ? 'border-blue-400 bg-blue-50' : ''}
                    `}
                  >
                    <input
                      ref={area.inputRef}
                      type="file"
                      accept={area.accept}
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files, area.type)}
                      disabled={isDisabled}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center space-y-2">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      ) : (
                        <Icon className={`w-8 h-8 ${area.iconColor}`} />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {area.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {getCountDescription(area.type, currentCount)} · {formatFileSize(limit.maxFileSize)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {area.accept.split(',').join(' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 已上传附件列表 */}
            {attachments.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {t.totalAttachments} ({attachments.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {attachments.map((attachment) => {
                    const Icon = attachment.type === 'image' ? ImageIcon
                      : attachment.type === 'video' ? FileVideo
                      : attachment.type === 'compressed' ? FileArchive
                      : FileText
                    const iconColor = attachment.type === 'image' ? 'text-green-500'
                      : attachment.type === 'video' ? 'text-purple-500'
                      : attachment.type === 'compressed' ? 'text-orange-500'
                      : 'text-blue-500'

                    return (
                      <div
                        key={attachment.id}
                        className="relative bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          {attachment.type === 'image' ? (
                            <img
                              src={attachment.url}
                              alt={attachment.fileName}
                              className="w-10 h-10 object-cover rounded flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="text-xs text-gray-600 truncate block max-w-[120px]">
                              {attachment.fileName}
                            </span>
                            {attachment.size && (
                              <span className="text-xs text-gray-400">
                                {formatFileSize(attachment.size)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                          title={t.removeSuccess}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4 justify-end">
            <Link
              href={`/${locale}/marketplace/${taskId}`}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              {t.back}
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t.save}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
