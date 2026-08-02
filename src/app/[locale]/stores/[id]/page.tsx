/**
 * Legacy store URL redirect: /[locale]/stores/[id] → /<storeSlug>
 *
 * All stores now have a clean GitHub-style URL (x2xhub.com/<slug>).
 * This page issues a 308 permanent redirect so old links/bookmarks and SEO
 * link equity are forwarded to the new canonical URL.
 *
 * 308 (permanentRedirect) preserves the request method and is the Next.js
 * equivalent of a 301 for SEO weight transfer.
 */

import { permanentRedirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export default async function LegacyStoreRedirect({ params }: Props) {
  const { id } = await params
  console.log('[LegacyStoreRedirect] Processing redirect for id:', id)

  const seller = await prisma.sellerProfile.findUnique({
    where: { id },
    select: { storeSlug: true },
  })
  console.log('[LegacyStoreRedirect] Seller found:', seller ? `slug=${seller.storeSlug}` : 'NOT FOUND')

  // If the seller doesn't exist or has no slug yet, 404
  if (!seller || !seller.storeSlug) {
    notFound()
  }

  // 308 permanent redirect to the clean slug URL (no locale prefix)
  permanentRedirect(`/${seller.storeSlug}`)
}
