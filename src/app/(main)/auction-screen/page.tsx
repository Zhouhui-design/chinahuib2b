'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

type AuctionListing = {
  id: string
  type: 'SELLING' | 'BUYING'
  title: string
  description: string | null
  category: string | null
  tags: string[]
  price: number | null
  currency: string
  minOrderQty: number | null
  maxOrderQty: number | null
  images: string[]
  videos: string[]
  documents: string[]
  contactEmail: string | null
  contactPhone: string | null
  contactWeChat: string | null
  contactWhatsApp: string | null
  posterId: string
  poster: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    role: string
    isOnline: boolean
  }
  sellerId: string | null
  seller: {
    id: string
    companyName: string
    logoUrl: string | null
    isVerified: boolean
  } | null
  status: string
  views: number
  inquiries: number
  isVerified: boolean
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  digitalVoucherId: string | null
}

export default function AuctionScreenPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'selling' | 'buying'>('selling')
  const [listings, setListings] = useState<AuctionListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const categories = [
    'Electronics',
    'Textiles',
    'Machinery',
    'Chemicals',
    'Furniture',
    'Toys',
    'Beauty',
    'Sports',
    'Automotive',
    'Services',
  ]

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          type: activeTab.toUpperCase(),
          ...(search && { search }),
          ...(category && { category }),
        })

        const res = await fetch(`/api/auction?${params}`)
        if (res.ok) {
          const data = await res.json()
          setListings(data.data.listings)
        }
      } catch (error) {
        console.error('Error fetching listings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchListings()
  }, [activeTab, search, category])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">🏪 Global Auction Screen</h1>
              <p className="text-gray-400 text-sm">
                Buy & Sell with the World • Post for $0.10
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/chat-hall"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                💬 Chat Hall
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!session}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 text-white rounded-lg font-bold transition"
              >
                ➕ Post Listing
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white">
            <p className="text-green-200 text-sm">Selling</p>
            <p className="text-2xl font-bold">{listings.filter(l => l.type === 'SELLING').length}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
            <p className="text-blue-200 text-sm">Buying</p>
            <p className="text-2xl font-bold">{listings.filter(l => l.type === 'BUYING').length}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4 text-white">
            <p className="text-purple-200 text-sm">Total Views</p>
            <p className="text-2xl font-bold">{listings.reduce((sum, l) => sum + l.views, 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-4 text-white">
            <p className="text-orange-200 text-sm">Inquiries</p>
            <p className="text-2xl font-bold">{listings.reduce((sum, l) => sum + l.inquiries, 0)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('selling')}
                className={`px-6 py-2 rounded-lg font-bold transition ${
                  activeTab === 'selling'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                📦 Selling
              </button>
              <button
                onClick={() => setActiveTab('buying')}
                className={`px-6 py-2 rounded-lg font-bold transition ${
                  activeTab === 'buying'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🔍 Buying
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${activeTab} listings...`}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
            <p className="text-4xl mb-4">📭</p>
            <h3 className="text-xl font-bold text-white mb-2">No listings yet</h3>
            <p className="text-gray-400 mb-4">Be the first to post!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!session}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg font-bold transition"
            >
              Post First Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500 hover:shadow-lg transition"
              >
                {/* Image */}
                <div className="h-40 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  {listing.images.length > 0 ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      width={200}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">
                      {listing.type === 'SELLING' ? '📦' : '🔍'}
                    </span>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      listing.type === 'SELLING'
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {listing.type === 'SELLING' ? 'SELLING' : 'BUYING'}
                    </span>
                  </div>
                  {listing.isVerified && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        ✓ Verified
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{listing.title}</h3>
                  {listing.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{listing.description}</p>
                  )}
                  
                  {listing.price && (
                    <p className="text-2xl font-bold text-green-400 mb-2">
                      {listing.currency} {listing.price.toLocaleString()}
                      {listing.minOrderQty && <span className="text-gray-500 text-sm ml-1">/ {listing.minOrderQty} pcs</span>}
                    </p>
                  )}

                  {listing.category && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-gray-500 text-xs">Category:</span>
                      <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">{listing.category}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-700 pt-3 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {listing.poster.displayName?.charAt(0) || listing.poster.username.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {listing.poster.displayName || listing.poster.username}
                        </p>
                        {listing.seller && (
                          <p className="text-blue-400 text-xs truncate">
                            🏪 {listing.seller.companyName}
                          </p>
                        )}
                      </div>
                      {listing.poster.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                    <div className="flex gap-3 text-gray-500 text-xs">
                      <span>👁️ {listing.views}</span>
                      <span>💬 {listing.inquiries}</span>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition">
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateListingModal
          type={activeTab}
          onClose={() => setShowCreateModal(false)}
          onCreated={(listing) => {
            setListings(prev => [listing, ...prev])
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}

function CreateListingModal({
  type,
  onClose,
  onCreated,
}: {
  type: 'selling' | 'buying'
  onClose: () => void
  onCreated: (listing: AuctionListing) => void
}) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    currency: 'USD',
    minOrderQty: '',
    images: [] as string[],
    contactEmail: '',
    contactPhone: '',
    contactWhatsApp: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/auction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type.toUpperCase(),
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          minOrderQty: formData.minOrderQty ? parseInt(formData.minOrderQty) : null,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Listing created successfully! Cost: $${data.data.cost}`)
        onCreated(data.data.listing)
      } else {
        alert('Failed to create listing')
      }
    } catch (error) {
      console.error('Error creating listing:', error)
      alert('Failed to create listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Create {type === 'selling' ? 'Selling' : 'Buying'} Listing
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Title *</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={`What are you ${type === 'selling' ? 'selling' : 'looking to buy'}?`}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your product or requirements..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {[
                  'Electronics', 'Textiles', 'Machinery', 'Chemicals',
                  'Furniture', 'Toys', 'Beauty', 'Sports', 'Automotive', 'Services',
                ].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-medium">Price ({type === 'selling' ? 'Asking' : 'Budget'})</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-medium">WhatsApp</label>
                <input
                  type="text"
                  value={formData.contactWhatsApp}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactWhatsApp: e.target.value }))}
                  placeholder="+86 138..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg font-bold transition"
            >
              {isSubmitting ? 'Posting...' : 'Post Listing - $0.10'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
