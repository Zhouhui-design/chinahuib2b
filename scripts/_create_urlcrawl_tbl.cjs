require('dotenv').config({ path: '/var/www/chinahuib2b/.env.production' });
const { PrismaClient, $queryRaw, $executeRaw } = require('/var/www/chinahuib2b/node_modules/@prisma/client');
const p = new PrismaClient();
(async () => {
  const q1 = `CREATE TYPE "UrlCrawlCategory" AS ENUM ('PRODUCT', 'MARKETPLACE', 'STATIC', 'AUTH', 'FILTER')`;
  const q2 = `CREATE TYPE "UrlCrawlStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'SKIPPED')`;
  const q3 = `CREATE TABLE IF NOT EXISTS "UrlCrawlRecord" (
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
  )`;
  const ixs = [
    `CREATE INDEX IF NOT EXISTS "UrlCrawlRecord_category_idx" ON "UrlCrawlRecord"(category)`,
    `CREATE INDEX IF NOT EXISTS "UrlCrawlRecord_status_idx" ON "UrlCrawlRecord"(status)`,
    `CREATE INDEX IF NOT EXISTS "UrlCrawlRecord_lastCheckedAt_idx" ON "UrlCrawlRecord"("lastCheckedAt")`,
    `CREATE INDEX IF NOT EXISTS "UrlCrawlRecord_nextCheckAt_idx" ON "UrlCrawlRecord"("nextCheckAt")`,
  ];
  try { await p.$executeRawUnsafe(q1); console.log('+ enum UrlCrawlCategory'); } catch (e) { if ((e.message||'').includes('already exists')) console.log('= enum UrlCrawlCategory exists'); else console.error('ERR1:', e.message); }
  try { await p.$executeRawUnsafe(q2); console.log('+ enum UrlCrawlStatus'); } catch (e) { if ((e.message||'').includes('already exists')) console.log('= enum UrlCrawlStatus exists'); else console.error('ERR2:', e.message); }
  try { await p.$executeRawUnsafe(q3); console.log('+ table UrlCrawlRecord'); } catch (e) { if ((e.message||'').includes('already exists')) console.log('= table exists'); else console.error('ERR3:', e.message); }
  for (const i of ixs) {
    try { await p.$executeRawUnsafe(i); console.log('+ index'); } catch(e){}
  }
  console.log('Done.');
  await p.$disconnect();
})();
