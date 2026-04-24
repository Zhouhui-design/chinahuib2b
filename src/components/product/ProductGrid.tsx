'use client';

import Image from 'next/image';
import Link from 'next/link';

type Product = {
  id: string;
  title: string;
  mainImageUrl: string;
  description?: string | null;
  seller: {
    id: string;
    companyName: string;
    country: string;
    city: string;
  };
  category: {
    name: string;
    slug: string;
  };
};

type ProductGridProps = {
  products: Product[];
};

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          {/* Product Image */}
          <div className="relative h-56 bg-gray-100 overflow-hidden">
            {product.mainImageUrl ? (
              <Image
                src={product.mainImageUrl}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400 text-sm">暂无图片</span>
              </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                {product.category.name}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.title}
            </h3>
            
            {product.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Seller Info */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-600">
                    {product.seller.companyName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-900 font-medium">
                    {product.seller.companyName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.seller.city}, {product.seller.country}
                  </p>
                </div>
              </div>
            </div>

            {/* View Details Button */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-blue-600 font-medium group-hover:underline">
                查看详情 →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
