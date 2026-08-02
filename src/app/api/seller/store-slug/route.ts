/**
 * Store slug edit API
 *
 * GET  /api/seller/store-slug  → returns current slug, locked status, full URL
 * PUT  /api/seller/store-slug  → validates + updates slug, then locks it (one-time edit)
 *
 * Rules:
 * - Slug can only be changed ONCE. After storeSlugLocked = true, PUT is rejected.
 * - Slug must pass isValidSlug() (format + reserved words).
 * - Slug must be unique across all SellerProfile records.
 * - On success: caches are invalidated and an SEO event is triggered so the
 *   sitemap / search engines pick up the new URL.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { invalidateSellerCaches } from '@/lib/cache'
import { isValidSlug } from '@/lib/store-slug'
import { handleSEOEvent } from '@/lib/seo-automation'

const BASE_URL = 'https://x2xhub.com'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        storeSlug: true,
        storeSlugLocked: true,
        storeSlugChangedAt: true,
      },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      slug: seller.storeSlug,
      locked: seller.storeSlugLocked,
      changedAt: seller.storeSlugChangedAt,
      url: seller.storeSlug ? `${BASE_URL}/${seller.storeSlug}` : null,
    })
  } catch (error) {
    console.error('Get store slug error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch store slug' },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const requestedSlug = typeof body?.slug === 'string' ? body.slug.trim().toLowerCase() : ''

    // 1. Validate format
    if (!isValidSlug(requestedSlug)) {
      return NextResponse.json(
        {
          error:
            'Invalid slug. Use 1-39 lowercase letters, numbers, and hyphens. ' +
            'Must start and end with a letter or number. Reserved words are not allowed.',
        },
        { status: 400 },
      )
    }

    // 2. Load seller + check lock
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, storeSlug: true, storeSlugLocked: true },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    if (seller.storeSlugLocked) {
      return NextResponse.json(
        {
          error:
            'Your store link has already been set and locked. ' +
            'It can only be changed once. Please contact support if you need further changes.',
        },
        { status: 403 },
      )
    }

    // 3. Uniqueness check (exclude self)
    const conflicting = await prisma.sellerProfile.findFirst({
      where: {
        storeSlug: requestedSlug,
        id: { not: seller.id },
      },
      select: { id: true },
    })

    if (conflicting) {
      return NextResponse.json(
        { error: 'This link is already taken by another store. Please choose a different one.' },
        { status: 409 },
      )
    }

    // 4. Update + lock
    await prisma.sellerProfile.update({
      where: { id: seller.id },
      data: {
        storeSlug: requestedSlug,
        storeSlugLocked: true,
        storeSlugChangedAt: new Date(),
      },
    })

    // 5. Invalidate caches (old slug + new slug)
    await invalidateSellerCaches(seller.id, requestedSlug)
    if (seller.storeSlug && seller.storeSlug !== requestedSlug) {
      await invalidateSellerCaches(seller.id, seller.storeSlug)
    }

    // 6. Trigger SEO event so sitemap / indexing picks up the new URL
    try {
      await handleSEOEvent({
        type: 'store_update',
        data: {
          id: seller.id,
          url: `${BASE_URL}/${requestedSlug}`,
          title: 'Store URL updated',
        },
      })
    } catch (e) {
      // Non-fatal: SEO automation is best-effort
      console.error('SEO event failed (non-fatal):', e)
    }

    return NextResponse.json({
      success: true,
      slug: requestedSlug,
      locked: true,
      url: `${BASE_URL}/${requestedSlug}`,
      message: 'Store link updated and locked successfully.',
    })
  } catch (error) {
    console.error('Update store slug error:', error)
    return NextResponse.json(
      { error: 'Failed to update store slug' },
      { status: 500 },
    )
  }
}
