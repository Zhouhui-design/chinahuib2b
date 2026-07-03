-- Create new enums for auction and verification system
CREATE TYPE IF NOT EXISTS "AuctionBidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'OUTBID', 'CANCELLED', 'WON', 'LOST');
CREATE TYPE IF NOT EXISTS "AuctionListingType" AS ENUM ('SELLING', 'BUYING');
CREATE TYPE IF NOT EXISTS "AuctionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CLOSED', 'COMPLETED');
CREATE TYPE IF NOT EXISTS "VerificationStatus" AS ENUM ('NOT_APPLIED', 'PENDING', 'VERIFIED', 'REJECTED');

-- Create AuctionListing table
CREATE TABLE IF NOT EXISTS "AuctionListing" (
    "id" TEXT NOT NULL,
    "type" "AuctionListingType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "techSpecs" TEXT,
    "productFeatures" TEXT,
    "applicationScope" TEXT,
    "usageMethod" TEXT,
    "shippingCountry" TEXT,
    "detailedAddress" TEXT,
    "price" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "minOrderQty" INTEGER DEFAULT 1,
    "maxOrderQty" INTEGER,
    "isFob" TEXT,
    "isCif" TEXT,
    "images" TEXT[],
    "videos" TEXT[],
    "documents" TEXT[],
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contactWeChat" TEXT,
    "contactWhatsApp" TEXT,
    "posterId" TEXT NOT NULL,
    "sellerId" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "cost" DECIMAL(10,2),
    "paymentId" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_APPLIED',
    "verificationFee" DECIMAL(10,2),
    "verificationNotes" TEXT,
    "status" "AuctionStatus" NOT NULL DEFAULT 'ACTIVE',
    "views" INTEGER NOT NULL DEFAULT 0,
    "inquiries" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "digitalVoucherId" TEXT,

    CONSTRAINT "AuctionListing_pkey" PRIMARY KEY ("id")
);

-- Create AuctionBid table
CREATE TABLE IF NOT EXISTS "AuctionBid" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isAutoBid" BOOLEAN NOT NULL DEFAULT false,
    "maxAutoBid" DECIMAL(10,2),
    "status" "AuctionBidStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuctionBid_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX IF NOT EXISTS "AuctionListing_type_idx" ON "AuctionListing"("type");
CREATE INDEX IF NOT EXISTS "AuctionListing_status_idx" ON "AuctionListing"("status");
CREATE INDEX IF NOT EXISTS "AuctionListing_posterId_idx" ON "AuctionListing"("posterId");
CREATE INDEX IF NOT EXISTS "AuctionListing_category_idx" ON "AuctionListing"("category");
CREATE INDEX IF NOT EXISTS "AuctionListing_createdAt_idx" ON "AuctionListing"("createdAt");
CREATE INDEX IF NOT EXISTS "AuctionListing_isVerified_idx" ON "AuctionListing"("isVerified");
CREATE INDEX IF NOT EXISTS "AuctionListing_verificationStatus_idx" ON "AuctionListing"("verificationStatus");

CREATE INDEX IF NOT EXISTS "AuctionBid_listingId_idx" ON "AuctionBid"("listingId");
CREATE INDEX IF NOT EXISTS "AuctionBid_bidderId_idx" ON "AuctionBid"("bidderId");
CREATE INDEX IF NOT EXISTS "AuctionBid_status_idx" ON "AuctionBid"("status");
CREATE INDEX IF NOT EXISTS "AuctionBid_createdAt_idx" ON "AuctionBid"("createdAt");

CREATE INDEX IF NOT EXISTS "VerificationCountry_name_idx" ON "VerificationCountry"("name");
CREATE INDEX IF NOT EXISTS "VerificationCountry_isEnabled_idx" ON "VerificationCountry"("isEnabled");

CREATE INDEX IF NOT EXISTS "VerificationRequest_userId_idx" ON "VerificationRequest"("userId");
CREATE INDEX IF NOT EXISTS "VerificationRequest_listingId_idx" ON "VerificationRequest"("listingId");
CREATE INDEX IF NOT EXISTS "VerificationRequest_status_idx" ON "VerificationRequest"("status");

-- Add foreign keys
ALTER TABLE "AuctionListing" ADD CONSTRAINT IF NOT EXISTS "AuctionListing_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuctionListing" ADD CONSTRAINT IF NOT EXISTS "AuctionListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AuctionBid" ADD CONSTRAINT IF NOT EXISTS "AuctionBid_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "AuctionListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuctionBid" ADD CONSTRAINT IF NOT EXISTS "AuctionBid_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VerificationRequest" ADD CONSTRAINT IF NOT EXISTS "VerificationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VerificationRequest" ADD CONSTRAINT IF NOT EXISTS "VerificationRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "AuctionListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
