import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Calendar, MapPin, Building2, ArrowRight, Package, Search } from 'lucide-react'
import { notFound } from 'next/navigation'
import BoothFilterBar from '@/components/exhibition/BoothFilterBar'
import Pagination from '@/components/exhibition/Pagination'
import { buildAlternates } from '@/lib/hreflang'
import { localizeCountry, localizeCity } from '@/lib/seo-title'

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

const SUPPORTED_LOCALES = new Set(['en', 'zh', 'es', 'fr', 'de', 'jp', 'kr', 'ru', 'pt', 'it', 'ar', 'hi', 'nl', 'tr', 'pl', 'sv', 'th', 'vi', 'id', 'ms', 'uk'])

const PAGE_SIZE = 12

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  if (!SUPPORTED_LOCALES.has(locale)) notFound()

  const titleMap: Record<string, string> = {
    zh: '展会与虚拟展台 | x2xhub 全球贸易平台',
    en: 'Exhibitions | x2xhub Global Trade Platform',
    es: 'Exposiciones | Plataforma Comercial Global x2xhub',
    fr: 'Expositions | Plateforme Commerciale Mondiale x2xhub',
    de: 'Ausstellungen | x2xhub Globale Handelsplattform',
    jp: '展示会 | x2xhub グローバル貿易プラットフォーム',
    kr: '전시회 | x2xhub 글로벌 무역 플랫폼',
  }
  const descMap: Record<string, string> = {
    zh: '浏览 x2xhub 平台所有展会与数字虚拟展台，与全球制造商、供应商和采购商建立贸易联系。',
    en: 'Browse all exhibitions and virtual booths on x2xhub. Connect with global manufacturers, suppliers, and buyers.',
    es: 'Explore todas las exposiciones y stands virtuales en x2xhub. Conecte con fabricantes y proveedores globales.',
    fr: 'Découvrez toutes les expositions et stands virtuels sur x2xhub. Connectez-vous avec des fabricants mondiaux.',
    de: 'Entdecken Sie alle Ausstellungen und virtuellen Stände auf x2xhub. Verbinden Sie sich mit globalen Herstellern.',
    jp: 'x2xhub の展示会とバーチャルブースを閲覧し、世界のメーカーやサプライヤーとビジネスを構築しましょう。',
    kr: 'x2xhub의 모든 전시회와 가상 부스를 둘러보고 글로벌 제조업체 및 공급업체와 연결하세요.',
  }
  const title = titleMap[locale] || titleMap.en
  const description = descMap[locale] || descMap.en

  // Supplying alternates.canonical alone would override the root layout's
  // hreflang set and leave this page with zero alternates.
  const alt = buildAlternates(`/${locale}/exhibitions`)

  return {
    title,
    description,
    alternates: { canonical: alt.canonical, languages: alt.languages },
    openGraph: { title, description, url: alt.canonical, type: 'website' as const },
  }
}

type BoothWhere = {
  isActive: boolean
  isPublished: boolean
  OR?: any[]
  seller?: any
  products?: any
}

async function getBooths(searchParams: Record<string, string | string[] | undefined>) {
  const exhibition = (searchParams.exhibition as string)?.trim()
  const company = (searchParams.company as string)?.trim()
  const product = (searchParams.product as string)?.trim()
  const keyword = (searchParams.keyword as string)?.trim()
  const page = Math.max(1, parseInt((searchParams.page as string) || '1', 10) || 1)

  const where: BoothWhere = {
    isActive: true,
    isPublished: true,
  }

  // 1) 展会信息：exhibitionName / name / location 模糊
  if (exhibition) {
    where.OR = [
      ...(where.OR || []),
      { exhibitionName: { contains: exhibition, mode: 'insensitive' } },
      { name: { contains: exhibition, mode: 'insensitive' } },
      { location: { contains: exhibition, mode: 'insensitive' } },
    ]
  }

  // 2) 公司名称：seller.companyName 模糊（JOIN SellerProfile）
  if (company) {
    where.seller = {
      ...(where.seller || {}),
      companyName: { contains: company, mode: 'insensitive' },
    }
  }

  // 3) 产品：products（活跃）title / titleEn 模糊
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

  // 4) 关键词：booth.keywords / products.keywords 数组子串模糊 + 展会/展台名兜底 + 产品标题兜底
  if (keyword) {
    const kw = keyword as string;
    // keywords JSONB 数组子串匹配（array_contains 只能精确匹配，需原生 SQL 子串匹配）
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

  // 总数（用于统计 + 分页）
  const total = await prisma.booth.count({ where })

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const booths = await prisma.booth.findMany({
    where,
    select: {
      id: true, name: true, exhibitionName: true, location: true, createdAt: true,
      _count: { select: { products: { where: { isActive: true } } } },
      seller: { select: { companyName: true, companyType: true, country: true, city: true } },
    },
    orderBy: [{ createdAt: 'desc' }],
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  return { booths, total, totalPages, currentPage: safePage, pageSize: PAGE_SIZE }
}

export default async function ExhibitionsPage({ params, searchParams }: Props) {
  const { locale } = await params
  if (!SUPPORTED_LOCALES.has(locale)) notFound()

  const sp = await searchParams
  const { booths, total, totalPages, currentPage, pageSize } = await getBooths(sp)
  const hrefPrefix = `/${locale}`

  // Minimal i18n strings for layout chrome
  const t = {
    heroEyebrow: locale === 'zh' ? '全球贸易展会' : locale === 'es' ? 'Ferias Comerciales Globales' : locale === 'fr' ? 'Salons Commerciaux Mondiaux' : locale === 'de' ? 'Globale Messen' : locale === 'jp' ? '国際見本市' : locale === 'kr' ? '글로벌 무역 전시회' : 'Global Trade Shows',
    heroTitle: locale === 'zh' ? '探索展会与虚拟展台' : locale === 'es' ? 'Descubre Exposiciones y Stands Virtuales' : locale === 'fr' ? 'Découvrez Expositions & Stands Virtuels' : locale === 'de' ? 'Entdecken Sie Ausstellungen & Virtuelle Stände' : locale === 'jp' ? '展示会とバーチャルブースを探す' : locale === 'kr' ? '전시회 및 가상 부스 탐색' : 'Discover Exhibitions & Virtual Booths',
    heroDesc: locale === 'zh' ? '在精心策划的数字展会平台上，与经过认证的全球制造商和供应商建立联系。' : locale === 'es' ? 'Conecte con fabricantes y proveedores mundiales verificados en nuestros stands digitales.' : locale === 'fr' ? 'Connectez-vous avec des fabricants et fournisseurs vérifiés dans nos stands numériques.' : locale === 'de' ? 'Vernetzen Sie sich mit verifizierten globalen Herstellern über unsere digitalen Messestände.' : locale === 'jp' ? '認定された世界のメーカー・サプライヤーとデジタル展示を通じて繋がりましょう。' : locale === 'kr' ? '검증된 글로벌 제조업체 및 공급업체와 디지털 부스를 통해 연결하세요.' : 'Connect with verified global manufacturers and suppliers through curated digital exhibition booths.',
    totalShows: locale === 'zh' ? '展会总数' : locale === 'de' ? 'Ausstellungen gesamt' : locale === 'es' ? 'Exposiciones totales' : locale === 'fr' ? 'Expositions totales' : locale === 'jp' ? '展示会総数' : locale === 'kr' ? '총 전시회' : 'Total Shows',
    activeBooths: locale === 'zh' ? '活跃展台' : locale === 'es' ? 'Stands activos' : locale === 'fr' ? 'Stands actifs' : locale === 'de' ? 'Aktive Stände' : locale === 'jp' ? 'アクティブなブース' : locale === 'kr' ? '활성 부스' : 'active booths',
    listedProducts: locale === 'zh' ? '上架产品' : locale === 'es' ? 'Productos publicados' : locale === 'fr' ? 'Produits référencés' : locale === 'de' ? 'Gelistete Produkte' : locale === 'jp' ? '掲載製品' : locale === 'kr' ? '등록된 제품' : 'listed products',
    allTitle: locale === 'zh' ? '全部展会与展台' : locale === 'es' ? 'Todas las Exposiciones y Stands' : locale === 'fr' ? 'Toutes les Expositions et Stands' : locale === 'de' ? 'Alle Ausstellungen und Stände' : locale === 'jp' ? 'すべての展示会とブース' : locale === 'kr' ? '모든 전시회 및 부스' : 'All Exhibitions & Booths',
    allSubtitle: locale === 'zh' ? '探索全球精选的活跃展会和公司展台。' : locale === 'es' ? 'Explore ferias y stands empresariales activos de todo el mundo.' : locale === 'fr' ? 'Explorez les salons actifs et les stands d\'entreprise du monde entier.' : locale === 'de' ? 'Entdecken Sie aktive Messen und Unternehmensstände weltweit.' : locale === 'jp' ? '世界中の開催中の見本市と企業ブースを探索しましょう。' : locale === 'kr' ? '전 세계 활성화된 무역 박람회와 기업 부스를 탐색해 보세요.' : 'Explore active trade shows and registered company booths from around the world.',
    browseMp: locale === 'zh' ? '浏览市场' : locale === 'es' ? 'Explorar mercado' : locale === 'fr' ? 'Explorer le marché' : locale === 'de' ? 'Marktplatz durchsuchen' : locale === 'jp' ? 'マーケットプレイスへ' : locale === 'kr' ? '마켓플레이스 둘러보기' : 'Browse Marketplace',
    noExh: locale === 'zh' ? '暂无展会' : locale === 'es' ? 'Aún no hay exposiciones' : locale === 'fr' ? 'Aucune exposition pour le moment' : locale === 'de' ? 'Noch keine Ausstellungen' : locale === 'jp' ? 'まだ展示会はありません' : locale === 'kr' ? '아직 전시회가 없습니다' : 'No exhibitions yet',
    noExhDesc: locale === 'zh' ? '敬请期待，新展会和公司展台将持续更新。' : locale === 'es' ? 'Vuelva pronto: se añaden nuevas exposiciones regularmente.' : locale === 'fr' ? 'Revenez bientôt — de nouvelles expositions sont ajoutées régulièrement.' : locale === 'de' ? 'Schauen Sie bald wieder vorbei — neue Ausstellungen werden regelmäßig hinzugefügt.' : locale === 'jp' ? 'まもなく新しい展示会が追加されます。' : locale === 'kr' ? '곧 새로운 전시회와 부스가 추가됩니다.' : 'Check back soon — new trade shows and booths are added regularly.',
    noResult: locale === 'zh' ? '未找到匹配的展会' : locale === 'de' ? 'Keine passenden Ausstellungen gefunden' : locale === 'es' ? 'No se encontraron exposiciones' : locale === 'fr' ? 'Aucune exposition trouvée' : locale === 'jp' ? '該当する展示会が見つかりません' : locale === 'kr' ? '일치하는 전시회를 찾을 수 없습니다' : 'No matching exhibitions found',
    noResultDesc: locale === 'zh' ? '请尝试其他关键词或清除筛选条件。' : locale === 'de' ? 'Versuchen Sie andere Suchbegriffe oder setzen Sie die Filter zurück.' : locale === 'es' ? 'Pruebe otros términos o restablezca los filtros.' : locale === 'fr' ? 'Essayez d\'autres termes ou réinitialisez les filtres.' : locale === 'jp' ? '別のキーワードを試すか、フィルターをリセットしてください。' : locale === 'kr' ? '다른 검색어를 시도하거나 필터를 초기화하세요.' : 'Try different keywords or reset the filters.',
    exploreMp: locale === 'zh' ? '前往市场' : locale === 'es' ? 'Explorar mercado' : locale === 'fr' ? 'Explorer le marché' : locale === 'de' ? 'Marktplatz erkunden' : locale === 'jp' ? 'マーケットプレイスへ' : locale === 'kr' ? '마켓플레이스 탐색' : 'Explore Marketplace',
    visit: locale === 'zh' ? '访问' : locale === 'es' ? 'Visitar' : locale === 'fr' ? 'Visiter' : locale === 'de' ? 'Besuchen' : locale === 'jp' ? '訪問' : locale === 'kr' ? '방문' : 'Visit',
    products: locale === 'zh' ? '产品' : locale === 'es' ? 'productos' : locale === 'fr' ? 'produits' : locale === 'de' ? 'Produkte' : locale === 'jp' ? '製品' : locale === 'kr' ? '제품' : 'products',
    found: locale === 'zh' ? '找到' : locale === 'de' ? 'Gefunden' : locale === 'es' ? 'Encontradas' : locale === 'fr' ? 'Trouvées' : locale === 'jp' ? '件' : locale === 'kr' ? '찾음' : 'Found',
    showsWord: locale === 'zh' ? '个展会' : locale === 'de' ? 'Ausstellungen' : locale === 'es' ? 'exposiciones' : locale === 'fr' ? 'expositions' : locale === 'jp' ? '展示会' : locale === 'kr' ? '전시회' : 'shows',
    perPage: locale === 'zh' ? '每页' : locale === 'de' ? 'pro Seite' : locale === 'es' ? 'por página' : locale === 'fr' ? 'par page' : locale === 'jp' ? '1ページあたり' : locale === 'kr' ? '페이지당' : 'per page',
  }

  const totalListedProducts = booths.reduce((a, b) => a + (b._count.products || 0), 0)

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
          <p className="text-blue-100 text-sm font-medium tracking-wider uppercase mb-3">{t.heroEyebrow}</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t.heroTitle}</h1>
          <p className="text-xl text-blue-50 max-w-2xl mb-8">{t.heroDesc}</p>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/15">
              <Building2 className="w-4 h-4" />
              <span>{total} {t.totalShows}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/15">
              <Package className="w-4 h-4" />
              <span>{totalListedProducts} {t.listedProducts}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.allTitle}</h2>
            <p className="text-gray-600 mt-2">{t.allSubtitle}</p>
          </div>
          <Link href={`${hrefPrefix}/marketplace`} className="hidden sm:inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            {t.browseMp} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 搜索栏（客户端交互，URL searchParams 驱动 SSR 查询） */}
        <BoothFilterBar locale={locale} />

        {/* 统计 + 分页信息 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 text-sm text-gray-600">
          <span>
            {t.found} <span className="font-semibold text-gray-900">{total}</span> {t.showsWord}
          </span>
          <span className="text-gray-500">
            {t.perPage} {pageSize} · {t.page} {currentPage}/{totalPages}
          </span>
        </div>

        {booths.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t.noResult}</h3>
            <p className="text-gray-500">{t.noResultDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {booths.map(b => {
              const city = localizeCity((b.seller?.city as string | undefined) || '', locale)
              const country = localizeCountry((b.seller?.country as string | undefined) || '', locale)
              const location = [b.location, city, country].filter(Boolean)[0] || '—'
              const company = b.seller?.companyName || ''
              const exhibitionName = b.exhibitionName || b.name || 'Company Virtual Booth'
              return (
                <Link key={b.id} href={`${hrefPrefix}/exhibitions/${b.id}`} className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">{exhibitionName}</h3>
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
                      <span>{b._count.products || 0} {t.products}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-blue-600 font-medium group-hover:gap-2 transition-all">
                      {t.visit} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* 分页跳转 */}
        <Pagination
          locale={locale}
          basePath={`${hrefPrefix}/exhibitions`}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </section>
    </main>
  )
}
