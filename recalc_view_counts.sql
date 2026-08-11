-- =============================================
-- 重新计算所有实体的真实浏览量
-- 运行方式: psql -U x2xhub -d x2xhub -h 127.0.0.1 -p 5432 -f recalc_view_counts.sql
-- =============================================

-- 1. 添加 Booth.viewCount 列（如果不存在）
ALTER TABLE "Booth" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS "Booth_viewCount_idx" ON "Booth"("viewCount");

-- 2. 重新计算 Product.viewCount
-- 真实浏览量 = 非自浏览的去重访客数（按ipHash+天去重）
UPDATE "Product" p SET "viewCount" = COALESCE(sub.cnt, 0)
FROM (
    SELECT "productId",
           COUNT(DISTINCT DATE_TRUNC('day', "createdAt") || ':' || "ipHash") AS cnt
    FROM "Visitor"
    WHERE "productId" IS NOT NULL
      AND "ipHash" IS NOT NULL
      AND "isSelfView" = false
    GROUP BY "productId"
) sub
WHERE p.id = sub."productId";

UPDATE "Product" SET "viewCount" = 0 WHERE "viewCount" IS NULL;

-- 3. 重新计算 Booth.viewCount
-- 展会浏览量 = 展会下所有产品的浏览量之和
UPDATE "Booth" b SET "viewCount" = COALESCE(sub.total_views, 0)
FROM (
    SELECT p."boothId", SUM(p."viewCount") AS total_views
    FROM "Product" p
    WHERE p."boothId" IS NOT NULL
    GROUP BY p."boothId"
) sub
WHERE b.id = sub."boothId";

UPDATE "Booth" SET "viewCount" = 0 WHERE "viewCount" IS NULL;

-- 4. 重置 AuctionListing.views (历史数据无去重记录)
UPDATE "AuctionListing" SET "views" = 0;

-- 5. 重置 MarketplaceTask.views (历史数据无去重记录)
UPDATE "MarketplaceTask" SET "views" = 0;

-- =============================================
-- 验证查询
-- =============================================
SELECT 'Product' as entity, COUNT(*) as total,
       SUM(CASE WHEN "viewCount" > 0 THEN 1 ELSE 0 END) as with_views,
       MAX("viewCount") as max_views,
       ROUND(AVG("viewCount")::numeric, 1) as avg_views
FROM "Product"
UNION ALL
SELECT 'Booth', COUNT(*),
       SUM(CASE WHEN "viewCount" > 0 THEN 1 ELSE 0 END),
       MAX("viewCount"),
       ROUND(AVG("viewCount")::numeric, 1)
FROM "Booth"
UNION ALL
SELECT 'Auction', COUNT(*),
       SUM(CASE WHEN "views" > 0 THEN 1 ELSE 0 END),
       MAX("views"),
       ROUND(AVG("views")::numeric, 1)
FROM "AuctionListing"
UNION ALL
SELECT 'Task', COUNT(*),
       SUM(CASE WHEN "views" > 0 THEN 1 ELSE 0 END),
       MAX("views"),
       ROUND(AVG("views")::numeric, 1)
FROM "MarketplaceTask";
