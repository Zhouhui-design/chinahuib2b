-- AlterTable: Add viewCount to Booth
ALTER TABLE "Booth" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex for booth view tracking
CREATE INDEX "Booth_viewCount_idx" ON "Booth"("viewCount");
