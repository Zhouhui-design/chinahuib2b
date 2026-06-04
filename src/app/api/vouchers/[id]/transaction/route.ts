import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import * as voucherService from '@/services/voucherService';

// POST /api/vouchers/[id]/transaction/sell - Mark as sold
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

    // Create transaction record
    await prisma.digitalVoucherTransaction.create({
      data: {
        voucherId: params.id,
        buyerId: body.buyerId,
        amount: body.amount,
        currency: body.currency || 'USD',
        transactionId: body.transactionId,
        status: 'PENDING',
      },
    });

    // Mark voucher as sold
    const updatedVoucher = await prisma.digitalVoucher.update({
      where: { id: params.id },
      data: {
        status: 'SOLD',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedVoucher);
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/vouchers/[id]/transaction/transfer - Transfer to buyer
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

    // Admin or verified transaction can transfer
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updatedVoucher = await voucherService.transferVoucher(params.id, body.buyerId);

    // Update transaction status
    await prisma.digitalVoucherTransaction.updateMany({
      where: { voucherId: params.id },
      data: {
        status: 'COMPLETED',
        verifiedBy: session.user.id,
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json(updatedVoucher);
  } catch (error) {
    console.error('Error transferring voucher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vouchers/[id]/transaction/redeem - Redeem voucher
export async function DELETE(
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

    // Only the buyer or admin can redeem
    const body = await request.json();
    const redeemingUserId = body.redeemerId || session.user.id;

    if (session.user.role !== 'ADMIN' && voucher.redeemedById !== redeemingUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedVoucher = await voucherService.redeemVoucher(
      params.id,
      redeemingUserId,
      body.notes
    );

    return NextResponse.json(updatedVoucher);
  } catch (error) {
    console.error('Error redeeming voucher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}