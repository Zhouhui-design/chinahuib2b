// This migration adds model and series fields to Category model

ALTER TABLE "Category" ADD COLUMN "model" TEXT;
ALTER TABLE "Category" ADD COLUMN "modelEn" TEXT;
ALTER TABLE "Category" ADD COLUMN "series" TEXT;
ALTER TABLE "Category" ADD COLUMN "seriesEn" TEXT;
ALTER TABLE "Category" ADD COLUMN "description" TEXT;
ALTER TABLE "Category" ADD COLUMN "descriptionEn" TEXT;