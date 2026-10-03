import { prisma } from '@/lib/db'
import { BASE_URL } from '@/lib/seo'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AuctionDetailClient from '@/app/auction/[id]/AuctionDetailClient'

// Locale-prefixed auction detail route (/<locale>/auction/<id>).
// The sitemap and geo-redirected crawlers land here. Next 15 requires
// `params` to be awaited — the legacy unprefixed page used the synchronous
// form, which is why the prefixed URLs 404'd. This page awaits params.
interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

async function getListing(id: string) {
  return prisma.auctionListing.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          logoUrl: true,
          isVerified: true,
          storeSlug: true,
        },
      },
      bids: {
        orderBy: { amount: 'desc' as const },
        take: 5,
        include: {
          bidder: { select: { displayName: true, company: true } },
        },
      },
    },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const listing = await prisma.auctionListing.findUnique({
      where: { id },
      select: {
        id: true, title: true, description: true, category: true,
        price: true, currency: true, status: true, images: true,
        sellerId: true, createdAt: true, updatedAt: true, type: true,
        isVerified: true, minOrderQty: true,
      },
    })
    if (!listing) return { title: 'Auction Not Found' }

    const title = listing.title
    const description = listing.description
      ? listing.description.substring(0, 200)
      : `Buy ${listing.title} at competitive prices on SeaHeart Global global B2B auction platform. Verified suppliers, secure trade, worldwide shipping.`
    const image = listing.images[0] || `${BASE_URL}/og-image.png`
    const keywords = [
      title, listing.category || '', 'B2B auction', 'global trade',
      'industrial supply', listing.isVerified ? 'verified supplier' : '',
      'wholesale', 'international trade',
    ].filter(Boolean).join(', ')

    return {
      title: `${title} - B2B Auction`,
      description,
      keywords,
      // Canonical stays on the unprefixed form so all locale variants
      // consolidate ranking signals onto one URL.
      alternates: { canonical: `${BASE_URL}/auction/${listing.id}` },
      openGraph: {
        title: `${title} - B2B Auction`,
        description,
        type: 'website',
        url: `${BASE_URL}/auction/${listing.id}`,
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
    return { title: 'Auction Listing' }
  }
}

export default async function LocaleAuctionDetailPage({ params }: PageProps) {
  const { id } = await params
  let listing
  try {
    listing = await getListing(id)
  } catch (error) {
    console.error('Error fetching auction listing:', error)
    notFound()
  }
  if (!listing || !['ACTIVE', 'PENDING'].includes(listing.status)) notFound()

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
      '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: '10+',
    } : undefined,
    ...(listing.seller ? {
      author: {
        '@type': 'Organization',
        name: listing.seller.companyName || listing.seller.contactName || 'Verified Supplier',
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
