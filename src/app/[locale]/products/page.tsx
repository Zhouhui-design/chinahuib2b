import { Suspense } from 'react';
import { getDictionary } from "@/locales/dictionary";
import type { LanguageCode } from "@/lib/languages";
import { prisma } from "@/lib/db";
import CategorySidebar from "@/components/category/CategorySidebar";
import ProductGrid from "@/components/product/ProductGrid";

type PageProps = {
  params: Promise<{ locale: LanguageCode }>;
  searchParams: Promise<any>;
};

async function ProductList({ searchParams }: { searchParams: Promise<any> }) {
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
        <ProductGrid products={products} />
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

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-xl font-bold text-gray-800 hidden sm:block">Global Expo</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{dict.nav.products}</span>
            </div>
          </div>
        </div>
      </nav>

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
              <ProductList searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
