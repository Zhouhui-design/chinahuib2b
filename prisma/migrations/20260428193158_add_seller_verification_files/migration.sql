-- CreateEnum
CREATE TYPE "VerificationFileType" AS ENUM ('BUSINESS_LICENSE', 'ID_CARD', 'DRIVER_LICENSE', 'CREDIT_CARD', 'PHOTO', 'VIDEO', 'OTHER');

-- CreateTable
CREATE TABLE "SellerVerificationFile" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "fileType" "VerificationFileType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerVerificationFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellerVerificationFile_sellerId_idx" ON "SellerVerificationFile"("sellerId");

-- CreateIndex
CREATE INDEX "SellerVerificationFile_fileType_idx" ON "SellerVerificationFile"("fileType");

-- CreateIndex
CREATE INDEX "SellerVerificationFile_isVerified_idx" ON "SellerVerificationFile"("isVerified");

-- AddForeignKey
ALTER TABLE "SellerVerificationFile" ADD CONSTRAINT "SellerVerificationFile_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
