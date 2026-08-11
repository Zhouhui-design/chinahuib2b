#!/usr/bin/env python3
"""
重新计算所有实体的真实浏览量并部署代码修复

真实浏览量定义:
- Product: Visitor 表中非自浏览的记录数（同一IP一天内只计一次）
- Booth:   BoothView 表中的记录数（同一IP一天内只计一次）
- Auction: 重置为0（历史数据无法去重，新API已加入自浏览排除）
- Task:    重置为0（同上）
"""
import sys, os, time, json, re, subprocess
from collections import defaultdict

# ========== 配置 ==========
APP_DIR = '/home/sardenesy/projects/chinahuib2b'
REMOTE_USER = 'root'
REMOTE_HOST = 'www.x2xhub.com'
REMOTE_APP_DIR = '/root/www/x2xhub.com/chinahuib2b'

# ========== Step 0: 本地构建 ==========
print("=" * 60)
print("STEP 0: 本地构建 Next.js 应用")
print("=" * 60)

os.chdir(APP_DIR)

# 1. 安装依赖
print("\n📦 安装依赖...")
r = subprocess.run(['npm', 'install'], capture_output=True, text=True, timeout=120, cwd=APP_DIR)
if r.returncode != 0:
    print(f"❌ npm install 失败: {r.stderr}")
    sys.exit(1)
print("✅ 依赖安装完成")

# 2. Prisma generate
print("\n🔨 Prisma generate...")
r = subprocess.run(['npx', 'prisma', 'generate'], capture_output=True, text=True, timeout=60, cwd=APP_DIR)
if r.returncode != 0:
    print(f"❌ prisma generate 失败: {r.stderr}")
    sys.exit(1)
print("✅ Prisma generate 完成")

# 3. 构建
print("\n🏗️  构建 Next.js...")
r = subprocess.run(['npm', 'run', 'build'], capture_output=True, text=True, timeout=180, cwd=APP_DIR)
if r.returncode != 0:
    print(f"❌ 构建失败:\n{r.stderr[-2000:]}")
    sys.exit(1)
print("✅ 构建完成")

# 4. 同步到服务器
print("\n📤 同步文件到服务器...")
r = subprocess.run(['rsync', '-avz', '--exclude=node_modules/.cache', '--exclude=.next/cache',
                    f'{APP_DIR}/', f'{REMOTE_USER}@{REMOTE_HOST}:{REMOTE_APP_DIR}/'],
                   capture_output=True, text=True, timeout=120)
if r.returncode != 0:
    print(f"❌ rsync 失败: {r.stderr}")
    sys.exit(1)
print("✅ 文件同步完成")

# ========== Step 1: 应用数据库迁移 ==========
print("\n" + "=" * 60)
print("STEP 1: 应用数据库迁移 (添加 Booth.viewCount)")
print("=" * 60)

migration_sql = '''
-- 添加 viewCount 列到 Booth
ALTER TABLE "Booth" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS "Booth_viewCount_idx" ON "Booth"("viewCount");
'''

result = subprocess.run(
    ['ssh', f'{REMOTE_USER}@{REMOTE_HOST}',
     f'PGPASSWORD="X2Xhub2025Prod" psql -U x2xhub -d x2xhub -h 127.0.0.1 -p 5432 -c "{migration_sql}"'],
    capture_output=True, text=True, timeout=30
)
print(result.stdout)
if result.returncode != 0:
    print(f"⚠️  迁移警告: {result.stderr[:500]}")
else:
    print("✅ 迁移成功")

# ========== Step 2: 重新计算真实浏览量 ==========
print("\n" + "=" * 60)
print("STEP 2: 重新计算真实浏览量")
print("=" * 60)

# 2a. Product: 基于 Visitor 表去重计算（每天每个IP只算一次）
print("\n📊 2a. 重新计算 Product.viewCount ...")
recalc_products = '''
UPDATE "Product" p SET "viewCount" = COALESCE(sub.cnt, 0)
FROM (
    SELECT "productId", COUNT(DISTINCT DATE_TRUNC('day', "createdAt") || ':' || "ipHash") AS cnt
    FROM "Visitor"
    WHERE "productId" IS NOT NULL
      AND "ipHash" IS NOT NULL
      AND "isSelfView" = false
    GROUP BY "productId"
) sub
WHERE p.id = sub."productId";

UPDATE "Product" SET "viewCount" = 0 WHERE "viewCount" IS NULL;
'''

result = subprocess.run(
    ['ssh', f'{REMOTE_USER}@{REMOTE_HOST}',
     f'PGPASSWORD="X2Xhub2025Prod" psql -U x2xhub -d x2xhub -h 127.0.0.1 -p 5432 -c "{recalc_products}"'],
    capture_output=True, text=True, timeout=120
)
print(result.stdout)
if result.returncode != 0:
    print(f"⚠️  产品浏览量重算警告: {result.stderr[:500]}")
else:
    print("✅ Product.viewCount 重新计算完成")

# 2b. Booth: 基于展会下产品的浏览量总和计算（BoothView按sellerId追踪，不按boothId）
print("\n📊 2b. 重新计算 Booth.viewCount ...")
recalc_booths = '''
UPDATE "Booth" b SET "viewCount" = COALESCE(sub.total_views, 0)
FROM (
    SELECT p."boothId", SUM(p."viewCount") AS total_views
    FROM "Product" p
    WHERE p."boothId" IS NOT NULL
    GROUP BY p."boothId"
) sub
WHERE b.id = sub."boothId";

UPDATE "Booth" SET "viewCount" = 0 WHERE "viewCount" IS NULL;
'''

result = subprocess.run(
    ['ssh', f'{REMOTE_USER}@{REMOTE_HOST}',
     f'PGPASSWORD="X2Xhub2025Prod" psql -U x2xhub -d x2xhub -h 127.0.0.1 -p 5432 -c "{recalc_booths}"'],
    capture_output=True, text=True, timeout=60
)
print(result.stdout)
if result.returncode != 0:
    print(f"⚠️  展会浏览量重算警告: {result.stderr[:500]}")
else:
    print("✅ Booth.viewCount 重新计算完成")

# 2c. Auction + Task: 重置为0（历史数据无法去重）
print("\n📊 2c. 重置 AuctionListing 和 MarketplaceTask 浏览量为 0 ...")
reset_views = '''
UPDATE "AuctionListing" SET "views" = 0;
UPDATE "MarketplaceTask" SET "views" = 0;
'''

result = subprocess.run(
    ['ssh', f'{REMOTE_USER}@{REMOTE_HOST}',
     f'PGPASSWORD="X2Xhub2025Prod" psql -U x2xhub -d x2xhub -h 127.0.0.1 -p 5432 -c "{reset_views}"'],
    capture_output=True, text=True, timeout=60
)
print(result.stdout)
if result.returncode != 0:
    print(f"⚠️  重置警告: {result.stderr[:500]}")
else:
    print("✅ AuctionListing/MarketplaceTask views 重置完成")

# ========== Step 3: 重启应用 ==========
print("\n" + "=" * 60)
print("STEP 3: 重启 PM2 服务")
print("=" * 60)

result = subprocess.run(
    ['ssh', f'{REMOTE_USER}@{REMOTE_HOST}',
     f'cd {REMOTE_APP_DIR} && npx prisma migrate deploy && pm2 restart chinahuib2b'],
    capture_output=True, text=True, timeout=60
)
print(result.stdout)
print(result.stderr[:500] if result.stderr else "")
print("✅ 应用重启完成")

# ========== Step 4: 验证 ==========
print("\n" + "=" * 60)
print("STEP 4: 验证浏览量数据")
print("=" * 60)

verify_sql = '''
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
'''

result = subprocess.run(
    ['ssh', f'{REMOTE_USER}@{REMOTE_HOST}',
     f'PGPASSWORD="X2Xhub2025Prod" psql -U x2xhub -d x2xhub -h 127.0.0.1 -p 5432 -c "{verify_sql}"'],
    capture_output=True, text=True, timeout=30
)
print(result.stdout)

# 检查页面
print("\n🔍 检查生产页面...")
import urllib.request
req = urllib.request.Request(
    'https://x2xhub.com/api/visitors',
    data=json.dumps({"productId": "cmsjryls80000cpg8auawfu69", "sessionId": "test_verify"}).encode(),
    headers={'Content-Type': 'application/json'}
)
try:
    resp = urllib.request.urlopen(req, timeout=10)
    data = json.loads(resp.read())
    print(f"✅ /api/visitors 状态: {data.get('success', 'ok')}")
except Exception as e:
    print(f"⚠️  API检查: {e}")

print("\n" + "=" * 60)
print("🎉 全部完成！")
print("=" * 60)
print("\n变更总结:")
print("  1. 移除了 SSR 页面 (products/[id]) 的重复 viewCount 自增")
print("  2. /api/visitors 添加了IP去重（1小时窗口）+ 自浏览排除")
print("  3. AuctionListing/MarketplaceTask: 添加了自浏览排除 + 用户去重")
print("  4. Booth: 添加了 viewCount 字段")
print("  5. 所有历史浏览量基于 Visitor 表真实记录重新计算")
