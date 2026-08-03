-- First, rename the existing FeeType (platform fees) to PlatformFeeType
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FeeType') THEN
    -- Check if it has the old values (platform fees)
    IF EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'FeeType') AND enumlabel = 'SHOUT_OUT') THEN
      ALTER TYPE "FeeType" RENAME TO "PlatformFeeType";
    END IF;
  END IF;
END
$$;

-- CreateEnum (only if it doesn't exist after potential rename)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FeeType') THEN
    CREATE TYPE "FeeType" AS ENUM ('INITIAL', 'PRICE_INCREASE', 'PRICE_DECREASE_REFUND', 'DELIST_FULL_REFUND', 'ADMIN_ADJUSTMENT', 'PARTIAL_REFUND');
  END IF;
END
$$;

-- AlterEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AuctionStatus') AND enumlabel = 'DELISTED') THEN
    ALTER TYPE "AuctionStatus" ADD VALUE 'DELISTED';
  END IF;
END
$$;

-- AlterTable
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "listingFee" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "listingFeeCurrency" TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS "originalPrice" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "feeRefunded" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "lastPriceAdjustmentAt" TIMESTAMP(3);

-- CreateTable (only if not exists)
CREATE TABLE IF NOT EXISTS "ListingFeeRecord" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "type" "FeeType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "reason" TEXT,
    "oldPrice" DECIMAL(10,2),
    "newPrice" DECIMAL(10,2),
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ListingFeeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ListingFeeRecord_listingId_idx" ON "ListingFeeRecord"("listingId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ListingFeeRecord_type_idx" ON "ListingFeeRecord"("type");

-- AddForeignKey (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ListingFeeRecord_listingId_fkey') THEN
    ALTER TABLE "ListingFeeRecord" ADD CONSTRAINT "ListingFeeRecord_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "AuctionListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
