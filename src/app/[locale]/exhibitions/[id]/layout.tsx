import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { languages } from '@/lib/languages'
import { buildExhibitionTitle, localizeCountry, localizeCity } from '@/lib/seo-title'

const BASE_URL = 'https://x2xhub.com'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params

  let booth: {
    name: string
    names: any
    exhibitionName: string
    exhibitionDates: any
    location: string | null
    bannerUrl: string | null
    logoUrl: string | null
    keywords: any
    seller: { companyName: string; country: string; city: string } | null
  } | null = null

  try {
    booth = await prisma.booth.findUnique({
      where: { id, isActive: true, isPublished: true },
      select: {
        name: true,
        names: true,
        exhibitionName: true,
        exhibitionDates: true,
        location: true,
        bannerUrl: true,
        logoUrl: true,
        keywords: true,
        seller: {
          select: {
            companyName: true,
            country: true,
            city: true,
          },
        },
      },
    })
  } catch (error) {
    console.error('Failed to fetch booth for metadata:', error)
  }

  const fallbackTitle = 'Exhibition'
  const fallbackDescription = 'Explore exhibitions on SeaHeart Global B2B trade platform'

  const canonicalUrl = `${BASE_URL}/${locale}/exhibitions/${id}`

  if (!booth) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      alternates: { canonical: canonicalUrl },
    }
  }

  const isEnglish = locale === 'en'

  // Localized booth name from `names` JSON (fallback to English then default name)
  let boothName = booth.name
  if (booth.names && typeof booth.names === 'object' && !Array.isArray(booth.names)) {
    const namesObj = booth.names as Record<string, string>
    boothName = namesObj[locale] || namesObj['en'] || booth.name
  }

  // 字段语义澄清（勿删，此处历史命名易误导）：
  //   booth.name            = 展会名称 (exhibition name)
  //   booth.exhibitionName  = 参展商公司名称 (company name) —— 字段名与实际内容不一致
  //   booth.seller          = 卖家资料
  const companyName = booth.seller?.companyName || booth.exhibitionName
  const sellerCity = booth.seller?.city || ''
  const sellerCountry = booth.seller?.country || ''

  // seller.city / seller.country hold whatever the seller typed, normally
  // Chinese. Rendering "台州绘寰精密加工刀具" inside an English title mixes
  // scripts and weakens the locale's language signal.
  const localizedCity = localizeCity(sellerCity, locale)
  const localizedCountry = localizeCountry(sellerCountry, locale)

  // Root layout applies template '%s | SeaHeart Global | 心海环球'. Appending
  // the brand here too produced "... | SeaHeart Global | SeaHeart Global |
  // 心海环球" -- the brand three times in one title, well past the ~60
  // characters Google renders.
  const title = buildExhibitionTitle({ boothName, companyName })
  const description = isEnglish
    ? `${boothName} by ${companyName} from ${localizedCity}, ${localizedCountry}. Discover products and connect with suppliers.`
    : `${boothName}，由${companyName}（${sellerCountry} ${sellerCity}）展出。查看产品并与供应商联系。`

  const keywordsArr = Array.isArray(booth.keywords) ? (booth.keywords as string[]) : []

  const allKeywords = [
    ...keywordsArr,
    boothName,
    booth.exhibitionName,
    companyName,
    sellerCountry,
    sellerCity,
    'exhibition',
    'trade show',
    'b2b',
    'global trade',
    'products',
  ].filter(Boolean)

  const ogImage = booth.bannerUrl || booth.logoUrl || undefined

  const alternates: Record<string, string> = {}
  for (const lang of languages) {
    alternates[lang.code] = `${BASE_URL}/${lang.code}/exhibitions/${id}`
  }

  // GEO meta (pure HTML meta tags appended via `other`)
  const geoMeta: Record<string, string> = {
    'geo.region': sellerCountry,
    'geo.placename': sellerCity,
  }
  if (sellerCity) {
    geoMeta['geo.placename'] = sellerCity
  }

  return {
    title,
    description,
    keywords: allKeywords as string[],

    alternates: {
      canonical: canonicalUrl,
      languages: alternates,
    },

    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'SeaHeart Global | 心海环球',
      ...(ogImage && { images: [{ url: ogImage, alt: boothName }] }),
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },

    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },

    other: geoMeta,
  }
}

export default function ExhibitionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
