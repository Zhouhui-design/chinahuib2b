import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function HomePage() {
  const session = await auth()
  
  // Fetch featured products (latest 6)
  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      seller: { select: { companyName: true, country: true } },
      category: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 6
  })

  // Fetch categories
  const categories = await prisma.category.findMany({
    where: { level: 1 },
    include: {
      children: {
        include: {
          children: true
        }
      }
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              🌏 Global Expo Network
            </Link>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search exhibits or exhibitors..."
                className="px-4 py-2 border border-gray-300 rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {session ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Hello, {session.user?.name}</span>
                  <Link
                    href="/api/auth/signout"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Sign Out
                  </Link>
                </div>
              ) : (
                <div className="space-x-2">
                  <Link
                    href="/auth/login"
                    className="text-sm text-gray-700 hover:text-blue-600"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to the Global Exhibition Hall
          </h1>
          <p className="text-xl mb-8">
            Discover quality products from manufacturers worldwide
          </p>
          <div className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold">
            Browse Exhibits • Connect with Suppliers • Download Brochures
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Navigation Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">📂 Exhibition Zones</h2>
              <nav className="space-y-2">
                {categories.map((category: any) => (
                  <div key={category.id}>
                    <Link
                      href={`/products?category=${category.slug}`}
                      className="block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded"
                    >
                      {category.name}
                    </Link>
                    {category.children.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1">
                        {category.children.map((subCategory: any) => (
                          <Link
                            key={subCategory.id}
                            href={`/products?category=${subCategory.slug}`}
                            className="block px-3 py-1 text-sm text-gray-600 hover:text-blue-600"
                          >
                            • {subCategory.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🔥 Featured Exhibits</h2>
              <p className="text-gray-600 mt-1">Latest products from our exhibitors</p>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">Product Image</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <Link
                          href={`/stores/${product.seller.id}`}
                          className="hover:text-blue-600 block"
                        >
                          🏢 {product.seller.companyName}
                        </Link>
                        <p>📍 {product.seller.country}</p>
                        <p>📁 {product.category.name}</p>
                      </div>
                      <Link
                        href={`/products/${product.id}`}
                        className="mt-3 block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                      >
                        View Exhibit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-600">No products yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-2">Global Expo Network</h3>
              <p className="text-sm text-gray-400">
                Your gateway to global B2B trade exhibitions
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Quick Links</h3>
              <ul className="space-y-1 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/rules" className="hover:text-white">Exhibition Rules</Link></li>
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">Contact</h3>
              <p className="text-sm text-gray-400">
                For support: support@chinahuib2b.top
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2026 Global Expo Network. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
