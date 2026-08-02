-- Add storeSlug fields to SellerProfile
-- Enables GitHub-style store URLs: x2xhub.com/<storeSlug>

-- Add storeSlug column (unique, nullable - populated by backfill script)
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "storeSlug" TEXT;

-- Add storeSlugLocked column (default false - locks slug after first edit)
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "storeSlugLocked" BOOLEAN NOT NULL DEFAULT false;

-- Add storeSlugChangedAt column (tracks when slug was last changed)
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "storeSlugChangedAt" TIMESTAMP(3);

-- Create unique index on storeSlug
CREATE UNIQUE INDEX IF NOT EXISTS "SellerProfile_storeSlug_key" ON "SellerProfile"("storeSlug");

-- Create regular index on storeSlug for lookups
CREATE INDEX IF NOT EXISTS "SellerProfile_storeSlug_idx" ON "SellerProfile"("storeSlug");
