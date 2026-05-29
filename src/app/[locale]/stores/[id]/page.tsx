/**
 * Store Detail Page - Server-Side Rendering with ISR
 */

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Globe, MapPin, Phone, Mail, Package, Download, MessageCircle, Eye, Calendar, Building2 } from 'lucide-react'
import { getSellerById } from '@/lib/api/sellers'
import ChatWidget from '@/components/chat/ChatWidget'
import { StoreSchema, BreadcrumbSchema } from '@/components/seo/StructuredData'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

// ISR Configuration - Revalidate every hour
export const revalidate = 3600

// Helper function to get description based on locale
function getLocalizedDescription(seller: any, locale: string): string {
  let displayDescription = ''
  
  // Check multi-language descriptions first
  if (seller.descriptions && typeof seller.descriptions === 'object') {
    // Priority: current locale > English > Chinese > any available
    if (seller.descriptions[locale]) {
      displayDescription = seller.descriptions[locale]
    } else if (seller.descriptions['en']) {
      displayDescription = seller.descriptions['en']
    } else if (seller.descriptions['zh']) {
      displayDescription = seller.descriptions['zh']
    } else {
      const firstLang = Object.keys(seller.descriptions)[0]
      displayDescription = seller.descriptions[firstLang] || ''
    }
  }
  
  // Fallback to legacy description field
  if (!displayDescription && seller.description) {
    displayDescription = seller.description
  }
  
  return displayDescription
}

export default async function StoreDetailPage({ params }: Props) {
  const { id, locale } = await params
  
  // Fetch seller data on server
  const seller = await getSellerById(id)
  
  if (!seller) {
    notFound()
  }
  
  // Get localized description
  const description = getLocalizedDescription(seller, locale)
  
  // Prepare breadcrumb schema
  const breadcrumbs = [
    { name: locale === 'zh' ? '首页' : 'Home', url: `/${locale}` },
    { name: locale === 'zh' ? '店铺' : 'Stores', url: `/${locale}/stores` },
    { name: seller.companyName, url: undefined as any }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Schema.org Structured Data */}
      <StoreSchema store={seller} />
      <BreadcrumbSchema items={breadcrumbs} />
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href={`/${locale}/stores`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {locale === 'zh' ? '返回店铺列表' : 'Back to Stores'}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Banner */}
        {seller.bannerUrl && (
          <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden mb-8">
            <Image
              src={seller.bannerUrl}
              alt={seller.companyName}
              fill
              className="object-cover"
              sizes="100vw"
              priority={true}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Store Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Name & Verification */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {seller.logoUrl && (
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                      <Image
                        src={seller.logoUrl}
                        alt={seller.companyName}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {seller.companyName}
                    </h1>
                    {seller.isVerified && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ✓ {locale === 'zh' ? '已认证' : 'Verified'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-gray-400" />
                  <span>{seller.companyType}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                  <span>{seller.city}, {seller.country}</span>
                </div>
                {seller.address && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-2 text-gray-400 mt-1" />
                    <span>{seller.address}</span>
                  </div>
                )}
                {seller.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-gray-400" />
                    <a href={`tel:${seller.phone}`} className="text-blue-600 hover:text-blue-700">
                      {seller.phone}
                    </a>
                  </div>
                )}
                {seller.email && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-gray-400" />
                    <a href={`mailto:${seller.email}`} className="text-blue-600 hover:text-blue-700">
                      {seller.email}
                    </a>
                  </div>
                )}
                {seller.website && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-gray-400" />
                    <a 
                      href={seller.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {seller.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Description - Multi-language support */}
              {description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    {locale === 'zh' ? '公司简介' : 'About Us'}
                  </h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {description}
                  </p>
                </div>
              )}

              {/* Certifications */}
              {seller.certifications.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    {locale === 'zh' ? '认证资质' : 'Certifications'}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {seller.certifications.map((cert, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Products */}
            {seller.products.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Package className="w-6 h-6 mr-2" />
                  {locale === 'zh' ? '产品展示' : 'Products'} 
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({seller.products.length})
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {seller.products.slice(0, 6).map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/products/${product.id}`}
                      className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-square bg-gray-100 relative">
                        <Image
                          src={product.mainImageUrl}
                          alt={locale === 'zh' ? product.title : (product.titleEn || product.title)}
                          fill
                          className="object-cover"
                          sizes="300px"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                          {locale === 'zh' ? product.title : (product.titleEn || product.title)}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {product.viewCount}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {product.inquiryCount}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">
                {locale === 'zh' ? '联系卖家' : 'Contact Seller'}
              </h3>
              
              <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5 mr-2" />
                {locale === 'zh' ? '发送消息' : 'Send Message'}
              </button>
              
              {seller.boothName && (
                <div className="text-center text-sm text-gray-600 mt-4 pt-4 border-t border-gray-200">
                  {locale === 'zh' ? '展位号' : 'Booth'}: 
                  <span className="font-semibold ml-1">{seller.boothName}</span>
                </div>
              )}
            </div>

            {/* Store Brochures */}
            {seller.storeBrochures.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  {locale === 'zh' ? '店铺画册' : 'Brochures'}
                </h3>
                
                <div className="space-y-3">
                  {seller.storeBrochures.map((brochure) => (
                    <a
                      key={brochure.id}
                      href={brochure.fileName}
                      download
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900 mb-1 line-clamp-1">
                        {brochure.title}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{(brochure.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                        <span className="flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          {brochure.downloadCount}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {locale === 'zh' ? '店铺统计' : 'Store Stats'}
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{locale === 'zh' ? '产品数量' : 'Products'}</span>
                  <span className="font-semibold text-gray-900">{seller.products.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{locale === 'zh' ? '加入时间' : 'Joined'}</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(seller.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chat Widget */}
      <ChatWidget sellerId={seller.id} />
    </div>
  )
}
