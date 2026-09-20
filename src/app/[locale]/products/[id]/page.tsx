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
import InquiryModal from '@/components/InquiryModal'
import VisitorTracker from '@/components/VisitorTracker'
import { ProductSchema, BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildProductTitle, localizeCountry, localizeCity } from '@/lib/seo-title'
import type { Metadata } from 'next'
import { languages } from '@/lib/languages'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

// Rendering mode: dynamic (server-rendered per request).
//
// This page must NOT be SSG. The root layout (src/app/layout.tsx) calls
// headers() to derive the locale and hreflang alternates from x-pathname.
// headers() is a dynamic API, so any attempt to prerender this route as static
// HTML throws DYNAMIC_SERVER_USAGE and the page 500s.
//
// A previous `generateStaticParams()` returning [] made this the only SSG (●)
// route in the build, which is exactly what broke every /<locale>/products/<id>
// page. It also prerendered nothing, so it bought no performance either.
// Sibling routes (/[locale], /[locale]/products) are dynamic and work fine.
//
// Caching still happens at the data layer: getProductById() fetches with
// next: { revalidate: 3600, tags: ['product-<id>'] }, so responses stay cheap
// and remain tag-invalidatable.
export const dynamic = 'force-dynamic'

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
  // og:image 主图 fallback
  const ogImage = product.mainImageUrl || (product.images && product.images.length > 0 ? product.images[0] : '')

  // seller.city / seller.country store whatever the seller typed, which is
  // normally Chinese. Rendering "Xiamen, 中国" inside an English or German
  // title mixes scripts and weakens that locale's language signal.
  const localizedCountry = localizeCountry(sellerCountry, locale)
  const localizedCity = localizeCity(sellerCity, locale)

  // Buyers search the native spelling only in that locale. An English page
  // whose keywords include "中国" / "佛山" reads as mixed-language spam to
  // Google, so keep geo keywords in the current locale only.
  const geoKeywords = [
    localizedCity,
    localizedCountry,
    `${localizedCity} manufacturer`,
    `${localizedCountry} supplier`,
    `${categoryName} ${localizedCountry}`,
  ]
  const baseKeywords = [product.title, categoryName, 'wholesale', 'B2B', 'supplier', 'manufacturer']
  const keywords = [...baseKeywords, ...geoKeywords]

  const alternates: Record<string, string> = {}
  const baseUrl = 'https://x2xhub.com'

  languages.forEach(lang => {
    // Every locale, including 'en', must carry its prefix. Pointing 'en' at
    // the unprefixed /products/<id> made the English and German versions
    // declare the same canonical, so Search Console reported "Duplicate
    // without user-selected canonical" and left the page unindexed.
    alternates[lang.code] = `${baseUrl}/${lang.code}/products/${id}`
  })

  // Root layout appends '| SeaHeart Global | 心海环球' via title.template,
  // so the brand must not be repeated here.
  const pageTitle = buildProductTitle({
    title,
    city: localizedCity,
    country: localizedCountry,
    category: categoryName,
  })

  return {
    title: pageTitle,
    description: `${description.substring(0, 150)}... - ${title} from ${localizedCity}, ${localizedCountry} manufacturer. Wholesale B2B platform.`,
    keywords,
    alternates: {
      canonical: `${baseUrl}/${locale}/products/${id}`,
      languages: alternates,
    },
    openGraph: {
      title: `${title} - ${localizedCity}, ${localizedCountry}`,
      description: `${description.substring(0, 150)}...`,
      url: `${baseUrl}/${locale}/products/${id}`,
      ...(ogImage ? { images: [ogImage] } : {}),
      locale: locale === 'zh' ? 'zh_CN' : `${locale}_${locale.toUpperCase()}`,
    },
    twitter: {
      title: `${title} - ${localizedCity}, ${localizedCountry}`,
      description: `${description.substring(0, 150)}...`,
    },
    other: {
      // Use the localized values so an English page does not ship
      // geo.region="中国" — that mixed-language signal is exactly what the
      // SEO audit flagged.
      'geo.region': localizedCountry.toUpperCase(),
      'geo.placename': localizedCity,
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
  // Localize city/country so the alt text matches the page language — raw
  // seller input ("中国", "佛山") on an English page read as mixed-language
  // spam to Google and confused AI crawlers.
  const imageAltText = `${title}, ${categoryName} from ${localizeCity(product.seller.city, locale)}, ${localizeCountry(product.seller.country, locale)} - ${product.seller.companyName}`
  // 主图 fallback：mainImageUrl 为空时，取 images 数组第一张作为主图
  const mainImage = product.mainImageUrl || (product.images && product.images.length > 0 ? product.images[0] : '')

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
              {mainImage && !mainImage.includes('placeholder') ? (
                mainImage.startsWith('/uploads/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mainImage}
                    alt={imageAltText}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                ) : (
                <Image
                  src={mainImage}
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

            {/* Content Differentiation — buyer decision info (only render fields that have values) */}
            {product.applications && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{locale === 'zh' ? '应用场景' : 'Applications'}</h2>
                <p className="text-gray-700 whitespace-pre-line">{product.applications}</p>
              </div>
            )}
            {product.advantages && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{locale === 'zh' ? '产品优势' : 'Product Advantages'}</h2>
                <p className="text-gray-700 whitespace-pre-line">{product.advantages}</p>
              </div>
            )}
            {product.caseStudy && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{locale === 'zh' ? '客户案例' : 'Case Study'}</h2>
                <p className="text-gray-700 whitespace-pre-line">{product.caseStudy}</p>
              </div>
            )}
            {product.customServices && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{locale === 'zh' ? '定制服务' : 'Custom Services'}</h2>
                <p className="text-gray-700 whitespace-pre-line">{product.customServices}</p>
              </div>
            )}
            {(product.targetMarket || product.certifications || product.deliveryTime || product.packaging) && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{locale === 'zh' ? '贸易信息' : 'Trade Information'}</h2>
                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                  {product.targetMarket && (
                    <div className="px-4 py-3 flex justify-between"><span className="text-gray-600">{locale === 'zh' ? '目标市场' : 'Target Market'}</span><span className="font-medium text-gray-900">{product.targetMarket}</span></div>
                  )}
                  {product.certifications && (
                    <div className="px-4 py-3 flex justify-between"><span className="text-gray-600">{locale === 'zh' ? '认证' : 'Certifications'}</span><span className="font-medium text-gray-900">{product.certifications}</span></div>
                  )}
                  {product.deliveryTime && (
                    <div className="px-4 py-3 flex justify-between"><span className="text-gray-600">{locale === 'zh' ? '交期' : 'Delivery Time'}</span><span className="font-medium text-gray-900">{product.deliveryTime}</span></div>
                  )}
                  {product.packaging && (
                    <div className="px-4 py-3 flex justify-between"><span className="text-gray-600">{locale === 'zh' ? '包装' : 'Packaging'}</span><span className="font-medium text-gray-900">{product.packaging}</span></div>
                  )}
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
                {product.seller.storeSlug ? (
                  <Link
                    href={`/${product.seller.storeSlug}`}
                    className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors underline-offset-2 hover:underline"
                  >
                    {product.seller.companyName}
                  </Link>
                ) : (
                  <p className="text-lg font-medium text-gray-900">
                    {product.seller.companyName}
                  </p>
                )}
                <p className="text-gray-600">
                  {localizeCity(product.seller.city, locale)}, {localizeCountry(product.seller.country, locale)}
                </p>
                {(() => {
                  const emails: string[] = []
                  if (product.seller.email?.trim()) emails.push(product.seller.email.trim())
                  if (Array.isArray((product.seller as any).emails)) {
                    for (const v of (product.seller as any).emails as string[]) {
                      if (typeof v === 'string' && v.trim() && !emails.includes(v.trim())) emails.push(v.trim())
                    }
                  }
                  return emails.map((v, i) => (
                    <a
                      key={`p-email-${i}`}
                      href={`mailto:${v}`}
                      className="block text-blue-600 hover:text-blue-700 break-all"
                    >
                      {v}
                    </a>
                  ))
                })()}

                {/* Instant Messaging contacts (only render if any has a value) */}
                {(product.seller.whatsapp || product.seller.wechat || product.seller.telegram || product.seller.qq || product.seller.zangi) && (
                  <div className="pt-2 mt-1 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-1.5">
                      {locale === 'zh' ? '即时通讯' : 'Instant Messaging'}
                    </div>
                    <div className="space-y-1">
                      {product.seller.whatsapp && (
                        <div className="flex items-center text-sm text-gray-700">
                          <span className="w-20 text-gray-400">WhatsApp</span>
                          <span className="font-medium break-all">{product.seller.whatsapp}</span>
                        </div>
                      )}
                      {product.seller.wechat && (
                        <div className="flex items-center text-sm text-gray-700">
                          <span className="w-20 text-gray-400">{locale === 'zh' ? '微信' : 'WeChat'}</span>
                          <span className="font-medium break-all">{product.seller.wechat}</span>
                        </div>
                      )}
                      {product.seller.telegram && (
                        <div className="flex items-center text-sm text-gray-700">
                          <span className="w-20 text-gray-400">Telegram</span>
                          <span className="font-medium break-all">{product.seller.telegram}</span>
                        </div>
                      )}
                      {product.seller.qq && (
                        <div className="flex items-center text-sm text-gray-700">
                          <span className="w-20 text-gray-400">QQ</span>
                          <span className="font-medium break-all">{product.seller.qq}</span>
                        </div>
                      )}
                      {product.seller.zangi && (
                        <div className="flex items-center text-sm text-gray-700">
                          <span className="w-20 text-gray-400">Zangi</span>
                          <span className="font-medium break-all">{product.seller.zangi}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <InquiryModal
                productId={product.id}
                sellerId={product.seller.id}
                productTitle={product.title}
                locale={locale}
              />
              {product.brochure && (
                <a
                  href={`/api/brochures/${product.brochure.id}/download`}
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
