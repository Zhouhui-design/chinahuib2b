-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "boothCategories" TEXT[],
ADD COLUMN     "boothName" TEXT,
ADD COLUMN     "isCustomizable" BOOLEAN NOT NULL DEFAULT false;
