-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('STATIC', 'PRODUCT', 'STORE', 'CATEGORY', 'CUSTOM');

-- CreateTable
CREATE TABLE "SEOConfig" (
    "id" TEXT NOT NULL,
    "pagePath" TEXT NOT NULL,
    "title" TEXT,
    "titleEn" TEXT,
    "description" TEXT,
    "descriptionEn" TEXT,
    "keywords" TEXT,
    "keywordsEn" TEXT,
    "pageType" "PageType" NOT NULL DEFAULT 'STATIC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SEOConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeadLink" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "statusCode" INTEGER NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeadLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SEOConfig_pagePath_key" ON "SEOConfig"("pagePath");

-- CreateIndex
CREATE INDEX "SEOConfig_pageType_idx" ON "SEOConfig"("pageType");

-- CreateIndex
CREATE INDEX "SEOConfig_isActive_idx" ON "SEOConfig"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DeadLink_url_key" ON "DeadLink"("url");

-- CreateIndex
CREATE INDEX "DeadLink_isResolved_idx" ON "DeadLink"("isResolved");

-- CreateIndex
CREATE INDEX "DeadLink_detectedAt_idx" ON "DeadLink"("detectedAt");
