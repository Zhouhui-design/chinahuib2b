/**
 * Backfill script: populate storeSlug for existing SellerProfile records.
 *
 * Strategy:
 * - Query all SellerProfile where storeSlug is null (paged, take: 500)
 * - For each, derive slug from the related User.username
 * - Ensure uniqueness across all sellers (in-memory Set + DB check)
 * - Update the record
 * - Repeat until no null records remain
 *
 * Usage:
 *   npx tsx scripts/migrate-store-slugs.ts          # local DB (DATABASE_URL from .env.local)
 *   NODE_ENV=production npx tsx scripts/migrate-store-slugs.ts   # production
 */

import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { deriveSlugFromUsername, generateUniqueSlugSync, isValidSlug } from '../src/lib/store-slug'

// Boot Prisma the same way db.ts does (so this works standalone)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://expo_dev:dev123@localhost:5432/global_expo_dev',
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter, log: ['error'] })

async function main() {
  console.log('=== Store slug backfill ===')
  console.log(`DB: ${process.env.DATABASE_URL ? '(from env)' : '(default local)'}`)

  // Load all existing slugs into an in-memory set for fast uniqueness checks
  const existingSlugs = new Set<string>()
  const existing = await prisma.sellerProfile.findMany({
    where: { storeSlug: { not: null } },
    select: { storeSlug: true },
  })
  for (const row of existing) {
    if (row.storeSlug) existingSlugs.add(row.storeSlug)
  }
  console.log(`Existing slugs already in DB: ${existingSlugs.size}`)

  let totalProcessed = 0
  let totalAssigned = 0
  let batch = 0

  // Loop until no null storeSlug records remain
  while (true) {
    batch++
    const sellers = await prisma.sellerProfile.findMany({
      where: { storeSlug: null },
      include: {
        user: { select: { username: true } },
      },
      take: 500,
    })

    if (sellers.length === 0) {
      console.log(`Batch ${batch}: no more null records. Done.`)
      break
    }

    console.log(`Batch ${batch}: processing ${sellers.length} sellers...`)

    for (const seller of sellers) {
      totalProcessed++
      const username = seller.user?.username || ''
      let base = deriveSlugFromUsername(username)

      // If derived base is invalid, fall back to random
      if (!isValidSlug(base)) {
        base = deriveSlugFromUsername('')
      }

      const uniqueSlug = generateUniqueSlugSync(base, (s) => existingSlugs.has(s))
      existingSlugs.add(uniqueSlug)

      await prisma.sellerProfile.update({
        where: { id: seller.id },
        data: { storeSlug: uniqueSlug },
      })
      totalAssigned++
      console.log(`  ✓ ${seller.companyName} <- "${uniqueSlug}" (from username: "${username}")`)
    }
  }

  console.log('\n=== Backfill complete ===')
  console.log(`Total processed: ${totalProcessed}`)
  console.log(`Total assigned:   ${totalAssigned}`)

  // Sanity check: confirm no nulls remain
  const remainingNull = await prisma.sellerProfile.count({ where: { storeSlug: null } })
  console.log(`Remaining null storeSlug records: ${remainingNull}`)
  if (remainingNull > 0) {
    console.error('⚠️  Some records still have null storeSlug!')
    process.exitCode = 1
  }
}

main()
  .catch((err) => {
    console.error('Backfill failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
