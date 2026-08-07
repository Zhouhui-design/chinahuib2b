-- ============================================================
-- 迁移：为 Category 增加来源/归属/状态，为 Product 增加 keywords
-- 设计原则：不破坏现有数据，所有现有分类默认 SYSTEM+APPROVED，现有产品 keywords=NULL
-- ============================================================

-- Step 1: 新增枚举类型
DO $$ BEGIN
    CREATE TYPE "CategorySource" AS ENUM ('SYSTEM', 'SELLER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "CategoryStatus" AS ENUM ('APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Step 2: Category 新增字段（全部可空 / 有默认值，避免锁表时间长）
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "source" "CategorySource" NOT NULL DEFAULT 'SYSTEM';
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "ownerId" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "submittedById" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3);
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "status" "CategoryStatus" NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

-- Step 3: Product 新增 keywords（JSONB 存储 string[]，与 Booth 完全一致）
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "keywords" JSONB;

-- Step 4: 外键约束
DO $$ BEGIN
    ALTER TABLE "Category"
      ADD CONSTRAINT "Category_ownerId_fkey"
      FOREIGN KEY ("ownerId") REFERENCES "SellerProfile"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Category"
      ADD CONSTRAINT "Category_submittedById_fkey"
      FOREIGN KEY ("submittedById") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Step 5: 索引（不影响数据，可在线创建）
CREATE INDEX IF NOT EXISTS "Category_source_idx" ON "Category"("source");
CREATE INDEX IF NOT EXISTS "Category_status_idx" ON "Category"("status");
CREATE INDEX IF NOT EXISTS "Category_ownerId_idx" ON "Category"("ownerId");

-- Step 6: GIN 索引加速 keywords 搜索（用于 JSONB @> 查询）
CREATE INDEX IF NOT EXISTS "Product_keywords_idx"
  ON "Product" USING GIN ("keywords" jsonb_path_ops);

-- 数据迁移说明：现有分类无需 UPDATE，DEFAULT 'SYSTEM' / 'APPROVED' 自动生效。
-- 现有产品的 keywords 字段为 NULL，搜索 API 需将 keywords 视为可选。
