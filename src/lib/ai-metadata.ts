import { Metadata } from 'next'

/**
 * AI-Friendly Metadata Configuration
 * Optimizes pages for AI crawlers and LLMs
 */
export function generateAIMetadata(
  title: string,
  description: string,
  keywords?: string[]
): Metadata {
  return {
    title,
    description,
    keywords: keywords || [],
    
    // AI-specific metadata
    other: {
      // Allow AI crawlers
      'robots': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      
      // Open Graph for social sharing (also used by AI)
      'og:title': title,
      'og:description': description,
      'og:type': 'website',
      'og:site_name': 'Global Expo Network',
      
      // Twitter Card
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
    },
    
    // Alternative languages for multilingual content
    alternates: {
      languages: {
        'en': '/en',
        'zh': '/zh',
        'ar': '/ar',
        'es': '/es',
        'fr': '/fr',
        'de': '/de',
        'ru': '/ru',
        'ja': '/ja',
        'ko': '/ko',
        'pt': '/pt',
        'hi': '/hi',
      },
    },
  }
}

/**
 * Product-specific AI metadata
 */
export function generateProductMetadata(
  productName: string,
  description: string,
  sellerName: string,
  category: string,
  imageUrl?: string
): Metadata {
  const title = `${productName} - ${sellerName} | Global Expo Network`
  const fullDescription = `${description} - Available from ${sellerName} on Global Expo Network B2B Marketplace`
  
  return {
    title,
    description: fullDescription,
    keywords: [
      productName,
      sellerName,
      category,
      'b2b marketplace',
      'wholesale',
      'supplier',
      'manufacturer',
    ],
    openGraph: {
      title,
      description: fullDescription,
      type: 'website',
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: fullDescription,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

/**
 * Store/Seller profile AI metadata
 */
export function generateStoreMetadata(
  companyName: string,
  description: string,
  country: string,
  city: string,
  logoUrl?: string
): Metadata {
  const title = `${companyName} - B2B Supplier from ${city}, ${country} | Global Expo Network`
  const fullDescription = `${companyName} is a verified supplier from ${city}, ${country}. ${description}`
  
  return {
    title,
    description: fullDescription,
    keywords: [
      companyName,
      country,
      city,
      'supplier',
      'manufacturer',
      'trader',
      'b2b',
      'verified supplier',
    ],
    openGraph: {
      title,
      description: fullDescription,
      type: 'website',
      images: logoUrl ? [{ url: logoUrl }] : undefined,
    },
  }
}
