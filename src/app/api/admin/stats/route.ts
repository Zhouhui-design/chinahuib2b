import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/admin/stats
 * Admin dashboard aggregated statistics.
 *
 * User counting rule (independent entities):
 *   - AI accounts (isAI=true) are sub-accounts of guardians; they do NOT count as separate entities.
 *   - A "user" = a human user (isAI=false or isAI is null).
 *   - Total AI accounts are reported separately as aiAccounts.
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      totalAccounts,
      aiAccounts,
      totalProducts,
      totalSellers,
      activeUsers,
      totalBooths,
      totalDistinctExhibitions,
      pendingSellerApprovals,
      draftSellerApprovals,
    ] = await Promise.all([
      // Independent human users (exclude AI accounts - they are not separate entities)
      // isAI is a non-nullable Boolean @default(false), so `isAI: null` is invalid
      // for Prisma and used to throw PrismaClientValidationError.
      prisma.user.count({
        where: { isAI: false },
      }),
      // Total accounts in the system (humans + AI) - useful for DB stats
      prisma.user.count(),
      // AI accounts only
      prisma.user.count({
        where: { isAI: true },
      }),
      // Total products (all statuses - admin needs to see the full picture)
      prisma.product.count(),
      // Total APPROVED sellers (only approved sellers are considered "official" sellers)
      prisma.sellerProfile.count({
        where: { profileStatus: 'APPROVED' },
      }),
      // Active users in last 24h (independent users only - exclude AI activity noise)
      prisma.user.count({
        where: {
          AND: [
            { isAI: false },
            {
              OR: [
                { lastLoginAt: { gte: oneDayAgo } },
                { lastSeenAt: { gte: oneDayAgo } },
              ],
            },
          ],
        },
      }),
      // Total active booths (each booth = an exhibition spot)
      prisma.booth.count({
        where: { isActive: true },
      }),
      // Total distinct exhibitions (by exhibitionName)
      prisma.$queryRaw`
        SELECT COUNT(DISTINCT "exhibitionName")::int AS cnt
        FROM "Booth"
        WHERE "isActive" = true AND "exhibitionName" IS NOT NULL
      ` as Promise<{ cnt: number }[]>,
      // Pending seller profile approvals (submitted, awaiting review)
      prisma.sellerProfile.count({
        where: { profileStatus: 'PENDING' },
      }),
      // Draft seller profiles (not yet submitted)
      prisma.sellerProfile.count({
        where: { profileStatus: 'DRAFT' },
      }),
    ])

    const totalExhibitions =
      Array.isArray(totalDistinctExhibitions) && totalDistinctExhibitions[0]?.cnt
        ? Number(totalDistinctExhibitions[0].cnt)
        : 0

    return NextResponse.json({
      success: true,
      data: {
        // Main dashboard stats
        totalUsers,        // Independent entities (human users only) - the real user count
        totalAccounts,     // All DB accounts including AI (for monitoring)
        aiAccounts,        // Pure AI accounts (for AI monitoring page)
        totalProducts,     // All products in the system
        totalSellers,      // APPROVED sellers only (official sellers)
        activeUsers,       // Human users active in last 24h
        totalBooths,       // Active booths (one booth = one exhibition participation)
        totalExhibitions,  // Distinct exhibition names across all booths
        pendingSellerApprovals,  // PENDING status - submitted, awaiting review
        draftSellerApprovals,    // DRAFT status - not yet submitted

        // Rules for transparency
        rules: {
          userCountExcludesAI: true,
          userCountDescription: 'Only independent human users (isAI=false/null). AI accounts are sub-accounts of guardians and share the same entity.',
          aiCountedSeparately: true,
          sellerCountDescription: 'Only APPROVED sellers (profileStatus=APPROVED). DRAFT/PENDING are reported separately.',
          productCountDescription: 'All products regardless of isActive flag.',
        },
      },
    })
  } catch (error) {
    console.error('[Admin Stats] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 })
  }
}
