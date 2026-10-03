export interface ProductSchema {
  id: string
  name: string
  description: string
  image: string
  brand?: string
  sku?: string
  price?: number
  currency?: string
  category?: string
  rating?: number
  reviewCount?: number
}

export interface OrganizationSchema {
  id: string
  name: string
  description: string
  logo?: string
  url?: string
  email?: string
  phone?: string
  address?: string
  slug?: string
}

export interface EventSchema {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  location?: string
  image?: string
  organizer?: OrganizationSchema
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export function generateProductSchema(product: ProductSchema): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://x2xhub.com/de/products/${product.id}`,
    name: product.name,
    description: product.description,
    image: product.image,
    ...(product.brand && { brand: product.brand }),
    ...(product.sku && { sku: product.sku }),
    ...(product.price && {
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency || 'USD',
        availability: 'https://schema.org/InStock',
      },
    }),
    ...(product.category && { category: product.category }),
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
      },
    }),
  }
}

export function generateOrganizationSchema(org: OrganizationSchema): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': org.slug
      ? `https://x2xhub.com/${org.slug}`
      : `https://x2xhub.com/de/stores/${org.id}`,
    name: org.name,
    description: org.description,
    ...(org.logo && { logo: org.logo }),
    ...(org.url && { url: org.url }),
    ...(org.email && { email: org.email }),
    ...(org.phone && { telephone: org.phone }),
    ...(org.address && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: org.address,
      },
    }),
  }
}

export function generateEventSchema(event: EventSchema): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `https://x2xhub.com/de/exhibitions/${event.id}`,
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    ...(event.location && { location: event.location }),
    ...(event.image && { image: event.image }),
    ...(event.organizer && {
      organizer: {
        '@type': 'Organization',
        name: event.organizer.name,
        ...(event.organizer.logo && { logo: event.organizer.logo }),
        ...(event.organizer.url && { url: event.organizer.url }),
      },
    }),
  }
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Canonical brand entity: legal/brand name is "SeaHeart Global"; the domain
// x2xhub.com and the former product name "X2XHub" are aliases of the SAME
// entity, so they live in alternateName rather than competing as the name.
// Never add unverified addresses, social links or ratings here — AI engines
// treat structured data as factual claims.
export const ORGANIZATION_ID = 'https://x2xhub.com/#organization'
const SUPPORTED_LANGUAGES = ['en', 'zh', 'de', 'es', 'fr', 'ja', 'ko', 'ar', 'ru', 'pt', 'hi', 'th', 'vi']

export function generateWebsiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SeaHeart Global',
    alternateName: ['SeaHeart Global | 心海环球', 'X2XHub', 'x2xhub.com'],
    url: 'https://x2xhub.com',
    description: 'Online B2B trade exhibition platform connecting global buyers with verified suppliers and manufacturers, available in 13 languages.',
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en',
    languages: SUPPORTED_LANGUAGES,
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://x2xhub.com/products?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateOrganizationSchemaFull(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'SeaHeart Global',
    alternateName: ['SeaHeart Global | 心海环球', 'X2XHub'],
    url: 'https://x2xhub.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://x2xhub.com/logo.png',
      width: 300,
      height: 60,
    },
    description: 'Multi-language online B2B trade exhibition platform connecting verified suppliers with global buyers.',
    email: 'contact@x2xhub.com',
    // Only real, owned official profiles. Add X/YouTube/LinkedIn/etc. here
    // once the exact URLs are confirmed — never guess slugs.
    sameAs: ['https://whatsapp.com/channel/0029Vb8ooT3CnA7n2NYU5v3F'],
    areaServed: {
      '@type': 'GeoArea',
      name: 'Global',
    },
    industry: [
      'B2B E-Commerce',
      'Online Exhibitions',
      'International Trade',
      'Wholesale Marketplace',
    ],
  }
}

export function generateWebApplicationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SeaHeart Global',
    url: 'https://x2xhub.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'B2B online exhibition platform for global trade',
  }
}

export function generateLocalBusinessSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'SeaHeart Global',
    url: 'https://x2xhub.com',
    description: 'Online B2B trade exhibition platform connecting buyers and sellers worldwide',
    image: 'https://x2xhub.com/logo.png',
    email: 'contact@x2xhub.com',
    openingHours: 'Mo-Su 00:00-24:00',
  }
}