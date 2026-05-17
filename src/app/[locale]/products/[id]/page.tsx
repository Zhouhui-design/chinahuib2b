'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Download, MessageCircle, Eye, Calendar, Package, Globe, Building2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import ChatWidget from '@/components/chat/ChatWidget'

interface Product {
  id: string
  title: string
  titleEn?: string
  description?: string
  specifications?: any
  minOrderQty?: number
  supplyCapacity?: string
  mainImageUrl: string
  images: string[]
  viewCount: number
  inquiryCount: number
  createdAt: string
  seller: {
    id: string
    companyName: string
    country: string
    city: string
    phone?: string
    email?: string
    website?: string
  }
  category: {
    id: string
    name: string
    nameEn?: string
    slug: string
  }
  brochure?: {
    id: string
    fileName: string
    fileSize: number
    downloadCount: number
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLanguage()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productId}/public`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setProduct(data.product)
      } else {
        setError(data.error || 'Failed to load product')
      }
    } catch (err) {
      console.error('Fetch product error:', err)
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadBrochure = async () => {
    if (!product?.brochure) return
    
    try {
      const response = await fetch(`/api/brochures/${product.brochure.id}/download`)
      const data = await response.json()
      
      if (response.ok && data.fileUrl) {
        window.open(data.fileUrl, '_blank')
      } else {
        alert(data.message || 'Download will be available soon')
      }
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link
            href={`/${language}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const allImages = [product.mainImageUrl, ...product.images.filter(img => img !== product.mainImageUrl)]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/${language}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Exhibition Hall
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <Image
                src={allImages[selectedImage]}
                alt={product.title}
                width={800}
                height={800}
                className="w-full h-full object-cover"
              />
            </div>
            
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} ${idx + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'zh' && product.title ? product.title : product.titleEn || product.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {product.viewCount} views
                </span>
                <span className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {product.inquiryCount} inquiries
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(product.createdAt)}
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-center space-x-2 text-sm">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Category:</span>
              <span className="font-medium text-gray-900">
                {language === 'zh' && product.category.name ? product.category.name : product.category.nameEn || product.category.name}
              </span>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Exhibitor Information</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Building2 className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{product.seller.companyName}</p>
                    <p className="text-sm text-gray-600">
                      {product.seller.city}, {product.seller.country}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Exhibitor
                </button>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-medium text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4">
              {product.minOrderQty && (
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Min Order Quantity</p>
                  <p className="text-xl font-bold text-gray-900">{product.minOrderQty} units</p>
                </div>
              )}
              
              {product.supplyCapacity && (
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Supply Capacity</p>
                  <p className="text-xl font-bold text-gray-900">{product.supplyCapacity}</p>
                </div>
              )}
            </div>

            {/* Brochure Download */}
            {product.brochure && (
              <button
                onClick={handleDownloadBrochure}
                className="w-full inline-flex items-center justify-center px-4 py-3 border-2 border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Brochure ({formatFileSize(product.brochure.fileSize)})
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-8 bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Exhibitor</h3>
            <p className="text-gray-600 mb-4">
              To contact this exhibitor, please sign in or register for a free account.
            </p>
            <div className="flex space-x-3">
              <Link
                href={`/${language}/auth/login?redirect=/products/${productId}`}
                className="flex-1 inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign In
              </Link>
              <Link
                href={`/${language}/auth/register?redirect=/products/${productId}`}
                className="flex-1 inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Register
              </Link>
            </div>
            <button
              onClick={() => setShowContactModal(false)}
              className="mt-3 w-full text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {product && <ChatWidget sellerId={product.seller.id} productId={product.id} />}
    </div>
  )
}
