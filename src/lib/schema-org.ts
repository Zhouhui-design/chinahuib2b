/**
 * Schema.org Structured Data for x2xhub.com
 * AI-First B2B Platform - Enhanced for AI Agent Discovery
 */

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "China Hui B2B",
  "alternateName": [
    "x2xhub.com",
    "Global Expo Network"
  ],
  "url": "https://x2xhub.com",
  "logo": "https://x2xhub.com/logo.png",
  "description": "AI-first global B2B marketplace connecting buyers and sellers worldwide with AI-powered tools",
  "sameAs": [
    "https://twitter.com/x2xhub",
    "https://linkedin.com/company/x2xhub"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["English", "Chinese", "Spanish", "Arabic", "French", "German", "Russian", "Japanese", "Korean", "Portuguese"]
  },
  "areaServed": "Worldwide",
  "knowsAbout": [
    "B2B E-commerce",
    "International Trade",
    "Wholesale",
    "Manufacturing",
    "Supply Chain",
    "AI-Powered Commerce"
  ]
}

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "China Hui B2B",
  "url": "https://x2xhub.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://x2xhub.com/products?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "inLanguage": ["en", "zh", "es", "ar", "fr", "de", "ru", "ja", "ko", "pt", "hi", "tr", "th", "id", "vi"],
  "description": "AI-driven B2B marketplace for global trade with multi-language support"
}

export const marketplaceSchema = {
  "@context": "https://schema.org",
  "@type": "OnlineMarketplace",
  "name": "China Hui B2B Marketplace",
  "url": "https://x2xhub.com/marketplace",
  "description": "Task marketplace where anyone or any AI can post and complete business tasks",
  "provider": {
    "@type": "Organization",
    "name": "China Hui B2B",
    "url": "https://x2xhub.com"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "0",
    "highPrice": "999999",
    "offerCount": "1000+"
  }
}

export const productSchema = (product: any) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.title,
  "description": product.description || "",
  "image": product.mainImageUrl || "https://x2xhub.com/default-product.jpg",
  "brand": {
    "@type": "Brand",
    "name": product.seller?.companyName || "Unknown Seller"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": product.currency || "USD",
    "price": product.price || "0",
    "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "seller": {
      "@type": "Organization",
      "name": product.seller?.companyName || ""
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": product.rating || "4.5",
    "reviewCount": product.reviewCount || "0"
  }
})

export const sellerSchema = (seller: any) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": seller.companyName,
  "description": seller.companyDescription || "",
  "url": `https://x2xhub.com/stores/${seller.id}`,
  "logo": seller.logoUrl || "",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": seller.address || "",
    "addressLocality": seller.city || "",
    "addressCountry": seller.country || ""
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "sales",
    "email": seller.email || "",
    "telephone": seller.phone || ""
  },
  "sameAs": seller.website ? [seller.website] : []
})

export const apiDocumentationSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "China Hui B2B API Documentation",
  "description": "Complete API documentation for AI agents to integrate with China Hui B2B platform",
  "url": "https://x2xhub.com/docs",
  "author": {
    "@type": "Organization",
    "name": "China Hui B2B"
  },
  "datePublished": "2026-05-21",
  "dateModified": "2026-05-21",
  "articleSection": "API Documentation",
  "keywords": ["API", "B2B", "AI Integration", "MCP", "REST", "WebSocket"]
}

// Helper function to generate JSON-LD script tag
export const generateJsonLd = (schema: any) => {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}
