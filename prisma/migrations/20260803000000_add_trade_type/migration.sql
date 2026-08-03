-- CreateEnum
CREATE TYPE "TradeType" AS ENUM ('DOMESTIC', 'EXPORT');

-- CreateEnum
CREATE TYPE "LoadingService" AS ENUM ('SELLER_LOADING', 'BUYER_PICKUP');

-- CreateEnum
CREATE TYPE "FreightPayment" AS ENUM ('FREIGHT_COLLECT', 'FREIGHT_PREPAID');

-- AlterTable
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "tradeType" "TradeType" NOT NULL DEFAULT 'DOMESTIC';
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "loadingService" "LoadingService";
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "freightPayment" "FreightPayment";
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "domesticShippingNote" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuctionListing_tradeType_idx" ON "AuctionListing"("tradeType");
