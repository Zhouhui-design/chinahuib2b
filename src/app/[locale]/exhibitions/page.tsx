import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Calendar, MapPin, Building2, ArrowRight, Package } from 'lucide-react'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ locale: string }> }

const SUPPORTED_LOCALES = new Set(['en', 'zh', 'es', 'fr', 'de', 'jp', 'kr', 'ru', 'pt', 'it', 'ar', 'hi', 'nl', 'tr', 'pl', 'sv', 'th', 'vi', 'id', 'ms', 'uk'])

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

  return {
    title,
    description,
    alternates: { canonical: `https://x2xhub.com/${locale}/exhibitions` },
    openGraph: { title, description, url: `https://x2xhub.com/${locale}/exhibitions`, type: 'website' as const },
  }
}

async function getBooths() {
  return prisma.booth.findMany({
    where: { isActive: true, isPublished: true },
    select: {
      id: true, name: true, exhibitionName: true, location: true, createdAt: true,
      _count: { select: { products: { where: { isActive: true } } } },
      seller: { select: { companyName: true, companyType: true, country: true, city: true } },
    },
    orderBy: [{ createdAt: 'desc' }],
    take: 100,
  })
}

export default async function ExhibitionsPage({ params }: Props) {
  const { locale } = await params
  if (!SUPPORTED_LOCALES.has(locale)) notFound()

  const booths = await getBooths()
  const hrefPrefix = `/${locale}`

  // Minimal i18n strings for layout chrome
  const t = {
    heroEyebrow: locale === 'zh' ? '全球贸易展会' : locale === 'es' ? 'Ferias Comerciales Globales' : locale === 'fr' ? 'Salons Commerciaux Mondiaux' : locale === 'de' ? 'Globale Messen' : locale === 'jp' ? '国際見本市' : locale === 'kr' ? '글로벌 무역 전시회' : 'Global Trade Shows',
    heroTitle: locale === 'zh' ? '探索展会与虚拟展台' : locale === 'es' ? 'Descubre Exposiciones y Stands Virtuales' : locale === 'fr' ? 'Découvrez Expositions & Stands Virtuels' : locale === 'de' ? 'Entdecken Sie Ausstellungen & Virtuelle Stände' : locale === 'jp' ? '展示会とバーチャルブースを探す' : locale === 'kr' ? '전시회 및 가상 부스 탐색' : 'Discover Exhibitions & Virtual Booths',
    heroDesc: locale === 'zh' ? '在精心策划的数字展会平台上，与经过认证的全球制造商和供应商建立联系。' : locale === 'es' ? 'Conecte con fabricantes y proveedores mundiales verificados en nuestros stands digitales.' : locale === 'fr' ? 'Connectez-vous avec des fabricants et fournisseurs vérifiés dans nos stands numériques.' : locale === 'de' ? 'Vernetzen Sie sich mit verifizierten globalen Herstellern über unsere digitalen Messestände.' : locale === 'jp' ? '認定された世界のメーカー・サプライヤーとデジタル展示を通じて繋がりましょう。' : locale === 'kr' ? '검증된 글로벌 제조업체 및 공급업체와 디지털 부스를 통해 연결하세요.' : 'Connect with verified global manufacturers and suppliers through curated digital exhibition booths.',
    activeBooths: locale === 'zh' ? '活跃展台' : locale === 'es' ? 'Stands activos' : locale === 'fr' ? 'Stands actifs' : locale === 'de' ? 'Aktive Stände' : locale === 'jp' ? 'アクティブなブース' : locale === 'kr' ? '활성 부스' : 'active booths',
    listedProducts: locale === 'zh' ? '上架产品' : locale === 'es' ? 'Productos publicados' : locale === 'fr' ? 'Produits référencés' : locale === 'de' ? 'Gelistete Produkte' : locale === 'jp' ? '掲載製品' : locale === 'kr' ? '등록된 제품' : 'listed products',
    allTitle: locale === 'zh' ? '全部展会与展台' : locale === 'es' ? 'Todas las Exposiciones y Stands' : locale === 'fr' ? 'Toutes les Expositions et Stands' : locale === 'de' ? 'Alle Ausstellungen und Stände' : locale === 'jp' ? 'すべての展示会とブース' : locale === 'kr' ? '모든 전시회 및 부스' : 'All Exhibitions & Booths',
    allSubtitle: locale === 'zh' ? '探索全球精选的活跃展会和公司展台。' : locale === 'es' ? 'Explore ferias y stands empresariales activos de todo el mundo.' : locale === 'fr' ? 'Explorez les salons actifs et les stands d\'entreprise du monde entier.' : locale === 'de' ? 'Entdecken Sie aktive Messen und Unternehmensstände weltweit.' : locale === 'jp' ? '世界中の開催中の見本市と企業ブースを探索しましょう。' : locale === 'kr' ? '전 세계 활성화된 무역 박람회와 기업 부스를 탐색해 보세요.' : 'Explore active trade shows and registered company booths from around the world.',
    browseMp: locale === 'zh' ? '浏览市场' : locale === 'es' ? 'Explorar mercado' : locale === 'fr' ? 'Explorer le marché' : locale === 'de' ? 'Marktplatz durchsuchen' : locale === 'jp' ? 'マーケットプレイスへ' : locale === 'kr' ? '마켓플레이스 둘러보기' : 'Browse Marketplace',
    noExh: locale === 'zh' ? '暂无展会' : locale === 'es' ? 'Aún no hay exposiciones' : locale === 'fr' ? 'Aucune exposition pour le moment' : locale === 'de' ? 'Noch keine Ausstellungen' : locale === 'jp' ? 'まだ展示会はありません' : locale === 'kr' ? '아직 전시회가 없습니다' : 'No exhibitions yet',
    noExhDesc: locale === 'zh' ? '敬请期待，新展会和公司展台将持续更新。' : locale === 'es' ? 'Vuelva pronto: se añaden nuevas exposiciones regularmente.' : locale === 'fr' ? 'Revenez bientôt — de nouvelles expositions sont ajoutées régulièrement.' : locale === 'de' ? 'Schauen Sie bald wieder vorbei — neue Ausstellungen werden regelmäßig hinzugefügt.' : locale === 'jp' ? 'まもなく新しい展示会が追加されます。' : locale === 'kr' ? '곧 새로운 전시회와 부스가 추가됩니다.' : 'Check back soon — new trade shows and booths are added regularly.',
    exploreMp: locale === 'zh' ? '前往市场' : locale === 'es' ? 'Explorar mercado' : locale === 'fr' ? 'Explorer le marché' : locale === 'de' ? 'Marktplatz erkunden' : locale === 'jp' ? 'マーケットプレイスへ' : locale === 'kr' ? '마켓플레이스 탐색' : 'Explore Marketplace',
    visit: locale === 'zh' ? '访问' : locale === 'es' ? 'Visitar' : locale === 'fr' ? 'Visiter' : locale === 'de' ? 'Besuchen' : locale === 'jp' ? '訪問' : locale === 'kr' ? '방문' : 'Visit',
    products: locale === 'zh' ? '产品' : locale === 'es' ? 'productos' : locale === 'fr' ? 'produits' : locale === 'de' ? 'Produkte' : locale === 'jp' ? '製品' : locale === 'kr' ? '제품' : 'products',
  }

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
              <span>{booths.length} {t.activeBooths}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/15">
              <Package className="w-4 h-4" />
              <span>{booths.reduce((a, b) => a + (b._count.products || 0), 0)} {t.listedProducts}</span>
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

        {booths.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t.noExh}</h3>
            <p className="text-gray-500">{t.noExhDesc}</p>
            <Link href={`${hrefPrefix}/marketplace`} className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
              {t.exploreMp} <ArrowRight className="w-4 h-4" />
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
      </section>
    </main>
  )
}
