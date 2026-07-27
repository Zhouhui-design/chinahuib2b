import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as auctionService from '@/services/auctionService';

const cleanArray = (arr: any): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(x => typeof x === 'string' && x.length > 0)
    .map(x => x.substring(0, 1000));
};

const cleanOptionalString = (val: any): string | undefined => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'string' && val.length === 0) return undefined;
  return String(val).substring(0, 2000);
};

// GET /api/auction - Get active auctions (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filterParams: { type?: string; category?: string; search?: string } = {};
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    if (type) filterParams.type = type;
    if (category) filterParams.category = category;
    if (search) filterParams.search = search;

    const auctions = await auctionService.getActiveAuctions(filterParams);
    return NextResponse.json(auctions);
  } catch (error: any) {
    console.error('Error fetching auctions:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.message, stack: error?.stack }, { status: 500 });
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

    console.log('Creating auction with data:', JSON.stringify({
      type: body.type,
      title: body.title,
      price: body.price,
      imagesCount: Array.isArray(body.images) ? body.images.length : 0,
      filesCount: Array.isArray(body.files) ? body.files.length : 0,
      drawingsCount: Array.isArray(body.drawings) ? body.drawings.length : 0,
    }));

    const auctionData: any = {
      type: body.type || 'SELLING',
      title: cleanOptionalString(body.title) || 'Untitled',
      description: cleanOptionalString(body.description),
      category: cleanOptionalString(body.category),
      tags: cleanArray(body.tags),
      keywords: cleanArray(body.keywords).slice(0, 50),
      startingBid: body.startingBid,
      bidIncrement: body.bidIncrement,
      reservePrice: body.reservePrice,
      auctionStartTime: body.auctionStartTime ? new Date(body.auctionStartTime) : undefined,
      auctionEndTime: body.auctionEndTime ? new Date(body.auctionEndTime) : undefined,
      autoExtend: body.autoExtend,
      extendedMinutes: body.extendedMinutes,
      images: cleanArray(body.images),
      videos: cleanArray(body.videos),
      documents: cleanArray(body.files),
      drawings: cleanArray(body.drawings),
      currency: cleanOptionalString(body.currency) || 'USD',
      minOrderQty: body.minOrderQty ? Number(body.minOrderQty) : undefined,
      maxOrderQty: body.maxOrderQty ? Number(body.maxOrderQty) : undefined,
      contactEmail: cleanOptionalString(body.contactEmail),
      contactPhone: cleanOptionalString(body.contactPhone),
      contactWeChat: cleanOptionalString(body.contactWeChat),
      contactWhatsApp: cleanOptionalString(body.contactWhatsApp),
      sellerId: body.sellerId,
      price: body.price ? Number(body.price) : undefined,
      techSpecs: cleanOptionalString(body.techSpecs),
      productFeatures: cleanOptionalString(body.productFeatures),
      applicationScope: cleanOptionalString(body.applicationScope),
      usageMethod: cleanOptionalString(body.usageMethod),
      shippingCountry: cleanOptionalString(body.shippingCountry),
      detailedAddress: cleanOptionalString(body.detailedAddress),
      isFob: body.isFob,
      isCif: body.isCif,
      verificationStatus: cleanOptionalString(body.verificationStatus) || 'NOT_APPLIED',
      unitId: cleanOptionalString(body.unitId),
      hsCode: cleanOptionalString(body.hsCode),
      hsCodeDescription: cleanOptionalString(body.hsCodeDescription),
      paymentMethods: cleanArray(body.paymentMethods),
      freightItems: cleanArray(body.freightItems),
      exportDocuments: cleanArray(body.exportDocuments),
      hasExportLicense: Boolean(body.hasExportLicense),
      exportLicenseNo: cleanOptionalString(body.exportLicenseNo),
      incoterms: cleanArray(body.incoterms),
      portOfLoading: cleanOptionalString(body.portOfLoading),
      portOfDestination: cleanOptionalString(body.portOfDestination),
    };

    if (auctionData.type === 'SELLING' && !auctionData.hsCode) {
      return NextResponse.json({ error: 'HS Code is required for selling listings' }, { status: 400 });
    }

    const auction = await auctionService.createAuctionListing(session.user.id, auctionData);

    return NextResponse.json({ success: true, data: { listing: auction } }, { status: 201 });
  } catch (error: any) {
    console.error('=== Error creating auction ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
    const errorResponse: any = { error: 'Internal server error' };
    
    if (error?.message) {
      errorResponse.message = error.message;
    }
    if (error?.code) {
      errorResponse.code = error.code;
    }
    if (error?.meta?.target) {
      errorResponse.target = error.meta.target;
    }
    if (error?.meta?.field_name) {
      errorResponse.field = error.meta.field_name;
    }
    
    console.error('Error response:', JSON.stringify(errorResponse));
    console.error('===============================');
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}