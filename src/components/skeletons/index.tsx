/**
 * Skeleton Loading Components
 */

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Image placeholder */}
      <div className="bg-gray-200 h-48 w-full"></div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="bg-gray-200 h-5 w-3/4 rounded"></div>
        
        {/* Description */}
        <div className="bg-gray-200 h-4 w-full rounded"></div>
        <div className="bg-gray-200 h-4 w-5/6 rounded"></div>
        
        {/* Price and MOQ */}
        <div className="flex justify-between items-center pt-2">
          <div className="bg-gray-200 h-6 w-1/3 rounded"></div>
          <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
        </div>
        
        {/* Button */}
        <div className="bg-gray-200 h-10 w-full rounded mt-4"></div>
      </div>
    </div>
  )
}

// Product List Skeleton
export function ProductListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}

// Store Card Skeleton
export function StoreCardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Logo */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="bg-gray-200 h-16 w-16 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="bg-gray-200 h-5 w-3/4 rounded"></div>
          <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-200 h-12 rounded"></div>
        <div className="bg-gray-200 h-12 rounded"></div>
        <div className="bg-gray-200 h-12 rounded"></div>
      </div>
      
      {/* Button */}
      <div className="bg-gray-200 h-10 w-full rounded"></div>
    </div>
  )
}

// Detail Page Skeleton
export function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="bg-gray-200 h-96 w-full rounded-lg"></div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-20 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          {/* Title */}
          <div className="bg-gray-200 h-8 w-3/4 rounded"></div>
          
          {/* Price */}
          <div className="bg-gray-200 h-12 w-1/3 rounded"></div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="bg-gray-200 h-4 w-full rounded"></div>
            <div className="bg-gray-200 h-4 w-5/6 rounded"></div>
            <div className="bg-gray-200 h-4 w-4/6 rounded"></div>
          </div>
          
          {/* Specifications */}
          <div className="space-y-3">
            <div className="bg-gray-200 h-6 w-1/4 rounded"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="bg-gray-200 h-4 w-1/3 rounded"></div>
                <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
              </div>
            ))}
          </div>
          
          {/* Actions */}
          <div className="flex space-x-4">
            <div className="bg-gray-200 h-12 flex-1 rounded"></div>
            <div className="bg-gray-200 h-12 flex-1 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 m-1 rounded"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, colIndex) => (
              <div key={colIndex} className="h-12 bg-gray-100 m-1 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Text Content Skeleton
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 h-4 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        ></div>
      ))}
    </div>
  )
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="bg-gray-200 h-4 w-24 rounded mb-2"></div>
              <div className="bg-gray-200 h-8 w-32 rounded"></div>
            </div>
            <div className="bg-gray-200 h-12 w-12 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Chart Skeleton
export function ChartSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="bg-gray-200 h-6 w-1/4 rounded mb-6"></div>
      <div className="bg-gray-200 h-64 w-full rounded"></div>
    </div>
  )
}
