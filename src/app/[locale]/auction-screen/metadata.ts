import type { Metadata } from 'next'
import { BASE_URL } from '@/lib/seo'

export function generateMetadata(): Metadata {
  return {
    title: 'X2XHub - Global B2B Trade Exhibition | Auction & Marketplace',
    description: 'Discover global B2B trade opportunities. Buy and sell products through our auction and marketplace platform. Connect with verified suppliers worldwide.',
    keywords: ['B2B auction', 'global trade', 'product sourcing', 'verified suppliers', 'international trade', 'wholesale marketplace'],
    alternates: {
      canonical: `${BASE_URL}/auction-screen`,
    },
    openGraph: {
      title: 'X2XHub - Global B2B Trade Exhibition | Auction & Marketplace',
      description: 'Discover global B2B trade opportunities. Buy and sell products through our auction and marketplace platform.',
      url: `${BASE_URL}/auction-screen`,
      type: 'website',
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'X2XHub B2B Trade Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'X2XHub - Global B2B Trade Exhibition',
      description: 'Discover global B2B trade opportunities with verified suppliers worldwide.',
      images: [`${BASE_URL}/og-image.png`],
    },
  }
}