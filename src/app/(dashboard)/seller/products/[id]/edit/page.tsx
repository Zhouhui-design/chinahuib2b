'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import FileUpload from '@/components/ui/FileUpload'
import { ArrowLeft, Save, X, Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

interface UploadedFile {
  url: string
}

interface Category {
  id: string
  name: string
  nameEn?: string
}

interface Unit {
  id: string
  name: string
  nameEn: string
  symbol?: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const language = useSellerLanguage()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
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
  const [acceptsOEM, setAcceptsOEM] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')

  // Fetch categories and product data
  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchProduct(),
      fetchUnits()
    ]).finally(() => setLoading(false))
  }, [productId, language])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?locale=${language}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

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

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch product')
      }

      const data = await response.json()
      const product = data.product

      // Pre-fill form with existing data
      setTitle(product.title)
      setCategoryId(product.categoryId)
      setDescription(product.description || '')
      setImages(product.images || [])
      setMainImageUrl((product.mainImageUrl || product.images?.[0] || '') as string)
      setMinOrderQty(product.minOrderQty || '')
      setMinOrderUnitId(product.minOrderUnitId || '')
      setSupplyCapacity(product.supplyCapacity || '')
      setSupplyCapacityUnitId(product.supplyCapacityUnitId || '')
      setVideos(product.videos || [])
      setDocuments(product.documents || [])
      setAcceptsOEM(product.acceptsOEM || false)
      setYoutubeUrl(product.youtubeUrl || '')
      setKeywords(Array.isArray(product.keywords) ? product.keywords : [])

      // Convert specifications object to array
      if (product.specifications && Object.keys(product.specifications).length > 0) {
        const specsArray = Object.entries(product.specifications).map(([key, value]) => ({
          key,
          value: String(value)
        }))
        setSpecifications(specsArray.length > 0 ? specsArray : [{ key: '', value: '' }])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product')
    }
  }

  const handleImageUpload = (data: UploadedFile | UploadedFile[]) => {
    const newImages = Array.isArray(data) ? data.map((d) => d.url) : [data.url]
    setImages(prev => [...prev, ...newImages])

    // Set first image as main if not set
    if (!mainImageUrl && newImages.length > 0) {
      setMainImageUrl(newImages[0])
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)

    // Update main image if removed
    if (mainImageUrl === images[index]) {
      setMainImageUrl(newImages[0] || '')
    }
  }

  const setAsMainImage = (index: number) => {
    const image = images[index]
    if (image) {
      setMainImageUrl(image)
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

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index)
    setVideos(newVideos)
  }

  const removeDocument = (index: number) => {
    const newDocs = documents.filter((_, i) => i !== index)
    setDocuments(newDocs)
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

  const addKeyword = () => {
    const trimmed = keywordInput.trim()
    if (trimmed && !keywords.includes(trimmed) && keywords.length < 50) {
      setKeywords([...keywords, trimmed])
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Product title is required')
      return
    }

    if (!categoryId) {
      setError('Please select a category')
      return
    }

    if (images.length === 0) {
      setError('Please upload at least one product image')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Convert specifications array to object
      const specsObj = specifications.reduce((acc, spec) => {
        if (spec.key.trim() && spec.value.trim()) {
          acc[spec.key.trim()] = spec.value.trim()
        }
        return acc
      }, {} as Record<string, string>)

      const productData = {
        title,
        categoryId,
        description,
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

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()

      if (!response.ok) {
        // Show detailed validation errors if available (400 - Zod)
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details
            .map((d: any) => {
              const field = d.path && d.path.length > 0 ? d.path.join('.') : 'field'
              return `${field}: ${d.message || 'invalid'}`
            })
            .join('; ')
          throw new Error(`${result.error}: ${errorMessages}`)
        }
        // Show server error details if available (500 - Prisma/DB)
        if (result.details && typeof result.details === 'string') {
          throw new Error(`${result.error}: ${result.details}`)
        }
        throw new Error(result.error || 'Failed to update product')
      }

      // Success - redirect to products list
      alert('Product updated successfully!')
      router.push('/seller/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/seller/products"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-sm text-gray-600 mt-1">
              Update your product listing
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter product title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>

          <FileUpload
            type="product_image"
            multiple={true}
            onUploadSuccess={handleImageUpload}
          />

          {/* Uploaded Images Preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Product ${index + 1}`}
                    className={`w-full aspect-square object-cover rounded-lg border-2 ${
                      mainImageUrl === img ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      {mainImageUrl !== img && (
                        <button
                          type="button"
                          onClick={() => setAsMainImage(index)}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          Set as Main
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
                      Main
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Videos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'zh' ? '产品视频' : 'Product Videos'}
          </h2>
          <p className="text-xs text-gray-500">
            {language === 'zh' ? '支持 MP4、MOV、AVI 等格式，最大 100MB（选填）' :
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

        {/* Product Documents */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'zh' ? '产品文档' : 'Product Documents'}
          </h2>
          <p className="text-xs text-gray-500">
            {language === 'zh' ? '支持 PDF、DOC、XLS、PPT、ZIP、RAR 等格式，最大 50MB（选填）' :
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
                      {language === 'zh' ? '下载' : 'Download'}
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

        {/* Specifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Specifications</h2>
            <button
              type="button"
              onClick={addSpecification}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Spec
            </button>
          </div>

          <div className="space-y-2">
            {specifications.map((spec, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                  placeholder="Key (e.g., Color)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  placeholder="Value (e.g., Red)"
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

        {/* SEO Keywords */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {language === 'zh' ? 'SEO 关键词' : 'SEO Keywords'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {language === 'zh'
                ? '添加多语言关键词，帮助全球买家搜索到你的产品（每个关键词建议不超过50字符，最多50个）'
                : 'Add multilingual keywords to help global buyers find your product (max 50 chars each, max 50 keywords)'}
            </p>
          </div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              placeholder={language === 'zh' ? '输入关键词后按回车添加（支持中/英/德/西/法/日/韩/俄/葡/阿拉伯语）' : 'Type keyword and press Enter (supports multi-language)'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              {language === 'zh' ? '添加' : 'Add'}
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
        </div>

        {/* Order & Supply Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Order & Supply Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Quantity
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={minOrderQty}
                  onChange={(e) => setMinOrderQty(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g., 100"
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
                Supply Capacity
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={supplyCapacity}
                  onChange={(e) => setSupplyCapacity(e.target.value)}
                  placeholder="e.g., 10000 pieces/month"
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
              {language === 'zh' ? '是否接受OEM' : 'Accepts OEM'}
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
                <span className="text-sm text-gray-700">{language === 'zh' ? '是' : 'Yes'}</span>
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
                <span className="text-sm text-gray-700">{language === 'zh' ? '否' : 'No'}</span>
              </label>
            </div>
          </div>
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'zh' ? 'YouTube链接' : 'YouTube URL'}
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
          <Link
            href="/seller/products"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}