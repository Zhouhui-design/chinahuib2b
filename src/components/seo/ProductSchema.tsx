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
    seller: {
      companyName: string
      country: string
      city: string
    }
  }
  baseUrl?: string
}

export default function ProductSchema({ product, baseUrl = 'https://chinahuib2b.top' }: ProductSchemaProps) {
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
      }
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/products/${product.id}`,
      "availability": "https://schema.org/InStock",
      "priceCurrency": "USD",
      "minOrderQuantity": product.minOrderQty || 1
    }
  }

  return (
    <Script
      id={`product-schema-${product.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
