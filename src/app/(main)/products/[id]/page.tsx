import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import ImageCarousel from '@/components/exhibition/ImageCarousel'
import ChatButton from '@/components/chat/ChatButton'
import Link from 'next/link'
import { MapPin, Building2, Download, Phone, Mail, Globe, ArrowLeft } from 'lucide-react'

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const session = await auth()
  const { id } = await params
  
  // Fetch product with all related data
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      seller: {
        include: {
          user: {
            select: { email: true }
          }
        }
      },
      category: true,
      brochure: true,
    },
  })

  if (!product || !product.isActive) {
    notFound()
  }

  // Increment view count
  await prisma.product.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  })

  // Fetch related products from same seller
  const relatedProducts = await prisma.product.findMany({
    where: {
      sellerId: product.sellerId,
      id: { not: product.id },
      isActive: true,
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })

  const specifications = product.specifications as any

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image Gallery */}
          <div>
            <ImageCarousel images={product.images || [product.mainImageUrl]} />
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Title & Category */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {product.category.name}
                </span>
                {product.isFeatured && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    ⭐ Featured
                  </span>
                )}
              </div>
            </div>

            {/* Seller Info Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Building2 className="w-4 h-4 mr-1" />
                    {product.seller.companyName}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {product.seller.city}, {product.seller.country}
                  </p>
                </div>
                {product.seller.isVerified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    ✓ Verified
                  </span>
                )}
              </div>
              
              {/* Certifications */}
              {product.seller.certifications && product.seller.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.seller.certifications.map((cert: string, idx: number) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {cert}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications */}
            {specifications && Object.keys(specifications).length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">📋 Specifications</h3>
                <div className="space-y-2">
                  {Object.entries(specifications).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="font-medium text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                  {product.minOrderQty && (
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-gray-600">Min Order Qty:</span>
                      <span className="font-medium text-gray-900">{product.minOrderQty} pieces</span>
                    </div>
                  )}
                  {product.supplyCapacity && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Supply Capacity:</span>
                      <span className="font-medium text-gray-900">{product.supplyCapacity}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Download Brochure */}
              {product.brochure && (
                <a
                  href={`/api/brochures/${product.brochure.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Product Brochure (PDF)
                </a>
              )}

              {/* Contact Exhibitor Button */}
              <ChatButton sellerId={product.sellerId} productId={product.id} />

              {/* View Contact Info */}
              {session ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    📞 Contact Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    {product.seller.phone && (
                      <p className="flex items-center text-blue-800">
                        <Phone className="w-4 h-4 mr-2" />
                        {product.seller.phone}
                      </p>
                    )}
                    {product.seller.email && (
                      <p className="flex items-center text-blue-800">
                        <Mail className="w-4 h-4 mr-2" />
                        {product.seller.email}
                      </p>
                    )}
                    {product.seller.website && (
                      <p className="flex items-center text-blue-800">
                        <Globe className="w-4 h-4 mr-2" />
                        <a href={product.seller.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {product.seller.website}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-yellow-800 text-sm">
                    🔒 Login to view contact information and chat with exhibitor
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">More from this Exhibitor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct: any) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {relatedProduct.mainImageUrl ? (
                      <img
                        src={relatedProduct.mainImageUrl}
                        alt={relatedProduct.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {relatedProduct.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
