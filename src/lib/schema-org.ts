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
    '@id': `https://x2xhub.com/de/stores/${org.id}`,
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

export function generateWebsiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'X2XHub - Global B2B Trade Exhibition Platform',
    url: 'https://x2xhub.com',
    description: 'Connect global buyers and sellers. Discover quality products and verified suppliers for international trade.',
    publisher: {
      '@type': 'Organization',
      name: 'X2XHub',
      logo: {
        '@type': 'ImageObject',
        url: 'https://x2xhub.com/logo.png',
      },
    },
    inLanguage: 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://x2xhub.com/products?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateLocalBusinessSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'X2XHub',
    url: 'https://x2xhub.com',
    description: 'Global B2B trade exhibition platform connecting buyers and sellers worldwide',
    image: 'https://x2xhub.com/logo.png',
    telephone: '+86-400-888-8888',
    email: 'contact@x2xhub.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No. 88 Innovation Avenue',
      addressLocality: 'Shenzhen',
      addressRegion: 'Guangdong',
      postalCode: '518000',
      addressCountry: 'CN',
    },
    openingHours: 'Mo-Su 00:00-24:00',
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 22.5431,
      longitude: 114.0579,
    },
  }
}