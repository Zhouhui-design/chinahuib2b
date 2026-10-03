import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * POST /api/inquiries
 *
 * Public product-inquiry submission. A buyer who is not logged in (the common
 * cold-start case: the platform has ~0 registered buyers) can still send an
 * inquiry, which is the whole point of a B2B product page.
 *
 * The Inquiry model requires a `buyerId` FK to User. For guest submissions we
 * do not force account creation; instead we attach the buyer's contact details
 * to `contactInfo` and, when no authenticated buyer is present, use a stable
 * system "guest" user so the relational schema stays satisfied without
 * fabricating per-submission accounts.
 */
export async function POST(request: NextRequest) {
  let body: {
    productId?: string
    sellerId?: string
    message?: string
    name?: string
    email?: string
    company?: string
    country?: string
    quantity?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { productId, sellerId, message, name, email, company, country, quantity } = body

  if (!productId || !sellerId) {
    return NextResponse.json({ error: 'productId and sellerId are required.' }, { status: 400 })
  }
  if (!message || !message.trim()) {
    return NextResponse.json({ error: 'A message describing your requirement is required.' }, { status: 400 })
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid contact email is required.' }, { status: 400 })
  }

  // Verify the product + seller exist so we never 500 on a dangling FK.
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, sellerId: true, title: true },
  })
  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
  }

  // Resolve a buyerId. Guests map to (or create) a single system user so the
  // Inquiry.buyerId FK is always satisfiable without inventing accounts.
  const buyerId = await resolveGuestBuyerId()

  // Compose a contact blob that preserves everything the buyer gave us.
  const contactInfo = JSON.stringify({
    name: name?.trim() || null,
    email: email.trim(),
    company: company?.trim() || null,
    country: country?.trim() || null,
    quantity: quantity?.trim() || null,
    channel: 'product-page',
  })

  try {
    const inquiry = await prisma.inquiry.create({
      data: {
        buyerId,
        sellerId: product.sellerId,
        productId: product.id,
        message: message.trim(),
        contactInfo,
        status: 'PENDING',
      },
    })

    // Best-effort denormalized counter shown on the product page.
    await prisma.product.update({
      where: { id: product.id },
      data: { inquiryCount: { increment: 1 } },
    }).catch(() => {})

    return NextResponse.json({ ok: true, inquiryId: inquiry.id }, { status: 201 })
  } catch (err) {
    console.error('[inquiries] create failed:', err)
    return NextResponse.json({ error: 'Failed to submit inquiry. Please try again.' }, { status: 500 })
  }
}

/**
 * Find or create the shared guest user used for unauthenticated inquiries.
 * Cached on module scope to avoid a lookup per request.
 */
let cachedGuestId: string | null = null
const GUEST_USERNAME = 'guest-buyer'
async function resolveGuestBuyerId(): Promise<string> {
  if (cachedGuestId) return cachedGuestId

  const existing = await prisma.user.findUnique({
    where: { username: GUEST_USERNAME },
    select: { id: true },
  })
  if (existing) {
    cachedGuestId = existing.id
    return existing.id
  }

  try {
    const created = await prisma.user.create({
      data: {
        username: GUEST_USERNAME,
        email: 'guest-buyer@x2xhub.local',
        displayName: 'Guest Buyer',
        password: 'guest-no-login', // column is required; this account never logs in
        role: 'BUYER',
      },
      select: { id: true },
    })
    cachedGuestId = created.id
    return created.id
  } catch {
    // Concurrent cold-start requests may race to create the guest user; on a
    // unique-violation just read it back.
    const again = await prisma.user.findUnique({
      where: { username: GUEST_USERNAME },
      select: { id: true },
    })
    if (!again) throw new Error('Unable to resolve guest buyer account')
    cachedGuestId = again.id
    return again.id
  }
}
