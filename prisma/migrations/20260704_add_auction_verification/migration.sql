-- Create VerificationStatus enum if not exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VerificationStatus') THEN
        CREATE TYPE "VerificationStatus" AS ENUM ('NOT_APPLIED', 'PENDING', 'VERIFIED', 'REJECTED');
    END IF;
END $$;

-- Add new columns to AuctionListing table
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "techSpecs" TEXT;
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "productFeatures" TEXT;
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "applicationScope" TEXT;
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "usageMethod" TEXT;
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "shippingCountry" TEXT;
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "detailedAddress" TEXT;
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "isFob" TEXT;
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "isCif" TEXT;
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "verificationStatus" "VerificationStatus" DEFAULT 'NOT_APPLIED';
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "verificationFee" DECIMAL(10,2);
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT;

-- Create VerificationCountry table
CREATE TABLE IF NOT EXISTS "VerificationCountry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameZh" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationCountry_pkey" PRIMARY KEY ("id")
);

-- Create VerificationRequest table
CREATE TABLE IF NOT EXISTS "VerificationRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT,
    "shippingCountry" TEXT NOT NULL,
    "detailedAddress" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "feeAmount" DECIMAL(10,2),
    "feeCurrency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "AuctionListing_verificationStatus_idx" ON "AuctionListing"("verificationStatus");
CREATE INDEX IF NOT EXISTS "VerificationCountry_name_idx" ON "VerificationCountry"("name");
CREATE INDEX IF NOT EXISTS "VerificationCountry_isEnabled_idx" ON "VerificationCountry"("isEnabled");
CREATE INDEX IF NOT EXISTS "VerificationRequest_userId_idx" ON "VerificationRequest"("userId");
CREATE INDEX IF NOT EXISTS "VerificationRequest_listingId_idx" ON "VerificationRequest"("listingId");
CREATE INDEX IF NOT EXISTS "VerificationRequest_status_idx" ON "VerificationRequest"("status");

-- Add foreign keys
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VerificationRequest_userId_fkey') THEN
        ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VerificationRequest_listingId_fkey') THEN
        ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "AuctionListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
