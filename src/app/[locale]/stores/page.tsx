import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { Building2, MapPin, Package } from 'lucide-react'
import { getDictionary } from '@/locales/dictionary'
import { storeUrl } from '@/lib/store-slug'
import StoresSearchBar from '@/components/stores/StoresSearchBar'
import { languages } from '@/lib/languages'
import type { LanguageCode } from '@/lib/languages'

type PageProps = {
  params: Promise<{ locale: LanguageCode }>
  searchParams: Promise<{ page?: string; search?: string }>
}

const BASE_URL = 'https://x2xhub.com'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const isEn = locale === 'en'

  const title = 'Verified Suppliers & Manufacturers | SeaHeart Global'
  const description = isEn
    ? 'Browse verified global suppliers, manufacturers and exporters. Connect with trusted B2B partners across 13+ languages and 100+ product categories.'
    : '浏览全球认证供应商、制造商和出口商。连接可信赖的 B2B 合作伙伴，覆盖 13+ 语言与 100+ 产品品类。'

  // Keep every locale prefixed (including 'en') so one page shape maps to one
  // canonical. The old code special-cased 'en' to BASE_URL + '/stores', which
  // split /en/stores and /stores into two competing canonicals.
  const alternates: Record<string, string> = {}
  languages.forEach(lang => {
    alternates[lang.code] = BASE_URL + '/' + lang.code + '/stores'
  })
  alternates['x-default'] = BASE_URL + '/en/stores'

  const canonical = BASE_URL + '/' + locale + '/stores'

  return {
    title,
    description,
    keywords: ['B2B supplier', 'manufacturer', 'verified supplier', 'exporter', 'wholesale', 'global trade', 'supplier directory'],
    alternates: { canonical, languages: alternates },
    openGraph: { title, description, type: 'website', url: canonical, siteName: 'SeaHeart Global' },
  }
}

function buildPageUrl(locale: string, page: number, search: string) {
  const qs = new URLSearchParams()
  qs.set('page', String(page))
  if (search) qs.set('search', search)
  return `/${locale}/stores?${qs.toString()}`
}

async function getSellers(page: number = 1, limit: number = 12, search?: string) {
  try {
    const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'
    const searchQuery = search ? `&search=${encodeURIComponent(search)}` : ''
    const res = await fetch(
      `${baseUrl}/api/sellers/public?page=${page}&limit=${limit}${searchQuery}`,
      { 
        cache: 'no-store',
        next: { revalidate: 60 }
      }
    )
    
    if (!res.ok) {
      throw new Error('Failed to fetch sellers')
    }
    
    return res.json()
  } catch (error) {
    console.error('Error fetching sellers:', error)
    return { sellers: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 1 } }
  }
}

export default async function StoresPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const sp = await searchParams
  const currentPage = parseInt(sp.page || '1')
  const search = sp.search || ''
  const dict = await getDictionary(locale)
  
  const { sellers, pagination } = await getSellers(currentPage, 12, search)

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">{dict.stores.title}</h1>
          <p className="mt-2 text-gray-600">{dict.stores.subtitle}</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search / Filter */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Suspense fallback={<div className="h-10 w-full max-w-2xl bg-gray-100 rounded-lg animate-pulse" />}>
            <StoresSearchBar placeholder={dict.stores.searchPlaceholder || '搜索公司、产品、展会、关键词…'} buttonText={dict.stores.searchButton || '搜索'} />
          </Suspense>
          {search && (
            <div className="text-sm text-gray-500 whitespace-nowrap">
              {'搜索'}：<span className="font-medium text-blue-600">“{search}”</span>
            </div>
          )}
        </div>

        {sellers.length > 0 ? (
          <>
            {/* Result count */}
            <div className="mb-4 text-sm text-gray-600">
              {dict.stores.foundCount
                ? dict.stores.foundCount.replace('{total}', String(pagination.total))
                : `共 ${pagination.total} 家公司`}
            </div>

            {/* Sellers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellers.map((seller: any) => (
                <Link
                  key={seller.id}
                  href={storeUrl(seller)}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Banner (object-contain: 完整自适应显示, 不裁剪) */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {seller.bannerUrl ? (
                      <Image
                        src={seller.bannerUrl}
                        alt={`${seller.companyName} banner`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
                        <Building2 className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                  </div>

                  {/* Company Info (logo 移至横幅下方, 不再遮挡横幅) */}
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-3">
                      {seller.logoUrl && (
                        <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                          <Image
                            src={seller.logoUrl}
                            alt={`${seller.companyName} logo`}
                            width={56}
                            height={56}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {seller.companyName}
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">{seller.companyType}</p>
                        </div>
                        {seller.isVerified && (
                          <span className="inline-flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex-shrink-0">
                            ✓ {dict.stores.verified}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {seller.city}, {seller.country}
                    </div>

                    {/* Description Preview */}
                    {seller.description && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {seller.description.replace(/<[^>]*>/g, '')}
                      </p>
                    )}

                    {/* Products Preview */}
                    {seller.products && seller.products.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Package className="w-4 h-4 mr-1" />
                          <span>{seller.products.length}+ {dict.stores.products}</span>
                        </div>
                        <div className="flex gap-2">
                          {seller.products.slice(0, 3).map((product: any) => (
                            <div key={product.id} className="w-16 h-16 rounded bg-gray-100 overflow-hidden">
                              {product.mainImageUrl ? (
                                <Image
                                  src={product.mainImageUrl}
                                  alt={product.title}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                  No img
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination with stats */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              {/* Stats summary */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                <div className="text-sm text-gray-600">
                  {dict.stores.foundCount
                    ? dict.stores.foundCount.replace('{total}', String(pagination.total))
                    : `共 ${pagination.total} 家公司`}
                </div>
                <div className="text-sm text-gray-500">
                  {pagination.totalPages > 0
                    ? `${dict.pagination.page || '第'} ${currentPage} / ${pagination.totalPages} ${dict.pagination.of || '页'}`
                    : ''}
                </div>
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex justify-center">
                  <nav className="flex items-center space-x-2">
                    {currentPage > 1 && (
                      <Link
                        href={buildPageUrl(locale, currentPage - 1, search)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {dict.pagination.previous}
                      </Link>
                    )}
                    
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <Link
                          key={pageNum}
                          href={buildPageUrl(locale, pageNum, search)}
                          className={`px-4 py-2 border rounded-md text-sm font-medium ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      )
                    })}
                    
                    {currentPage < pagination.totalPages && (
                      <Link
                        href={buildPageUrl(locale, currentPage + 1, search)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {dict.pagination.next}
                      </Link>
                    )}
                  </nav>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {search ? (dict.stores.noSearchResults || '未找到相关结果') : dict.stores.noExhibitors}
            </h3>
            <p className="text-gray-600">
              {search ? (dict.stores.noSearchResultsDesc || '请尝试其他关键词') : dict.stores.noExhibitorsDesc}
            </p>
          </div>
        )}
      </main>
    </>
  )
}
