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
    description: 'The world\'s leading online B2B exhibition platform connecting global buyers with verified suppliers and manufacturers for international trade.',
    publisher: {
      '@type': 'Organization',
      name: 'X2XHub',
      logo: {
        '@type': 'ImageObject',
        url: 'https://x2xhub.com/logo.png',
      },
    },
    inLanguage: 'en',
    languages: ['en', 'zh', 'ar', 'es', 'fr', 'de', 'ru', 'ja', 'ko', 'pt', 'hi', 'tr', 'th', 'id', 'vi'],
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
    '@id': 'https://x2xhub.com/#organization',
    name: 'X2XHub Global Trade Network',
    alternateName: 'X2XHUB',
    url: 'https://x2xhub.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://x2xhub.com/logo.png',
      width: 300,
      height: 60,
    },
    description: 'Global B2B online exhibition and trade platform connecting buyers with verified suppliers across 50+ countries.',
    email: 'contact@x2xhub.com',
    sameAs: [
      'https://twitter.com/x2xhub',
      'https://www.facebook.com/x2xhub',
      'https://www.linkedin.com/company/x2xhub',
      'https://www.youtube.com/@x2xhub',
      'https://www.instagram.com/x2xhub',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'DE',
      addressLocality: 'Frankfurt',
    },
    areaServed: {
      '@type': 'GeoArea',
      name: 'Global',
    },
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: '50',
    },
    foundingDate: '2024',
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
    name: 'X2XHub - B2B Trade Platform',
    url: 'https://x2xhub.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'B2B online exhibition platform for global trade',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1000',
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
    telephone: '+49-69-12345678',
    email: 'contact@x2xhub.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Frankfurt',
      addressCountry: 'DE',
    },
    openingHours: 'Mo-Su 00:00-24:00',
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 50.1109,
      longitude: 8.6821,
    },
  }
}