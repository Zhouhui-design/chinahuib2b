/**
 * Legacy store URL redirect: /stores/[id] → /<storeSlug>
 *
 * 308 permanent redirect to the clean GitHub-style slug URL.
 */

import { permanentRedirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LegacyStoreRedirect({ params }: Props) {
  const { id } = await params

  const seller = await prisma.sellerProfile.findUnique({
    where: { id },
    select: { storeSlug: true },
  })

  if (!seller || !seller.storeSlug) {
    notFound()
  }

  permanentRedirect(`/${seller.storeSlug}`)
}
