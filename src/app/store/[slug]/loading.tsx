/**
 * Loading skeleton for the slug-based store page.
 */
export default function StoreLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner skeleton */}
      <div className="h-64 bg-gray-200 rounded-lg animate-pulse mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right column skeleton */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-12 w-full bg-gray-200 rounded animate-pulse mb-3" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
