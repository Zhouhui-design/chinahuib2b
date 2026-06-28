import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getSEOConfig } from '@/lib/seo'
import type { Metadata } from 'next'
import AnnouncementBar from '@/components/AnnouncementBar'
import DisclaimerModal from '@/components/DisclaimerModal'
import DisclaimerTicker from '@/components/DisclaimerTicker'
import Navbar from '@/components/Navbar'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOConfig('/')
  return seo || {}
}

export default async function HomePage() {
  // Fetch featured products (latest 6)
  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      seller: { select: { companyName: true, country: true, boothName: true } },
      category: { select: { name: true } },
      booth: { select: { name: true, exhibitionName: true } }
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
      {/* Announcement Bar - Top */}
      <AnnouncementBar />
      
      {/* Disclaimer Modal - Popup on first visit per session */}
      <DisclaimerModal />
      
      {/* Navigation Bar */}
      <Navbar locale="en" />
      
      {/* Disclaimer Ticker - Below Header */}
      <DisclaimerTicker />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🌍 Welcome to Global B2B Trading Hub
          </h1>
          <p className="text-xl mb-8">
            Buy, Sell, Chat & Trade with the World
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Link
              href="/chat-hall"
              className="bg-white/20 hover:bg-white/30 backdrop-blur px-6 py-4 rounded-xl transition"
            >
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-bold mb-1">Chat Hall</h3>
              <p className="text-sm opacity-90">Public Chat & Shout Outs</p>
            </Link>
            <Link
              href="/auction-screen"
              className="bg-white/20 hover:bg-white/30 backdrop-blur px-6 py-4 rounded-xl transition"
            >
              <div className="text-3xl mb-2">🏪</div>
              <h3 className="font-bold mb-1">Auction Screen</h3>
              <p className="text-sm opacity-90">Buy & Sell Listings</p>
            </Link>
            <Link
              href="/stores"
              className="bg-white/20 hover:bg-white/30 backdrop-blur px-6 py-4 rounded-xl transition"
            >
              <div className="text-3xl mb-2">🏪</div>
              <h3 className="font-bold mb-1">Exhibitor Booths</h3>
              <p className="text-sm opacity-90">Visit & Customize Booths</p>
            </Link>
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
                        {product.seller.boothName && (
                          <p>🏷️ {product.seller.boothName}</p>
                        )}
                        {product.booth && (
                          <p>🎪 {product.booth.exhibitionName || product.booth.name}</p>
                        )}
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
              <p className="text-sm text-gray-400 mb-2">
                Email: support@x2xhub.com
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Skype: aardenx@outlook.com
              </p>
              <div className="flex space-x-3">
                <a 
                  href="skype:aardenx@outlook.com?chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                  title="Skype"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.84 13.58c-.28.28-.66.44-1.07.44h-1.29c-.41 0-.79-.16-1.07-.44l-1.41-1.41c-.28-.28-.44-.66-.44-1.07v-1.29c0-.41.16-.79.44-1.07l1.41-1.41c.28-.28.66-.44 1.07-.44h1.29c.41 0 .79.16 1.07.44l1.41 1.41c.28.28.44.66.44 1.07v1.29c0 .41-.16.79-.44 1.07l-1.41 1.41zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
                  </svg>
                </a>
              </div>
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
