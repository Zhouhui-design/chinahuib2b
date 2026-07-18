'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Edit2, Trash2, Plus, X } from 'lucide-react'
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

export default function BoothDetailPage() {
  const params = useParams()
  const id = params['id'] as string
  const language = useSellerLanguage()
  const [booth, setBooth] = useState<Booth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set())
  const [isDeleteMode, setIsDeleteMode] = useState(false)

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
        <button
          onClick={() => window.open(`/seller/booths?id=${booth.id}&edit=true`, '_blank')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          {t.edit}
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {t.delete}
        </button>
      </div>

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
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                {language === 'zh' ? '上传文件' : 'Documents'}
              </h3>
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
