-- 新增访客访问类型枚举 + Visitor.viewType 字段
CREATE TYPE "ViewType" AS ENUM ('PRODUCT', 'BOOTH', 'STORE');

ALTER TABLE "Visitor" ADD COLUMN "viewType" "ViewType" NOT NULL DEFAULT 'STORE';

-- BrochureDownload 新增 sellerId（哪个公司的文件被下载）+ 外键 + 索引
ALTER TABLE "BrochureDownload" ADD COLUMN "sellerId" TEXT;

CREATE INDEX "BrochureDownload_sellerId_idx" ON "BrochureDownload"("sellerId");

ALTER TABLE "BrochureDownload" ADD CONSTRAINT "BrochureDownload_sellerId_fkey"
  FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
