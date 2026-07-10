'use client'

import Script from 'next/script'

interface ProductSchemaProps {
  product: {
    id: string
    title: string
    titleEn?: string
    description?: string
    mainImageUrl: string
    images: string[]
    minOrderQty?: number
    supplyCapacity?: string
    category?: {
      name: string
      nameEn?: string
    }
    seller: {
      companyName: string
      country: string
      city: string
      mapLatitude?: number
      mapLongitude?: number
    }
  }
  baseUrl?: string
}

export default function ProductSchema({ product, baseUrl = 'https://x2xhub.com' }: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.titleEn || product.title,
    "description": product.description || '',
    "image": [
      `${baseUrl}${product.mainImageUrl}`,
      ...product.images.slice(0, 4).map(img => `${baseUrl}${img}`)
    ],
    "brand": {
      "@type": "Brand",
      "name": product.seller.companyName
    },
    "manufacturer": {
      "@type": "Organization",
      "name": product.seller.companyName,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": product.seller.country,
        "addressLocality": product.seller.city
      },
      "geo": product.seller.mapLatitude && product.seller.mapLongitude ? {
        "@type": "GeoCoordinates",
        "latitude": product.seller.mapLatitude,
        "longitude": product.seller.mapLongitude
      } : undefined
    },
    "category": product.category?.nameEn || product.category?.name,
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/products/${product.id}`,
      "availability": "https://schema.org/InStock",
      "priceCurrency": "USD",
      "minOrderQuantity": product.minOrderQty || 1
    },
    "keywords": `${product.title}, ${product.seller.city}, ${product.seller.country}, ${product.category?.name || ''}`
  }

  return (
    <Script
      id={`product-schema-${product.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
