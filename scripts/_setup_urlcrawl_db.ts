import { prisma } from '@/lib/db'

async function main() {
  const statements = [
    `DO $$ BEGIN
      CREATE TYPE "UrlCrawlCategory" AS ENUM ('PRODUCT', 'MARKETPLACE', 'STATIC', 'AUTH', 'FILTER');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "UrlCrawlStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'SKIPPED');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `CREATE TABLE IF NOT EXISTS "UrlCrawlRecord" (
      id TEXT PRIMARY KEY NOT NULL,
      url TEXT NOT NULL UNIQUE,
      category "UrlCrawlCategory" NOT NULL,
      status "UrlCrawlStatus" NOT NULL DEFAULT 'PENDING',
      "statusCode" INTEGER,
      "errorMessage" TEXT,
      "responseTime" INTEGER,
      "redirectCount" INTEGER,
      "finalUrl" TEXT,
      "lastCheckedAt" TIMESTAMP(3),
      "nextCheckAt" TIMESTAMP(3),
      "retryCount" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS "UrlCrawlRecord_category_idx" ON "UrlCrawlRecord"(category)`,
    `CREATE INDEX IF NOT EXISTS "UrlCrawlRecord_status_idx" ON "UrlCrawlRecord"(status)`,
    `CREATE INDEX IF NOT EXISTS "UrlCrawlRecord_lastCheckedAt_idx" ON "UrlCrawlRecord"("lastCheckedAt")`,
    `CREATE INDEX IF NOT EXISTS "UrlCrawlRecord_nextCheckAt_idx" ON "UrlCrawlRecord"("nextCheckAt")`,
  ]
  for (const s of statements) {
    try {
      await prisma.$executeRawUnsafe(s)
      console.log('OK', s.slice(0, 80).replace(/\s+/g, ' '))
    } catch (e: any) {
      if (/already exists|duplicate|already/.test(e.message || '')) console.log('EXISTS')
      else { console.error('ERR:', e.message); process.exitCode = 1 }
    }
  }
  console.log('DB setup complete.')
  await prisma.$disconnect()
}

main()
