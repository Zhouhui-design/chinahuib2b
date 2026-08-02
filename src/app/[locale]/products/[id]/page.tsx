/**
 * Product Detail Page - Server-Side Rendering with ISR
 * 
 * Features:
 * - Server-side data fetching
 * - Incremental Static Regeneration (ISR)
 * - Automatic cache invalidation
 * - SEO optimized with geolocation keywords
 * - Fast initial load
 */

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Download, MessageCircle, Eye, Calendar, Package, Globe, Building2 } from 'lucide-react'
import { getProductById } from '@/lib/api/products'
import ChatWidget from '@/components/chat/ChatWidget'
import VisitorTracker from '@/components/VisitorTracker'
import { ProductSchema, BreadcrumbSchema } from '@/components/seo/StructuredData'
import type { Metadata } from 'next'
import { languages } from '@/lib/languages'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

// ISR Configuration
export const revalidate = 3600 // Revalidate every hour

// Generate static params for SSG
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const { id, locale } = await params
  const product = await getProductById(id)

  if (!product) {
    return {}
  }

  const title = locale === 'zh' ? product.title : (product.titleEn || product.title)
  const description = product.description || ''
  const sellerCity = product.seller.city
  const sellerCountry = product.seller.country
  const categoryName = locale === 'zh' ? product.category.name : (product.category.nameEn || product.category.name)

  const geoKeywords = [sellerCity, sellerCountry, `${sellerCity} manufacturer`, `${sellerCountry} supplier`, `${categoryName} ${sellerCountry}`]
  const baseKeywords = [product.title, categoryName, 'wholesale', 'B2B', 'supplier', 'manufacturer']
  const keywords = [...baseKeywords, ...geoKeywords]

  const alternates: Record<string, string> = {}
  const baseUrl = 'https://x2xhub.com'
  
  languages.forEach(lang => {
    const langPath = lang.code === 'en' 
      ? `/products/${id}`
      : `/${lang.code}/products/${id}`
    alternates[lang.code] = `${baseUrl}${langPath}`
  })

  return {
    title: `${title} - ${sellerCity}, ${sellerCountry} ${categoryName} Supplier | SeaHeart Global`,
    description: `${description.substring(0, 150)}... - ${title} from ${sellerCity}, ${sellerCountry} manufacturer. Wholesale B2B platform.`,
    keywords,
    alternates: {
      canonical: `${baseUrl}/products/${id}`,
      languages: alternates,
    },
    openGraph: {
      title: `${title} - ${sellerCity}, ${sellerCountry}`,
      description: `${description.substring(0, 150)}...`,
      url: `${baseUrl}/products/${id}`,
      images: [product.mainImageUrl],
      locale: locale === 'zh' ? 'zh_CN' : `${locale}_${locale.toUpperCase()}`,
    },
    twitter: {
      title: `${title} - ${sellerCity}, ${sellerCountry}`,
      description: `${description.substring(0, 150)}...`,
    },
    other: {
      'geo.region': sellerCountry.toUpperCase(),
      'geo.placename': sellerCity,
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id, locale } = await params
  
  // Fetch product data on server
  const product = await getProductById(id)
  
  if (!product) {
    notFound()
  }
  
  // Prepare breadcrumb schema
  const breadcrumbs = [
    { name: locale === 'zh' ? '首页' : 'Home', url: `/${locale}` },
    { name: locale === 'zh' ? '产品' : 'Products', url: `/${locale}/products` },
    { name: product.title, url: undefined as any } // Last item has no URL
  ]

  const title = locale === 'zh' ? product.title : (product.titleEn || product.title)
  const categoryName = locale === 'zh' ? product.category.name : (product.category.nameEn || product.category.name)
  const imageAltText = `${title}, ${categoryName} from ${product.seller.city}, ${product.seller.country} - ${product.seller.companyName}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Visitor Tracking */}
      <VisitorTracker productId={product.id} sellerId={product.seller.id} />
      
      {/* Schema.org Structured Data */}
      <ProductSchema product={product} />
      <BreadcrumbSchema items={breadcrumbs} />
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href={`/${locale}/products`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {locale === 'zh' ? '返回产品列表' : 'Back to Products'}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              {product.mainImageUrl && !product.mainImageUrl.includes('placeholder') ? (
                product.mainImageUrl.startsWith('/uploads/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.mainImageUrl}
                    alt={imageAltText}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                ) : (
                <Image
                  src={product.mainImageUrl}
                  alt={imageAltText}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={true}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlByb2R1Y3QgSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=="
                />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500">{locale === 'zh' ? '暂无产品图片' : 'No product image available'}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-white rounded-lg overflow-hidden shadow">
                    {!img.includes('placeholder') ? (
                      img.startsWith('/uploads/') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={`${imageAltText} - view ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                      <Image
                        src={img}
                        alt={`${imageAltText} - view ${idx + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        sizes="200px"
                        loading="lazy"
                      />
                    )
                  ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Product Videos */}
            {product.videos && product.videos.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {locale === 'zh' ? '产品视频' : 'Product Videos'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.videos.map((video, idx) => (
                    <div key={idx} className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow">
                      <video
                        src={video}
                        controls
                        className="w-full h-full"
                        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23374151'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Documents */}
            {product.documents && product.documents.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {locale === 'zh' ? '产品文档' : 'Product Documents'}
                </h2>
                <div className="space-y-2">
                  {product.documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      download
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {doc.size > 1024 * 1024 
                              ? `${(doc.size / (1024 * 1024)).toFixed(2)} MB` 
                              : `${(doc.size / 1024).toFixed(1)} KB`}
                          </p>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-blue-600" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Category */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {locale === 'zh' ? product.title : (product.titleEn || product.title)}
              </h1>
              <Link 
                href={`/${locale}/categories/${product.category.slug}`}
                className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                {locale === 'zh' ? product.category.name : (product.category.nameEn || product.category.name)}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {product.viewCount} {locale === 'zh' ? '次浏览' : 'views'}
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                {product.inquiryCount} {locale === 'zh' ? '次询盘' : 'inquiries'}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(product.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {locale === 'zh' ? '产品描述' : 'Description'}
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {locale === 'zh' ? '规格参数' : 'Specifications'}
                </h2>
                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="px-4 py-3 flex justify-between">
                      <span className="text-gray-600">{key}</span>
                      <span className="font-medium text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Info */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              {product.minOrderQty && (
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">
                    {locale === 'zh' ? '最小起订量:' : 'Min Order:'} 
                    <span className="font-semibold ml-1">{product.minOrderQty}</span>
                  </span>
                </div>
              )}
              {product.supplyCapacity && (
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">
                    {locale === 'zh' ? '供应能力:' : 'Supply Capacity:'} 
                    <span className="font-semibold ml-1">{product.supplyCapacity}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                {locale === 'zh' ? '供应商信息' : 'Seller Information'}
              </h3>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {product.seller.companyName}
                </p>
                <p className="text-gray-600">
                  {product.seller.city}, {product.seller.country}
                </p>
                {product.seller.email && (
                  <a 
                    href={`mailto:${product.seller.email}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {product.seller.email}
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                {locale === 'zh' ? '立即询盘' : 'Send Inquiry'}
              </button>
              {product.brochure && (
                <a
                  href={product.brochure.fileName}
                  download
                  className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {locale === 'zh' ? '下载画册' : 'Download'}
                </a>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Chat Widget */}
      <ChatWidget sellerId={product.seller.id} />
    </div>
  )
}
