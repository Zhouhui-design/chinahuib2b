import { prisma } from '@/lib/db';
import { TransactionType } from '@prisma/client';
import * as walletService from './walletService';

// Create a new shout out
export async function createShoutOut(
  senderId: string,
  data: {
    content: string;
    isFree?: boolean;
    cost?: number;
    paymentId?: string;
    priority?: number;
    expiresAt?: Date;
    type?: string; // product, service, demand, general
    tags?: string[];
    location?: string;
  }
): Promise<ShoutOut> {
  // Check daily limit
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const todayShoutOuts = await prisma.shoutOut.count({
    where: {
      senderId,
      createdAt: {
        gte: todayStart,
        lt: todayEnd,
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: senderId },
  });

  const dailyLimit = user?.dailyShoutOuts || 10;

  if (todayShoutOuts >= dailyLimit) {
    throw new Error('Daily shout out limit reached');
  }

  // Calculate priority based on payment
  let priority = data.priority || 1;
  let finalCost = data.cost || 0;
  let isFree = data.isFree ?? true;
  
  if (!isFree && finalCost > 0) {
    // Check wallet balance
    const hasBalance = await walletService.hasSufficientBalance(senderId, finalCost);
    if (!hasBalance) {
      throw new Error('Insufficient wallet balance');
    }
    
    // Higher cost = higher priority
    if (finalCost >= 10) {
      priority = 5;
    } else if (finalCost >= 5) {
      priority = 4;
    } else if (finalCost >= 2) {
      priority = 3;
    } else if (finalCost >= 1) {
      priority = 2;
    }
  }

  // Set expiry based on priority/cost
  let expiresAt = data.expiresAt;
  if (!expiresAt) {
    const baseDuration = priority * 60 * 60 * 1000; // 1 hour per priority level
    expiresAt = new Date(now.getTime() + baseDuration);
  }

  // Create shout out first
  const shoutOut = await prisma.shoutOut.create({
    data: {
      senderId,
      content: data.content,
      isFree,
      cost: finalCost,
      paymentId: data.paymentId,
      priority,
      expiresAt,
      type: data.type || 'general',
      tags: data.tags || [],
      location: data.location,
    },
  });

  // Charge wallet if not free
  if (!isFree && finalCost > 0) {
    await walletService.createTransaction(
      senderId,
      TransactionType.PAYMENT,
      finalCost,
      'Paid shout out',
      undefined,
      undefined,
      `ShoutOut:${shoutOut.id}`
    );
  }

  return shoutOut;
}

// Get all active shout outs
export async function getActiveShoutOuts(
  type?: string,
  tags?: string[],
  location?: string
): Promise<ShoutOut[]> {
  const now = new Date();
  const where: Record<string, any> = {
    expiresAt: { gte: now },
  };

  if (type) {
    where.type = type;
  }

  if (tags && tags.length > 0) {
    where.tags = { hasSome: tags };
  }

  if (location) {
    where.location = { contains: location, mode: 'insensitive' };
  }

  return await prisma.shoutOut.findMany({
    where,
    include: { sender: true },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

// Get shout out by ID
export async function getShoutOutById(shoutOutId: string): Promise<ShoutOut | null> {
  return await prisma.shoutOut.findUnique({
    where: { id: shoutOutId },
    include: { sender: true },
  });
}

// Update view count
export async function incrementViewCount(shoutOutId: string): Promise<ShoutOut> {
  return await prisma.shoutOut.update({
    where: { id: shoutOutId },
    data: { viewCount: { increment: 1 } },
  });
}

// Update click count
export async function incrementClickCount(shoutOutId: string): Promise<ShoutOut> {
  return await prisma.shoutOut.update({
    where: { id: shoutOutId },
    data: { clickCount: { increment: 1 } },
  });
}

// Add reaction
export async function addReaction(
  shoutOutId: string,
  userId: string,
  reactionType: string // like, fire, heart, etc.
): Promise<ShoutOut> {
  const shoutOut = await prisma.shoutOut.findUnique({
    where: { id: shoutOutId },
  });

  if (!shoutOut) {
    throw new Error('Shout out not found');
  }

  const currentReactions = shoutOut.reactions as Record<string, string[]> || {};
  
  // Remove user from other reaction types
  Object.keys(currentReactions).forEach(key => {
    if (key !== reactionType) {
      currentReactions[key] = currentReactions[key].filter(id => id !== userId);
    }
  });

  // Add user to the selected reaction type
  if (!currentReactions[reactionType]) {
    currentReactions[reactionType] = [];
  }
  
  if (!currentReactions[reactionType].includes(userId)) {
    currentReactions[reactionType].push(userId);
  } else {
    // Toggle - remove if already present
    currentReactions[reactionType] = currentReactions[reactionType].filter(id => id !== userId);
  }

  return await prisma.shoutOut.update({
    where: { id: shoutOutId },
    data: { reactions: currentReactions },
  });
}

// Get trending tags
export async function getTrendingTags(limit: number = 10): Promise<{ tag: string; count: number }[]> {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const shoutOuts = await prisma.shoutOut.findMany({
    where: {
      createdAt: { gte: twentyFourHoursAgo },
    },
    select: { tags: true },
  });

  const tagCount: Record<string, number> = {};
  shoutOuts.forEach(shoutOut => {
    shoutOut.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCount)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Get shout outs by user
export async function getShoutOutsByUser(
  userId: string
): Promise<ShoutOut[]> {
  return await prisma.shoutOut.findMany({
    where: { senderId: userId },
    include: { sender: true },
    orderBy: { createdAt: 'desc' },
  });
}

// Delete shout out
export async function deleteShoutOut(shoutOutId: string): Promise<ShoutOut> {
  return await prisma.shoutOut.delete({
    where: { id: shoutOutId },
  });
}

// Get daily shout out stats
export async function getDailyShoutOutStats(userId: string): Promise<{
  todayCount: number;
  dailyLimit: number;
  remaining: number;
}> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const todayShoutOuts = await prisma.shoutOut.count({
    where: {
      senderId: userId,
      createdAt: {
        gte: todayStart,
        lt: todayEnd,
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const dailyLimit = user?.dailyShoutOuts || 10;

  return {
    todayCount: todayShoutOuts,
    dailyLimit,
    remaining: dailyLimit - todayShoutOuts,
  };
}