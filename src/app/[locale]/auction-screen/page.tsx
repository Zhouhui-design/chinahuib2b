'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import type { LanguageCode } from '@/lib/languages'
import { dictionaries } from '@/locales/dictionary'
import { Clock, Zap, Trophy, Users, TrendingUp, AlertCircle } from 'lucide-react'

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

type Bid = {
  id: string
  bidderName: string
  amount: number
  createdAt: string
}

type AuctionDetail = {
  id: string
  title: string
  currentPrice: number
  startingPrice: number
  reservePrice: number
  currentWinner: string | null
  bids: Bid[]
  endTime: string
  status: string
  bidCount: number
}

export default function AuctionScreenPage() {
  const { data: session } = useSession() ?? { data: null }
  const [activeTab, setActiveTab] = useState<'selling' | 'buying'>('selling')
  const [listings, setListings] = useState<AuctionListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAuction, setSelectedAuction] = useState<AuctionDetail | null>(null)
  const [showBidModal, setShowBidModal] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [currentBid, setCurrentBid] = useState<AuctionDetail | null>(null)
  
  const sseRef = useRef<EventSource | null>(null)

  const params = useParams()
  const locale = (params.locale as LanguageCode) || 'en'
  const dict = dictionaries[locale] || dictionaries.en

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

  useEffect(() => {
    if (selectedAuction) {
      sseRef.current = new EventSource(`/api/auction/${selectedAuction.id}/stream`)
      
      sseRef.current.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          if (parsed.type === 'auction_update') {
            setCurrentBid(parsed.data)
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error)
        }
      }

      sseRef.current.onerror = (error) => {
        console.error('SSE error:', error)
        sseRef.current?.close()
      }
    }

    return () => {
      if (sseRef.current) {
        sseRef.current.close()
        sseRef.current = null
      }
    }
  }, [selectedAuction])

  const handleViewAuction = async (listingId: string) => {
    try {
      const res = await fetch(`/api/auction/${listingId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedAuction({
          id: data.id,
          title: data.title,
          currentPrice: data.currentPrice?.toNumber() || 0,
          startingPrice: data.startingPrice.toNumber(),
          reservePrice: data.reservePrice?.toNumber() || 0,
          currentWinner: data.currentWinner?.username || null,
          bids: [],
          endTime: data.endTime,
          status: data.status,
          bidCount: data.bidCount,
        })
        setShowBidModal(true)
      }
    } catch (error) {
      console.error('Error fetching auction:', error)
    }
  }

  const handlePlaceBid = async () => {
    if (!session || !selectedAuction || !bidAmount) return

    const amount = parseFloat(bidAmount)
    if (amount <= (currentBid?.currentPrice || selectedAuction.currentPrice)) {
      alert(dict.auctionScreen.bidMustBeHigher)
      return
    }

    try {
      const res = await fetch(`/api/auction/${selectedAuction.id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      if (res.ok) {
        setBidAmount('')
        alert(dict.auctionScreen.bidPlaced)
      } else {
        const error = await res.json()
        alert(error.error || dict.auctionScreen.failedToBid)
      }
    } catch (error) {
      console.error('Error placing bid:', error)
      alert(dict.auctionScreen.failedToBid)
    }
  }

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime)
    const now = new Date()
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return dict.auctionScreen.auctionEnded

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    }
    return `${minutes}m ${seconds}s`
  }

  const auctionData = currentBid || selectedAuction

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">🏪 {dict.auctionScreen.title}</h1>
              <p className="text-gray-400 text-sm">
                {dict.auctionScreen.subtitle}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/${locale}/chat-hall`}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                💬 {dict.auctionScreen.chatHall}
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!session}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 text-white rounded-lg font-bold transition"
              >
                ➕ {dict.auctionScreen.postListing}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white">
            <p className="text-green-200 text-sm">{dict.auctionScreen.selling}</p>
            <p className="text-2xl font-bold">{listings.filter(l => l.type === 'SELLING').length}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
            <p className="text-blue-200 text-sm">{dict.auctionScreen.buying}</p>
            <p className="text-2xl font-bold">{listings.filter(l => l.type === 'BUYING').length}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4 text-white">
            <p className="text-purple-200 text-sm">{dict.auctionScreen.totalViews}</p>
            <p className="text-2xl font-bold">{listings.reduce((sum, l) => sum + l.views, 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-4 text-white">
            <p className="text-orange-200 text-sm">{dict.auctionScreen.inquiries}</p>
            <p className="text-2xl font-bold">{listings.reduce((sum, l) => sum + l.inquiries, 0)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('selling')}
                className={`px-6 py-2 rounded-lg font-bold transition ${
                  activeTab === 'selling'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                📦 {dict.auctionScreen.selling}
              </button>
              <button
                onClick={() => setActiveTab('buying')}
                className={`px-6 py-2 rounded-lg font-bold transition ${
                  activeTab === 'buying'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🔍 {dict.auctionScreen.buying}
              </button>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={dict.auctionScreen.searchPlaceholder}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{dict.auctionScreen.allCategories}</option>
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
            <h3 className="text-xl font-bold text-white mb-2">{dict.auctionScreen.noListings}</h3>
            <p className="text-gray-400 mb-4">{dict.auctionScreen.beFirstToPost}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!session}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg font-bold transition"
            >
              {dict.auctionScreen.postFirstListing}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500 hover:shadow-lg transition cursor-pointer"
                onClick={() => handleViewAuction(listing.id)}
              >
                <div className="h-40 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative">
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
                      {listing.type === 'SELLING' ? dict.auctionScreen.selling : dict.auctionScreen.buying}
                    </span>
                  </div>
                  {listing.isVerified && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        ✓ {dict.auctionScreen.verified}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{listing.title}</h3>
                  {listing.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{listing.description}</p>
                  )}
                  
                  {listing.price && (
                    <p className="text-2xl font-bold text-green-400 mb-2">
                      {listing.currency} {listing.price.toLocaleString()}
                      {listing.minOrderQty && <span className="text-gray-500 text-sm ml-1">/ {listing.minOrderQty} {dict.auctionScreen.pcs}</span>}
                    </p>
                  )}

                  {listing.category && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-gray-500 text-xs">{dict.auctionScreen.category}:</span>
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
                      <span>👁️ {listing.views} {dict.auctionScreen.views}</span>
                      <span>💬 {listing.inquiries}</span>
                    </div>
                    <button 
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewAuction(listing.id)
                      }}
                    >
                      {dict.auctionScreen.bid}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bid Modal with Real-time Updates */}
      {showBidModal && auctionData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                {dict.auctionScreen.liveAuction}
              </h2>
              <button
                onClick={() => {
                  setShowBidModal(false)
                  setSelectedAuction(null)
                  setCurrentBid(null)
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{auctionData.title}</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">{dict.auctionScreen.currentBid}</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">
                      ${auctionData.currentPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">{dict.auctionScreen.startingBid}</p>
                    <p className="text-xl font-bold text-gray-300 mt-1">
                      ${auctionData.startingPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">{dict.auctionScreen.reserve}</p>
                    <p className="text-xl font-bold text-orange-400 mt-1">
                      ${auctionData.reservePrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">{dict.auctionScreen.bidCount}</p>
                    <p className="text-xl font-bold text-blue-400 mt-1">
                      {auctionData.bidCount}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-red-500" />
                  <span className="text-lg font-bold text-red-400">
                    {getTimeRemaining(auctionData.endTime)}
                  </span>
                </div>

                {auctionData.currentWinner && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-yellow-400">
                      {dict.auctionScreen.currentWinner}: {auctionData.currentWinner}
                    </span>
                  </div>
                )}
              </div>

              {/* Bidding Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  {dict.auctionScreen.placeYourBid}
                </h3>
                
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`${dict.auctionScreen.bidAmount} $${auctionData.currentPrice + 1}`}
                    min={auctionData.currentPrice + 1}
                    step="0.01"
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handlePlaceBid}
                    disabled={!session || !bidAmount}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 text-white rounded-lg font-bold transition"
                  >
                    {dict.auctionScreen.bid}
                  </button>
                </div>
              </div>

              {/* Live Bid History */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  {dict.auctionScreen.liveBids}
                </h3>
                
                {auctionData.bids && auctionData.bids.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {auctionData.bids.slice(0, 10).map((bid, index) => (
                      <div
                        key={bid.id}
                        className="flex items-center justify-between bg-gray-700 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-gray-300">{bid.bidderName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-green-400 font-bold">${bid.amount.toLocaleString()}</span>
                          <p className="text-gray-500 text-xs">{new Date(bid.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-700 rounded-lg">
                    <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">{dict.auctionScreen.noBidsYet}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateListingModal
          type={activeTab}
          onClose={() => setShowCreateModal(false)}
          onCreated={(listing) => {
            setListings(prev => [listing, ...prev])
            setShowCreateModal(false)
          }}
          dict={dict}
        />
      )}
    </div>
  )
}

function CreateListingModal({
  type,
  onClose,
  onCreated,
  dict,
}: {
  type: 'selling' | 'buying'
  onClose: () => void
  onCreated: (listing: AuctionListing) => void
  dict: typeof dictionaries.en
}) {
  const { data: session } = useSession() ?? { data: null }
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
        alert(`${dict.auctionScreen.listingCreated}${data.data.cost}`)
        onCreated(data.data.listing)
      } else {
        alert(dict.auctionScreen.failedToCreate)
      }
    } catch (error) {
      console.error('Error creating listing:', error)
      alert(dict.auctionScreen.failedToCreate)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {dict.auctionScreen.createListing}
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
            <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.titleLabel} *</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={`What are you ${type === 'selling' ? dict.auctionScreen.selling : dict.auctionScreen.buying}?`}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.descriptionLabel}</label>
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
              <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.category}</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{dict.auctionScreen.selectCategory}</option>
                {[
                  'Electronics', 'Textiles', 'Machinery', 'Chemicals',
                  'Furniture', 'Toys', 'Beauty', 'Sports', 'Automotive', 'Services',
                ].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.price} ({type === 'selling' ? dict.auctionScreen.asking : dict.auctionScreen.budget})</label>
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
            <h3 className="text-lg font-bold text-white mb-4">{dict.auctionScreen.contact}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.email}</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.whatsapp}</label>
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
              {dict.auctionScreen.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg font-bold transition"
            >
              {isSubmitting ? dict.auctionScreen.posting : dict.auctionScreen.postListingCost}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}