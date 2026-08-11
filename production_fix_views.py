#!/usr/bin/env python3
"""
在生产服务器上运行: python3 /root/recalc_and_deploy.py
重新计算所有实体的真实浏览量并重启服务
"""
import subprocess, os, sys

DB = "PGPASSWORD='X2Xhub2025Prod' psql -U x2xhub -d x2xhub -h 127.0.0.1 -p 5432"
APP_DIR = "/root/www/x2xhub.com/chinahuib2b"

sql = """
-- 1. 添加 Booth.viewCount 列
ALTER TABLE "Booth" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS "Booth_viewCount_idx" ON "Booth"("viewCount");

-- 2. Product.viewCount: 基于 Visitor 表去重（非自浏览 + 按IP+天去重）
UPDATE "Product" p SET "viewCount" = COALESCE(sub.cnt, 0)
FROM (
    SELECT "productId",
           COUNT(DISTINCT DATE_TRUNC('day', "createdAt") || ':' || "ipHash") AS cnt
    FROM "Visitor"
    WHERE "productId" IS NOT NULL AND "ipHash" IS NOT NULL AND "isSelfView" = false
    GROUP BY "productId"
) sub
WHERE p.id = sub."productId";
UPDATE "Product" SET "viewCount" = 0 WHERE "viewCount" IS NULL;

-- 3. Booth.viewCount = 展会下产品浏览量之和
UPDATE "Booth" b SET "viewCount" = COALESCE(sub.total_views, 0)
FROM (
    SELECT p."boothId", SUM(p."viewCount") AS total_views
    FROM "Product" p WHERE p."boothId" IS NOT NULL GROUP BY p."boothId"
) sub
WHERE b.id = sub."boothId";
UPDATE "Booth" SET "viewCount" = 0 WHERE "viewCount" IS NULL;

-- 4. 重置 AuctionListing 和 MarketplaceTask（历史无去重数据）
UPDATE "AuctionListing" SET "views" = 0;
UPDATE "MarketplaceTask" SET "views" = 0;
"""

print("🔄 Step 1: 重新计算浏览量...")
r = subprocess.run([DB, "-c", sql], capture_output=True, text=True, shell=True)
if r.returncode != 0:
    print(f"❌ SQL 错误: {r.stderr[:500]}")
    sys.exit(1)
print("✅ 浏览量重新计算完成")
print(r.stdout[:500])

print("\n🔄 Step 2: 应用 Prisma migration...")
r = subprocess.run(["npx", "prisma", "migrate", "deploy"], capture_output=True, text=True, cwd=APP_DIR, timeout=60)
print(r.stdout)
if r.returncode != 0:
    print(f"⚠️  Migration 警告: {r.stderr[:500]}")

print("\n🔄 Step 3: 重启 PM2...")
r = subprocess.run(["pm2", "restart", "chinahuib2b"], capture_output=True, text=True, timeout=30)
print(r.stdout)
print("✅ 服务已重启")

print("\n🔄 Step 4: 验证...")
verify = f"""
SELECT 'Product' as entity, COUNT(*) as total,
       SUM(CASE WHEN "viewCount" > 0 THEN 1 ELSE 0 END) as with_views,
       MAX("viewCount") as max_v, ROUND(AVG("viewCount")::numeric,1) as avg_v FROM "Product"
UNION ALL
SELECT 'Booth', COUNT(*), SUM(CASE WHEN "viewCount">0 THEN 1 ELSE 0 END),
       MAX("viewCount"), ROUND(AVG("viewCount")::numeric,1) FROM "Booth"
UNION ALL
SELECT 'Auction', COUNT(*), SUM(CASE WHEN "views">0 THEN 1 ELSE 0 END),
       MAX("views"), ROUND(AVG("views")::numeric,1) FROM "AuctionListing"
UNION ALL
SELECT 'Task', COUNT(*), SUM(CASE WHEN "views">0 THEN 1 ELSE 0 END),
       MAX("views"), ROUND(AVG("views")::numeric,1) FROM "MarketplaceTask";
"""
r = subprocess.run([DB, "-c", verify], capture_output=True, text=True, shell=True)
print(r.stdout)
print("\n🎉 全部完成！浏览量现在是基于真实访客数据计算的。")
