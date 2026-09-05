import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Calendar, MapPin, Building2, ArrowRight, Package, Search } from 'lucide-react'
import BoothFilterBar from '@/components/exhibition/BoothFilterBar'
import Pagination from '@/components/exhibition/Pagination'

export const revalidate = 3600 // 1 hour ISR

export const metadata = {
  title: 'Exhibitions | x2xhub Global Trade Platform',
  description: 'Browse all exhibitions and virtual booths on x2xhub. Connect with global manufacturers, suppliers, and buyers through our digital trade show platform.',
  keywords: ['exhibitions', 'trade shows', 'virtual booths', 'B2B marketplace', 'global trade', 'suppliers', 'manufacturers'],
  alternates: {
    // /exhibitions 301-redirects to /en/exhibitions (middleware locale redirect),
    // so the canonical must match the redirect target, not the pre-redirect URL.
    canonical: 'https://x2xhub.com/en/exhibitions',
  },
  openGraph: {
    title: 'Exhibitions | x2xhub Global Trade Platform',
    description: 'Browse all exhibitions and virtual booths on x2xhub.',
    url: 'https://x2xhub.com/exhibitions',
    type: 'website',
  },
}

const PAGE_SIZE = 12

async function getBooths(searchParams: Record<string, string | string[] | undefined>) {
  const exhibition = (searchParams.exhibition as string)?.trim()
  const company = (searchParams.company as string)?.trim()
  const product = (searchParams.product as string)?.trim()
  const keyword = (searchParams.keyword as string)?.trim()
  const page = Math.max(1, parseInt((searchParams.page as string) || '1', 10) || 1)

  const where: any = {
    isActive: true,
    isPublished: true,
  }

  if (exhibition) {
    where.OR = [
      ...(where.OR || []),
      { exhibitionName: { contains: exhibition, mode: 'insensitive' } },
      { name: { contains: exhibition, mode: 'insensitive' } },
      { location: { contains: exhibition, mode: 'insensitive' } },
    ]
  }

  if (company) {
    where.seller = {
      ...(where.seller || {}),
      companyName: { contains: company, mode: 'insensitive' },
    }
  }

  if (product) {
    where.products = {
      ...(where.products || {}),
      some: {
        isActive: true,
        OR: [
          { title: { contains: product, mode: 'insensitive' } },
          { titleEn: { contains: product, mode: 'insensitive' } },
        ],
      },
    }
  }

  if (keyword) {
    const kw = keyword as string;
    const kwBoothRows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT b.id FROM "Booth" b
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(COALESCE(b."keywords", '[]'::jsonb)) AS k
        WHERE k ILIKE ${'%' + kw + '%'}
      ) OR EXISTS (
        SELECT 1 FROM "Product" p
        WHERE p."boothId" = b.id AND p."isActive" = true AND EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(COALESCE(p."keywords", '[]'::jsonb)) AS pk
          WHERE pk ILIKE ${'%' + kw + '%'}
        )
      )
    `;
    const kwBoothIds = kwBoothRows.map((r) => r.id);

    where.OR = [
      ...(where.OR || []),
      ...(kwBoothIds.length > 0 ? [{ id: { in: kwBoothIds } }] : []),
      { exhibitionName: { contains: kw, mode: 'insensitive' } },
      { name: { contains: kw, mode: 'insensitive' } },
      {
        products: {
          some: {
            isActive: true,
            OR: [
              { title: { contains: kw, mode: 'insensitive' } },
              { titleEn: { contains: kw, mode: 'insensitive' } },
            ],
          },
        },
      },
    ]
  }

  const total = await prisma.booth.count({ where })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const booths = await prisma.booth.findMany({
    where,
    select: {
      id: true,
      name: true,
      exhibitionName: true,
      location: true,
      createdAt: true,
      _count: { select: { products: { where: { isActive: true } } } },
      seller: { select: { companyName: true, companyType: true, country: true, city: true } },
    },
    orderBy: [{ createdAt: 'desc' }],
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  return { booths, total, totalPages, currentPage: safePage, pageSize: PAGE_SIZE }
}

export default async function ExhibitionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const { booths, total, totalPages, currentPage, pageSize } = await getBooths(sp)

  const totalListedProducts = booths.reduce((a, b) => a + (b._count.products || 0), 0)

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
              <span>{total} Total Shows</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/15">
              <Package className="w-4 h-4" />
              <span>{totalListedProducts} listed products</span>
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

        <BoothFilterBar locale="en" />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 text-sm text-gray-600">
          <span>
            Found <span className="font-semibold text-gray-900">{total}</span> shows
          </span>
          <span className="text-gray-500">
            {pageSize} per page · Page {currentPage}/{totalPages}
          </span>
        </div>

        {booths.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No matching exhibitions found</h3>
            <p className="text-gray-500">Try different keywords or reset the filters.</p>
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

        <Pagination
          locale="en"
          basePath="/exhibitions"
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </section>
    </main>
  )
}
