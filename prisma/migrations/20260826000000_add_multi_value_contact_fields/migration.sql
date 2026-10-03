-- AlterTable: Add multi-value contact fields to SellerProfile
ALTER TABLE "SellerProfile" ADD COLUMN "emails" JSONB;
ALTER TABLE "SellerProfile" ADD COLUMN "phones" JSONB;
ALTER TABLE "SellerProfile" ADD COLUMN "websites" JSONB;
