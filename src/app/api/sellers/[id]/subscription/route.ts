import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as sellerService from '@/services/sellerService';

// GET /api/sellers/[id]/subscription - Get subscription status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const seller = await sellerService.getSellerProfile(session.user.id);
    if (!seller || seller.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const status = await sellerService.checkSubscriptionStatus(params.id);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/sellers/[id]/subscription - Subscribe to premium plan
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const seller = await sellerService.getSellerProfile(session.user.id);
    if (!seller || seller.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { plan, amount, transactionId } = body;

    const updatedSeller = await sellerService.subscribeToPremium(
      params.id,
      plan,
      amount,
      transactionId
    );

    return NextResponse.json(updatedSeller);
  } catch (error) {
    console.error('Error subscribing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/sellers/[id]/subscription/extend - Extend subscription
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const seller = await sellerService.getSellerProfile(session.user.id);
    if (!seller || seller.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { days, amount, transactionId } = body;

    const updatedSeller = await sellerService.extendSubscription(
      params.id,
      days,
      amount,
      transactionId
    );

    return NextResponse.json(updatedSeller);
  } catch (error) {
    console.error('Error extending subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}