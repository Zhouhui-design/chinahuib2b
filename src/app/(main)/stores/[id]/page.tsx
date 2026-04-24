import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import ChatButton from '@/components/chat/ChatButton'
import { MapPin, Building2, Download, Phone, Mail, Globe, ArrowLeft, Award, FileText } from 'lucide-react'

interface StorePageProps {
  params: Promise<{ id: string }>
}

export default async function StorePage({ params }: StorePageProps) {
  const session = await auth()
  const { id } = await params
  
  // Fetch seller profile with all related data
  const seller = await prisma.sellerProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: { email: true, username: true }
      },
      products: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } }
        }
      },
      storeBrochures: {
        orderBy: { sortOrder: 'asc' }
      }
    },
  })

  if (!seller || !seller.isActive) {
    notFound()
  }

  // Record contact view if user is logged in
  if (session?.user?.id) {
    await prisma.contactView.upsert({
      where: {
        viewerId_sellerId: {
          viewerId: session.user.id,
          sellerId: seller.id
        }
      },
      create: {
        viewerId: session.user.id,
        sellerId: seller.id
      },
      update: {
        viewedAt: new Date()
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Exhibition Hall
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Header Banner */}
        <div className="relative h-64 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg overflow-hidden mb-8">
          {seller.bannerUrl ? (
            <Image
              src={seller.bannerUrl}
              alt={`${seller.companyName} banner`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <Building2 className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <h1 className="text-3xl font-bold">{seller.companyName}</h1>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Company Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Company Profile Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start space-x-4 mb-4">
                {seller.logoUrl ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={seller.logoUrl}
                      alt={`${seller.companyName} logo`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-10 h-10 text-blue-600" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{seller.companyName}</h2>
                  <p className="text-sm text-gray-600 mt-1">{seller.companyType}</p>
                  {seller.isVerified && (
                    <span className="inline-flex items-center mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      ✓ Verified Exhibitor
                    </span>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2 text-sm">
                <p className="flex items-center text-gray-700">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  {seller.city}, {seller.country}
                </p>
                {seller.address && (
                  <p className="text-gray-600 pl-6">{seller.address}</p>
                )}
              </div>

              {/* Certifications */}
              {seller.certifications && seller.certifications.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <Award className="w-4 h-4 mr-1" />
                    Certifications
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {seller.certifications.map((cert: string, idx: number) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            {session ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                  📞 Contact Information
                </h3>
                <div className="space-y-3 text-sm">
                  {seller.phone && (
                    <p className="flex items-center text-blue-800">
                      <Phone className="w-4 h-4 mr-2" />
                      <a href={`tel:${seller.phone}`} className="hover:underline">{seller.phone}</a>
                    </p>
                  )}
                  {seller.email && (
                    <p className="flex items-center text-blue-800">
                      <Mail className="w-4 h-4 mr-2" />
                      <a href={`mailto:${seller.email}`} className="hover:underline">{seller.email}</a>
                    </p>
                  )}
                  {seller.website && (
                    <p className="flex items-center text-blue-800">
                      <Globe className="w-4 h-4 mr-2" />
                      <a href={seller.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {seller.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-800 text-sm mb-3">
                  🔒 Login to view contact information
                </p>
                <Link
                  href={`/auth/login?callbackUrl=/stores/${seller.id}`}
                  className="inline-block bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
                >
                  Login Now
                </Link>
              </div>
            )}

            {/* Chat Button */}
            <ChatButton sellerId={seller.id} />
          </div>

          {/* Right Column - Products & Resources */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Description */}
            {seller.description && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Company Profile</h3>
                <div 
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: seller.description }}
                />
              </div>
            )}

            {/* Products Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                All Products ({seller.products.length})
              </h3>
              
              {seller.products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {seller.products.map((product: any) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                    >
                      <div className="aspect-square bg-gray-100 relative">
                        {product.mainImageUrl ? (
                          <img
                            src={product.mainImageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600">
                          {product.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-1">{product.category.name}</p>
                        {product.minOrderQty && (
                          <p className="text-xs text-gray-500">
                            MOQ: {product.minOrderQty} pieces
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <p className="text-gray-600">No products yet</p>
                </div>
              )}
            </div>

            {/* Store Brochures / Resources */}
            {seller.storeBrochures && seller.storeBrochures.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Downloadable Resources
                </h3>
                
                <div className="bg-white rounded-lg border border-gray-200 divide-y">
                  {seller.storeBrochures.map((brochure: any) => (
                    <div key={brochure.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                          <FileText className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{brochure.title}</p>
                          <p className="text-xs text-gray-500">
                            {(brochure.fileSize / 1024 / 1024).toFixed(2)} MB • 
                            Downloaded {brochure.downloadCount} times
                          </p>
                        </div>
                      </div>
                      <a
                        href={`/api/brochures/${brochure.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
