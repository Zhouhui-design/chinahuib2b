'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { loadTranslations } from '@/i18n/lazyTranslations'
import type { Language } from '@/i18n/translations'
import { X, Image, Video, FileText, Link2, Phone, Upload, Loader2, Send } from 'lucide-react'

interface FormDataType {
  title: string
  content: string
  category: string
  link: string
  phone: string
}

interface UploadedFile {
  url: string
  filename: string
  type?: string
  size?: number
}

export default function PostTopicPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as Language) || 'en'
  
  const [translations, setTranslations] = useState<typeof import('@/i18n/translations').translations['en'] | null>(null)
  const [loadingTranslations, setLoadingTranslations] = useState(true)

  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    content: '',
    category: 'OTHER',
    link: '',
    phone: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [images, setImages] = useState<string[]>([])
  const [videos, setVideos] = useState<string[]>([])
  const [documents, setDocuments] = useState<UploadedFile[]>([])
  
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)
  
  const [uploading, setUploading] = useState<{ image: boolean; video: boolean; document: boolean }>({
    image: false,
    video: false,
    document: false,
  })

  const categories = [
    { value: 'INDUSTRY', label: { zh: '行业讨论', en: 'Industry', ja: '産業', ko: '산업', fr: 'Industrie', de: 'Industrie', es: 'Industria' } },
    { value: 'HOT_TOPIC', label: { zh: '热点话题', en: 'Hot Topic', ja: 'ホットトピック', ko: '핫 토픽', fr: 'Sujet chaud', de: 'Hit-Thema', es: 'Tema caliente' } },
    { value: 'PRODUCT', label: { zh: '产品评价', en: 'Product', ja: '製品', ko: '제품', fr: 'Produit', de: 'Produkt', es: 'Producto' } },
    { value: 'NEWS', label: { zh: '行业新闻', en: 'News', ja: 'ニュース', ko: '뉴스', fr: 'Actualités', de: 'Nachrichten', es: 'Noticias' } },
    { value: 'RECRUITMENT', label: { zh: '招聘信息', en: 'Recruitment', ja: '採用', ko: '채용', fr: 'Recrutement', de: 'Bewerbung', es: 'Reclutamiento' } },
    { value: 'ARTICLE', label: { zh: '文章分享', en: 'Article', ja: '記事', ko: '기사', fr: 'Article', de: 'Artikel', es: 'Artículo' } },
    { value: 'OTHER', label: { zh: '其他', en: 'Other', ja: 'その他', ko: '기타', fr: 'Autre', de: 'Andere', es: 'Otro' } },
  ]

  useEffect(() => {
    const fetchTranslations = async () => {
      const dict = await loadTranslations(locale)
      setTranslations(dict)
      setLoadingTranslations(false)
    }
    fetchTranslations()
  }, [locale])

  if (loadingTranslations || !translations) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  const t = translations.marketplace

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
      newErrors['title'] = locale === 'zh' ? '请输入话题标题' : 'Please enter topic title'
    } else if (formData.title.length > 200) {
      newErrors['title'] = locale === 'zh' ? '标题不能超过200个字符' : 'Title cannot exceed 200 characters'
    }
    
    if (!formData.content.trim()) {
      newErrors['content'] = locale === 'zh' ? '请输入话题内容' : 'Please enter topic content'
    } else if (formData.content.length > 5000) {
      newErrors['content'] = locale === 'zh' ? '内容不能超过5000个字符' : 'Content cannot exceed 5000 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpload = async (files: FileList | null, type: 'image' | 'video' | 'document') => {
    if (!files || files.length === 0) return

    setUploading(prev => ({ ...prev, [type]: true }))

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const uploadType = type === 'image' ? 'product_image' : type === 'video' ? 'product_video' : 'product_document'
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', uploadType)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed')
        }

        if (type === 'image') {
          setImages(prev => [...prev, data.url])
        } else if (type === 'video') {
          setVideos(prev => [...prev, data.url])
        } else {
          setDocuments(prev => [...prev, {
            url: data.url,
            filename: file.name,
            type: file.type,
            size: file.size,
          }])
        }
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert(err instanceof Error ? err.message : (locale === 'zh' ? '上传失败' : 'Upload failed'))
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }))
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index))
  }

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      setLoading(true)
      
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
          images,
          videos,
          documents,
          link: formData.link || undefined,
          phone: formData.phone || undefined,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(locale === 'zh' ? '话题发布成功！' : 'Topic posted successfully!')
        router.push(`/${locale}/marketplace`)
      } else {
        alert(data.error || (locale === 'zh' ? '发布失败' : 'Failed to post'))
      }
    } catch (error) {
      console.error('Error posting topic:', error)
      alert(locale === 'zh' ? '网络错误' : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (value: string) => {
    const category = categories.find(c => c.value === value)
    return category?.label[locale as keyof typeof category.label] || value
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/${locale}/marketplace`}
            className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block"
          >
            ← {locale === 'zh' ? '返回市场' : 'Back to Marketplace'}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'zh' ? '发表话题' : 'Post a Topic'}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'zh' ? '分享您的观点、新闻或想法，与社区交流讨论' : 'Share your opinions, news, or ideas with the community'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'zh' ? '话题标题' : 'Topic Title'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={locale === 'zh' ? '请输入话题标题...' : 'Enter topic title...'}
              maxLength={200}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">{formData.title.length}/200</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'zh' ? '话题分类' : 'Category'}
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {getCategoryLabel(category.value)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'zh' ? '话题内容' : 'Content'} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={8}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={locale === 'zh' ? '分享您的观点、行业分析、新闻资讯或产品评价...' : 'Share your opinions, industry analysis, news, or product reviews...'}
              maxLength={5000}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">{formData.content.length}/5000</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Link2 className="w-4 h-4 inline mr-1" />
                {locale === 'zh' ? '链接' : 'Link'}
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                {locale === 'zh' ? '联系电话' : 'Phone'}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={locale === 'zh' ? '您的联系电话' : 'Your phone number'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              {locale === 'zh' ? '上传附件' : 'Upload Attachments'}
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => !uploading.image && imageInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
                  ${uploading.image ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}
                `}
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => handleUpload(e.target.files, 'image')}
                  disabled={uploading.image}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-3">
                  {uploading.image ? (
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  ) : (
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                      <Image className="w-7 h-7 text-green-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {locale === 'zh' ? '上传图片' : 'Upload Images'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, WebP • Max 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => !uploading.video && videoInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
                  ${uploading.video ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}
                `}
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/mov,video/webm"
                  multiple
                  onChange={(e) => handleUpload(e.target.files, 'video')}
                  disabled={uploading.video}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-3">
                  {uploading.video ? (
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  ) : (
                    <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                      <Video className="w-7 h-7 text-purple-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {locale === 'zh' ? '上传视频' : 'Upload Videos'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      MP4, MOV, WebM • Max 100MB
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => !uploading.document && documentInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
                  ${uploading.document ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}
                `}
              >
                <input
                  ref={documentInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z"
                  multiple
                  onChange={(e) => handleUpload(e.target.files, 'document')}
                  disabled={uploading.document}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-3">
                  {uploading.document ? (
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  ) : (
                    <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                      <FileText className="w-7 h-7 text-orange-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {locale === 'zh' ? '上传文件' : 'Upload Files'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, ZIP, RAR • Max 50MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {locale === 'zh' ? '图片' : 'Images'} ({images.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img src={image} alt={`Image ${index}`} className="w-full h-24 object-cover rounded-lg" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {videos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {locale === 'zh' ? '视频' : 'Videos'} ({videos.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {videos.map((video, index) => (
                    <div key={index} className="relative bg-gray-900 rounded-lg p-4 flex flex-col items-center justify-center min-h-[100px]">
                      <Video className="w-8 h-8 text-white mb-2" />
                      <span className="text-xs text-gray-400 truncate w-full text-center">Video {index + 1}</span>
                      <button
                        onClick={() => removeVideo(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {documents.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {locale === 'zh' ? '文件' : 'Documents'} ({documents.length})
                </p>
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{doc.filename}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(doc.size || 0)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          <Link2 className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => removeDocument(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
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
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{locale === 'zh' ? '发布中...' : 'Posting...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{locale === 'zh' ? '发布话题' : 'Post Topic'}</span>
                </>
              )}
            </button>
            <Link
              href={`/${locale}/marketplace`}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
            >
              {locale === 'zh' ? '取消' : 'Cancel'}
            </Link>
          </div>
        </form>

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            {locale === 'zh' ? '发布建议' : 'Tips for Posting'}
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• {locale === 'zh' ? '选择合适的分类，让更多人看到您的话题' : 'Choose the appropriate category to reach more people'}</li>
            <li>• {locale === 'zh' ? '标题要简洁明了，内容要详实有价值' : 'Keep your title concise and content detailed'}</li>
            <li>• {locale === 'zh' ? '上传相关图片或视频可以增加话题吸引力' : 'Upload relevant images or videos to increase engagement'}</li>
            <li>• {locale === 'zh' ? '遵守社区规范，文明发言' : 'Follow community guidelines and speak politely'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}