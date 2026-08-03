import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const listings = await prisma.auctionListing.findMany({
      where: {
        OR: [
          { posterId: userId },
          { sellerId: userId },
        ],
      },
      include: {
        poster: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        seller: {
          select: {
            id: true,
            companyName: true,
            isVerified: true,
          },
        },
        feeRecords: {
          orderBy: { processedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const serialized = listings.map(l => ({
      ...l,
      price: l.price ? Number(l.price) : null,
      listingFee: l.listingFee ? Number(l.listingFee) : null,
      originalPrice: l.originalPrice ? Number(l.originalPrice) : null,
      soldQuantity: l.soldQuantity || 0,
      stockQuantity: l.stockQuantity || 0,
      feeRecords: l.feeRecords.map(r => ({
        ...r,
        amount: Number(r.amount),
      })),
    }));

    return NextResponse.json({
      success: true,
      data: serialized,
    });
  } catch (error) {
    console.error('Error fetching seller listings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
