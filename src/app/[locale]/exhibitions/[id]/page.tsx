import { notFound } from 'next/navigation'
import { getPublishedBoothById } from '@/lib/server/booths'
import { localizeCity, localizeCountry } from '@/lib/seo-title'
import BoothDetailPageClient, { type Booth } from './BoothDetailPageClient'

const BASE_URL = 'https://x2xhub.com'

// User-generated text is embedded in JSON-LD; escape script-breaking chars.
function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

/**
 * Booth page structured data for AI crawlers and rich results.
 * Field semantics (historical naming is misleading):
 *   booth.name           = exhibition (expo) name
 *   booth.exhibitionName = exhibitor company name fallback
 *   booth.seller         = authoritative exhibitor profile
 */
function buildBoothJsonLd(booth: Booth, locale: string) {
  const url = `${BASE_URL}/${locale}/exhibitions/${booth.id}`
  const seller = booth.seller
  const companyName = seller?.companyName || booth.exhibitionName

  // JSON-LD stays English-localized even on non-English pages (mixed-script
  // addresses read as spam); matches the convention in StructuredData.tsx.
  const city = localizeCity(seller?.city || '', 'en')
  const country = localizeCountry(seller?.country || '', 'en')

  const names = booth.names && typeof booth.names === 'object' ? booth.names : null
  const expoName = names?.['en'] || booth.name

  const description =
    `${expoName} by ${companyName} from ${city}, ${country}. ` +
    `View ${booth.products.length} product${booth.products.length === 1 ? '' : 's'} and connect with the supplier on SeaHeart Global.`

  const sellerDescriptions =
    seller?.descriptions && typeof seller.descriptions === 'object' ? seller.descriptions : null

  // Only absolute URLs qualify as sameAs.
  const socialLinks = [
    seller?.linkedin,
    seller?.facebook,
    seller?.instagram,
    seller?.youtube,
    seller?.twitter,
    seller?.pinterest,
    seller?.reddit,
    seller?.tiktok,
    ...(Array.isArray(seller?.websites) ? seller!.websites : []),
    seller?.website,
  ].filter((v): v is string => typeof v === 'string' && /^https?:\/\//i.test(v))

  const exhibitor = {
    '@type': 'Organization',
    '@id': `${url}#exhibitor`,
    name: companyName,
    ...(socialLinks.length > 0 && { sameAs: [...new Set(socialLinks)] }),
    ...(seller?.logoUrl || booth.logoUrl
      ? { logo: seller?.logoUrl || booth.logoUrl }
      : {}),
    ...(sellerDescriptions?.['en'] || seller?.description
      ? {
          description: (sellerDescriptions?.['en'] || seller?.description || '').slice(0, 1000),
        }
      : {}),
    address: {
      '@type': 'PostalAddress',
      ...(seller?.address ? { streetAddress: seller.address } : {}),
      addressLocality: city,
      addressCountry: country,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      ...(seller?.email || seller?.emails?.[0]
        ? { email: seller?.email || seller?.emails?.[0] }
        : {}),
      ...(seller?.phone || seller?.phones?.[0]
        ? { telephone: seller?.phone || seller?.phones?.[0] }
        : {}),
      ...(Array.isArray(seller?.voiceLanguages) && seller.voiceLanguages.length > 0
        ? { availableLanguage: seller.voiceLanguages }
        : {}),
    },
  }

  const event = {
    '@type': 'ExhibitionEvent',
    '@id': `${url}#event`,
    name: expoName,
    description,
    url,
    ...(booth.bannerUrl ? { image: booth.bannerUrl } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: { '@type': 'VirtualLocation', url },
    isAccessibleForFree: true,
    organizer: { '@id': `${BASE_URL}/#organization` },
    contributor: { '@id': `${url}#exhibitor` },
    ...(booth.exhibitionDates?.start ? { startDate: booth.exhibitionDates.start } : {}),
    ...(booth.exhibitionDates?.end ? { endDate: booth.exhibitionDates.end } : {}),
    ...(Array.isArray(booth.keywords) && booth.keywords.length > 0
      ? { keywords: booth.keywords.join(', ') }
      : {}),
  }

  const productList = {
    '@type': 'ItemList',
    '@id': `${url}#products`,
    numberOfItems: booth.products.length,
    itemListElement: booth.products.slice(0, 100).map((product, index) => {
      const descriptions =
        product.descriptions && typeof product.descriptions === 'object'
          ? product.descriptions
          : null
      const desc = (
        descriptions?.['en'] ||
        product.description ||
        ''
      )
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 500)
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.titleEn || product.titles?.['en'] || product.title,
          ...(desc ? { description: desc } : {}),
          ...(product.mainImageUrl ? { image: product.mainImageUrl } : {}),
          sku: product.id,
          ...(product.category?.nameEn || product.category?.name
            ? { category: product.category?.nameEn || product.category?.name }
            : {}),
          url: `${BASE_URL}/${locale}/products/${product.id}`,
          manufacturer: { '@id': `${url}#exhibitor` },
        },
      }
    }),
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [event, exhibitor, productList],
  }
}

export default async function BoothDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params

  const boothData = await getPublishedBoothById(id)
  if (!boothData) {
    notFound()
  }

  // Round-trip to plain JSON (Date -> ISO string), matching the exact shape
  // the client used to receive from GET /api/exhibitions.
  const booth = JSON.parse(JSON.stringify(boothData)) as Booth

  return (
    <>
      <script
        type="application/ld+json"
        id="booth-jsonld"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(buildBoothJsonLd(booth, locale)) }}
      />
      <BoothDetailPageClient initialBooth={booth} locale={locale} />
    </>
  )
}
