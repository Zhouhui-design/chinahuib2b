import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as voucherService from '@/services/voucherService';

// GET /api/vouchers/[id] - Get voucher by ID
export async function GET(
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

    return NextResponse.json(voucher);
  } catch (error) {
    console.error('Error fetching voucher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/vouchers/[id] - Update voucher
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const voucher = await voucherService.getVoucherById(params.id);

    if (!voucher) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
    }

    // Check ownership
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!sellerProfile || sellerProfile.id !== voucher.sellerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedVoucher = await prisma.digitalVoucher.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        value: body.value,
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
        validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
        validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedVoucher);
  } catch (error) {
    console.error('Error updating voucher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/vouchers/[id] - Delete voucher
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

    // Check ownership or admin
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (session.user.role !== 'ADMIN' && (!sellerProfile || sellerProfile.id !== voucher.sellerId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.digitalVoucher.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Voucher cancelled successfully' });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Need to add prisma import
import { prisma } from '@/lib/db';