import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as auctionService from '@/services/auctionService';

// POST /api/auction/[id]/bid - Place a bid
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, isAutoBid, maxAutoBid } = body;

    const result = await auctionService.placeBid(
      id,
      session.user.id,
      amount,
      isAutoBid || false,
      maxAutoBid
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error placing bid:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/auction/[id]/bid - Get all bids for listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bids = await auctionService.getBidsForListing(id);
    return NextResponse.json(bids);
  } catch (error) {
    console.error('Error fetching bids:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}