/*
  Warnings:

  - You are about to drop the `UserBehavior` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('MANUFACTURING', 'PRODUCT_SALE', 'SERVICE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "AuctionListingType" AS ENUM ('SELLING', 'BUYING');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CLOSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "VoucherTransactionStatus" AS ENUM ('PENDING', 'VERIFIED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BoothCustomizationType" AS ENUM ('THEME', 'COLOR_SCHEME', 'LAYOUT', 'BANNER', 'DECOR', 'ANIMATION', 'FONT', 'BACKGROUND');

-- CreateEnum
CREATE TYPE "AIAgentStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REVOKED');

-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('USER', 'SELLER', 'SYSTEM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'AI_BUYER';
ALTER TYPE "UserRole" ADD VALUE 'AI_SELLER';
ALTER TYPE "UserRole" ADD VALUE 'AI_ASSISTANT';

-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "booth3DPreview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "boothAccentImage" TEXT,
ADD COLUMN     "boothAnimations" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "boothBgImage" TEXT,
ADD COLUMN     "boothColor" TEXT,
ADD COLUMN     "boothFont" TEXT,
ADD COLUMN     "boothLayout" TEXT,
ADD COLUMN     "boothTags" TEXT[],
ADD COLUMN     "boothTheme" TEXT,
ADD COLUMN     "descriptions" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aiCapabilities" JSONB,
ADD COLUMN     "aiModel" TEXT,
ADD COLUMN     "aiProvider" TEXT,
ADD COLUMN     "dailyShoutOuts" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSystemAI" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3),
ADD COLUMN     "lastShoutOutDate" TIMESTAMP(3),
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- DropTable
DROP TABLE "UserBehavior";

-- CreateTable
CREATE TABLE "APIKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'AI Agent Key',
    "role" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "rateLimit" INTEGER NOT NULL DEFAULT 1000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "APIKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APIUsageLog" (
    "id" TEXT NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER,
    "responseTime" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "APIUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "TaskType" NOT NULL,
    "budget" DECIMAL(10,2),
    "price" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "unit" TEXT,
    "minOrderQty" INTEGER,
    "deadline" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "postedById" TEXT NOT NULL,
    "contactInfo" TEXT,
    "applications" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "rating" DECIMAL(3,2),
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskApplication" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "quote" DECIMAL(10,2),
    "deliveryTime" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "linkedSellerId" TEXT,
    "isSystemMessage" BOOLEAN NOT NULL DEFAULT false,
    "isAnnouncement" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "reactions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivateMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoutOut" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "cost" DECIMAL(10,2),
    "paymentId" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "reactions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShoutOut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionListing" (
    "id" TEXT NOT NULL,
    "type" "AuctionListingType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "price" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "minOrderQty" INTEGER,
    "maxOrderQty" INTEGER,
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

-- CreateTable
CREATE TABLE "DigitalVoucher" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "value" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "redemptionCode" TEXT NOT NULL,
    "isRedeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedById" TEXT,
    "redeemedAt" TIMESTAMP(3),
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "securityHash" TEXT,
    "images" TEXT[],
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalVoucherTransaction" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "buyerId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "transactionId" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "deliveryInfo" JSONB,
    "status" "VoucherTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DigitalVoucherTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoothCustomization" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "type" "BoothCustomizationType" NOT NULL,
    "value" TEXT,
    "config" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoothCustomization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoothView" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "viewerId" TEXT,
    "duration" INTEGER,
    "interactions" JSONB,
    "referrer" TEXT,
    "deviceType" TEXT,
    "country" TEXT,
    "city" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoothView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    "scope" JSONB,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "AIPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "result" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAgent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capabilities" TEXT[],
    "status" "AIAgentStatus" NOT NULL DEFAULT 'PENDING',
    "ownerId" TEXT NOT NULL,
    "ownerType" "OwnerType" NOT NULL,
    "apiKey" TEXT NOT NULL,
    "secretKey" TEXT NOT NULL,
    "webhookUrl" TEXT,
    "permissions" JSONB NOT NULL,
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAgentAuditLog" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAgentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "APIKey_key_key" ON "APIKey"("key");

-- CreateIndex
CREATE INDEX "APIKey_userId_idx" ON "APIKey"("userId");

-- CreateIndex
CREATE INDEX "APIKey_key_idx" ON "APIKey"("key");

-- CreateIndex
CREATE INDEX "APIKey_isActive_idx" ON "APIKey"("isActive");

-- CreateIndex
CREATE INDEX "APIUsageLog_apiKeyId_idx" ON "APIUsageLog"("apiKeyId");

-- CreateIndex
CREATE INDEX "APIUsageLog_createdAt_idx" ON "APIUsageLog"("createdAt");

-- CreateIndex
CREATE INDEX "APIUsageLog_endpoint_idx" ON "APIUsageLog"("endpoint");

-- CreateIndex
CREATE INDEX "MarketplaceTask_status_idx" ON "MarketplaceTask"("status");

-- CreateIndex
CREATE INDEX "MarketplaceTask_type_idx" ON "MarketplaceTask"("type");

-- CreateIndex
CREATE INDEX "MarketplaceTask_postedById_idx" ON "MarketplaceTask"("postedById");

-- CreateIndex
CREATE INDEX "MarketplaceTask_createdAt_idx" ON "MarketplaceTask"("createdAt");

-- CreateIndex
CREATE INDEX "TaskApplication_taskId_idx" ON "TaskApplication"("taskId");

-- CreateIndex
CREATE INDEX "TaskApplication_applicantId_idx" ON "TaskApplication"("applicantId");

-- CreateIndex
CREATE INDEX "TaskApplication_status_idx" ON "TaskApplication"("status");

-- CreateIndex
CREATE INDEX "PublicMessage_createdAt_idx" ON "PublicMessage"("createdAt");

-- CreateIndex
CREATE INDEX "PublicMessage_senderId_idx" ON "PublicMessage"("senderId");

-- CreateIndex
CREATE INDEX "PublicMessage_isAnnouncement_idx" ON "PublicMessage"("isAnnouncement");

-- CreateIndex
CREATE INDEX "PrivateMessage_senderId_receiverId_idx" ON "PrivateMessage"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "PrivateMessage_receiverId_senderId_idx" ON "PrivateMessage"("receiverId", "senderId");

-- CreateIndex
CREATE INDEX "PrivateMessage_createdAt_idx" ON "PrivateMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ShoutOut_senderId_idx" ON "ShoutOut"("senderId");

-- CreateIndex
CREATE INDEX "ShoutOut_createdAt_idx" ON "ShoutOut"("createdAt");

-- CreateIndex
CREATE INDEX "ShoutOut_priority_idx" ON "ShoutOut"("priority");

-- CreateIndex
CREATE INDEX "AuctionListing_type_idx" ON "AuctionListing"("type");

-- CreateIndex
CREATE INDEX "AuctionListing_status_idx" ON "AuctionListing"("status");

-- CreateIndex
CREATE INDEX "AuctionListing_posterId_idx" ON "AuctionListing"("posterId");

-- CreateIndex
CREATE INDEX "AuctionListing_category_idx" ON "AuctionListing"("category");

-- CreateIndex
CREATE INDEX "AuctionListing_createdAt_idx" ON "AuctionListing"("createdAt");

-- CreateIndex
CREATE INDEX "AuctionListing_isVerified_idx" ON "AuctionListing"("isVerified");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalVoucher_redemptionCode_key" ON "DigitalVoucher"("redemptionCode");

-- CreateIndex
CREATE INDEX "DigitalVoucher_sellerId_idx" ON "DigitalVoucher"("sellerId");

-- CreateIndex
CREATE INDEX "DigitalVoucher_redemptionCode_idx" ON "DigitalVoucher"("redemptionCode");

-- CreateIndex
CREATE INDEX "DigitalVoucher_isRedeemed_idx" ON "DigitalVoucher"("isRedeemed");

-- CreateIndex
CREATE INDEX "DigitalVoucher_isVerified_idx" ON "DigitalVoucher"("isVerified");

-- CreateIndex
CREATE INDEX "DigitalVoucherTransaction_voucherId_idx" ON "DigitalVoucherTransaction"("voucherId");

-- CreateIndex
CREATE INDEX "DigitalVoucherTransaction_buyerId_idx" ON "DigitalVoucherTransaction"("buyerId");

-- CreateIndex
CREATE INDEX "DigitalVoucherTransaction_status_idx" ON "DigitalVoucherTransaction"("status");

-- CreateIndex
CREATE INDEX "BoothCustomization_sellerId_idx" ON "BoothCustomization"("sellerId");

-- CreateIndex
CREATE INDEX "BoothCustomization_type_idx" ON "BoothCustomization"("type");

-- CreateIndex
CREATE INDEX "BoothView_sellerId_idx" ON "BoothView"("sellerId");

-- CreateIndex
CREATE INDEX "BoothView_viewerId_idx" ON "BoothView"("viewerId");

-- CreateIndex
CREATE INDEX "BoothView_viewedAt_idx" ON "BoothView"("viewedAt");

-- CreateIndex
CREATE INDEX "AIPermission_userId_idx" ON "AIPermission"("userId");

-- CreateIndex
CREATE INDEX "AIPermission_permission_idx" ON "AIPermission"("permission");

-- CreateIndex
CREATE INDEX "AIAuditLog_userId_idx" ON "AIAuditLog"("userId");

-- CreateIndex
CREATE INDEX "AIAuditLog_createdAt_idx" ON "AIAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AIAuditLog_action_idx" ON "AIAuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "AIAgent_apiKey_key" ON "AIAgent"("apiKey");

-- CreateIndex
CREATE INDEX "AIAgent_apiKey_idx" ON "AIAgent"("apiKey");

-- CreateIndex
CREATE INDEX "AIAgent_ownerId_idx" ON "AIAgent"("ownerId");

-- CreateIndex
CREATE INDEX "AIAgent_status_idx" ON "AIAgent"("status");

-- CreateIndex
CREATE INDEX "AIAgentAuditLog_agentId_idx" ON "AIAgentAuditLog"("agentId");

-- CreateIndex
CREATE INDEX "AIAgentAuditLog_createdAt_idx" ON "AIAgentAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AIAgentAuditLog_action_idx" ON "AIAgentAuditLog"("action");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isOnline_idx" ON "User"("isOnline");

-- CreateIndex
CREATE INDEX "User_dailyShoutOuts_idx" ON "User"("dailyShoutOuts");

-- AddForeignKey
ALTER TABLE "APIKey" ADD CONSTRAINT "APIKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APIUsageLog" ADD CONSTRAINT "APIUsageLog_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "APIKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APIUsageLog" ADD CONSTRAINT "APIUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceTask" ADD CONSTRAINT "MarketplaceTask_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskApplication" ADD CONSTRAINT "TaskApplication_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "MarketplaceTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskApplication" ADD CONSTRAINT "TaskApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicMessage" ADD CONSTRAINT "PublicMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicMessage" ADD CONSTRAINT "PublicMessage_linkedSellerId_fkey" FOREIGN KEY ("linkedSellerId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateMessage" ADD CONSTRAINT "PrivateMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateMessage" ADD CONSTRAINT "PrivateMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoutOut" ADD CONSTRAINT "ShoutOut_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionListing" ADD CONSTRAINT "AuctionListing_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionListing" ADD CONSTRAINT "AuctionListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionListing" ADD CONSTRAINT "AuctionListing_digitalVoucherId_fkey" FOREIGN KEY ("digitalVoucherId") REFERENCES "DigitalVoucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalVoucher" ADD CONSTRAINT "DigitalVoucher_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalVoucherTransaction" ADD CONSTRAINT "DigitalVoucherTransaction_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "DigitalVoucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalVoucherTransaction" ADD CONSTRAINT "DigitalVoucherTransaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoothCustomization" ADD CONSTRAINT "BoothCustomization_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoothView" ADD CONSTRAINT "BoothView_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoothView" ADD CONSTRAINT "BoothView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPermission" ADD CONSTRAINT "AIPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAuditLog" ADD CONSTRAINT "AIAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAgentAuditLog" ADD CONSTRAINT "AIAgentAuditLog_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AIAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
