import { prisma } from '@/lib/db';
import { AuctionListing, AuctionBid, AuctionBidStatus } from '@prisma/client';

// Get auction listing by ID
export async function getAuctionListing(listingId: string): Promise<AuctionListing | null> {
  return await prisma.auctionListing.findUnique({
    where: { id: listingId },
    include: {
      poster: true,
      seller: true,
    },
  });
}

// Get all active auctions
export async function getActiveAuctions(filters?: { type?: string; category?: string; search?: string }): Promise<AuctionListing[]> {
  const where: any = {
    status: { in: ['ACTIVE', 'PENDING'] },
  };

  if (filters?.type) {
    where.type = filters.type;
  }
  if (filters?.category) {
    where.category = filters.category;
  }
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return await prisma.auctionListing.findMany({
    where,
    include: {
      poster: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
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
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Create a new auction listing
export async function createAuctionListing(
  posterId: string,
  data: {
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
    startingBid?: number;
    bidIncrement?: number;
    reservePrice?: number;
    auctionStartTime?: Date;
    auctionEndTime?: Date;
    autoExtend?: boolean;
    extendedMinutes?: number;
    images?: string[];
    videos?: string[];
    documents?: string[];
    drawings?: string[];
    currency?: string;
    minOrderQty?: number;
    maxOrderQty?: number;
    contactEmail?: string;
    contactPhone?: string;
    contactWeChat?: string;
    contactWhatsApp?: string;
    sellerId?: string;
    type?: string;
    price?: number;
    techSpecs?: string;
    productFeatures?: string;
    applicationScope?: string;
    usageMethod?: string;
    shippingCountry?: string;
    detailedAddress?: string;
    isFob?: string;
    isCif?: string;
    verificationStatus?: string;
    unitId?: string;
    keywords?: string[];
    stockQuantity?: number;
    hsCode?: string;
    hsCodeDescription?: string;
    paymentMethods?: string[];
    freightItems?: string[];
    exportDocuments?: string[];
    hasExportLicense?: boolean;
    exportLicenseNo?: string;
    incoterms?: string[];
    portOfLoading?: string;
    portOfDestination?: string;
  }
): Promise<AuctionListing> {
  const safeArray = (arr: any): string[] => Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : [];
  const cleanObj = (obj: any): any => {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = value;
      }
    }
    return result;
  };
  
  const toDecimal = (val: any): number | undefined => {
    if (val === undefined || val === null || val === '') return undefined;
    const num = Number(val);
    if (isNaN(num)) return undefined;
    return num;
  };
  
  const createData: any = cleanObj({
    type: (data.type as any) || 'SELLING',
    title: data.title,
    description: data.description || '',
    category: data.category,
    tags: safeArray(data.tags),
    price: toDecimal(data.price ?? 0),
    status: data.verificationStatus === 'VERIFIED' ? 'ACTIVE' : 'PENDING',
    images: safeArray(data.images),
    videos: safeArray(data.videos),
    documents: safeArray(data.documents),
    currency: data.currency || 'USD',
    minOrderQty: data.minOrderQty,
    maxOrderQty: data.maxOrderQty,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    contactWeChat: data.contactWeChat,
    contactWhatsApp: data.contactWhatsApp,
    posterId,
    sellerId: data.sellerId,
    techSpecs: data.techSpecs,
    productFeatures: data.productFeatures,
    applicationScope: data.applicationScope,
    usageMethod: data.usageMethod,
    shippingCountry: data.shippingCountry,
    detailedAddress: data.detailedAddress,
    isFob: data.isFob,
    isCif: data.isCif,
    verificationStatus: ((data.verificationStatus as any) || 'NOT_APPLIED').toString(),
    unitId: data.unitId,
    hsCode: data.hsCode,
    hsCodeDescription: data.hsCodeDescription,
    paymentMethods: safeArray(data.paymentMethods),
    freightItems: safeArray(data.freightItems),
    exportDocuments: safeArray(data.exportDocuments),
    hasExportLicense: data.hasExportLicense || false,
    exportLicenseNo: data.exportLicenseNo,
    incoterms: safeArray(data.incoterms).join(', '),
    portOfLoading: data.portOfLoading,
    portOfDestination: data.portOfDestination,
  });

  return await prisma.auctionListing.create({
    data: createData,
  });
}

// Place a bid on an auction
export async function placeBid(
  listingId: string,
  bidderId: string,
  amount: number,
  isAutoBid: boolean = false,
  maxAutoBid?: number
): Promise<{
  success: boolean;
  bid?: AuctionBid;
  message: string;
  currentBid: number;
  isReserveMet: boolean;
}> {
  const listing = await getAuctionListing(listingId);
  if (!listing) {
    return { success: false, message: 'Auction listing not found', currentBid: 0, isReserveMet: false };
  }

  const currentHighestBid = await getCurrentBid(listingId);
  const minimumBid = (currentHighestBid?.amount || 0) + 1;
  if (amount < minimumBid) {
    return {
      success: false,
      message: `Bid must be at least ${minimumBid} ${listing.currency}`,
      currentBid: currentHighestBid?.amount || 0,
      isReserveMet: false,
    };
  }

  if (listing.posterId === bidderId) {
    return { success: false, message: 'Seller cannot bid on their own auction', currentBid: currentHighestBid?.amount || 0, isReserveMet: false };
  }

  if (isAutoBid && maxAutoBid && amount > maxAutoBid) {
    return { success: false, message: 'Bid amount exceeds maximum auto-bid', currentBid: currentHighestBid?.amount || 0, isReserveMet: false };
  }

  const bid = await prisma.auctionBid.create({
    data: {
      listingId,
      bidderId,
      amount,
      currency: listing.currency,
      status: AuctionBidStatus.ACCEPTED,
      isAutoBid,
      maxAutoBid,
    },
  });

  return {
    success: true,
    bid,
    message: 'Bid placed successfully',
    currentBid: amount,
    isReserveMet: true,
  };
}

// Get all bids for a listing
export async function getBidsForListing(listingId: string): Promise<AuctionBid[]> {
  return await prisma.auctionBid.findMany({
    where: { listingId },
    include: { bidder: true },
    orderBy: { createdAt: 'desc' },
  });
}

// Get current highest bid
export async function getCurrentBid(listingId: string): Promise<{ amount: number; bidderId?: string } | null> {
  const bid = await prisma.auctionBid.findFirst({
    where: { listingId, status: AuctionBidStatus.ACCEPTED },
    orderBy: { amount: 'desc' },
    include: { bidder: true },
  });

  if (!bid) {
    const listing = await getAuctionListing(listingId);
    if (listing) {
      return { amount: listing.price?.toNumber() || 0 };
    }
    return null;
  }

  return { amount: bid.amount.toNumber(), bidderId: bid.bidderId };
}

// Close auction
export async function closeAuction(listingId: string): Promise<AuctionListing> {
  return await prisma.auctionListing.update({
    where: { id: listingId },
    data: {
      status: 'CLOSED',
      updatedAt: new Date(),
    },
  });
}

// Check if reserve price is met
export async function isReserveMet(listingId: string): Promise<boolean> {
  const currentBid = await getCurrentBid(listingId);
  return currentBid ? currentBid.amount > 0 : false;
}

// Get winning bid
export async function getWinningBid(listingId: string): Promise<AuctionBid | null> {
  const listing = await getAuctionListing(listingId);
  if (!listing) return null;

  return await prisma.auctionBid.findFirst({
    where: { listingId, status: AuctionBidStatus.ACCEPTED },
    orderBy: { amount: 'desc' },
    include: { bidder: true },
  });
}

// Auto-bid handler
export async function processAutoBid(
  listingId: string,
  newBidAmount: number
): Promise<{ autoBidPlaced: boolean; amount?: number; bidderId?: string }> {
  const autoBidders = await prisma.auctionBid.findMany({
    where: {
      listingId,
      isAutoBid: true,
      status: AuctionBidStatus.ACCEPTED,
      maxAutoBid: { gte: newBidAmount },
    },
    orderBy: { maxAutoBid: 'desc' },
    include: { bidder: true },
  });

  if (autoBidders.length === 0) {
    return { autoBidPlaced: false };
  }

  const topAutoBidder = autoBidders[0];
  const increment = 1;
  const nextBid = newBidAmount + increment;

  if (nextBid <= topAutoBidder.maxAutoBid!.toNumber()) {
    const result = await placeBid(
      listingId,
      topAutoBidder.bidderId,
      nextBid,
      true,
      topAutoBidder.maxAutoBid
    );

    if (result.success && result.bid) {
      return { autoBidPlaced: true, amount: nextBid, bidderId: topAutoBidder.bidderId };
    }
  }

  return { autoBidPlaced: false };
}
