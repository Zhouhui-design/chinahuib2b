-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "lastPaymentAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionAmount" DECIMAL(10,2);
