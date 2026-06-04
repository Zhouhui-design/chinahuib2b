import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as voucherService from '@/services/voucherService';

// POST /api/vouchers/[id]/verify/submit - Submit for verification
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

    // Check ownership
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!sellerProfile || sellerProfile.id !== voucher.sellerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedVoucher = await voucherService.submitForVerification(params.id);
    return NextResponse.json(updatedVoucher);
  } catch (error) {
    console.error('Error submitting for verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vouchers/[id]/verify/approve - Approve verification (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin can approve
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updatedVoucher = await voucherService.verifyGoods(
      params.id,
      session.user.id,
      body.notes
    );

    return NextResponse.json(updatedVoucher);
  } catch (error) {
    console.error('Error approving verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vouchers/[id]/verify/reject - Reject verification (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin can reject
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updatedVoucher = await voucherService.rejectVerification(
      params.id,
      session.user.id,
      body.notes
    );

    return NextResponse.json(updatedVoucher);
  } catch (error) {
    console.error('Error rejecting verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Need to add prisma import
import { prisma } from '@/lib/db';