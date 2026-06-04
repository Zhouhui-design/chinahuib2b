import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as voucherService from '@/services/voucherService';

// POST /api/vouchers/[id]/logistics/tracking - Set tracking info
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const voucher = await voucherService.getVoucherById(params.id);
    if (!voucher) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
    }

    // Check ownership or admin
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (session.user.role !== 'ADMIN' && (!sellerProfile || sellerProfile.id !== voucher.sellerId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updatedVoucher = await voucherService.setTrackingInfo(
      params.id,
      body.trackingNumber,
      body.logisticsProvider,
      body.shippingAddress,
      body.estimatedDelivery ? new Date(body.estimatedDelivery) : undefined
    );

    return NextResponse.json(updatedVoucher);
  } catch (error) {
    console.error('Error setting tracking info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/vouchers/[id]/logistics/update - Add logistics update
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const voucher = await voucherService.getVoucherById(params.id);
    if (!voucher) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
    }

    // Check ownership or admin
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (session.user.role !== 'ADMIN' && (!sellerProfile || sellerProfile.id !== voucher.sellerId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updatedVoucher = await voucherService.addLogisticsUpdate(
      params.id,
      body.status,
      body.location,
      body.description
    );

    return NextResponse.json(updatedVoucher);
  } catch (error) {
    console.error('Error adding logistics update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Need to add prisma import
import { prisma } from '@/lib/db';