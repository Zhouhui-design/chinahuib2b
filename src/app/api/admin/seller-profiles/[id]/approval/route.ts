import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as sellerService from '@/services/sellerService';

// PATCH /api/admin/seller-profiles/[id]/approval - Approve or reject seller profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, notes } = body; // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    let result;
    if (action === 'approve') {
      result = await sellerService.approveSellerProfile(id, session.user.id, notes);
    } else {
      result = await sellerService.rejectSellerProfile(id, session.user.id, notes);
    }

    return NextResponse.json({
      success: true,
      profileStatus: result.profileStatus,
      message: action === 'approve' ? 'Profile approved successfully' : 'Profile rejected',
    });
  } catch (error) {
    console.error('Error updating seller profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
