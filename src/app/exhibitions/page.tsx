import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Calendar, MapPin, Building2, ArrowRight, Package } from 'lucide-react'

export const revalidate = 3600 // 1 hour ISR

export const metadata = {
  title: 'Exhibitions | x2xhub Global Trade Platform',
  description: 'Browse all exhibitions and virtual booths on x2xhub. Connect with global manufacturers, suppliers, and buyers through our digital trade show platform.',
  keywords: ['exhibitions', 'trade shows', 'virtual booths', 'B2B marketplace', 'global trade', 'suppliers', 'manufacturers'],
  alternates: {
    canonical: 'https://x2xhub.com/exhibitions',
  },
  openGraph: {
    title: 'Exhibitions | x2xhub Global Trade Platform',
    description: 'Browse all exhibitions and virtual booths on x2xhub.',
    url: 'https://x2xhub.com/exhibitions',
    type: 'website',
  },
}

async function getBooths() {
  return prisma.booth.findMany({
    where: {
      isActive: true,
      isPublished: true,
    },
    select: {
      id: true,
      name: true,
      exhibitionName: true,
      location: true,
      createdAt: true,
      _count: {
        select: {
          products: { where: { isActive: true } },
        },
      },
      seller: {
        select: {
          companyName: true,
          companyType: true,
          country: true,
          city: true,
        },
      },
    },
    orderBy: [
      { createdAt: 'desc' },
    ],
    take: 100,
  })
}

function formatDate(d: Date | string | null) {
  if (!d) return null
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default async function ExhibitionsPage() {
  const booths = await getBooths()

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
          <p className="text-blue-100 text-sm font-medium tracking-wider uppercase mb-3">
            Global Trade Shows
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Discover Exhibitions & Virtual Booths
          </h1>
          <p className="text-xl text-blue-50 max-w-2xl mb-8">
            Connect with verified global manufacturers and suppliers through our curated digital exhibition booths. Explore trade shows, access product catalogs, and start business conversations — all in one place.
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/15">
              <Building2 className="w-4 h-4" />
              <span>{booths.length} active booths</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/15">
              <Package className="w-4 h-4" />
              <span>
                {booths.reduce((a, b) => a + (b._count.products || 0), 0)} listed products
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              All Exhibitions & Booths
            </h2>
            <p className="text-gray-600 mt-2">
              Explore our list of active trade shows and registered company booths from around the world.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="hidden sm:inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Browse Marketplace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {booths.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No exhibitions yet</h3>
            <p className="text-gray-500">
              Check back soon — new trade shows and company booths are added regularly.
            </p>
            <Link
              href="/marketplace"
              className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              Explore Marketplace
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {booths.map(b => {
              const city = (b.seller?.city as string | undefined) || ''
              const country = (b.seller?.country as string | undefined) || ''
              const location = [b.location, city, country].filter(Boolean)[0] || '—'
              const company = b.seller?.companyName || ''
              const exhibitionName = b.exhibitionName || b.name || 'Company Virtual Booth'

              return (
                <Link
                  key={b.id}
                  href={`/exhibitions/${b.id}`}
                  className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                      {exhibitionName}
                    </h3>
                  </div>

                  {company && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Building2 className="w-4 h-4 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{company}</span>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{location}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Package className="w-4 h-4" />
                      <span>{b._count.products || 0} products</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-blue-600 font-medium group-hover:gap-2 transition-all">
                      Visit
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
