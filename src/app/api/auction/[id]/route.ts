import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.auctionListing.findUnique({
      where: { id },
      include: {
        poster: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            isOnline: true,
          },
        },
        seller: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            isVerified: true,
            country: true,
            city: true,
            email: true,
            phone: true,
          },
        },
        unit: true,
        bids: {
          include: {
            bidder: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    await prisma.auctionListing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    const result = {
      ...listing,
      price: listing.price?.toNumber() ?? null,
      startingBid: listing.startingBid?.toNumber() ?? null,
      currentBid: listing.currentBid?.toNumber() ?? null,
      bidIncrement: listing.bidIncrement?.toNumber() ?? null,
      reservePrice: listing.reservePrice?.toNumber() ?? null,
      cost: listing.cost?.toNumber() ?? null,
      verificationFee: listing.verificationFee?.toNumber() ?? null,
      bids: listing.bids.map((bid: any) => ({
        ...bid,
        amount: bid.amount?.toNumber() ?? 0,
        bidderName: bid.bidder?.displayName || bid.bidder?.username || 'Anonymous',
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching auction listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const listing = await prisma.auctionListing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.posterId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.auctionListing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting auction listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
