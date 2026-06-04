import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as voucherService from '@/services/voucherService';
import { VoucherStatus, GoodsVerificationStatus } from '@prisma/client';

// GET /api/vouchers - Get all vouchers (admin) or vouchers by current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as VoucherStatus | undefined;
    const verificationStatus = searchParams.get('verificationStatus') as GoodsVerificationStatus | undefined;
    const sellerId = searchParams.get('sellerId');

    let vouchers;

    // Admin can see all vouchers
    if (session.user.role === 'ADMIN') {
      vouchers = await voucherService.getAllVouchers(verificationStatus, status);
    } else if (sellerId) {
      // Filter by seller ID
      vouchers = await voucherService.getVouchersBySeller(sellerId, status);
    } else {
      // Get current user's vouchers
      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: session.user.id },
      });
      
      if (sellerProfile) {
        vouchers = await voucherService.getVouchersBySeller(sellerProfile.id, status);
      } else {
        vouchers = [];
      }
    }

    return NextResponse.json(vouchers);
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vouchers - Create a new voucher
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 400 });
    }

    const voucher = await voucherService.createVoucher(sellerProfile.id, {
      title: body.title,
      description: body.description,
      value: body.value,
      currency: body.currency || 'USD',
      goodsName: body.goodsName,
      goodsDescription: body.goodsDescription,
      goodsQuantity: body.goodsQuantity,
      goodsWeight: body.goodsWeight,
      goodsDimensions: body.goodsDimensions,
      goodsCategory: body.goodsCategory,
      goodsOrigin: body.goodsOrigin,
      goodsSpecifications: body.goodsSpecifications,
      images: body.images,
      documents: body.documents,
      terms: body.terms,
      validFrom: new Date(body.validFrom),
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
    });

    return NextResponse.json(voucher, { status: 201 });
  } catch (error) {
    console.error('Error creating voucher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Need to add prisma import
import { prisma } from '@/lib/db';