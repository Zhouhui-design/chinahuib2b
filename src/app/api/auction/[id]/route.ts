import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateServiceFee, getPaymentConfig } from '@/lib/payment-service';

// In-memory dedup for auction views (1-hour window per listing+viewer)
const auctionViewDedup = new Map<string, number>();

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
        feeRecords: {
          orderBy: { processedAt: 'desc' },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const bids = await prisma.auctionBid.findMany({
      where: { listingId: id },
      include: {
        bidder: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Increment view count with dedup
    // Skip if viewer is the owner (self-view)
    const session = await getServerSession(authOptions);
    const viewerId = session?.user?.id;
    const isOwner = viewerId && (viewerId === listing.posterId || (listing.sellerId && viewerId === listing.sellerId));

    if (!isOwner) {
      // Dedup: use in-memory map to track recent views (1-hour window)
      // Key: listingId:userId, Value: timestamp
      const now = Date.now();
      const dedupKey = `${id}:${viewerId || 'anon'}`;
      const lastView = auctionViewDedup.get(dedupKey);
      if (!lastView || now - lastView > 60 * 60 * 1000) {
        await prisma.auctionListing.update({
          where: { id },
          data: { views: { increment: 1 } },
        });
        auctionViewDedup.set(dedupKey, now);
      }
    }

    const result = {
      ...listing,
      price: listing.price?.toNumber() ?? null,
      startingBid: listing.startingBid?.toNumber() ?? null,
      currentBid: listing.currentBid?.toNumber() ?? null,
      bidIncrement: listing.bidIncrement?.toNumber() ?? null,
      reservePrice: listing.reservePrice?.toNumber() ?? null,
      cost: listing.cost?.toNumber() ?? null,
      verificationFee: listing.verificationFee?.toNumber() ?? null,
      listingFee: listing.listingFee?.toNumber() ?? null,
      originalPrice: listing.originalPrice?.toNumber() ?? null,
      feeRecords: listing.feeRecords.map((r: any) => ({
        ...r,
        amount: r.amount?.toNumber() ?? 0,
        oldPrice: r.oldPrice?.toNumber() ?? null,
        newPrice: r.newPrice?.toNumber() ?? null,
      })),
      bids: bids.map((bid: any) => ({
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

const TRACKED_FIELDS = [
  'title', 'description', 'category', 'tags', 'images', 'videos',
  'documents', 'contactEmail', 'contactPhone', 'contactWeChat', 'contactWhatsApp',
  'techSpecs', 'productFeatures', 'applicationScope', 'usageMethod',
  'shippingCountry', 'detailedAddress', 'hsCode', 'hsCodeDescription',
  'portOfLoading', 'portOfDestination', 'tradeType', 'loadingService',
  'freightPayment', 'domesticShippingNote', 'paymentMethods',
];

const PRICE_FIELDS = ['price'];
const STOCK_FIELDS = ['stockQuantity'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const listing = await prisma.auctionListing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.posterId !== session.user.id && listing.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (listing.status === 'DELISTED') {
      return NextResponse.json({ error: 'Cannot update a delisted listing' }, { status: 400 });
    }

    const currentPrice = listing.price?.toNumber() ?? 0;
    const currentStock = listing.stockQuantity;
    const updates: any = {};
    const warnings: string[] = [];
    const feeActions: any[] = [];

    if (body.price !== undefined && body.price !== null) {
      const newPrice = Number(body.price);
      if (isNaN(newPrice) || newPrice < 0) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
      }

      const config = await getPaymentConfig();
      const newFeeResult = calculateServiceFee(newPrice, config);
      const oldFeeAmount = listing.listingFee?.toNumber() ?? 0;
      const newFeeAmount = newFeeResult.finalFee;

      if (newPrice > currentPrice) {
        const feeDiff = newFeeAmount - oldFeeAmount;
        if (feeDiff > 0) {
          feeActions.push({
            type: 'PRICE_INCREASE',
            amount: feeDiff,
            reason: `Price increased from ${currentPrice} to ${newPrice}`,
            oldPrice: currentPrice,
            newPrice,
          });
          warnings.push(`Price increased. Additional listing fee: ${listing.listingFeeCurrency || 'USD'} ${feeDiff.toFixed(2)}`);
        }
      } else if (newPrice < currentPrice) {
        const feeDiff = oldFeeAmount - newFeeAmount;
        if (feeDiff > 0) {
          feeActions.push({
            type: 'PRICE_DECREASE_REFUND',
            amount: feeDiff,
            reason: `Price decreased from ${currentPrice} to ${newPrice}. Refund excess fee.`,
            oldPrice: currentPrice,
            newPrice,
          });
          warnings.push(`Price decreased. Refund excess fee: ${listing.listingFeeCurrency || 'USD'} ${feeDiff.toFixed(2)}`);
        }
      }

      updates.price = newPrice;
      updates.originalPrice = listing.originalPrice?.toNumber() ?? currentPrice;
      updates.listingFee = newFeeAmount;
      updates.lastPriceAdjustmentAt = new Date();
    }

    if (body.stockQuantity !== undefined && body.stockQuantity !== null) {
      const newStock = Number(body.stockQuantity);
      const soldQty = listing.soldQuantity;

      if (isNaN(newStock) || newStock < soldQty) {
        return NextResponse.json({
          error: `Stock cannot be less than sold quantity (${soldQty}). Stock can only be decreased, not increased. To increase stock, create a new listing.`,
        }, { status: 400 });
      }

      if (newStock > currentStock) {
        return NextResponse.json({
          error: 'Stock can only be decreased, not increased. To increase stock, please create a new listing via "发布列表".',
        }, { status: 400 });
      }

      updates.stockQuantity = newStock;
    }

    const hasInfoChanges = TRACKED_FIELDS.some(f => body[f] !== undefined);

    for (const field of TRACKED_FIELDS) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (hasInfoChanges) {
      updates.verificationStatus = 'PENDING';
      updates.isVerified = false;
      warnings.push('Product information updated. Listing requires platform re-verification before going live.');
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updatedListing = await prisma.auctionListing.update({
      where: { id },
      data: updates,
    });

    for (const action of feeActions) {
      await prisma.listingFeeRecord.create({
        data: {
          listingId: id,
          type: action.type,
          amount: action.amount,
          currency: listing.listingFeeCurrency || 'USD',
          reason: action.reason,
          oldPrice: action.oldPrice,
          newPrice: action.newPrice,
        },
      });
    }

    const availableStock = Math.max(0, (updatedListing.stockQuantity || 0) - (updatedListing.soldQuantity || 0));

    return NextResponse.json({
      success: true,
      data: {
        ...updatedListing,
        price: updatedListing.price?.toNumber() ?? null,
        listingFee: updatedListing.listingFee?.toNumber() ?? null,
        originalPrice: updatedListing.originalPrice?.toNumber() ?? null,
        availableStock,
        feeActions,
        warnings,
      },
    });
  } catch (error: any) {
    console.error('Error updating auction listing:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
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

    if (listing.posterId !== session.user.id && listing.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (listing.status === 'DELISTED') {
      return NextResponse.json({ error: 'Listing already delisted' }, { status: 400 });
    }

    const listingFee = listing.listingFee?.toNumber() ?? 0;

    await prisma.$transaction(async (tx) => {
      await tx.auctionListing.update({
        where: { id },
        data: {
          status: 'DELISTED',
          feeRefunded: listingFee > 0,
        },
      });

      if (listingFee > 0) {
        await tx.listingFeeRecord.create({
          data: {
            listingId: id,
            type: 'DELIST_FULL_REFUND',
            amount: listingFee,
            currency: listing.listingFeeCurrency || 'USD',
            reason: 'Listing delisted - full fee refund',
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        delisted: true,
        refundAmount: listingFee,
        currency: listing.listingFeeCurrency || 'USD',
        message: listingFee > 0
          ? `Listing delisted. Full fee refund of ${listing.listingFeeCurrency || 'USD'} ${listingFee.toFixed(2)} has been processed.`
          : 'Listing delisted successfully.',
      },
    });
  } catch (error: any) {
    console.error('Error delisting auction listing:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
