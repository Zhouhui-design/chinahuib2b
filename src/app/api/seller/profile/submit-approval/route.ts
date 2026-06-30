import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as sellerService from '@/services/sellerService';

// POST /api/seller/profile/submit-approval - Submit profile for approval
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const seller = await sellerService.getSellerProfile(session.user.id);
    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 });
    }

    // Check if already pending or approved
    if (seller.profileStatus === 'APPROVED') {
      return NextResponse.json({ error: 'Profile is already approved' }, { status: 400 });
    }

    if (seller.profileStatus === 'PENDING') {
      return NextResponse.json({ error: 'Profile is already pending approval' }, { status: 400 });
    }

    // Submit for approval
    const updatedProfile = await sellerService.submitForApproval(seller.id);

    return NextResponse.json({
      success: true,
      profileStatus: updatedProfile.profileStatus,
      message: 'Profile submitted for approval successfully',
    });
  } catch (error) {
    console.error('Error submitting for approval:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
