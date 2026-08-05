/**
 * Post Task Page
 * Allows users to create new marketplace tasks
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { loadTranslations } from '@/i18n/lazyTranslations'
import type { Language } from '@/i18n/translations'
import { X, Image, FileText, FileCode, FileArchive, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

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
  keywords: string
}

interface Attachment {
  id: string
  url: string
  fileName: string
  type: 'image' | 'file' | 'drawing' | 'compressed'
}

export default function PostTaskPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as Language) || 'en'
  
  const [translations, setTranslations] = useState<typeof import('@/i18n/translations').translations['en'] | null>(null)
  const [loadingTranslations, setLoadingTranslations] = useState(true)

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
    keywords: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [aiGenerating, setAiGenerating] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const drawingInputRef = useRef<HTMLInputElement>(null)
  const compressedInputRef = useRef<HTMLInputElement>(null)
  
  const [uploadingState, setUploadingState] = useState<{
    image: boolean
    file: boolean
    drawing: boolean
    compressed: boolean
  }>({
    image: false,
    file: false,
    drawing: false,
    compressed: false,
  })

  useEffect(() => {
    const fetchTranslations = async () => {
      const dict = await loadTranslations(locale)
      setTranslations(dict)
      setLoadingTranslations(false)
    }
    fetchTranslations()
  }, [locale])

  // Check login status — upload API requires authentication
  const [authChecked, setAuthChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setIsLoggedIn(!!data?.user?.id)
        setAuthChecked(true)
      })
      .catch(() => {
        setIsLoggedIn(false)
        setAuthChecked(true)
      })
  }, [])

  if (!authChecked || loadingTranslations || !translations) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  // Show login prompt if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {locale === 'zh' ? '请先登录' : 'Please Login First'}
          </h2>
          <p className="text-gray-600 mb-6">
            {locale === 'zh'
              ? '您需要登录后才能发布任务和上传附件。'
              : 'You need to login before posting tasks and uploading attachments.'}
          </p>
          <a
            href={`/${locale}/auth/login`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {locale === 'zh' ? '前往登录' : 'Go to Login'}
          </a>
        </div>
      </div>
    )
  }

  const t = translations.marketplace.postTaskPage

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: any = {}
    
    if (!formData.title.trim()) {
      newErrors['title'] = t.titleRequired
    }
    
    if (!formData.description.trim()) {
      newErrors['description'] = t.descriptionRequired
    } else if (formData.description.length < 1) {
      newErrors['description'] = t.descriptionMinLength
    }
    
    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors['budget'] = t.budgetMustBeNumber
    }
    
    if (formData.price && isNaN(Number(formData.price))) {
      newErrors['price'] = t.priceMustBeNumber
    }
    
    if (formData.minOrderQty && isNaN(Number(formData.minOrderQty))) {
      newErrors['minOrderQty'] = t.minOrderMustBeNumber
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAIGenerate = async () => {
    if (!formData.title.trim()) {
      alert(t.enterTitleFirst)
      return
    }
    
    try {
      setAiGenerating(true)
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockDescriptions: Record<string, string> = {
        MANUFACTURING: `We are looking for a reliable manufacturer to produce ${formData.title.toLowerCase()}.

Requirements:
- High quality standards
- Competitive pricing
- On-time delivery
- Experience in similar products

Please provide:
1. Your manufacturing capabilities
2. Sample products or portfolio
3. Pricing structure
4. Production timeline
5. Minimum order quantities

We are ready to start immediately and looking for long-term partnership.`,
        
        PRODUCT_SALE: `We are offering ${formData.title.toLowerCase()} for sale.

Product Details:
- High quality product
- Competitive wholesale pricing
- Bulk discounts available
- Fast shipping worldwide

Specifications:
- Please contact for detailed specifications
- Custom packaging available
- Sample orders welcome

Ideal for retailers, distributors, and resellers. Contact us for pricing and availability.`,
        
        SERVICE: `We are providing professional ${formData.title.toLowerCase()} services.

Our Services Include:
- Expert consultation
- High-quality deliverables
- Fast turnaround time
- Competitive pricing
- Customer satisfaction guaranteed

Why Choose Us:
- Years of experience
- Professional team
- Proven track record
- Flexible scheduling
- Affordable rates

Contact us today to discuss your requirements and get a custom quote.`
      }
      
      const generatedDescription = mockDescriptions[formData.type as keyof typeof mockDescriptions] || mockDescriptions['MANUFACTURING']
      
      setFormData(prev => ({ ...prev, description: generatedDescription || '' }))
      
      alert('AI has generated a description for you! You can edit it as needed.')
    } catch (error) {
      console.error('AI generation error:', error)
      alert(t.failedToPost)
    } finally {
      setAiGenerating(false)
    }
  }

  const handleFileUpload = async (
    files: FileList | null, 
    attachmentType: 'image' | 'file' | 'drawing' | 'compressed'
  ) => {
    if (!files || files.length === 0) return

    const typeKey = attachmentType === 'image' ? 'image' : 
                    attachmentType === 'file' ? 'file' : 
                    attachmentType === 'drawing' ? 'drawing' : 'compressed'
    
    setUploadingState(prev => ({ ...prev, [typeKey]: true }))

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        if (file.size > 20 * 1024 * 1024) {
          alert(`${t.maxFileSize}: ${file.name}`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'task_attachment')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed')
        }

        setAttachments(prev => [...prev, {
          id: `${Date.now()}-${i}`,
          url: data.url,
          fileName: file.name,
          type: attachmentType,
        }])
      }
      
      alert(t.uploadSuccess)
    } catch (err) {
      console.error('Upload error:', err)
      alert(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingState(prev => ({ ...prev, [typeKey]: false }))
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      setLoading(true)
      
      const attachmentUrls = attachments.map(att => att.url)
      
      const keywordsArray = formData.keywords
        .split(/[,，]/)
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, 10)
      
      const response = await fetch('/api/marketplace/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          attachments: attachmentUrls,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          price: formData.price ? parseFloat(formData.price) : null,
          minOrderQty: formData.minOrderQty ? parseInt(formData.minOrderQty) : null,
          deadline: formData.deadline || null,
          keywords: keywordsArray,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(t.taskPostedSuccess)
        router.push(`/${locale}/marketplace/${data.data.id}`)
      } else {
        alert(data.error || t.failedToPost)
      }
    } catch (error) {
      console.error('Error posting task:', error)
      alert(t.networkError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/${locale}/marketplace`}
            className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block"
          >
            {t.backToMarketplace}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-2">
            {t.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.taskTitle}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t.taskTitlePlaceholder}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.taskType}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.keywords || (locale === 'zh' ? '关键词' : 'Keywords')}
            </label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.keywordsPlaceholder || (locale === 'zh' ? '请输入关键词，用逗号分隔，最多10个' : 'Enter keywords separated by commas, up to 10')}
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-500">
              {t.keywordsNote || (locale === 'zh' ? '关键词有助于提高任务被搜索到的概率' : 'Keywords help improve the chances of your task being found')}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {t.description}
              </label>
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={aiGenerating || !formData.title}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiGenerating ? t.generating : t.aiGenerate}
              </button>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={10}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t.descriptionPlaceholder}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {t.descriptionMinChars}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.budget}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t.budgetPlaceholder}
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.unitPrice}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t.unitPricePlaceholder}
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
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
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CNY">CNY - Chinese Yuan</option>
                <option value="JPY">JPY - Japanese Yen</option>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t.unitPlaceholder}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.minOrderQty}
              </label>
              <input
                type="number"
                name="minOrderQty"
                value={formData.minOrderQty}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.minOrderQty ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t.minOrderQtyPlaceholder}
                min="1"
              />
              {errors.minOrderQty && (
                <p className="mt-1 text-sm text-red-600">{errors.minOrderQty}</p>
              )}
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
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.contactInfo}
            </label>
            <input
              type="text"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.contactInfoPlaceholder}
            />
            <p className="mt-1 text-xs text-gray-500">
              {t.contactInfoNote}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              {t.attachments}
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => !uploadingState.image && imageInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all
                  ${uploadingState.image ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}
                `}
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files, 'image')}
                  disabled={uploadingState.image}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-2">
                  {uploadingState.image ? (
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  ) : (
                    <Image className="w-8 h-8 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t.uploadImages}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t.supportedImageTypes} • {t.maxFileSize}
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => !uploadingState.file && fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all
                  ${uploadingState.file ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files, 'file')}
                  disabled={uploadingState.file}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-2">
                  {uploadingState.file ? (
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t.uploadFiles}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t.supportedFileTypes} • {t.maxFileSize}
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => !uploadingState.drawing && drawingInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all
                  ${uploadingState.drawing ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}
                `}
              >
                <input
                  ref={drawingInputRef}
                  type="file"
                  accept=".dwg,.dxf"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files, 'drawing')}
                  disabled={uploadingState.drawing}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-2">
                  {uploadingState.drawing ? (
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  ) : (
                    <FileCode className="w-8 h-8 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t.uploadDrawings}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t.supportedDrawingTypes} • {t.maxFileSize}
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => !uploadingState.compressed && compressedInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all
                  ${uploadingState.compressed ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}
                `}
              >
                <input
                  ref={compressedInputRef}
                  type="file"
                  accept=".zip,.rar"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files, 'compressed')}
                  disabled={uploadingState.compressed}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-2">
                  {uploadingState.compressed ? (
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  ) : (
                    <FileArchive className="w-8 h-8 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t.uploadCompressed}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t.supportedCompressedTypes} • {t.maxFileSize}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {t.attachments} ({attachments.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="relative bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        {attachment.type === 'image' ? (
                          <Image className="w-5 h-5 text-green-500" />
                        ) : attachment.type === 'drawing' ? (
                          <FileCode className="w-5 h-5 text-blue-500" />
                        ) : attachment.type === 'compressed' ? (
                          <FileArchive className="w-5 h-5 text-orange-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-gray-500" />
                        )}
                        <span className="text-xs text-gray-600 truncate max-w-[120px]">
                          {attachment.fileName}
                        </span>
                      </div>
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.posting : t.postTaskBtn}
            </button>
            <Link
              href={`/${locale}/marketplace`}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
            >
              {t.cancel}
            </Link>
          </div>
        </form>

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">{t.tipsTitle}</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• {t.tip1}</li>
            <li>• {t.tip2}</li>
            <li>• {t.tip3}</li>
            <li>• {t.tip4}</li>
            <li>• {t.tip5}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}