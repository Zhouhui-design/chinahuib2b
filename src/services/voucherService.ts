import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { DigitalVoucher, GoodsVerificationStatus, VoucherStatus } from '@prisma/client';

// Generate SHA-256 hash from goods information
export function generateSecurityHash(goodsInfo: {
  goodsName: string;
  goodsDescription?: string;
  goodsQuantity?: number;
  goodsWeight?: number;
  goodsOrigin?: string;
  timestamp: string;
}): string {
  const data = JSON.stringify(goodsInfo);
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Generate unique certificate number
export function generateCertificateNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `CV-${timestamp}-${random}`;
}

// Generate unique redemption code
export function generateRedemptionCode(): string {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}

// Create a new digital voucher
export async function createVoucher(
  sellerId: string,
  data: {
    title: string;
    description?: string;
    value: number;
    currency?: string;
    goodsName: string;
    goodsDescription?: string;
    goodsQuantity?: number;
    goodsWeight?: number;
    goodsDimensions?: string;
    goodsCategory?: string;
    goodsOrigin?: string;
    goodsSpecifications?: Record<string, any>;
    images?: string[];
    documents?: string[];
    terms?: string;
    validFrom: Date;
    validUntil?: Date;
  }
): Promise<DigitalVoucher> {
  const timestamp = new Date().toISOString();
  const securityHash = generateSecurityHash({
    goodsName: data.goodsName,
    goodsDescription: data.goodsDescription,
    goodsQuantity: data.goodsQuantity,
    goodsWeight: data.goodsWeight,
    goodsOrigin: data.goodsOrigin,
    timestamp,
  });

  const voucher = await prisma.digitalVoucher.create({
    data: {
      sellerId,
      title: data.title,
      description: data.description,
      value: data.value,
      currency: data.currency || 'USD',
      goodsName: data.goodsName,
      goodsDescription: data.goodsDescription,
      goodsQuantity: data.goodsQuantity,
      goodsWeight: data.goodsWeight,
      goodsDimensions: data.goodsDimensions,
      goodsCategory: data.goodsCategory,
      goodsOrigin: data.goodsOrigin,
      goodsSpecifications: data.goodsSpecifications,
      images: data.images || [],
      documents: data.documents || [],
      terms: data.terms,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      securityHash,
      hashAlgorithm: 'SHA-256',
      hashGeneratedAt: new Date(timestamp),
      certificateNumber: generateCertificateNumber(),
      redemptionCode: generateRedemptionCode(),
      status: VoucherStatus.CREATED,
      verificationStatus: GoodsVerificationStatus.PENDING,
      issueDate: new Date(),
    },
  });

  return voucher;
}

// Submit voucher for verification
export async function submitForVerification(
  voucherId: string
): Promise<DigitalVoucher> {
  return await prisma.digitalVoucher.update({
    where: { id: voucherId },
    data: {
      verificationStatus: GoodsVerificationStatus.UNDER_REVIEW,
      updatedAt: new Date(),
    },
  });
}

// Verify goods and approve voucher
export async function verifyGoods(
  voucherId: string,
  verifierId: string,
  notes?: string
): Promise<DigitalVoucher> {
  const voucher = await prisma.digitalVoucher.findUnique({
    where: { id: voucherId },
  });

  if (!voucher) {
    throw new Error('Voucher not found');
  }

  // Re-generate hash to ensure integrity
  const timestamp = new Date().toISOString();
  const newHash = generateSecurityHash({
    goodsName: voucher.goodsName || '',
    goodsDescription: voucher.goodsDescription,
    goodsQuantity: voucher.goodsQuantity,
    goodsWeight: voucher.goodsWeight,
    goodsOrigin: voucher.goodsOrigin,
    timestamp,
  });

  // Create verification record
  await prisma.goodsVerificationRecord.create({
    data: {
      voucherId,
      verifierId,
      status: GoodsVerificationStatus.VERIFIED,
      notes,
      evidence: {
        images: voucher.images,
        documents: voucher.documents,
      },
    },
  });

  return await prisma.digitalVoucher.update({
    where: { id: voucherId },
    data: {
      verificationStatus: GoodsVerificationStatus.VERIFIED,
      verifiedBy: verifierId,
      verifiedAt: new Date(),
      status: VoucherStatus.VERIFIED,
      isVerified: true,
      securityHash: newHash,
      hashGeneratedAt: new Date(timestamp),
      updatedAt: new Date(),
    },
  });
}

// Reject goods verification
export async function rejectVerification(
  voucherId: string,
  verifierId: string,
  notes: string
): Promise<DigitalVoucher> {
  await prisma.goodsVerificationRecord.create({
    data: {
      voucherId,
      verifierId,
      status: GoodsVerificationStatus.REJECTED,
      notes,
    },
  });

  return await prisma.digitalVoucher.update({
    where: { id: voucherId },
    data: {
      verificationStatus: GoodsVerificationStatus.REJECTED,
      verifiedBy: verifierId,
      verifiedAt: new Date(),
      verificationNotes: notes,
      updatedAt: new Date(),
    },
  });
}

// List voucher for sale
export async function listForSale(voucherId: string): Promise<DigitalVoucher> {
  return await prisma.digitalVoucher.update({
    where: { id: voucherId },
    data: {
      status: VoucherStatus.FOR_SALE,
      updatedAt: new Date(),
    },
  });
}

// Verify hash integrity
export function verifyHash(
  voucher: DigitalVoucher,
  customTimestamp?: string
): boolean {
  const timestamp = customTimestamp || voucher.hashGeneratedAt?.toISOString() || new Date().toISOString();
  
  const expectedHash = generateSecurityHash({
    goodsName: voucher.goodsName || '',
    goodsDescription: voucher.goodsDescription,
    goodsQuantity: voucher.goodsQuantity,
    goodsWeight: voucher.goodsWeight,
    goodsOrigin: voucher.goodsOrigin,
    timestamp,
  });

  return expectedHash === voucher.securityHash;
}

// Transfer voucher to buyer
export async function transferVoucher(
  voucherId: string,
  buyerId: string
): Promise<DigitalVoucher> {
  return await prisma.digitalVoucher.update({
    where: { id: voucherId },
    data: {
      status: VoucherStatus.TRANSFERRED,
      updatedAt: new Date(),
    },
  });
}

// Redeem voucher
export async function redeemVoucher(
  voucherId: string,
  redeemerId: string,
  notes?: string
): Promise<DigitalVoucher> {
  return await prisma.digitalVoucher.update({
    where: { id: voucherId },
    data: {
      isRedeemed: true,
      redeemedById: redeemerId,
      redeemedAt: new Date(),
      redemptionNotes: notes,
      status: VoucherStatus.REDEEMED,
      updatedAt: new Date(),
    },
  });
}

// Add logistics update
export async function addLogisticsUpdate(
  voucherId: string,
  status: string,
  location?: string,
  description?: string
): Promise<DigitalVoucher> {
  await prisma.logisticsUpdate.create({
    data: {
      voucherId,
      status,
      location,
      description,
      timestamp: new Date(),
    },
  });

  return await prisma.digitalVoucher.update({
    where: { id: voucherId },
    data: {
      logisticsStatus: status,
      updatedAt: new Date(),
    },
  });
}

// Set tracking info
export async function setTrackingInfo(
  voucherId: string,
  trackingNumber: string,
  logisticsProvider: string,
  shippingAddress?: string,
  estimatedDelivery?: Date
): Promise<DigitalVoucher> {
  return await prisma.digitalVoucher.update({
    where: { id: voucherId },
    data: {
      trackingNumber,
      logisticsProvider,
      shippingAddress,
      estimatedDelivery,
      logisticsStatus: 'pending',
      updatedAt: new Date(),
    },
  });
}

// Get voucher by ID
export async function getVoucherById(voucherId: string): Promise<DigitalVoucher | null> {
  return await prisma.digitalVoucher.findUnique({
    where: { id: voucherId },
    include: {
      seller: true,
      verificationRecords: true,
      logisticsUpdates: {
        orderBy: { timestamp: 'desc' },
      },
    },
  });
}

// Get vouchers by seller
export async function getVouchersBySeller(
  sellerId: string,
  status?: VoucherStatus
): Promise<DigitalVoucher[]> {
  const where: Record<string, any> = { sellerId };
  if (status) {
    where.status = status;
  }

  return await prisma.digitalVoucher.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: true,
    },
  });
}

// Get all vouchers (admin)
export async function getAllVouchers(
  verificationStatus?: GoodsVerificationStatus,
  status?: VoucherStatus
): Promise<DigitalVoucher[]> {
  const where: Record<string, any> = {};
  if (verificationStatus) {
    where.verificationStatus = verificationStatus;
  }
  if (status) {
    where.status = status;
  }

  return await prisma.digitalVoucher.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: true,
      verificationRecords: true,
    },
  });
}

// Verify certificate authenticity
export async function verifyCertificate(
  certificateNumber: string
): Promise<{
  isValid: boolean;
  voucher?: DigitalVoucher;
  message: string;
}> {
  const voucher = await prisma.digitalVoucher.findUnique({
    where: { certificateNumber },
    include: {
      seller: true,
      verificationRecords: true,
    },
  });

  if (!voucher) {
    return {
      isValid: false,
      message: 'Certificate not found',
    };
  }

  if (voucher.status === VoucherStatus.CANCELLED) {
    return {
      isValid: false,
      voucher,
      message: 'Certificate has been cancelled',
    };
  }

  if (voucher.status === VoucherStatus.EXPIRED) {
    return {
      isValid: false,
      voucher,
      message: 'Certificate has expired',
    };
  }

  if (!voucher.isVerified) {
    return {
      isValid: false,
      voucher,
      message: 'Certificate has not been verified',
    };
  }

  // Verify hash integrity
  const hashValid = verifyHash(voucher);
  if (!hashValid) {
    return {
      isValid: false,
      voucher,
      message: 'Certificate integrity check failed',
    };
  }

  return {
    isValid: true,
    voucher,
    message: 'Certificate is valid and authentic',
  };
}