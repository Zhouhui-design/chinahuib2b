/**
 * Product API Service - Server-side data fetching
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://x2xhub.com';

export interface Product {
  id: string;
  title: string;
  titleEn?: string;
  description?: string;
  specifications?: any;
  minOrderQty?: number;
  supplyCapacity?: string;
  mainImageUrl: string;
  images: string[];
  viewCount: number;
  inquiryCount: number;
  createdAt: string;
  seller: {
    id: string;
    companyName: string;
    country: string;
    city: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  category: {
    id: string;
    name: string;
    nameEn?: string;
    slug: string;
  };
  brochure?: {
    id: string;
    fileName: string;
    fileSize: number;
    downloadCount: number;
  };
}

/**
 * Fetch product by ID (Server-side)
 * @param productId - Product ID
 * @returns Product data or null
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      next: { 
        revalidate: 3600, // ISR: Revalidate every hour
        tags: [`product-${productId}`]
      },
      cache: 'force-cache'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    const data = await response.json();
    return data.product || data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Fetch multiple products (Server-side)
 * @param options - Query options
 * @returns Products list
 */
export async function getProducts(options: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'newest' | 'popular' | 'price_asc' | 'price_desc';
} = {}): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
  const { page = 1, limit = 20, category, search, sortBy = 'newest' } = options;

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
    });

    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const response = await fetch(`${API_BASE_URL}/api/products?${params}`, {
      next: { 
        revalidate: 1800, // ISR: Revalidate every 30 minutes
        tags: ['products-list']
      },
      cache: 'force-cache'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      products: data.products || [],
      total: data.total || 0,
      page: data.page || page,
      totalPages: data.totalPages || 1,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0, page, totalPages: 1 };
  }
}

/**
 * Increment product view count (Server Action)
 * @param productId - Product ID
 */
export async function incrementProductView(productId: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/products/${productId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Don't cache this request
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

/**
 * Revalidate product cache (for admin actions)
 * @param productId - Product ID
 */
export async function revalidateProduct(productId: string): Promise<void> {
  const { revalidateTag } = await import('next/cache');
  revalidateTag(`product-${productId}`);
}

/**
 * Revalidate products list cache
 */
export async function revalidateProductsList(): Promise<void> {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('products-list');
}
