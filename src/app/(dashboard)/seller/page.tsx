import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Package, Eye, Download, TrendingUp, Plus } from 'lucide-react'

export default async function SellerDashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  // Get seller profile
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!seller) {
    redirect('/become-seller')
  }

  // Get statistics
  const [productCount, totalViews, totalDownloads] = await Promise.all([
    prisma.product.count({
      where: { sellerId: seller.id }
    }),
    prisma.product.aggregate({
      where: { sellerId: seller.id },
      _sum: { viewCount: true }
    }),
    prisma.productBrochure.aggregate({
      where: { product: { sellerId: seller.id } },
      _sum: { downloadCount: true }
    })
  ])

  // Get recent products
  const recentProducts = await prisma.product.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      category: { select: { name: true } }
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back, {seller.companyName}
          </p>
        </div>
        <Link
          href="/seller/products/new"
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{productCount}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <Link
            href="/seller/products"
            className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block"
          >
            View all products →
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalViews._sum.viewCount || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>All time views</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Brochure Downloads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalDownloads._sum.downloadCount || 0}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm text-purple-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Total downloads</span>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
          <Link
            href="/seller/products"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all →
          </Link>
        </div>
        
        {recentProducts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentProducts.map((product: any) => (
              <div key={product.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.mainImageUrl ? (
                        <img
                          src={product.mainImageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{product.title}</h3>
                      <p className="text-sm text-gray-500">{product.category.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {product.viewCount} views • Created {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/products/${product.id}`}
                      target="_blank"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      View
                    </Link>
                    <Link
                      href={`/seller/products/${product.id}/edit`}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">No products yet</p>
            <Link
              href="/seller/products/new"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Manage Your Store</h3>
          <p className="text-blue-100 text-sm mb-4">
            Update your company profile, logo, and banner
          </p>
          <Link
            href="/seller/store"
            className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            Go to Store Settings
          </Link>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Upload Brochures</h3>
          <p className="text-purple-100 text-sm mb-4">
            Add product catalogs and company brochures
          </p>
          <Link
            href="/seller/brochures"
            className="inline-block bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
          >
            Manage Brochures
          </Link>
        </div>
      </div>
    </div>
  )
}
