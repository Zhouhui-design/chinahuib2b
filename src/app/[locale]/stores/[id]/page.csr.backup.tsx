'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Globe, MapPin, Phone, Mail, Package, Download, MessageCircle, Eye, Calendar } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import ChatWidget from '@/components/chat/ChatWidget'

interface Seller {
  id: string
  companyName: string
  companyType: string
  country: string
  city: string
  address?: string
  phone?: string
  email?: string
  website?: string
  description?: string
  logoUrl?: string
  bannerUrl?: string
  certifications: string[]
  boothName?: string
  isVerified: boolean
  createdAt: string
  products: Array<{
    id: string
    title: string
    titleEn?: string
    mainImageUrl: string
    viewCount: number
    inquiryCount: number
    category: {
      name: string
      nameEn?: string
    }
  }>
  storeBrochures: Array<{
    id: string
    title: string
    fileName: string
    fileSize: number
    downloadCount: number
  }>
}

export default function StoreDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLanguage()
  const sellerId = params.id as string
  
  const [seller, setSeller] = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'brochures'>('products')

  useEffect(() => {
    fetchSeller()
  }, [sellerId])

  const fetchSeller = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sellers/${sellerId}/public`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setSeller(data.seller)
      } else {
        setError(data.error || 'Failed to load store')
      }
    } catch (err) {
      console.error('Fetch seller error:', err)
      setError('Failed to load store')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadBrochure = async (brochureId: string) => {
    try {
      const response = await fetch(`/api/brochures/${brochureId}/download`)
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

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Store not found'}</p>
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

      {/* Banner */}
      {seller.bannerUrl ? (
        <div className="h-64 bg-gray-200 relative">
          <Image
            src={seller.bannerUrl}
            alt={seller.companyName}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">{seller.companyName}</h1>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Company Info */}
          <div className="space-y-6">
            {/* Company Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {seller.logoUrl && (
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={seller.logoUrl}
                    alt={seller.companyName}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                {seller.companyName}
              </h2>
              
              {seller.isVerified && (
                <div className="flex items-center justify-center mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Verified Exhibitor
                  </span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">
                      {seller.city}, {seller.country}
                    </p>
                    {seller.address && (
                      <p className="text-sm text-gray-600 mt-1">{seller.address}</p>
                    )}
                  </div>
                </div>

                {seller.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{seller.phone}</p>
                    </div>
                  </div>
                )}

                {seller.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{seller.email}</p>
                    </div>
                  </div>
                )}

                {seller.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <a 
                        href={seller.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        {seller.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push(`/${language}/auth/login?redirect=/stores/${sellerId}`)}
                className="w-full mt-6 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Exhibitor
              </button>
            </div>

            {/* Certifications */}
            {seller.certifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
                <div className="space-y-2">
                  {seller.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-sm text-gray-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'products'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Products ({seller.products.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'about'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    About
                  </button>
                  <button
                    onClick={() => setActiveTab('brochures')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'brochures'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Brochures ({seller.storeBrochures.length})
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'products' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {seller.products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/${language}/products/${product.id}`}
                        className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="aspect-square bg-gray-100 relative">
                          <Image
                            src={product.mainImageUrl}
                            alt={language === 'zh' && product.title ? product.title : product.titleEn || product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {language === 'zh' && product.title ? product.title : product.titleEn || product.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {language === 'zh' && product.category.name ? product.category.name : product.category.nameEn || product.category.name}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {product.viewCount}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {product.inquiryCount}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {activeTab === 'about' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Company Description</h3>
                    {seller.description ? (
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: seller.description }}
                      />
                    ) : (
                      <p className="text-gray-600">No description available.</p>
                    )}
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Company Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Company Type</p>
                          <p className="font-medium text-gray-900 capitalize">{seller.companyType.toLowerCase()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Member Since</p>
                          <p className="font-medium text-gray-900">
                            {new Date(seller.createdAt).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
                              year: 'numeric',
                              month: 'long'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'brochures' && (
                  <div className="space-y-4">
                    {seller.storeBrochures.length > 0 ? (
                      seller.storeBrochures.map((brochure) => (
                        <div key={brochure.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                              <Download className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{brochure.title}</h4>
                              <p className="text-sm text-gray-600">
                                {formatFileSize(brochure.fileSize)} • {brochure.downloadCount} downloads
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadBrochure(brochure.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-8">No brochures available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      {seller && <ChatWidget sellerId={seller.id} />}
    </div>
  )
}
