'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit2, Trash2, Plus, X, Upload, Image as ImageIcon, FileText, Trash2 as TrashIcon, Loader2 } from 'lucide-react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'
import ProductSelector from '@/components/ProductSelector'

interface Product {
  id: string
  title: string
  mainImageUrl: string
  images: string[]
  category?: { name: string }
}

interface Booth {
  id: string
  name: string
  names?: Record<string, string>
  exhibitionName: string
  exhibitionDates?: { start: string; end: string }
  location?: string
  logoUrl?: string
  bannerUrl?: string
  keywords?: string[]
  documents?: Array<{ url: string; name: string; type: string; size: number }>
  theme?: string
  colorScheme?: string
  layout?: string
  isActive: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
  seller: {
    companyName: string
    country: string
    city: string
    logoUrl?: string
  }
  products: Product[]
}

interface FormData {
  name: string
  exhibitionName: string
  location: string
  logoUrl: string
  bannerUrl: string
  keywords: string[]
  documents: Array<{ url: string; name: string; type: string; size: number }>
  theme: string
  colorScheme: string
  layout: string
}

export default function BoothDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params['id'] as string
  const language = useSellerLanguage()
  const [booth, setBooth] = useState<Booth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set())
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    exhibitionName: '',
    location: '',
    logoUrl: '',
    bannerUrl: '',
    keywords: [],
    documents: [],
    theme: '',
    colorScheme: '',
    layout: ''
  })
  const [keywordInput, setKeywordInput] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [bannerPreview, setBannerPreview] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  // Upload progress states
  const [uploadProgress, setUploadProgress] = useState<{
    type: 'logo' | 'banner' | 'document'
    fileName: string
    progress: number
    status: 'uploading' | 'success' | 'error'
  } | null>(null)
  const [documentUploads, setDocumentUploads] = useState<Array<{
    id: string
    fileName: string
    progress: number
    status: 'uploading' | 'success' | 'error'
  }>>([])
  
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  const t = {
    back: language === 'zh' ? '返回展位列表' : 'Back to Booths',
    boothDetails: language === 'zh' ? '展位详情' : 'Booth Details',
    companyName: language === 'zh' ? '公司名称' : 'Company Name',
    location: language === 'zh' ? '位置' : 'Location',
    exhibitionDates: language === 'zh' ? '展会日期' : 'Exhibition Dates',
    keywords: language === 'zh' ? '关键词' : 'Keywords',
    products: language === 'zh' ? '产品' : 'Products',
    noProducts: language === 'zh' ? '暂无产品' : 'No products yet',
    viewProduct: language === 'zh' ? '查看产品' : 'View Product',
    publish: language === 'zh' ? '上架' : 'Publish',
    unpublish: language === 'zh' ? '下架' : 'Unpublish',
    edit: language === 'zh' ? '编辑' : 'Edit',
    delete: language === 'zh' ? '删除' : 'Delete',
    confirmDelete: language === 'zh' ? '确定要删除这个展位吗？' : 'Are you sure you want to delete this booth?',
    addProducts: language === 'zh' ? '添加产品' : 'Add Products',
    removeProducts: language === 'zh' ? '删除产品' : 'Remove Products',
    cancel: language === 'zh' ? '取消' : 'Cancel',
    confirmRemove: language === 'zh' ? '确定要删除选中的产品吗？' : 'Are you sure you want to remove selected products?',
    selectedCount: language === 'zh' ? '已选择 {count} 个' : '{count} selected',
    maxProducts: language === 'zh' ? '最多添加100个产品' : 'Maximum 100 products',
    save: language === 'zh' ? '保存' : 'Save',
    editBooth: language === 'zh' ? '编辑展位信息' : 'Edit Booth Information',
    exhibitionName: language === 'zh' ? '展会名称' : 'Exhibition Name',
    boothName: language === 'zh' ? '展位名称' : 'Booth Name',
    uploadLogo: language === 'zh' ? '上传Logo' : 'Upload Logo',
    uploadBanner: language === 'zh' ? '上传横幅' : 'Upload Banner',
    uploadDoc: language === 'zh' ? '上传文件' : 'Upload Document',
    noLogo: language === 'zh' ? '暂无Logo' : 'No Logo',
    noBanner: language === 'zh' ? '暂无横幅' : 'No Banner',
    clickToUpload: language === 'zh' ? '点击上传' : 'Click to Upload',
    addKeyword: language === 'zh' ? '添加关键词' : 'Add Keyword',
    remove: language === 'zh' ? '移除' : 'Remove',
    documents: language === 'zh' ? '上传文件' : 'Documents',
    noDocuments: language === 'zh' ? '暂无文件' : 'No documents yet',
  }

  useEffect(() => {
    fetchBooth()
  }, [id])

  const fetchBooth = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/booths?id=${id}`)
      const data = await res.json()
      if (data.booth) {
        setBooth(data.booth)
      }
    } catch (error) {
      console.error('Failed to fetch booth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const enterEditMode = () => {
    if (!booth) return
    setFormData({
      name: booth.name || '',
      exhibitionName: booth.exhibitionName || '',
      location: booth.location || '',
      logoUrl: booth.logoUrl || '',
      bannerUrl: booth.bannerUrl || '',
      keywords: [...(booth.keywords || [])],
      documents: [...(booth.documents || [])],
      theme: booth.theme || '',
      colorScheme: booth.colorScheme || '',
      layout: booth.layout || ''
    })
    setLogoPreview(booth.logoUrl || '')
    setBannerPreview(booth.bannerUrl || '')
    setKeywordInput('')
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setKeywordInput('')
  }

  const handleSave = async () => {
    if (!booth) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/booths', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: booth.id,
          name: formData.name,
          exhibitionName: formData.exhibitionName,
          location: formData.location,
          logoUrl: formData.logoUrl,
          bannerUrl: formData.bannerUrl,
          keywords: formData.keywords,
          documents: formData.documents,
          theme: formData.theme,
          colorScheme: formData.colorScheme,
          layout: formData.layout
        })
      })
      const data = await res.json()
      if (data.success) {
        setIsEditing(false)
        fetchBooth()
      } else {
        alert(data.error || 'Failed to save changes')
      }
    } catch (error) {
      console.error('Failed to save booth:', error)
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  // Upload file with progress tracking using XMLHttpRequest
  const uploadFileWithProgress = (
    file: File,
    type: string,
    onProgress: (progress: number) => void
  ): Promise<{ success: boolean; url?: string; fileName?: string; size?: number; error?: string }> => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText)
            resolve(data)
          } catch {
            resolve({ success: false, error: 'Invalid response' })
          }
        } else {
          resolve({ success: false, error: `Upload failed with status ${xhr.status}` })
        }
      })

      xhr.addEventListener('error', () => {
        resolve({ success: false, error: 'Network error during upload' })
      })

      xhr.addEventListener('abort', () => {
        resolve({ success: false, error: 'Upload aborted' })
      })

      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    })
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'zh' ? '文件大小不能超过5MB' : 'File size cannot exceed 5MB')
      return
    }
    
    setUploadProgress({
      type: 'logo',
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    })
    
    const result = await uploadFileWithProgress(file, 'boothLogo', (progress) => {
      setUploadProgress(prev => prev ? { ...prev, progress } : null)
    })
    
    if (result.success && result.url) {
      setLogoPreview(result.url)
      setFormData(prev => ({ ...prev, logoUrl: result.url }))
      setUploadProgress(prev => prev ? { ...prev, progress: 100, status: 'success' } : null)
    } else {
      setUploadProgress(prev => prev ? { ...prev, status: 'error' } : null)
      alert(result.error || 'Upload failed')
    }
    
    setTimeout(() => setUploadProgress(null), 3000)
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert(language === 'zh' ? '文件大小不能超过10MB' : 'File size cannot exceed 10MB')
      return
    }
    
    setUploadProgress({
      type: 'banner',
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    })
    
    const result = await uploadFileWithProgress(file, 'boothBanner', (progress) => {
      setUploadProgress(prev => prev ? { ...prev, progress } : null)
    })
    
    if (result.success && result.url) {
      setBannerPreview(result.url)
      setFormData(prev => ({ ...prev, bannerUrl: result.url }))
      setUploadProgress(prev => prev ? { ...prev, progress: 100, status: 'success' } : null)
    } else {
      setUploadProgress(prev => prev ? { ...prev, status: 'error' } : null)
      alert(result.error || 'Upload failed')
    }
    
    setTimeout(() => setUploadProgress(null), 3000)
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const newUploads = Array.from(files).map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      progress: 0,
      status: 'uploading' as const
    }))
    
    setDocumentUploads(prev => [...prev, ...newUploads])
    
    const uploadedDocs = await Promise.all(
      Array.from(files).map(async (file, index) => {
        const uploadId = newUploads[index].id
        const result = await uploadFileWithProgress(file, 'boothDocument', (progress) => {
          setDocumentUploads(prev => prev.map(u => 
            u.id === uploadId ? { ...u, progress } : u
          ))
        })
        
        if (result.success && result.url) {
          setDocumentUploads(prev => prev.map(u => 
            u.id === uploadId ? { ...u, progress: 100, status: 'success' } : u
          ))
          return {
            url: result.url,
            name: result.fileName || file.name,
            type: file.type,
            size: result.size || file.size
          }
        } else {
          setDocumentUploads(prev => prev.map(u => 
            u.id === uploadId ? { ...u, status: 'error' } : u
          ))
          return null
        }
      })
    )
    
    const validDocs = uploadedDocs.filter((doc): doc is { url: string; name: string; type: string; size: number } => doc !== null)
    
    if (validDocs.length > 0) {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...validDocs]
      }))
    }
    
    setTimeout(() => {
      setDocumentUploads(prev => prev.filter(u => u.status !== 'success'))
    }, 3000)
  }

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
  }

  const addKeyword = () => {
    const trimmed = keywordInput.trim()
    if (!trimmed) return
    if (formData.keywords.includes(trimmed)) {
      setKeywordInput('')
      return
    }
    setFormData(prev => ({ ...prev, keywords: [...prev.keywords, trimmed] }))
    setKeywordInput('')
  }

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== keyword) }))
  }

  const handleTogglePublish = async () => {
    if (!booth) return
    try {
      const res = await fetch('/api/booths', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: booth.id,
          isPublished: !booth.isPublished
        })
      })
      const data = await res.json()
      if (data.success) {
        fetchBooth()
      }
    } catch (error) {
      console.error('Failed to update booth:', error)
    }
  }

  const handleDelete = async () => {
    if (!booth) return
    if (!confirm(t.confirmDelete)) return
    try {
      const res = await fetch(`/api/booths?id=${booth.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        window.location.href = '/seller/booths'
      }
    } catch (error) {
      console.error('Failed to delete booth:', error)
    }
  }

  const handleAddProducts = async (productIds: string[]) => {
    if (!booth || productIds.length === 0) return
    try {
      const res = await fetch('/api/booths/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boothId: booth.id,
          productIds
        })
      })
      const data = await res.json()
      if (data.success) {
        fetchBooth()
      } else {
        alert(data.error || 'Failed to add products')
      }
    } catch (error) {
      console.error('Failed to add products:', error)
      alert('Failed to add products')
    }
  }

  const handleRemoveProducts = async () => {
    if (selectedForDelete.size === 0) return
    if (!confirm(t.confirmRemove)) return
    
    try {
      const res = await fetch('/api/booths/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: Array.from(selectedForDelete)
        })
      })
      const data = await res.json()
      if (data.success) {
        setSelectedForDelete(new Set())
        setIsDeleteMode(false)
        fetchBooth()
      } else {
        alert(data.error || 'Failed to remove products')
      }
    } catch (error) {
      console.error('Failed to remove products:', error)
      alert('Failed to remove products')
    }
  }

  const toggleProductForDelete = (productId: string) => {
    const newSelected = new Set(selectedForDelete)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedForDelete(newSelected)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!booth) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎪</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Booth not found</h3>
        <p className="text-gray-600 mb-4">The booth you're looking for doesn't exist.</p>
        <button
          onClick={() => window.location.href = '/seller/booths'}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t.back}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => window.location.href = '/seller/booths'}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.back}
        </button>
        <div className="flex-1" />
        <button
          onClick={handleTogglePublish}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            booth.isPublished 
              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {booth.isPublished ? t.unpublish : t.publish}
        </button>
        {!isEditing && (
          <button
            onClick={enterEditMode}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            {t.edit}
          </button>
        )}
        {isEditing && (
          <>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : null}
              {t.save}
            </button>
          </>
        )}
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {t.delete}
        </button>
      </div>

      {isEditing ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t.editBooth}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.boothName}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.exhibitionName}</label>
              <input
                type="text"
                value={formData.exhibitionName}
                onChange={(e) => setFormData(prev => ({ ...prev, exhibitionName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.location}</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.uploadLogo}</label>
              <div
                onClick={() => uploadProgress?.type !== 'logo' && logoInputRef.current?.click()}
                className={`cursor-pointer border-2 border-dashed rounded-lg p-4 transition-colors flex items-center justify-center ${
                  uploadProgress?.type === 'logo' 
                    ? 'border-blue-500 bg-blue-50 cursor-not-allowed' 
                    : 'border-gray-300 hover:border-blue-500'
                }`}
              >
                {uploadProgress?.type === 'logo' ? (
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-700 truncate">{uploadProgress.fileName}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          uploadProgress.status === 'error' ? 'bg-red-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${uploadProgress.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {uploadProgress.status === 'error' ? (language === 'zh' ? '上传失败' : 'Upload failed') : `${uploadProgress.progress}%`}
                    </p>
                  </div>
                ) : logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-20 w-20 object-contain" />
                ) : (
                  <div className="text-center text-gray-500">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm">{t.clickToUpload}</span>
                  </div>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={uploadProgress?.type === 'logo'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.uploadBanner}</label>
              <div
                onClick={() => uploadProgress?.type !== 'banner' && bannerInputRef.current?.click()}
                className={`cursor-pointer border-2 border-dashed rounded-lg p-4 transition-colors flex items-center justify-center ${
                  uploadProgress?.type === 'banner' 
                    ? 'border-blue-500 bg-blue-50 cursor-not-allowed' 
                    : 'border-gray-300 hover:border-blue-500'
                }`}
              >
                {uploadProgress?.type === 'banner' ? (
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-700 truncate">{uploadProgress.fileName}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          uploadProgress.status === 'error' ? 'bg-red-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${uploadProgress.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {uploadProgress.status === 'error' ? (language === 'zh' ? '上传失败' : 'Upload failed') : `${uploadProgress.progress}%`}
                    </p>
                  </div>
                ) : bannerPreview ? (
                  <img src={bannerPreview} alt="Banner preview" className="h-20 w-full object-cover" />
                ) : (
                  <div className="text-center text-gray-500">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm">{t.clickToUpload}</span>
                  </div>
                )}
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
                disabled={uploadProgress?.type === 'banner'}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.keywords}</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                placeholder={language === 'zh' ? '输入关键词后按回车添加' : 'Type keyword and press Enter'}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addKeyword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {t.addKeyword}
              </button>
            </div>
            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.documents}</label>
            <div
              onClick={() => documentInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors flex items-center justify-center mb-3"
            >
              <div className="text-center text-gray-500">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">{t.clickToUpload}</span>
              </div>
            </div>
            <input
              ref={documentInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
              onChange={handleDocumentUpload}
              className="hidden"
            />
            
            {/* Document upload progress list */}
            {documentUploads.length > 0 && (
              <div className="space-y-2 mb-3">
                {documentUploads.map((upload) => (
                  <div
                    key={upload.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      upload.status === 'error' 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    {upload.status === 'uploading' ? (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    ) : upload.status === 'success' ? (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{upload.fileName}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            upload.status === 'error' ? 'bg-red-500' : upload.status === 'success' ? 'bg-green-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${upload.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 min-w-[40px] text-right">
                      {upload.status === 'error' 
                        ? (language === 'zh' ? '失败' : 'Error') 
                        : `${upload.progress}%`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {formData.documents.length > 0 ? (
              <div className="space-y-2">
                {formData.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {(doc.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => removeDocument(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              documentUploads.length === 0 && <p className="text-sm text-gray-500">{t.noDocuments}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={cancelEdit}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : null}
              {t.save}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative h-56">
            {booth.bannerUrl ? (
              <img
                src={booth.bannerUrl}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">{booth.exhibitionName}</span>
              </div>
            )}
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                booth.isPublished 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-500 text-white'
              }`}>
                {booth.isPublished ? t.publish : t.unpublish}
              </span>
            </div>
          </div>
          
          <div className="p-6 -mt-12 relative z-10">
            <div className="flex items-center gap-4 bg-white rounded-xl shadow-md p-4">
              {booth.logoUrl ? (
                <img
                  src={booth.logoUrl}
                  alt="Logo"
                  className="h-20 w-20 rounded-lg object-contain bg-gray-50 p-2 border border-gray-200"
                />
              ) : (
                <div className="h-20 w-20 rounded-lg bg-gray-50 p-3 flex items-center justify-center border border-gray-200">
                  <span className="text-3xl">🏢</span>
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800">{booth.name}</h1>
                <p className="text-gray-600">{booth.seller.companyName}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t.companyName}</h3>
                <p className="text-gray-900 font-semibold">{booth.seller.companyName}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t.location}</h3>
                <p className="text-gray-900 font-semibold">{booth.seller.city}, {booth.seller.country}</p>
              </div>
              {booth.exhibitionDates && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t.exhibitionDates}</h3>
                  <p className="text-gray-900 font-semibold">{booth.exhibitionDates.start} - {booth.exhibitionDates.end}</p>
                </div>
              )}
            </div>

            {booth.keywords && booth.keywords.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 mb-3">{t.keywords}</h3>
                <div className="flex flex-wrap gap-2">
                  {booth.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {booth.documents && booth.documents.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 mb-3">{t.documents}</h3>
                <div className="space-y-2">
                  {booth.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-2xl">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <span className="text-gray-400">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{t.products} ({(booth.products || []).length}/100)</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowProductSelector(true)}
                    disabled={(booth.products || []).length >= 100}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t.addProducts}
                  </button>
                  {(booth.products || []).length > 0 && (
                    <button
                      onClick={() => {
                        setIsDeleteMode(!isDeleteMode)
                        setSelectedForDelete(new Set())
                      }}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        isDeleteMode 
                          ? 'bg-gray-200 text-gray-700' 
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {isDeleteMode ? t.cancel : t.removeProducts}
                    </button>
                  )}
                </div>
              </div>
              {(booth.products || []).length > 0 ? (
                <>
                  {isDeleteMode && selectedForDelete.size > 0 && (
                    <div className="mb-4 p-4 bg-red-50 rounded-lg flex items-center justify-between">
                      <span className="text-red-700">
                        {t.selectedCount.replace('{count}', selectedForDelete.size.toString())}
                      </span>
                      <button
                        onClick={handleRemoveProducts}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        确认删除
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(booth.products || []).map((product) => (
                      <div
                        key={product.id}
                        className={`bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                          isDeleteMode ? 'cursor-pointer' : ''
                        } ${selectedForDelete.has(product.id) ? 'ring-2 ring-red-500' : ''}`}
                        onClick={() => isDeleteMode && toggleProductForDelete(product.id)}
                      >
                        <div className="relative h-40">
                          {product.mainImageUrl ? (
                            <img
                              src={product.mainImageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400">No image</span>
                            </div>
                          )}
                          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {product.images.length + 1} images
                          </span>
                          {isDeleteMode && (
                            <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center ${
                              selectedForDelete.has(product.id) 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white/80 text-gray-600'
                            }`}>
                              {selectedForDelete.has(product.id) ? (
                                <X className="w-4 h-4" />
                              ) : (
                                <span className="text-xs font-bold">+</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                          {product.category && (
                            <p className="text-sm text-gray-500 mb-3">{product.category.name}</p>
                          )}
                          {!isDeleteMode && (
                            <button
                              onClick={() => window.open(`/products/${product.id}`, '_blank')}
                              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              {t.viewProduct}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.noProducts}</h3>
                  <p className="text-gray-600 mb-4">Add products to your booth to showcase them to buyers.</p>
                  <button
                    onClick={() => setShowProductSelector(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {t.addProducts}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ProductSelector
        isOpen={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        onAdd={handleAddProducts}
        existingProductIds={(booth.products || []).map(p => p.id)}
        maxProducts={100}
      />
    </div>
  )
}
