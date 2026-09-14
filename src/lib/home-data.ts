/**
 * Homepage data loaders.
 *
 * Why this exists:
 * The homepage used to build its three sections with `fetch()` calls against
 * its OWN public HTTP endpoints, using NEXTAUTH_URL as the base. In production
 * NEXTAUTH_URL is "https://x2xhub.com", so every single render made three
 * SERIAL round-trips out to Cloudflare and back into the same Node process.
 * Worse, two of them could never succeed:
 *
 *   GET /api/products  -> resolveSellerFromRequest() finds no seller -> 404
 *   GET /api/sellers   -> getServerSession() finds no session        -> 401
 *
 * So the homepage paid full network latency three times and then rendered the
 * "no products" / "no exhibitors" empty states anyway. Measured TTFB: ~10.8s.
 *
 * These loaders hit Prisma directly, in parallel, and are cached. No HTTP hop,
 * no auth barrier, and the sections actually render real content.
 */

import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'

export const HOME_REVALIDATE_SECONDS = 300

/** Featured products for the homepage grid (4 cards). */
async function loadFeaturedProductsUncached() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: 4,
    select: {
      id: true,
      title: true,
      images: true,
      mainImageUrl: true,
      acceptsOEM: true,
      category: { select: { name: true } },
      seller: { select: { id: true, storeSlug: true, companyName: true } },
    },
  })
}

/** Verified exhibitors for the homepage grid (4 cards). */
async function loadExhibitorsUncached() {
  return prisma.sellerProfile.findMany({
    where: { isActive: true, isVerified: true, profileStatus: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    take: 4,
    select: {
      id: true,
      storeSlug: true,
      companyName: true,
      country: true,
      logoUrl: true,
    },
  })
}

/** Published exhibition booths for the homepage grid (all published booths). */
async function loadBoothsUncached() {
  const rows = await prisma.booth.findMany({
    where: { isPublished: true, isActive: true },
    orderBy: { createdAt: 'asc' },
    // no take limit: show ALL published booths on the homepage (owner request 2026-09-14)
    include: {
      seller: {
        select: {
          id: true,
          companyName: true,
          country: true,
          city: true,
          logoUrl: true,
        },
      },
      products: {
        select: { id: true, title: true, mainImageUrl: true, images: true },
        take: 4,
      },
    },
  })

  // BoothCard is a client component: it needs plain JSON, not Date/Json/null.
  // unstable_cache serializes anyway, so map explicitly and keep types honest.
  // Optional keys are spread conditionally rather than set to `undefined`,
  // because tsconfig has exactOptionalPropertyTypes enabled.
  return rows.map((b) => ({
    id: b.id,
    name: b.name,
    ...(b.names ? { names: b.names as Record<string, string> } : {}),
    exhibitionName: b.exhibitionName,
    ...(b.exhibitionDates
      ? { exhibitionDates: b.exhibitionDates as { start: string; end: string } }
      : {}),
    ...(b.location ? { location: b.location } : {}),
    ...(b.logoUrl ? { logoUrl: b.logoUrl } : {}),
    ...(b.bannerUrl ? { bannerUrl: b.bannerUrl } : {}),
    ...(Array.isArray(b.keywords) ? { keywords: b.keywords as string[] } : {}),
    ...(b.theme ? { theme: b.theme } : {}),
    ...(b.layout ? { layout: b.layout } : {}),
    isActive: b.isActive,
    isPublished: b.isPublished,
    createdAt: b.createdAt.toISOString(),
    seller: {
      id: b.seller.id,
      companyName: b.seller.companyName,
      country: b.seller.country,
      city: b.seller.city,
      ...(b.seller.logoUrl ? { logoUrl: b.seller.logoUrl } : {}),
    },
    products: b.products.map((p) => ({
      id: p.id,
      title: p.title,
      mainImageUrl: p.mainImageUrl,
      images: p.images,
    })),
  }))
}

const getFeaturedProducts = unstable_cache(
  loadFeaturedProductsUncached,
  ['home:featured-products'],
  { revalidate: HOME_REVALIDATE_SECONDS, tags: ['home', 'products'] },
)

const getExhibitors = unstable_cache(
  loadExhibitorsUncached,
  ['home:exhibitors'],
  { revalidate: HOME_REVALIDATE_SECONDS, tags: ['home', 'sellers'] },
)

const getBooths = unstable_cache(
  loadBoothsUncached,
  ['home:booths'],
  { revalidate: HOME_REVALIDATE_SECONDS, tags: ['home', 'booths'] },
)

/**
 * Load every homepage section in parallel.
 * A failure in one section degrades that section only; it never takes the
 * page down and never blocks the other two.
 */
export async function getHomePageData() {
  const [products, sellers, booths] = await Promise.allSettled([
    getFeaturedProducts(),
    getExhibitors(),
    getBooths(),
  ])

  if (products.status === 'rejected') {
    console.error('[home] featured products failed:', products.reason)
  }
  if (sellers.status === 'rejected') {
    console.error('[home] exhibitors failed:', sellers.reason)
  }
  if (booths.status === 'rejected') {
    console.error('[home] booths failed:', booths.reason)
  }

  return {
    featuredProducts: products.status === 'fulfilled' ? products.value : [],
    exhibitors: sellers.status === 'fulfilled' ? sellers.value : [],
    booths: booths.status === 'fulfilled' ? booths.value : [],
  }
}
