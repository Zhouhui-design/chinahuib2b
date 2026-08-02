/**
 * Schema.org Structured Data Components for SEO
 */

import type { Product, Organization, BreadcrumbList, FAQPage } from 'schema-dts'

// Product Schema
export function ProductSchema({ product }: { product: any }) {
  const schema: Product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.titleEn || product.name || product.title,
    description: product.description,
    image: product.images?.[0] || product.mainImageUrl || '',
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || product.storeName || product.seller?.companyName || 'SeaHeart Global',
    },
    manufacturer: product.seller ? {
      '@type': 'Organization',
      name: product.seller.companyName,
      address: {
        '@type': 'PostalAddress',
        addressCountry: product.seller.country,
        addressLocality: product.seller.city,
      },
      geo: product.seller.mapLatitude && product.seller.mapLongitude ? {
        '@type': 'GeoCoordinates',
        latitude: product.seller.mapLatitude,
        longitude: product.seller.mapLongitude,
      } : undefined,
    } : undefined,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'USD',
      availability: product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `https://x2xhub.com/products/${product.id}`,
      seller: {
        '@type': 'Organization',
        name: product.storeName || product.seller?.companyName || 'SeaHeart Global',
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      minOrderQuantity: product.minOrderQty || 1,
    },
    aggregateRating: product.averageRating ? {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount || 0,
    } : undefined,
    category: product.category?.name || product.category,
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
    url: organization.url || 'https://x2xhub.com',
    logo: organization.logo || 'https://x2xhub.com/logo.png',
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
  // Resolve localized description from multi-language descriptions object
  const description = store.descriptions && typeof store.descriptions === 'object'
    ? (store.descriptions['en'] || store.descriptions['zh'] || store.description || '')
    : (store.description || '')

  const hasAddress = store.address || store.city || store.country
  const hasGeo = store.mapLatitude != null && store.mapLongitude != null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.companyName,
    description: description || undefined,
    url: store.storeSlug
      ? `https://x2xhub.com/${store.storeSlug}`
      : `https://x2xhub.com/stores/${store.id}`,
    logo: store.logoUrl || undefined,
    image: store.bannerUrl || store.logoUrl || undefined,
    address: hasAddress ? {
      '@type': 'PostalAddress',
      streetAddress: store.address || undefined,
      addressLocality: store.city || undefined,
      addressCountry: store.country || undefined,
    } : undefined,
    geo: hasGeo ? {
      '@type': 'GeoCoordinates',
      latitude: store.mapLatitude,
      longitude: store.mapLongitude,
    } : undefined,
    telephone: store.phone || undefined,
    email: store.email || undefined,
    ...(store.website ? { sameAs: [store.website] } : {}),
  }

  // Remove undefined/null values for clean JSON-LD output
  const cleanSchema = JSON.parse(JSON.stringify(schema))

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
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
      url: `https://x2xhub.com/exhibitions/${exhibition.id}`,
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
