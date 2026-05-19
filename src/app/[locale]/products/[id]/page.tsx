/**
 * Product Detail Page - Server-Side Rendering with ISR
 * 
 * Features:
 * - Server-side data fetching
 * - Incremental Static Regeneration (ISR)
 * - Automatic cache invalidation
 * - SEO optimized
 * - Fast initial load
 */

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Download, MessageCircle, Eye, Calendar, Package, Globe, Building2 } from 'lucide-react'
import { getProductById, incrementProductView } from '@/lib/api/products'
import ChatWidget from '@/components/chat/ChatWidget'
import { ProductSchema, BreadcrumbSchema } from '@/components/seo/StructuredData'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

// ISR Configuration
export const revalidate = 3600 // Revalidate every hour

// Generate static params for SSG
export async function generateStaticParams() {
  // In production, fetch popular products and pre-render them
  // For now, return empty array (will be generated on-demand)
  return []
}

export default async function ProductDetailPage({ params }: Props) {
  const { id, locale } = await params
  
  // Fetch product data on server
  const product = await getProductById(id)
  
  if (!product) {
    notFound()
  }
  
  // Increment view count (non-blocking)
  incrementProductView(id).catch(console.error)
  
  // Prepare breadcrumb schema
  const breadcrumbs = [
    { name: locale === 'zh' ? '首页' : 'Home', url: `/${locale}` },
    { name: locale === 'zh' ? '产品' : 'Products', url: `/${locale}/products` },
    { name: product.title, url: undefined as any } // Last item has no URL
  ]

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Image
                src={product.mainImageUrl}
                alt={product.title}
                width={800}
                height={800}
                className="w-full h-full object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={true}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlByb2R1Y3QgSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=="
              />
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-white rounded-lg overflow-hidden shadow">
                    <Image
                      src={img}
                      alt={`${product.title} ${idx + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                      sizes="200px"
                      loading="lazy"
                    />
                  </div>
                ))}
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
