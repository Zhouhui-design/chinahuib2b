import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as sellerService from '@/services/sellerService';

// GET /api/admin/seller-profiles - Get sellers with pending approvals
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // PENDING, APPROVED, REJECTED, DRAFT, or all

    let sellers;
    if (status && status !== 'all') {
      sellers = await sellerService.getSellersByProfileStatus(status as any);
    } else {
      // Get all sellers with their profile status
      const { prisma } = await import('@/lib/db');
      sellers = await prisma.sellerProfile.findMany({
        orderBy: { profileSubmittedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ sellers });
  } catch (error) {
    console.error('Error fetching seller profiles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
