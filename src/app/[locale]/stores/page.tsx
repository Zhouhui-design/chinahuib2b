import Link from 'next/link'
import Image from 'next/image'
import { Building2, MapPin, Package } from 'lucide-react'
import { getDictionary } from '@/locales/dictionary'
import type { LanguageCode } from '@/lib/languages'
import LanguageSwitcher from '@/components/language/LanguageSwitcher'

type PageProps = {
  params: Promise<{ locale: LanguageCode }>
  searchParams: Promise<{ page?: string }>
}

async function getSellers(page: number = 1, limit: number = 12) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(
      `${baseUrl}/api/sellers?page=${page}&limit=${limit}`,
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
  const dict = await getDictionary(locale)
  
  const { sellers, pagination } = await getSellers(currentPage)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-xl font-bold text-gray-800 hidden sm:block">Global Expo</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href={`/${locale}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                {dict.nav.home}
              </Link>
              <Link href={`/${locale}/products`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                {dict.nav.products}
              </Link>
              <Link href={`/${locale}/stores`} className="text-sm font-medium text-blue-600 transition-colors">
                {dict.nav.exhibitors}
              </Link>
            </div>

            {/* Right side - Language Switcher & Auth */}
            <div className="flex items-center space-x-4">
              <LanguageSwitcher currentLocale={locale} />
              
              <div className="flex items-center space-x-3">
                <Link
                  href={`/${locale}/auth/login`}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {dict.nav.login}
                </Link>
                <Link
                  href={`/${locale}/auth/register`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {dict.nav.register}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">{dict.stores.title}</h1>
          <p className="mt-2 text-gray-600">{dict.stores.subtitle}</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sellers.length > 0 ? (
          <>
            {/* Sellers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellers.map((seller: any) => (
                <Link
                  key={seller.id}
                  href={`/${locale}/stores/${seller.id}`}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Banner/Logo */}
                  <div className="relative h-48 bg-gradient-to-r from-blue-600 to-blue-800">
                    {seller.bannerUrl ? (
                      <Image
                        src={seller.bannerUrl}
                        alt={`${seller.companyName} banner`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    
                    {/* Logo Overlay */}
                    {seller.logoUrl && (
                      <div className="absolute bottom-4 left-4 w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-md">
                        <Image
                          src={seller.logoUrl}
                          alt={`${seller.companyName} logo`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Company Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {seller.companyName}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">{seller.companyType}</p>
                      </div>
                      {seller.isVerified && (
                        <span className="inline-flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          ✓ {dict.stores.verified}
                        </span>
                      )}
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/${locale}/stores?page=${currentPage - 1}`}
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
                        href={`/${locale}/stores?page=${pageNum}`}
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
                      href={`/${locale}/stores?page=${currentPage + 1}`}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {dict.pagination.next}
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{dict.stores.noExhibitors}</h3>
            <p className="text-gray-600">{dict.stores.noExhibitorsDesc}</p>
          </div>
        )}
      </main>
    </div>
  )
}
