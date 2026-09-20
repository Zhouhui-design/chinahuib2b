import { Suspense } from 'react';
import { getDictionary } from "@/locales/dictionary";
import type { LanguageCode } from "@/lib/languages";
import { prisma } from "@/lib/db";
import CategorySidebar from "@/components/category/CategorySidebar";
import ProductGrid from "@/components/product/ProductGrid";
import { BreadcrumbSchema } from '@/components/seo/StructuredData';
import type { Metadata } from 'next';
import { languages } from '@/lib/languages';
import Link from 'next/link';
import ProductFilterBar from "@/components/product/ProductFilterBar";

// ISR Configuration - Revalidate every 30 minutes
export const revalidate = 1800;

const PAGE_SIZE = 50;

export async function generateMetadata({ params }: { params: Promise<{ locale: LanguageCode }> }): Promise<Metadata> {
  const { locale } = await params;
  
  const baseUrl = 'https://x2xhub.com';

  // Every locale keeps its prefix, including 'en'. Mapping 'en' to a bare
  // /products made canonical point at a URL that middleware redirects away
  // from, so /en/products was declaring a canonical it does not serve.
  const alternates: Record<string, string> = {};
  languages.forEach(lang => {
    alternates[lang.code] = `${baseUrl}/${lang.code}/products`;
  });
  alternates['x-default'] = `${baseUrl}/en/products`;

  return {
    // Root layout template appends '| SeaHeart Global | 心海环球' — keep the
    // page-specific part free of the brand to avoid the doubled-brand title
    // Google Search Console flagged.
    title: locale === 'zh' ? '产品 - 全球B2B贸易平台' : 'Products - Global B2B Trade Platform',
    description: locale === 'zh' 
      ? '浏览来自全球制造商的精选产品，涵盖电子产品、机械设备、原材料等多个品类。SeaHeart Global 心海环球 - 全球领先的B2B贸易展览平台。' 
      : 'Browse featured products from global manufacturers across electronics, machinery, raw materials and more. SeaHeart Global - Leading global B2B trade exhibition platform.',
    keywords: ['B2B', 'products', 'manufacturer', 'supplier', 'wholesale', 'trade', 'global', 'exhibition', '电子产品', '机械设备', '原材料', '供应商'],
    
    alternates: {
      canonical: `${baseUrl}/${locale}/products`,
      languages: alternates,
    },
    
    openGraph: {
      title: locale === 'zh' ? '产品列表 - SeaHeart Global' : 'Products - SeaHeart Global',
      description: locale === 'zh' 
        ? '浏览来自全球制造商的精选产品' 
        : 'Browse featured products from global manufacturers',
      url: `${baseUrl}/${locale}/products`,
      type: 'website',
      siteName: 'SeaHeart Global | 心海环球',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: locale === 'zh' ? '产品列表 - SeaHeart Global' : 'Products - SeaHeart Global',
      description: locale === 'zh' 
        ? '浏览来自全球制造商的精选产品' 
        : 'Browse featured products from global manufacturers',
    },
    
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}

type PageProps = {
  params: Promise<{ locale: LanguageCode }>;
  searchParams: Promise<any>;
};

async function ProductList({ searchParams, locale }: { searchParams: Promise<any>; locale: string }) {
  const { category, page, companyName, productName, keyword, country, companyType } = await searchParams;
  const currentPage = Math.max(1, parseInt(page as string, 10) || 1);

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

  // 产品名称：title / titleEn 模糊
  if (productName) {
    where.OR = [
      ...(where.OR || []),
      { title: { contains: productName as string, mode: 'insensitive' } },
      { titleEn: { contains: productName as string, mode: 'insensitive' } },
    ];
  }

  // 关键词：模糊子串匹配（title/titleEn/description + keywords JSONB 数组元素）
  let keywordProductIds: string[] | null = null;
  if (keyword) {
    const kw = keyword as string;
    // keywords JSONB 数组子串匹配（array_contains 只能精确匹配，需用原生 SQL）
    const kwRows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Product"
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(COALESCE("keywords", '[]'::jsonb)) AS k
        WHERE k ILIKE ${'%' + kw + '%'}
      )
    `;
    keywordProductIds = kwRows.map((r) => r.id);

    where.OR = [
      ...(where.OR || []),
      { title: { contains: kw, mode: 'insensitive' } },
      { titleEn: { contains: kw, mode: 'insensitive' } },
      { description: { contains: kw, mode: 'insensitive' } },
      ...(keywordProductIds.length > 0 ? [{ id: { in: keywordProductIds } }] : []),
    ];
  }

  // 公司维度：通过 seller 关系过滤（JOIN SellerProfile）
  const sellerWhere: any = {};
  if (companyName) {
    sellerWhere.companyName = { contains: companyName as string, mode: 'insensitive' };
  }
  if (country) {
    sellerWhere.country = { contains: country as string, mode: 'insensitive' };
  }
  if (companyType) {
    const types = (companyType as string).split(',').map((t) => t.trim().toUpperCase()).filter(Boolean);
    if (types.length === 1) sellerWhere.companyType = types[0];
    else if (types.length > 1) sellerWhere.companyType = { in: types };
  }
  if (Object.keys(sellerWhere).length > 0) {
    where.seller = sellerWhere;
  }

  // Get accurate total count (not limited)
  const totalProducts = await prisma.product.count({ where });

  // Fetch products for current page
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
          nameEn: true,
          slug: true,
          translations: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  let selectedCategory = null;
  if (category) {
    selectedCategory = await prisma.category.findUnique({
      where: { slug: category as string },
      select: { name: true, nameEn: true, slug: true, translations: true }
    });
  }

  const getCategoryDisplayName = (cat: any, loc: string) => {
    if (!cat) return '';
    // Use auto-translated field if available
    const translations = cat.translations as Record<string, string> | null;
    if (translations && translations[loc]) {
      return translations[loc];
    }
    // Fallback to legacy fields
    if (loc === 'zh') return cat.name;
    if (loc === 'en') return cat.nameEn || cat.name;
    // For other languages, try English translation then Chinese
    if (translations?.['en']) return translations['en'];
    return cat.nameEn || cat.name;
  };

  // Build query string preserving category filter across pages
  const buildPageHref = (p: number) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category as string);
    // 保留五维筛选条件，避免翻页后丢失
    if (companyName) params.set('companyName', companyName as string);
    if (productName) params.set('productName', productName as string);
    if (keyword) params.set('keyword', keyword as string);
    if (country) params.set('country', country as string);
    if (companyType) params.set('companyType', companyType as string);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  return (
    <div className="flex-1">
      {selectedCategory && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600">
              {locale === 'zh' ? '当前分类：' : locale === 'en' ? 'Current Category:' : 'Kategorie:'}
            </span>
            <span className="font-semibold text-blue-600">
              {getCategoryDisplayName(selectedCategory, locale)}
            </span>
          </div>
        </div>
      )}

      {/* Product count */}
      <div className="mb-4 text-sm text-gray-600">
        {locale === 'zh'
          ? <>找到 <span className="font-semibold">{totalProducts}</span> 个产品{totalPages > 1 && <>（第 {currentPage}/{totalPages} 页）</>}</>
          : <>Found <span className="font-semibold">{totalProducts}</span> products{totalPages > 1 && <> (Page {currentPage} of {totalPages})</>}</>}
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <ProductGrid products={products as any} locale={locale} />
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无产品</h3>
          <p className="text-gray-600">该分类下还没有产品</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {currentPage > 1 ? (
            <Link
              href={`/${locale}/products${buildPageHref(currentPage - 1)}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {locale === 'zh' ? '上一页' : 'Previous'}
            </Link>
          ) : (
            <span className="px-4 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
              {locale === 'zh' ? '上一页' : 'Previous'}
            </span>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/${locale}/products${buildPageHref(p)}`}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                p === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {p}
            </Link>
          ))}

          {currentPage < totalPages ? (
            <Link
              href={`/${locale}/products${buildPageHref(currentPage + 1)}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {locale === 'zh' ? '下一页' : 'Next'}
            </Link>
          ) : (
            <span className="px-4 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
              {locale === 'zh' ? '下一页' : 'Next'}
            </span>
          )}
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
            <div className="flex-1 min-w-0">
              {/* 五维筛选栏（客户端交互，URL searchParams 驱动 SSR 查询） */}
              <Suspense fallback={null}>
                <ProductFilterBar locale={locale} />
              </Suspense>

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
        </div>
      </main>
    </div>
  );
}
