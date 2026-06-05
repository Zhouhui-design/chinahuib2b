/**
 * Seller/Store API Service - Server-side data fetching
 */

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'https://x2xhub.com';

export interface Seller {
  id: string;
  companyName: string;
  companyType: string;
  country: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  certifications: string[];
  boothName?: string;
  isVerified: boolean;
  createdAt: string;
  products: Array<{
    id: string;
    title: string;
    titleEn?: string;
    mainImageUrl: string;
    viewCount: number;
    inquiryCount: number;
    category: {
      name: string;
      nameEn?: string;
    };
  }>;
  storeBrochures: Array<{
    id: string;
    title: string;
    fileName: string;
    fileSize: number;
    downloadCount: number;
  }>;
}

/**
 * Fetch seller by ID (Server-side)
 * @param sellerId - Seller ID
 * @returns Seller data or null
 */
export async function getSellerById(sellerId: string): Promise<Seller | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sellers/${sellerId}/public`, {
      next: { 
        revalidate: 3600, // ISR: Revalidate every hour
        tags: [`seller-${sellerId}`]
      },
      cache: 'force-cache'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch seller: ${response.statusText}`);
    }

    const data = await response.json();
    return data.seller || data;
  } catch (error) {
    console.error('Error fetching seller:', error);
    return null;
  }
}

/**
 * Fetch multiple sellers (Server-side)
 * @param options - Query options
 * @returns Sellers list
 */
export async function getSellers(options: {
  page?: number;
  limit?: number;
  country?: string;
  search?: string;
} = {}): Promise<{ sellers: Seller[]; total: number; page: number; totalPages: number }> {
  const { page = 1, limit = 20, country, search } = options;

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (country) params.append('country', country);
    if (search) params.append('search', search);

    const response = await fetch(`${API_BASE_URL}/api/sellers?${params}`, {
      next: { 
        revalidate: 1800, // ISR: Revalidate every 30 minutes
        tags: ['sellers-list']
      },
      cache: 'force-cache'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sellers: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      sellers: data.sellers || [],
      total: data.total || 0,
      page: data.page || page,
      totalPages: data.totalPages || 1,
    };
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return { sellers: [], total: 0, page, totalPages: 1 };
  }
}

/**
 * Revalidate seller cache (for admin actions)
 * @param sellerId - Seller ID
 */
export async function revalidateSeller(sellerId: string): Promise<void> {
  const { revalidateTag } = await import('next/cache');
  revalidateTag(`seller-${sellerId}`);
}

/**
 * Revalidate sellers list cache
 */
export async function revalidateSellersList(): Promise<void> {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('sellers-list');
}
