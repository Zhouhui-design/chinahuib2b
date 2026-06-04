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
export async function getActiveAuctions(): Promise<AuctionListing[]> {
  const now = new Date();
  return await prisma.auctionListing.findMany({
    where: {
      isAuction: true,
      status: 'ACTIVE',
      auctionStartTime: { lte: now },
      auctionEndTime: { gte: now },
    },
    include: {
      poster: true,
      seller: true,
    },
    orderBy: { auctionEndTime: 'asc' },
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
    startingBid: number;
    bidIncrement: number;
    reservePrice?: number;
    auctionStartTime: Date;
    auctionEndTime: Date;
    autoExtend?: boolean;
    extendedMinutes?: number;
    images?: string[];
    videos?: string[];
    documents?: string[];
    currency?: string;
    minOrderQty?: number;
    maxOrderQty?: number;
    contactEmail?: string;
    contactPhone?: string;
    contactWeChat?: string;
    contactWhatsApp?: string;
    sellerId?: string;
  }
): Promise<AuctionListing> {
  return await prisma.auctionListing.create({
    data: {
      type: 'SELLING',
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags || [],
      startingBid: data.startingBid,
      currentBid: data.startingBid,
      bidIncrement: data.bidIncrement,
      reservePrice: data.reservePrice,
      auctionStartTime: data.auctionStartTime,
      auctionEndTime: data.auctionEndTime,
      autoExtend: data.autoExtend || true,
      extendedMinutes: data.extendedMinutes || 5,
      isAuction: true,
      status: 'ACTIVE',
      images: data.images || [],
      videos: data.videos || [],
      documents: data.documents || [],
      currency: data.currency || 'USD',
      minOrderQty: data.minOrderQty,
      maxOrderQty: data.maxOrderQty,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      contactWeChat: data.contactWeChat,
      contactWhatsApp: data.contactWhatsApp,
      posterId,
      sellerId: data.sellerId,
    },
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

  const now = new Date();
  if (listing.auctionStartTime && now < listing.auctionStartTime) {
    return { success: false, message: 'Auction has not started yet', currentBid: listing.currentBid || 0, isReserveMet: false };
  }

  if (listing.auctionEndTime && now > listing.auctionEndTime) {
    return { success: false, message: 'Auction has ended', currentBid: listing.currentBid || 0, isReserveMet: false };
  }

  // Check minimum bid amount
  const minimumBid = (listing.currentBid || listing.startingBid || 0) + (listing.bidIncrement || 1);
  if (amount < minimumBid) {
    return {
      success: false,
      message: `Bid must be at least ${minimumBid} ${listing.currency}`,
      currentBid: listing.currentBid || 0,
      isReserveMet: false,
    };
  }

  // Check if bidder is the seller
  if (listing.posterId === bidderId) {
    return { success: false, message: 'Seller cannot bid on their own auction', currentBid: listing.currentBid || 0, isReserveMet: false };
  }

  // Check for auto-bid conflicts
  if (isAutoBid && maxAutoBid && amount > maxAutoBid) {
    return { success: false, message: 'Bid amount exceeds maximum auto-bid', currentBid: listing.currentBid || 0, isReserveMet: false };
  }

  // Create the bid
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

  // Update current bid
  const updatedListing = await prisma.auctionListing.update({
    where: { id: listingId },
    data: {
      currentBid: amount,
      bidCount: { increment: 1 },
      updatedAt: new Date(),
    },
  });

  // Auto-extend if bid in last minute
  if (listing.autoExtend && listing.auctionEndTime) {
    const timeRemaining = listing.auctionEndTime.getTime() - now.getTime();
    if (timeRemaining < 60000) { // Less than 1 minute
      await prisma.auctionListing.update({
        where: { id: listingId },
        data: {
          auctionEndTime: new Date(now.getTime() + (listing.extendedMinutes || 5) * 60000),
        },
      });
    }
  }

  const isReserveMet = !listing.reservePrice || amount >= listing.reservePrice;

  return {
    success: true,
    bid,
    message: 'Bid placed successfully',
    currentBid: amount,
    isReserveMet,
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
      return { amount: listing.startingBid || 0 };
    }
    return null;
  }

  return { amount: bid.amount, bidderId: bid.bidderId };
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
  const listing = await getAuctionListing(listingId);
  if (!listing || !listing.reservePrice) {
    return true; // No reserve price means it's met
  }

  const currentBid = await getCurrentBid(listingId);
  return currentBid ? currentBid.amount >= listing.reservePrice : false;
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
  // Find all auto-bidders with maxAutoBid >= newBidAmount
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

  // Get the highest auto-bidder
  const topAutoBidder = autoBidders[0];
  const bidIncrement = await prisma.auctionListing.findUnique({
    where: { id: listingId },
    select: { bidIncrement: true },
  });

  const increment = bidIncrement?.bidIncrement || 1;
  const nextBid = newBidAmount + increment;

  if (nextBid <= topAutoBidder.maxAutoBid!) {
    // Place auto-bid
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