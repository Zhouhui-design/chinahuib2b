import { prisma } from '@/lib/db';
import { SellerProfile, Product, Booth, SubscriptionStatus, ProfileStatus } from '@prisma/client';
import { deriveSlugFromUsername, generateUniqueSlug, isValidSlug } from '@/lib/store-slug';
import { getCountryAliases, normalizeCountryKey } from '@/lib/countries';

/**
 * Generate a unique store slug derived from a username.
 * Checks the database for collisions and appends -2, -3, ... when needed.
 *
 * Used by all seller-creation paths so every new store gets a clean
 * GitHub-style URL (x2xhub.com/<slug>) from day one.
 */
export async function generateUniqueStoreSlug(
  username: string,
  excludeSellerId?: string,
): Promise<string> {
  const base = deriveSlugFromUsername(username || '');
  const existsFn = async (slug: string) => {
    const conflict = await prisma.sellerProfile.findFirst({
      where: {
        storeSlug: slug,
        ...(excludeSellerId ? { id: { not: excludeSellerId } } : {}),
      },
      select: { id: true },
    });
    return !!conflict;
  };
  const slug = await generateUniqueSlug(base, existsFn);
  // Defensive: ensure final result is valid
  return isValidSlug(slug) ? slug : deriveSlugFromUsername('');
}

// Get seller profile by user ID
export async function getSellerProfile(userId: string): Promise<SellerProfile | null> {
  return await prisma.sellerProfile.findUnique({
    where: { userId },
    include: {
      products: true,
      booths: true,
    },
  });
}

// Get seller profile by ID
export async function getSellerProfileById(sellerId: string): Promise<SellerProfile | null> {
  return await prisma.sellerProfile.findUnique({
    where: { id: sellerId },
    include: {
      products: {
        include: { category: true },
      },
      booths: true,
    },
  });
}

// Create seller profile
export async function createSellerProfile(
  userId: string,
  data: {
    companyName: string;
    companyType: 'MANUFACTURER' | 'TRADER' | 'BOTH';
    country: string;
    province?: string;
    city?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    whatsapp?: string;
    wechat?: string;
    telegram?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    description?: string;
    descriptions?: Record<string, string>;
    logoUrl?: string;
    bannerUrl?: string;
    certifications?: string[];
  }
): Promise<SellerProfile> {
  // Fetch username to derive a unique store slug
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  const storeSlug = await generateUniqueStoreSlug(user?.username || '');

  return await prisma.sellerProfile.create({
    data: {
      userId,
      companyName: data.companyName,
      companyType: data.companyType,
      country: data.country,
      province: data.province,
      city: data.city,
      address: data.address,
      phone: data.phone,
      email: data.email,
      website: data.website,
      whatsapp: data.whatsapp,
      wechat: data.wechat,
      telegram: data.telegram,
      linkedin: data.linkedin,
      facebook: data.facebook,
      instagram: data.instagram,
      description: data.description,
      descriptions: data.descriptions,
      logoUrl: data.logoUrl,
      bannerUrl: data.bannerUrl,
      certifications: data.certifications || [],
      subscriptionStatus: SubscriptionStatus.FREE_TRIAL,
      subscriptionExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day free trial
      storeSlug,
    },
  });
}

// Update seller profile
export async function updateSellerProfile(
  sellerId: string,
  data: Partial<SellerProfile>
): Promise<SellerProfile> {
  return await prisma.sellerProfile.update({
    where: { id: sellerId },
    data,
  });
}

// Create product
export async function createProduct(
  sellerId: string,
  data: {
    title: string;
    titles?: Record<string, string>;
    description?: string;
    descriptions?: Record<string, string>;
    categoryId: string;
    boothId?: string;
    specifications?: Record<string, any>;
    minOrderQty?: number;
    supplyCapacity?: string;
    mainImageUrl: string;
    images?: string[];
    hasBrochure?: boolean;
    isFeatured?: boolean;
  }
): Promise<Product> {
  return await prisma.product.create({
    data: {
      sellerId,
      title: data.title,
      titles: data.titles,
      description: data.description,
      descriptions: data.descriptions,
      categoryId: data.categoryId,
      boothId: data.boothId,
      specifications: data.specifications,
      minOrderQty: data.minOrderQty,
      supplyCapacity: data.supplyCapacity,
      mainImageUrl: data.mainImageUrl,
      images: data.images || [],
      hasBrochure: data.hasBrochure || false,
      isFeatured: data.isFeatured || false,
      isActive: true,
    },
  });
}

// Update product
export async function updateProduct(
  productId: string,
  data: Partial<Product>
): Promise<Product> {
  return await prisma.product.update({
    where: { id: productId },
    data,
  });
}

// Delete product
export async function deleteProduct(productId: string): Promise<Product> {
  return await prisma.product.update({
    where: { id: productId },
    data: { isActive: false },
  });
}

// Get products by seller
export async function getProductsBySeller(
  sellerId: string,
  categoryId?: string,
  isActive?: boolean
): Promise<Product[]> {
  const where: Record<string, any> = { sellerId };
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  return await prisma.product.findMany({
    where,
    include: { category: true, booth: true },
    orderBy: { createdAt: 'desc' },
  });
}

// Create booth
export async function createBooth(
  sellerId: string,
  data: {
    name: string;
    names?: Record<string, string>;
    exhibitionName: string;
    exhibitionDates?: { start: string; end: string };
    location?: string;
    theme?: string;
    colorScheme?: string;
    layout?: string;
  }
): Promise<Booth> {
  return await prisma.booth.create({
    data: {
      sellerId,
      name: data.name,
      names: data.names,
      exhibitionName: data.exhibitionName,
      exhibitionDates: data.exhibitionDates,
      location: data.location,
      theme: data.theme,
      colorScheme: data.colorScheme,
      layout: data.layout,
      isActive: true,
      isPublished: false,
    },
  });
}

// Update booth
export async function updateBooth(
  boothId: string,
  data: Partial<Booth>
): Promise<Booth> {
  return await prisma.booth.update({
    where: { id: boothId },
    data,
  });
}

// Publish booth
export async function publishBooth(boothId: string): Promise<Booth> {
  return await prisma.booth.update({
    where: { id: boothId },
    data: { isPublished: true },
  });
}

// Unpublish booth
export async function unpublishBooth(boothId: string): Promise<Booth> {
  return await prisma.booth.update({
    where: { id: boothId },
    data: { isPublished: false },
  });
}

// Subscribe to premium plan
export async function subscribeToPremium(
  sellerId: string,
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE',
  amount: number,
  transactionId: string
): Promise<SellerProfile> {
  const subscriptionDurations: Record<string, number> = {
    BASIC: 30,    // 1 month
    PRO: 90,      // 3 months
    ENTERPRISE: 365, // 1 year
  };

  const days = subscriptionDurations[plan];
  const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  return await prisma.sellerProfile.update({
    where: { id: sellerId },
    data: {
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionExpiry: expiryDate,
      subscriptionAmount: amount,
      lastPaymentAt: new Date(),
    },
  });
}

// Extend subscription
export async function extendSubscription(
  sellerId: string,
  days: number,
  amount: number,
  transactionId: string
): Promise<SellerProfile> {
  const seller = await prisma.sellerProfile.findUnique({
    where: { id: sellerId },
  });

  if (!seller) {
    throw new Error('Seller not found');
  }

  const currentExpiry = seller.subscriptionExpiry || new Date();
  const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);

  return await prisma.sellerProfile.update({
    where: { id: sellerId },
    data: {
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionExpiry: newExpiry,
      subscriptionAmount: { increment: amount },
      lastPaymentAt: new Date(),
    },
  });
}

// Check subscription status
export async function checkSubscriptionStatus(
  sellerId: string
): Promise<{
  status: SubscriptionStatus;
  isActive: boolean;
  expiresAt?: Date;
  daysRemaining?: number;
}> {
  const seller = await prisma.sellerProfile.findUnique({
    where: { id: sellerId },
    select: { subscriptionStatus: true, subscriptionExpiry: true },
  });

  if (!seller) {
    throw new Error('Seller not found');
  }

  const now = new Date();
  let isActive = seller.subscriptionStatus === SubscriptionStatus.ACTIVE;
  
  if (seller.subscriptionExpiry && seller.subscriptionExpiry < now) {
    isActive = false;
  }

  let daysRemaining: number | undefined;
  if (seller.subscriptionExpiry) {
    daysRemaining = Math.ceil(
      (seller.subscriptionExpiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
    );
    if (daysRemaining < 0) daysRemaining = 0;
  }

  return {
    status: seller.subscriptionStatus,
    isActive,
    expiresAt: seller.subscriptionExpiry,
    daysRemaining,
  };
}

// Get all sellers with active subscriptions
export async function getActiveSellers(): Promise<SellerProfile[]> {
  const now = new Date();
  return await prisma.sellerProfile.findMany({
    where: {
      isActive: true,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionExpiry: { gte: now },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Get featured sellers
export async function getFeaturedSellers(limit: number = 10): Promise<SellerProfile[]> {
  return await prisma.sellerProfile.findMany({
    where: {
      isActive: true,
      isVerified: true,
      profileStatus: ProfileStatus.APPROVED,
    },
    include: {
      products: { take: 3 },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// Get all approved sellers for public display
export interface CountryFacet {
  /** Canonical English name; raw unmapped value when the country is unknown */
  name: string;
  /** ISO alpha-2 when recognized, null for legacy/unmapped values */
  code: string | null;
  count: number;
}

/**
 * Country facets for buyer-facing filters: only countries that have approved
 * sellers, with counts. Raw stored spellings ("China" / "中国") are merged into
 * one canonical facet via the country translation table.
 *
 * scope 'withProducts' additionally requires at least one active product (used
 * by the products listing so a facet click never yields zero products).
 */
export async function getSellerCountryFacets(
  scope: 'all' | 'withProducts' = 'all'
): Promise<CountryFacet[]> {
  const rows = await prisma.sellerProfile.groupBy({
    by: ['country'],
    where: {
      isActive: true,
      profileStatus: ProfileStatus.APPROVED,
      ...(scope === 'withProducts' ? { products: { some: { isActive: true } } } : {}),
    },
    _count: { _all: true },
  });

  const facets = new Map<string, CountryFacet>();
  for (const row of rows) {
    const raw = (row.country || '').trim();
    if (!raw) continue;
    const normalized = normalizeCountryKey(raw);
    const key = normalized ? normalized.name : raw;
    const existing = facets.get(key);
    if (existing) {
      existing.count += row._count._all;
    } else {
      facets.set(key, {
        name: key,
        code: normalized?.code ?? null,
        count: row._count._all,
      });
    }
  }

  return Array.from(facets.values()).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
}

export async function getApprovedSellers(
  page: number = 1,
  limit: number = 12,
  search?: string,
  country?: string
): Promise<{ sellers: SellerProfile[]; total: number; totalPages: number }> {
  const skip = (page - 1) * limit;
  const keyword = search?.trim();

  // 模糊筛选：作用到公司信息、产品、展会、关键词
  // - 公司信息：companyName / description / businessScope / registeredAddress / certifications / boothCategories / boothTags
  // - 产品：products.some(title / titleEn)
  // - 展会：booths.some(name / exhibitionName)
  const baseWhere: any = {
    isActive: true,
    profileStatus: ProfileStatus.APPROVED,
  };

  // 国家筛选：别名归一化（"China" 同时匹配库存里的 "中国" 等写法）；
  // 未识别值回退为大小写不敏感的包含匹配
  if (country?.trim()) {
    const aliases = getCountryAliases(country);
    baseWhere.country =
      aliases.length === 1
        ? { contains: aliases[0], mode: 'insensitive' }
        : { in: aliases };
  }

  const where = keyword
    ? {
        ...baseWhere,
        OR: [
          { companyName: { contains: keyword, mode: 'insensitive' as const } },
          { description: { contains: keyword, mode: 'insensitive' as const } },
          { businessScope: { contains: keyword, mode: 'insensitive' as const } },
          { registeredAddress: { contains: keyword, mode: 'insensitive' as const } },
          { boothCategories: { has: keyword } },
          { boothTags: { has: keyword } },
          { certifications: { has: keyword } },
          {
            products: {
              some: {
                OR: [
                  { title: { contains: keyword, mode: 'insensitive' as const } },
                  { titleEn: { contains: keyword, mode: 'insensitive' as const } },
                ],
              },
            },
          },
          {
            booths: {
              some: {
                OR: [
                  { name: { contains: keyword, mode: 'insensitive' as const } },
                  { exhibitionName: { contains: keyword, mode: 'insensitive' as const } },
                ],
              },
            },
          },
        ],
      }
    : baseWhere;

  const [sellers, total] = await Promise.all([
    prisma.sellerProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        products: {
          where: { isActive: true },
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: { id: true, title: true, mainImageUrl: true },
        },
      },
    }),
    prisma.sellerProfile.count({ where }),
  ]);

  return {
    sellers,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

// Get sellers pending approval (for admin)
export async function getPendingApprovalSellers(): Promise<SellerProfile[]> {
  return await prisma.sellerProfile.findMany({
    where: {
      isActive: true,
      profileStatus: ProfileStatus.PENDING,
    },
    orderBy: { profileSubmittedAt: 'asc' },
  });
}

// Approve seller profile
export async function approveSellerProfile(
  sellerId: string,
  adminId: string,
  notes?: string
): Promise<SellerProfile> {
  return await prisma.sellerProfile.update({
    where: { id: sellerId },
    data: {
      profileStatus: ProfileStatus.APPROVED,
      isVerified: true, // Also flip the boolean flag so homepage/unified queries match
      profileReviewedAt: new Date(),
      profileReviewedBy: adminId,
      profileReviewNotes: notes,
    },
  });
}

// Reject seller profile
export async function rejectSellerProfile(
  sellerId: string,
  adminId: string,
  notes?: string
): Promise<SellerProfile> {
  return await prisma.sellerProfile.update({
    where: { id: sellerId },
    data: {
      profileStatus: ProfileStatus.REJECTED,
      isVerified: false, // Revoke verification so a previously-approved seller stops showing publicly
      profileReviewedAt: new Date(),
      profileReviewedBy: adminId,
      profileReviewNotes: notes,
    },
  });
}

// Submit profile for approval
export async function submitForApproval(sellerId: string): Promise<SellerProfile> {
  return await prisma.sellerProfile.update({
    where: { id: sellerId },
    data: {
      profileStatus: ProfileStatus.PENDING,
      profileSubmittedAt: new Date(),
    },
  });
}

export async function getSellersByProfileStatus(status: ProfileStatus): Promise<SellerProfile[]> {
  return await prisma.sellerProfile.findMany({
    where: {
      isActive: true,
      profileStatus: status,
    },
    orderBy: { profileSubmittedAt: 'asc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
        },
      },
    },
  });
}