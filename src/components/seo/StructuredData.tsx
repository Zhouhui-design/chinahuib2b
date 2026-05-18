/**
 * Schema.org Structured Data Components for SEO
 */

import type { Product, Organization, BreadcrumbList, FAQPage } from 'schema-dts'

// Product Schema
export function ProductSchema({ product }: { product: any }) {
  const schema: Product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.[0] || '',
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || product.storeName,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'USD',
      availability: product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `https://chinahuib2b.top/products/${product.id}`,
      seller: {
        '@type': 'Organization',
        name: product.storeName,
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    aggregateRating: product.averageRating ? {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount || 0,
    } : undefined,
    category: product.category,
    material: product.specifications?.material,
    color: product.specifications?.color,
    weight: product.specifications?.weight,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Organization Schema
export function OrganizationSchema({ organization }: { organization: any }) {
  const schema: Organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organization.name,
    url: organization.url || 'https://chinahuib2b.top',
    logo: organization.logo || 'https://chinahuib2b.top/logo.png',
    description: organization.description,
    address: organization.address ? {
      '@type': 'PostalAddress',
      streetAddress: organization.address.street,
      addressLocality: organization.address.city,
      addressRegion: organization.address.state,
      postalCode: organization.address.zipCode,
      addressCountry: organization.address.country,
    } : undefined,
    contactPoint: organization.contactPoints?.map((point: any) => ({
      '@type': 'ContactPoint',
      telephone: point.phone,
      contactType: point.type,
      availableLanguage: point.languages || ['en', 'zh-CN'],
    })),
    sameAs: organization.socialLinks,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// BreadcrumbList Schema
export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema: BreadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// FAQ Page Schema
export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const schema: FAQPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Store Schema
export function StoreSchema({ store }: { store: any }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.storeName,
    description: store.description,
    url: `https://chinahuib2b.top/stores/${store.id}`,
    logo: store.logo || 'https://chinahuib2b.top/default-store-logo.png',
    image: store.banner || store.logo,
    address: store.address ? {
      '@type': 'PostalAddress',
      streetAddress: store.address.street,
      addressLocality: store.address.city,
      addressCountry: store.address.country,
    } : undefined,
    geo: store.location ? {
      '@type': 'GeoCoordinates',
      latitude: store.location.lat,
      longitude: store.location.lng,
    } : undefined,
    openingHoursSpecification: store.businessHours ? {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: store.businessHours.days,
      opens: store.businessHours.open,
      closes: store.businessHours.close,
    } : undefined,
    telephone: store.contactPhone,
    email: store.contactEmail,
    priceRange: store.priceRange || '$$',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Exhibition Schema
export function ExhibitionSchema({ exhibition }: { exhibition: any }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: exhibition.name,
    description: exhibition.description,
    startDate: exhibition.startDate,
    endDate: exhibition.endDate,
    location: {
      '@type': 'Place',
      name: exhibition.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: exhibition.city,
        addressCountry: exhibition.country,
      },
    },
    organizer: {
      '@type': 'Organization',
      name: exhibition.organizer,
      url: exhibition.website,
    },
    eventStatus: exhibition.status === 'active' 
      ? 'https://schema.org/EventScheduled'
      : 'https://schema.org/EventCancelled',
    offers: {
      '@type': 'Offer',
      url: `https://chinahuib2b.top/exhibitions/${exhibition.id}`,
      price: exhibition.ticketPrice || 0,
      priceCurrency: 'USD',
      availability: exhibition.status === 'active'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
