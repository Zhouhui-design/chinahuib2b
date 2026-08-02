import { prisma } from '@/lib/db'
import { BASE_URL } from '@/lib/seo'
import { Metadata } from 'next'
import AuctionDetailClient from './AuctionDetailClient'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const listing = await prisma.auctionListing.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        price: true,
        currency: true,
        status: true,
        images: true,
        sellerId: true,
        createdAt: true,
        updatedAt: true,
        type: true,
        isVerified: true,
        minOrderQty: true,
      },
    })

    if (!listing) {
      return {
        title: 'Auction Not Found | SeaHeart Global',
      }
    }

    const title = listing.title
    const description = listing.description
      ? listing.description.substring(0, 200)
      : `Buy ${listing.title} at competitive prices on SeaHeart Global global B2B auction platform. Verified suppliers, secure trade, worldwide shipping.`

    const priceText = listing.price ? `${listing.price} ${listing.currency}` : 'Contact for price'
    const image = listing.images[0] || `${BASE_URL}/og-image.png`

    const keywords = [
      title,
      listing.category || '',
      'B2B auction',
      'global trade',
      'industrial supply',
      listing.isVerified ? 'verified supplier' : '',
      'wholesale',
      'international trade',
    ].filter(Boolean).join(', ')

    return {
      title: `${title} - B2B Auction | SeaHeart Global`,
      description,
      keywords,
      alternates: {
        canonical: `${BASE_URL}/auction/${listing.id}`,
      },
      openGraph: {
        title: `${title} - B2B Auction | SeaHeart Global`,
        description,
        url: `${BASE_URL}/auction/${listing.id}`,
        type: 'product',
        images: [{ url: image, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} - B2B Auction`,
        description,
        images: [image],
      },
    }
  } catch (error) {
    console.error('Error generating auction metadata:', error)
    return {
      title: 'Auction Listing | SeaHeart Global',
    }
  }
}

export default async function AuctionDetailPage({ params }: PageProps) {
  let listing

  try {
    listing = await prisma.auctionListing.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            displayName: true,
            company: true,
            avatarUrl: true,
            isVerified: true,
            storeSlug: true,
          },
        },
        bids: {
          orderBy: { amount: 'desc' },
          take: 5,
          include: {
            bidder: {
              select: { displayName: true, company: true },
            },
          },
        },
      },
    })
  } catch (error) {
    console.error('Error fetching auction listing:', error)
    notFound()
  }

  if (!listing || !['ACTIVE', 'PENDING'].includes(listing.status)) {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    image: listing.images,
    sku: listing.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: listing.currency,
      price: listing.price?.toString() || undefined,
      availability: listing.status === 'ACTIVE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${BASE_URL}/auction/${listing.id}`,
    },
    aggregateRating: listing.isVerified ? {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '10+',
    } : undefined,
    ...(listing.seller ? {
      author: {
        '@type': 'Organization',
        name: listing.seller.displayName || listing.seller.company || 'Verified Supplier',
        url: listing.seller.storeSlug
          ? `${BASE_URL}/${listing.seller.storeSlug}`
          : `${BASE_URL}/stores/${listing.seller.id}`,
      },
    } : {}),
    url: `${BASE_URL}/auction/${listing.id}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AuctionDetailClient listing={listing} />
    </>
  )
}
