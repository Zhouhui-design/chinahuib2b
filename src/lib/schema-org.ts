'use client'

import { Metadata } from 'next'

/**
 * 为产品页面生成 Schema.org 结构化数据
 * 帮助 AI 搜索引擎更好地理解和索引内容
 */
export function generateProductSchema(product: {
  id: string
  name: string
  description: string
  price: number
  currency: string
  availability: 'InStock' | 'OutOfStock' | 'PreOrder'
  brand?: string
  category?: string
  images?: string[]
  rating?: {
    value: number
    count: number
  }
  seller: {
    name: string
    id: string
  }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.[0],
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    offers: {
      '@type': 'Offer',
      url: `https://chinahuib2b.top/products/${product.id}`,
      priceCurrency: product.currency,
      price: product.price,
      availability: `https://schema.org/${product.availability}`,
      seller: {
        '@type': 'Organization',
        name: product.seller.name,
      },
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating.value,
      reviewCount: product.rating.count,
    } : undefined,
  }
}

/**
 * 为店铺页面生成 Schema.org 结构化数据
 */
export function generateStoreSchema(store: {
  id: string
  name: string
  description: string
  url: string
  logo?: string
  address?: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  contactPoint?: {
    telephone: string
    contactType: string
    availableLanguage: string[]
  }
  rating?: {
    value: number
    count: number
  }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.name,
    description: store.description,
    url: store.url,
    logo: store.logo,
    address: store.address ? {
      '@type': 'PostalAddress',
      ...store.address,
    } : undefined,
    contactPoint: store.contactPoint ? {
      '@type': 'ContactPoint',
      ...store.contactPoint,
    } : undefined,
    aggregateRating: store.rating ? {
      '@type': 'AggregateRating',
      ratingValue: store.rating.value,
      reviewCount: store.rating.count,
    } : undefined,
  }
}

/**
 * 为 FAQ 页面生成 Schema.org 结构化数据
 */
export function generateFAQSchema(faqs: Array<{
  question: string
  answer: string
}>) {
  return {
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
}

/**
 * 为 Breadcrumb 生成 Schema.org 结构化数据
 */
export function generateBreadcrumbSchema(items: Array<{
  name: string
  url: string
  position: number
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * 为 Organization 生成 Schema.org 结构化数据
 */
export function generateOrganizationSchema(org: {
  name: string
  url: string
  logo?: string
  sameAs?: string[]  // 社交媒体链接
  contactPoint?: {
    telephone: string
    contactType: string
    email?: string
  }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    logo: org.logo,
    sameAs: org.sameAs,
    contactPoint: org.contactPoint ? {
      '@type': 'ContactPoint',
      ...org.contactPoint,
    } : undefined,
  }
}

/**
 * 在 React 组件中使用示例
 * 
 * import Script from 'next/script'
 * import { generateProductSchema } from '@/lib/schema-org'
 * 
 * const schema = generateProductSchema(product)
 * <Script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
 */
