import { Suspense } from 'react';
import { getDictionary } from "@/locales/dictionary";
import type { LanguageCode } from "@/lib/languages";
import { prisma } from "@/lib/db";
import CategorySidebar from "@/components/category/CategorySidebar";
import ProductGrid from "@/components/product/ProductGrid";
import { BreadcrumbSchema } from '@/components/seo/StructuredData';
import type { Metadata } from 'next';
import { languages } from '@/lib/languages';

// ISR Configuration - Revalidate every 30 minutes
export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ locale: LanguageCode }> }): Promise<Metadata> {
  const { locale } = await params;
  
  const baseUrl = 'https://x2xhub.com';
  
  const alternates: Record<string, string> = {};
  languages.forEach(lang => {
    const langPath = lang.code === 'en' 
      ? '/products'
      : `/${lang.code}/products`;
    alternates[lang.code] = `${baseUrl}${langPath}`;
  });

  return {
    title: locale === 'zh' ? '产品列表 - 全球B2B贸易平台 | X2XHub' : 'Products - Global B2B Trade Platform | X2XHub',
    description: locale === 'zh' 
      ? '浏览来自全球制造商的精选产品，涵盖电子产品、机械设备、原材料等多个品类。X2XHub - 全球领先的B2B贸易展览平台。' 
      : 'Browse featured products from global manufacturers across electronics, machinery, raw materials and more. X2XHub - Leading global B2B trade exhibition platform.',
    keywords: ['B2B', 'products', 'manufacturer', 'supplier', 'wholesale', 'trade', 'global', 'exhibition', '电子产品', '机械设备', '原材料', '供应商'],
    
    alternates: {
      canonical: `${baseUrl}/products`,
      languages: alternates,
    },
    
    openGraph: {
      title: locale === 'zh' ? '产品列表 - X2XHub' : 'Products - X2XHub',
      description: locale === 'zh' 
        ? '浏览来自全球制造商的精选产品' 
        : 'Browse featured products from global manufacturers',
      url: `${baseUrl}/${locale}/products`,
      type: 'website',
      siteName: 'X2XHub',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: locale === 'zh' ? '产品列表 - X2XHub' : 'Products - X2XHub',
      description: locale === 'zh' 
        ? '浏览来自全球制造商的精选产品' 
        : 'Browse featured products from global manufacturers',
    },
    
    robots: {
      index: true,
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: -1,
    },
  };
}

type PageProps = {
  params: Promise<{ locale: LanguageCode }>;
  searchParams: Promise<any>;
};

async function ProductList({ searchParams, locale }: { searchParams: Promise<any>; locale: string }) {
  const { category } = await searchParams;
  
  // Build filter query
  const where: any = {
    isActive: true,
  };

  // Filter by category if provided
  if (category) {
    where.category = {
      slug: category as string
    };
  }

  // Fetch products
  const products = await prisma.product.findMany({
    where,
    include: {
      seller: {
        select: {
          id: true,
          companyName: true,
          country: true,
          city: true,
        }
      },
      category: {
        select: {
          name: true,
          slug: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50, // Limit for performance
  });

  // Fetch selected category info
  let selectedCategory = null;
  if (category) {
    selectedCategory = await prisma.category.findUnique({
      where: { slug: category as string },
      select: { name: true, slug: true }
    });
  }

  return (
    <div className="flex-1">
      {/* Category filter indicator */}
      {selectedCategory && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600">当前分类：</span>
            <span className="font-semibold text-blue-600">{selectedCategory.name}</span>
          </div>
        </div>
      )}

      {/* Product count */}
      <div className="mb-4 text-sm text-gray-600">
        找到 <span className="font-semibold">{products.length}</span> 个产品
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <ProductGrid products={products} locale={locale} />
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无产品</h3>
          <p className="text-gray-600">该分类下还没有产品</p>
        </div>
      )}
    </div>
  );
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  
  // Prepare breadcrumb schema
  const breadcrumbs = [
    { name: locale === 'zh' ? '首页' : 'Home', url: `/${locale}` },
    { name: locale === 'zh' ? '产品' : 'Products', url: undefined as any }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Schema.org Structured Data */}
      <BreadcrumbSchema items={breadcrumbs} />

      {/* Category Sidebar */}
      <Suspense fallback={null}>
        <CategorySidebar />
      </Suspense>

      {/* Main Content */}
      <main className="transition-all duration-300 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {dict.nav.products}
            </h1>
            <p className="text-gray-600">浏览来自全球制造商的精选产品</p>
          </div>

          {/* Product List with Category Filter */}
          <div className="flex gap-8">
            {/* Sidebar will push content with margin */}
            <Suspense
              fallback={
                <div className="flex-1 flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              }
            >
              <ProductList searchParams={searchParams} locale={locale} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
