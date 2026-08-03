-- AlterTable: Add translations JSON field and translatedAt timestamp to Category
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "translations" JSONB;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "translatedAt" TIMESTAMP(3);
