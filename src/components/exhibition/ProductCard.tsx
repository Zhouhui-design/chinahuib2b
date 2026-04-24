import Link from 'next/link'
import Image from 'next/image'

interface ProductCardProps {
  id: string
  title: string
  mainImageUrl: string
  seller: {
    id: string
    companyName: string
    country: string
  }
  category: {
    name: string
  }
}

export default function ProductCard({ product }: { product: ProductCardProps }) {
  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300">
        <div className="relative h-48 bg-gray-100">
          {product.mainImageUrl ? (
            <Image
              src={product.mainImageUrl}
              alt={product.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600">
            {product.title}
          </h3>
          <div className="space-y-1">
            <Link 
              href={`/stores/${product.seller.id}`}
              className="text-sm text-gray-600 hover:text-blue-600 flex items-center"
            >
              🏢 {product.seller.companyName}
            </Link>
            <p className="text-xs text-gray-500">
              📍 {product.seller.country}
            </p>
            <p className="text-xs text-gray-500">
              📁 {product.category.name}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="inline-block text-sm text-blue-600 font-medium group-hover:underline">
              View Exhibit →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
