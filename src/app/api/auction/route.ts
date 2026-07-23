import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as auctionService from '@/services/auctionService';

// GET /api/auction - Get active auctions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auctions = await auctionService.getActiveAuctions();
    return NextResponse.json(auctions);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/auction - Create new auction listing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const auctionData: any = {
      title: body.title,
      description: body.description,
      category: body.category,
      tags: body.tags,
      startingBid: body.startingBid,
      bidIncrement: body.bidIncrement,
      reservePrice: body.reservePrice,
      auctionStartTime: body.auctionStartTime ? new Date(body.auctionStartTime) : undefined,
      auctionEndTime: body.auctionEndTime ? new Date(body.auctionEndTime) : undefined,
      autoExtend: body.autoExtend,
      extendedMinutes: body.extendedMinutes,
      images: body.images,
      videos: body.videos,
      documents: body.files,
      drawings: body.drawings,
      currency: body.currency,
      minOrderQty: body.minOrderQty,
      maxOrderQty: body.maxOrderQty,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      contactWeChat: body.contactWeChat,
      contactWhatsApp: body.contactWhatsApp,
      sellerId: body.sellerId,
      type: body.type,
      price: body.price,
      techSpecs: body.techSpecs,
      productFeatures: body.productFeatures,
      applicationScope: body.applicationScope,
      usageMethod: body.usageMethod,
      shippingCountry: body.shippingCountry,
      detailedAddress: body.detailedAddress,
      isFob: body.isFob,
      isCif: body.isCif,
      verificationStatus: body.verificationStatus,
      unitId: body.unitId,
      keywords: body.keywords,
    };

    const auction = await auctionService.createAuctionListing(session.user.id, auctionData);

    return NextResponse.json({ success: true, data: { listing: auction } }, { status: 201 });
  } catch (error) {
    console.error('Error creating auction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}