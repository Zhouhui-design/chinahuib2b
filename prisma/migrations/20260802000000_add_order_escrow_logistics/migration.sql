-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_SHIPMENT', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'PAYPAL', 'ALIPAY', 'WECHAT', 'WORLD_FIRST', 'BANK_TRANSFER', 'CRYPTO');

-- CreateEnum
CREATE TYPE "PaymentStatus_Order" AS ENUM ('UNPAID', 'PAID', 'REFUNDED', 'PARTIAL_REFUND', 'FAILED');

-- CreateEnum
CREATE TYPE "EscrowStatus_Order" AS ENUM ('PENDING', 'FUNDED', 'RELEASING', 'RELEASED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "LogisticsStatus" AS ENUM ('PENDING_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'CUSTOMS_CLEARANCE', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'LOST');

-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('FOB', 'CIF', 'EXW', 'CFR', 'DAP', 'DDP', 'FCA');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DisputeType" AS ENUM ('ITEM_NOT_AS_DESCRIBED', 'ITEM_NOT_RECEIVED', 'ITEM_DAMAGED', 'QUANTITY_MISMATCH', 'QUALITY_ISSUE', 'LATE_DELIVERY', 'OTHER');

-- AlterTable: Add new columns to AuctionListing
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "stockQuantity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "soldQuantity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "portOfLoading" TEXT;
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "portOfDestination" TEXT;
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "incoterms" TEXT;

-- CreateTable: Order
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentMethod" "PaymentMethod",
    "paymentStatus" "PaymentStatus_Order" NOT NULL DEFAULT 'UNPAID',
    "paymentGatewayTxId" TEXT,
    "escrowId" TEXT,
    "shippingMethod" "ShippingMethod",
    "shippingAddress" JSONB,
    "portOfLoading" TEXT,
    "portOfDestination" TEXT,
    "incoterms" TEXT,
    "trackingNumber" TEXT,
    "carrierName" TEXT,
    "estimatedDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "buyerNote" TEXT,
    "sellerNote" TEXT,
    "platformFee" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable: EscrowTransaction
CREATE TABLE IF NOT EXISTS "EscrowTransaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "EscrowStatus_Order" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentGatewayTxId" TEXT,
    "releasedToSellerAt" TIMESTAMP(3),
    "refundedToBuyerAt" TIMESTAMP(3),
    "holdReason" TEXT,
    "autoReleaseDays" INTEGER NOT NULL DEFAULT 7,
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EscrowTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable: LogisticsRecord
CREATE TABLE IF NOT EXISTS "LogisticsRecord" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "carrierName" TEXT,
    "trackingNumber" TEXT,
    "status" "LogisticsStatus" NOT NULL DEFAULT 'PENDING_PICKUP',
    "originPort" TEXT,
    "destinationPort" TEXT,
    "estimatedArrival" TIMESTAMP(3),
    "actualArrival" TIMESTAMP(3),
    "weight" DECIMAL(10,2),
    "volume" DECIMAL(10,2),
    "shippingDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "documents" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LogisticsRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable: LogisticsUpdate_Order
CREATE TABLE IF NOT EXISTS "LogisticsUpdate_Order" (
    "id" TEXT NOT NULL,
    "logisticsId" TEXT NOT NULL,
    "status" "LogisticsStatus" NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LogisticsUpdate_Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Dispute
CREATE TABLE IF NOT EXISTS "Dispute" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "type" "DisputeType" NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "reason" TEXT NOT NULL,
    "resolution" TEXT,
    "resolutionAmount" DECIMAL(10,2),
    "resolutionCurrency" TEXT DEFAULT 'USD',
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "buyerDocs" JSONB,
    "sellerDocs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_buyerId_idx" ON "Order"("buyerId");
CREATE INDEX IF NOT EXISTS "Order_sellerId_idx" ON "Order"("sellerId");
CREATE INDEX IF NOT EXISTS "Order_listingId_idx" ON "Order"("listingId");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_paymentStatus_idx" ON "Order"("paymentStatus");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX IF NOT EXISTS "EscrowTransaction_orderId_idx" ON "EscrowTransaction"("orderId");
CREATE INDEX IF NOT EXISTS "EscrowTransaction_status_idx" ON "EscrowTransaction"("status");
CREATE INDEX IF NOT EXISTS "EscrowTransaction_buyerId_idx" ON "EscrowTransaction"("buyerId");
CREATE INDEX IF NOT EXISTS "LogisticsRecord_orderId_idx" ON "LogisticsRecord"("orderId");
CREATE INDEX IF NOT EXISTS "LogisticsRecord_status_idx" ON "LogisticsRecord"("status");
CREATE INDEX IF NOT EXISTS "LogisticsRecord_carrierName_idx" ON "LogisticsRecord"("carrierName");
CREATE INDEX IF NOT EXISTS "LogisticsUpdate_Order_logisticsId_idx" ON "LogisticsUpdate_Order"("logisticsId");
CREATE INDEX IF NOT EXISTS "LogisticsUpdate_Order_status_idx" ON "LogisticsUpdate_Order"("status");
CREATE INDEX IF NOT EXISTS "Dispute_orderId_idx" ON "Dispute"("orderId");
CREATE INDEX IF NOT EXISTS "Dispute_status_idx" ON "Dispute"("status");
CREATE INDEX IF NOT EXISTS "Dispute_type_idx" ON "Dispute"("type");
CREATE INDEX IF NOT EXISTS "AuctionListing_stockQuantity_idx" ON "AuctionListing"("stockQuantity");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "AuctionListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "EscrowTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE "EscrowTransaction" ADD CONSTRAINT "EscrowTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE "EscrowTransaction" ADD CONSTRAINT "EscrowTransaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE "EscrowTransaction" ADD CONSTRAINT "EscrowTransaction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE "LogisticsRecord" ADD CONSTRAINT "LogisticsRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE "LogisticsRecord" ADD CONSTRAINT "LogisticsRecord_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE "LogisticsUpdate_Order" ADD CONSTRAINT "LogisticsUpdate_Order_logisticsId_fkey" FOREIGN KEY ("logisticsId") REFERENCES "LogisticsRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EscrowTransaction_orderId_key" ON "EscrowTransaction"("orderId");
CREATE UNIQUE INDEX IF NOT EXISTS "Dispute_orderId_key" ON "Dispute"("orderId");
