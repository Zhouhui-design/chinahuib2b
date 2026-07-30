'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import type { LanguageCode } from '@/lib/languages'
import { dictionaries } from '@/locales/dictionary'
import { Clock, Zap, Trophy, Users, TrendingUp, AlertCircle, Upload, X, Image as ImageIcon, FileText, File, Check } from 'lucide-react'
import { useCallback } from 'react'

type Category = {
  id: string
  name: string
  level: number
  parentId: string | null
}

// Country list
const countries = [
  'China', 'United States', 'Germany', 'Japan', 'South Korea', 'Vietnam', 'India',
  'Brazil', 'Italy', 'France', 'United Kingdom', 'Canada', 'Australia', 'Mexico',
  'Indonesia', 'Thailand', 'Malaysia', 'Singapore', 'Hong Kong', 'Taiwan',
  'Turkey', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Spain', 'Portugal',
  'Netherlands', 'Belgium', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland',
  'Austria', 'Russia', 'Ukraine', 'Egypt', 'South Africa', 'Nigeria', 'Kenya',
  'Argentina', 'Chile', 'Colombia', 'Peru', 'Saudi Arabia', 'UAE', 'Israel',
  'Pakistan', 'Bangladesh', 'Philippines', 'Myanmar', 'Cambodia', 'Laos'
].sort()

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
  const [showFeeModal, setShowFeeModal] = useState(false)
  const [feeData, setFeeData] = useState<{
    enabled: boolean
    fee: {
      baseAmount: number
      feeRate: number
      calculatedFee: number
      finalFee: number
      minFee: number
      currency: string
    }
    paymentMethods: {
      id: string
      name: string
      icon: string
      qrCode?: string
      details?: string
    }[]
  } | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingListingData, setPendingListingData] = useState<any>(null)
  const [selectedListing, setSelectedListing] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [inquiryQty, setInquiryQty] = useState('')
  const [inquiryMessage, setInquiryMessage] = useState('')
  
  const sseRef = useRef<EventSource | null>(null)

  const params = useParams()
  const locale = (params.locale as LanguageCode) || 'en'
  const dict = dictionaries[locale] || dictionaries.en

  const [dynamicCategories, setDynamicCategories] = useState<{ id: string; name: string; slug: string }[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/categories?locale=${locale}`)
        if (res.ok) {
          const data = await res.json()
          if (data.categories && Array.isArray(data.categories)) {
            const level1Cats = data.categories.filter((c: any) => c.level === 1)
            setDynamicCategories(level1Cats.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })))
          }
        }
      } catch (e) {
        console.error('Failed to load categories', e)
      }
    }
    fetchCategories()
  }, [locale])

  const handleSubmitFee = async (listingData: any) => {
    setPendingListingData(listingData)
    try {
      const res = await fetch('/api/auction/calculate-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: listingData.price, currency: listingData.currency })
      })
      if (res.ok) {
        const data = await res.json()
        setFeeData(data)
        setShowFeeModal(true)
      } else {
        setFeeData({
          enabled: false,
          fee: { baseAmount: 0, feeRate: 0, calculatedFee: 0, finalFee: 0, minFee: 0, currency: listingData.currency },
          paymentMethods: []
        })
        setShowFeeModal(true)
      }
    } catch (error) {
      console.error('Error calculating fee:', error)
      setFeeData({
        enabled: false,
        fee: { baseAmount: 0, feeRate: 0, calculatedFee: 0, finalFee: 0, minFee: 0, currency: listingData.currency },
        paymentMethods: []
      })
      setShowFeeModal(true)
    }
  }

  const createListing = async (listingData: any) => {
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData)
      })
      if (res.ok) {
        const listing = await res.json()
        setListings(prev => [listing, ...prev])
        setShowFeeModal(false)
        setShowPaymentModal(false)
        setPendingListingData(null)
      }
    } catch (error) {
      console.error('Error creating listing:', error)
      alert('Failed to create listing')
    }
  }

  const categories = dynamicCategories.length > 0
    ? dynamicCategories.map(c => c.name)
    : [
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

  const normalizeListing = (raw: any) => {
    if (!raw) return null
    return {
      ...raw,
      images: Array.isArray(raw.images) ? raw.images : [],
      price: typeof raw.price?.toNumber === 'function' ? raw.price.toNumber() : (raw.price ?? 0),
      startingBid: typeof raw.startingBid?.toNumber === 'function' ? raw.startingBid.toNumber() : (raw.startingBid ?? 0),
      currentBid: typeof raw.currentBid?.toNumber === 'function' ? raw.currentBid.toNumber() : (raw.currentBid ?? 0),
      bidIncrement: typeof raw.bidIncrement?.toNumber === 'function' ? raw.bidIncrement.toNumber() : (raw.bidIncrement ?? 0),
      cost: typeof raw.cost?.toNumber === 'function' ? raw.cost.toNumber() : (raw.cost ?? 0),
      verificationFee: typeof raw.verificationFee?.toNumber === 'function' ? raw.verificationFee.toNumber() : (raw.verificationFee ?? 0),
      minOrderQty: typeof raw.minOrderQty === 'number' ? raw.minOrderQty : (raw.minOrderQty ?? undefined),
      maxOrderQty: typeof raw.maxOrderQty === 'number' ? raw.maxOrderQty : (raw.maxOrderQty ?? undefined),
      isVerified: raw.verificationStatus === 'VERIFIED',
      poster: raw.poster ? {
        ...raw.poster,
        displayName: raw.poster.displayName || raw.poster.username || 'Anonymous',
      } : { displayName: 'Anonymous', username: 'anonymous' },
      seller: raw.seller || null,
    }
  }

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
          const rawListings = Array.isArray(data) ? data : data.data?.listings || data.data || []
          const normalized = rawListings.map(normalizeListing).filter(Boolean)
          setListings(normalized)
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
        const normalized = normalizeListing(data)
        setSelectedListing(normalized)
        setShowDetailModal(true)
      } else {
        const errData = await res.json().catch(() => ({}))
        alert(errData.error || 'Failed to load listing details')
      }
    } catch (error) {
      console.error('Error fetching auction:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleSubmitInquiry = async () => {
    if (!session) {
      alert('Please login first')
      return
    }
    if (!selectedListing) return

    try {
      const res = await fetch('/api/buyer/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: selectedListing.id,
          quantity: parseFloat(inquiryQty) || 1,
          message: inquiryMessage,
        }),
      })

      if (res.ok) {
        alert('Inquiry sent successfully! The seller will be notified.')
        setInquiryQty('')
        setInquiryMessage('')
        setShowDetailModal(false)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to send inquiry')
      }
    } catch (error) {
      console.error('Error sending inquiry:', error)
      alert('Failed to send inquiry')
    }
  }

  const handleContactSeller = () => {
    if (!selectedListing?.seller) return
    const message = encodeURIComponent(`Hello, I'm interested in your listing: ${selectedListing.title}`)
    window.open(`https://wa.me/${selectedListing.seller.whatsapp || selectedListing.contactWhatsApp || ''}?text=${message}`, '_blank')
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
                  
                  {listing.price != null && listing.price > 0 && (
                    <p className="text-2xl font-bold text-green-400 mb-2">
                      {listing.currency} {Number(listing.price).toLocaleString()}
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
                        {(listing.poster?.displayName || listing.poster?.username || '?').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {listing.poster?.displayName || listing.poster?.username || 'Anonymous'}
                        </p>
                        {listing.seller && (
                          <p className="text-blue-400 text-xs truncate">
                            🏪 {listing.seller.companyName}
                          </p>
                        )}
                      </div>
                      {listing.poster?.isOnline && (
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

      {/* Product Detail Modal with Buy/Order Button */}
      {showDetailModal && selectedListing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
              <h2 className="text-lg font-bold text-white">
                {selectedListing.type === 'SELLING' ? '📦 Product Details' : '🔍 Buying Request'}
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedListing(null)
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4">
              {selectedListing.images && selectedListing.images.length > 0 && (
                <div className="mb-4">
                  <div className="relative w-full h-64 bg-gray-700 rounded-xl overflow-hidden">
                    <Image
                      src={selectedListing.images[0]}
                      alt={selectedListing.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  {selectedListing.images.length > 1 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto">
                      {selectedListing.images.slice(0, 8).map((img: string, idx: number) => (
                        <div key={idx} className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={img} alt="" width={64} height={64} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mb-4">
                <h1 className="text-2xl font-bold text-white mb-2">{selectedListing.title}</h1>
                <div className="flex items-center gap-3 mb-2">
                  {selectedListing.isVerified && (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ✓ Verified
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedListing.type === 'SELLING'
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {selectedListing.type === 'SELLING' ? 'For Sale' : 'Buying'}
                  </span>
                </div>

                {selectedListing.type === 'SELLING' && selectedListing.price != null && selectedListing.price > 0 && (
                  <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-600/30 rounded-xl p-4 mb-4">
                    <p className="text-3xl font-bold text-green-400">
                      {selectedListing.currency} {Number(selectedListing.price).toLocaleString()}
                    </p>
                    {selectedListing.minOrderQty && (
                      <p className="text-gray-400 text-sm mt-1">
                        MOQ: {selectedListing.minOrderQty} {selectedListing.unitId || 'pcs'}
                        {selectedListing.maxOrderQty && ` - ${selectedListing.maxOrderQty} ${selectedListing.unitId || 'pcs'}`}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {selectedListing.description && (
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white mb-2">📝 Description</h3>
                  <div className="bg-gray-700 rounded-lg p-4 text-gray-300 whitespace-pre-wrap">
                    {selectedListing.description}
                  </div>
                </div>
              )}

              {(selectedListing.techSpecs || selectedListing.productFeatures || selectedListing.applicationScope) && (
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedListing.techSpecs && (
                    <div>
                      <h3 className="text-sm font-bold text-white mb-2">⚙️ Tech Specs</h3>
                      <div className="bg-gray-700 rounded-lg p-3 text-gray-300 text-sm whitespace-pre-wrap">
                        {selectedListing.techSpecs}
                      </div>
                    </div>
                  )}
                  {selectedListing.productFeatures && (
                    <div>
                      <h3 className="text-sm font-bold text-white mb-2">✨ Features</h3>
                      <div className="bg-gray-700 rounded-lg p-3 text-gray-300 text-sm whitespace-pre-wrap">
                        {selectedListing.productFeatures}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(selectedListing.seller || selectedListing.poster) && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white mb-2">🏪 Seller Information</h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    {selectedListing.seller ? (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {selectedListing.seller.companyName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-white font-bold">{selectedListing.seller.companyName}</p>
                          <p className="text-gray-400 text-sm">
                            {selectedListing.seller.country && `${selectedListing.seller.country}`}
                            {selectedListing.seller.city && `, ${selectedListing.seller.city}`}
                          </p>
                          {selectedListing.seller.isVerified && (
                            <span className="text-yellow-400 text-xs">✓ Verified Seller</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {selectedListing.poster?.displayName?.charAt(0) || selectedListing.poster?.username?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-bold">{selectedListing.poster?.displayName || selectedListing.poster?.username}</p>
                          {selectedListing.poster?.isOnline && (
                            <span className="text-green-400 text-xs">● Online</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedListing.contactEmail || selectedListing.contactPhone || selectedListing.contactWeChat || selectedListing.contactWhatsApp) && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white mb-2">📞 Contact</h3>
                  <div className="bg-gray-700 rounded-lg p-3 space-y-2">
                    {selectedListing.contactEmail && (
                      <p className="text-gray-300 text-sm">📧 {selectedListing.contactEmail}</p>
                    )}
                    {selectedListing.contactPhone && (
                      <p className="text-gray-300 text-sm">📱 {selectedListing.contactPhone}</p>
                    )}
                    {selectedListing.contactWeChat && (
                      <p className="text-gray-300 text-sm">💬 WeChat: {selectedListing.contactWeChat}</p>
                    )}
                    {selectedListing.contactWhatsApp && (
                      <p className="text-gray-300 text-sm">💬 WhatsApp: {selectedListing.contactWhatsApp}</p>
                    )}
                  </div>
                </div>
              )}

              {(selectedListing.shippingCountry || selectedListing.detailedAddress) && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white mb-2">🚚 Shipping Info</h3>
                  <div className="bg-gray-700 rounded-lg p-3 space-y-1">
                    {selectedListing.shippingCountry && (
                      <p className="text-gray-300 text-sm">🌍 From: {selectedListing.shippingCountry}</p>
                    )}
                    {selectedListing.detailedAddress && (
                      <p className="text-gray-300 text-sm truncate">📍 {selectedListing.detailedAddress}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-4 border-t border-gray-700 pt-4">
                <h3 className="text-lg font-bold text-white mb-3">🛒 Take Action</h3>
                
                {!session ? (
                  <div className="bg-yellow-600/20 border border-yellow-600/40 rounded-lg p-4 mb-3">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ Please <Link href={`/${locale}/login`} className="underline font-bold">login</Link> to contact the seller or place an order.
                    </p>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3 mb-3">
                  {selectedListing.contactWhatsApp && (
                    <button
                      onClick={() => {
                        const msg = encodeURIComponent(`Hello, I'm interested in your product: ${selectedListing.title}`)
                        window.open(`https://wa.me/${selectedListing.contactWhatsApp}?text=${msg}`, '_blank')
                      }}
                      className="px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
                    >
                      💬 WhatsApp
                    </button>
                  )}
                  {selectedListing.contactEmail && (
                    <button
                      onClick={() => {
                        window.location.href = `mailto:${selectedListing.contactEmail}?subject=Interested in your product: ${selectedListing.title}`
                      }}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
                    >
                      📧 Email
                    </button>
                  )}
                  {selectedListing.contactPhone && (
                    <button
                      onClick={() => {
                        window.location.href = `tel:${selectedListing.contactPhone}`
                      }}
                      className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
                    >
                      📞 Call
                    </button>
                  )}
                </div>

                {session && selectedListing.type === 'SELLING' && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-bold mb-3">📝 Send Inquiry / Place Order</h4>
                    
                    <div className="mb-3">
                      <label className="text-gray-400 text-sm block mb-1">Quantity</label>
                      <input
                        type="number"
                        value={inquiryQty}
                        onChange={(e) => setInquiryQty(e.target.value)}
                        placeholder={String(selectedListing.minOrderQty || 1)}
                        min={1}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="text-gray-400 text-sm block mb-1">Message to Seller</label>
                      <textarea
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Tell the seller what you need..."
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSubmitInquiry}
                      className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white rounded-lg font-bold transition text-lg"
                    >
                      🛒 Send Inquiry / Place Order
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-gray-500 text-xs pt-3 border-t border-gray-700">
                <span>👁️ {selectedListing.views || 0} views</span>
                <span>💬 {selectedListing.inquiries || 0} inquiries</span>
                <span>📅 Posted: {new Date(selectedListing.createdAt).toLocaleDateString(locale)}</span>
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
          onSubmitFee={handleSubmitFee}
          dict={dict}
          locale={locale}
        />
      )}

      {/* Service Fee Confirmation Modal */}
      {showFeeModal && feeData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                💰 {dict.auctionScreen.feeTitle}
              </h2>
              <button
                onClick={() => setShowFeeModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {feeData.enabled ? (
                <>
                  <div className="bg-gray-700 rounded-lg p-4 mb-6">
                    <p className="text-gray-300 text-sm mb-2">{dict.auctionScreen.goodsAmount}</p>
                    <p className="text-2xl font-bold text-white">{pendingListingData?.currency} {feeData.fee.baseAmount.toFixed(2)}</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{dict.auctionScreen.serviceFeeRate}</span>
                      <span className="text-white">{(feeData.fee.feeRate * 100).toFixed(4)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{dict.auctionScreen.calculatedFee}</span>
                      <span className="text-white">{pendingListingData?.currency} {feeData.fee.calculatedFee.toFixed(4)}</span>
                    </div>
                    {feeData.fee.calculatedFee < feeData.fee.minFee && (
                      <div className="flex justify-between text-sm text-yellow-400">
                        <span>⚠️ {dict.auctionScreen.minFeeStandard}</span>
                        <span>{pendingListingData?.currency} {feeData.fee.minFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-600 pt-3 flex justify-between text-lg font-bold">
                      <span className="text-white">{dict.auctionScreen.totalFee}</span>
                      <span className="text-green-400">{pendingListingData?.currency} {feeData.fee.finalFee.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-6">
                    {dict.auctionScreen.feeDescription}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowFeeModal(false)}
                      className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition"
                    >
                      {dict.auctionScreen.cancel}
                    </button>
                    <button
                      onClick={() => {
                        setShowFeeModal(false)
                        setShowPaymentModal(true)
                      }}
                      className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition"
                    >
                      {dict.auctionScreen.confirmPayment}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center py-8">
                    <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-lg text-white mb-2">{dict.auctionScreen.feeExempted}</p>
                    <p className="text-gray-400">{dict.auctionScreen.noFeeRequired}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowFeeModal(false)}
                      className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition"
                    >
                      {dict.auctionScreen.cancel}
                    </button>
                    <button
                      onClick={() => {
                        if (pendingListingData) {
                          createListing(pendingListingData)
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition"
                    >
                      {dict.auctionScreen.postListing}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && feeData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                💳 {dict.auctionScreen.choosePaymentMethod}
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-700 rounded-lg p-4 mb-6 text-center">
                <p className="text-gray-400 text-sm">{dict.auctionScreen.amountDue}</p>
                <p className="text-3xl font-bold text-green-400">{pendingListingData?.currency} {feeData.fee.finalFee.toFixed(2)}</p>
              </div>

              {feeData.paymentMethods.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {feeData.paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{method.icon}</span>
                        <div className="flex-1">
                          <p className="text-white font-bold">{method.name}</p>
                          {method.details && (
                            <p className="text-gray-400 text-sm whitespace-pre-line">{method.details}</p>
                          )}
                        </div>
                      </div>
                      {method.qrCode && (
                        <div className="mt-4 flex justify-center">
                          <img
                            src={method.qrCode}
                            alt={`${method.name} QR Code`}
                            className="w-48 h-48 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-6">
                  <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">{dict.auctionScreen.noPaymentMethods}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setShowFeeModal(true)
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition"
                >
                  {dict.auctionScreen.back}
                </button>
                <button
                  onClick={() => {
                    if (pendingListingData) {
                      createListing(pendingListingData)
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition"
                >
                  {dict.auctionScreen.payAndPublish}
                </button>
              </div>

              <p className="text-gray-500 text-xs text-center mt-4">
                {dict.auctionScreen.contactAfterPayment}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CreateListingModal({
  type,
  onClose,
  onCreated,
  onSubmitFee,
  dict,
  locale,
}: {
  type: 'selling' | 'buying'
  onClose: () => void
  onCreated: (listing: AuctionListing) => void
  onSubmitFee: (listingData: any) => void
  dict: typeof dictionaries.en
  locale: LanguageCode
}) {
  const { data: session } = useSession() ?? { data: null }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [units, setUnits] = useState<any[]>([])
  const [loadingUnits, setLoadingUnits] = useState(true)
  
  // Category cascade selection
  const [selectedLevel1, setSelectedLevel1] = useState('')
  const [selectedLevel2, setSelectedLevel2] = useState('')
  const [selectedLevel3, setSelectedLevel3] = useState('')
  const [selectedLevel4, setSelectedLevel4] = useState('')
  const [selectedLevel5, setSelectedLevel5] = useState('')
  
  const [formData, setFormData] = useState({
    // Basic info
    productName: '',  // 商品名称（必填）
    productDescription: '',  // 商品描述（选填）
    techSpecs: '',  // 技术参数（选填）
    productFeatures: '',  // 产品特点（选填）
    applicationScope: '',  // 适用范围（选填）
    usageMethod: '',  // 使用方法（选填）
    keywords: '',  // 关键词，最多50个，用逗号分隔
    
    // Location & Shipping
    shippingCountry: '',  // 发货国家（必填）
    detailedAddress: '',  // 货物所在详细地址（必填）
    
    // Pricing
    currency: 'USD',  // 交易货币
    unitId: '',  // 计量单位
    pickupPrice: '',  // 自提价格（选填）
    stockQuantity: '0',  // 实时库存
    isFob: 'NO',  // 是否可FOB：YES, NEGOTIATE, NO
    isCif: 'NO',  // 是否可CIF：YES, NEGOTIATE, NO
    minOrderQty: '1',  // 最小起订量，默认1
    
    // Verification
    verificationStatus: 'NOT_APPLIED',  // 平台审核状态
    
    // Contact
    contactEmail: '',
    contactPhone: '',
    contactWhatsApp: '',
    
    // Foreign Trade / Export
    hsCode: '',
    hsCodeDescription: '',
    paymentMethods: [] as string[],
    freightItems: [] as string[],
    exportDocuments: [] as string[],
    hasExportLicense: false,
    exportLicenseNo: '',
    incoterms: [] as string[],
    portOfLoading: '',
    portOfDestination: '',
    
    // Files
    images: [] as string[],
    files: [] as string[],
    drawings: [] as string[],
  })

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/categories?locale=${locale}`)
        if (res.ok) {
          const data = await res.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [locale])

  // Fetch units on mount
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch('/api/units')
        if (res.ok) {
          const data = await res.json()
          setUnits(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching units:', error)
      } finally {
        setLoadingUnits(false)
      }
    }
    fetchUnits()
  }, [])

  // Get filtered categories by level
  const level1Categories = categories.filter(c => c.level === 1)
  const level2Categories = selectedLevel1 
    ? categories.filter(c => c.level === 2 && c.parentId === selectedLevel1)
    : []
  const level3Categories = selectedLevel2 
    ? categories.filter(c => c.level === 3 && c.parentId === selectedLevel2)
    : []
  const level4Categories = selectedLevel3 
    ? categories.filter(c => c.level === 4 && c.parentId === selectedLevel3)
    : []
  const level5Categories = selectedLevel4 
    ? categories.filter(c => c.level === 5 && c.parentId === selectedLevel4)
    : []

  // Handle category change
  const handleLevel1Change = (id: string) => {
    setSelectedLevel1(id)
    setSelectedLevel2('')
    setSelectedLevel3('')
    setSelectedLevel4('')
    setSelectedLevel5('')
  }

  const handleLevel2Change = (id: string) => {
    setSelectedLevel2(id)
    setSelectedLevel3('')
    setSelectedLevel4('')
    setSelectedLevel5('')
  }

  const handleLevel3Change = (id: string) => {
    setSelectedLevel3(id)
    setSelectedLevel4('')
    setSelectedLevel5('')
  }

  const handleLevel4Change = (id: string) => {
    setSelectedLevel4(id)
    setSelectedLevel5('')
  }

  // File upload handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !session) return

    const uploadedUrls: string[] = []
    for (const file of Array.from(files)) {
      try {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        formDataUpload.append('type', 'product_image')

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        })
        const data = await res.json()
        if (data.success) {
          uploadedUrls.push(data.url)
        }
      } catch (error) {
        console.error('Upload error:', error)
      }
    }

    if (uploadedUrls.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }))
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !session) return

    const uploadedUrls: string[] = []
    for (const file of Array.from(files)) {
      try {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        formDataUpload.append('type', 'brochure')

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        })
        const data = await res.json()
        if (data.success) {
          uploadedUrls.push(data.url)
        }
      } catch (error) {
        console.error('Upload error:', error)
      }
    }

    if (uploadedUrls.length > 0) {
      setFormData(prev => ({ ...prev, files: [...prev.files, ...uploadedUrls] }))
    }
  }

  const handleDrawingUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !session) return

    const uploadedUrls: string[] = []
    for (const file of Array.from(files)) {
      try {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        formDataUpload.append('type', 'brochure')

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        })
        const data = await res.json()
        if (data.success) {
          uploadedUrls.push(data.url)
        }
      } catch (error) {
        console.error('Upload error:', error)
      }
    }

    if (uploadedUrls.length > 0) {
      setFormData(prev => ({ ...prev, drawings: [...prev.drawings, ...uploadedUrls] }))
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  const removeDrawing = (index: number) => {
    setFormData(prev => ({
      ...prev,
      drawings: prev.drawings.filter((_, i) => i !== index)
    }))
  }

  // Validation
  const validateForm = () => {
    if (!formData.productName.trim()) {
      alert(dict.auctionScreen.productNamePlaceholder)
      return false
    }
    if (!formData.shippingCountry) {
      alert(dict.auctionScreen.selectCountry)
      return false
    }
    if (!formData.detailedAddress.trim()) {
      alert(dict.auctionScreen.detailedAddressPlaceholder)
      return false
    }
    if (!formData.unitId) {
      alert(dict.auctionScreen.selectUnit)
      return false
    }
    if (!formData.pickupPrice) {
      alert(dict.auctionScreen.pickupPrice)
      return false
    }
    if (type === 'selling' && !formData.hsCode.trim()) {
      alert(dict.auctionScreen.hsCodeRequired)
      return false
    }
    return true
  }

  const handleApplyVerification = async () => {
    if (!session) return
    
    if (!formData.productName.trim()) {
      alert(dict.auctionScreen.productNamePlaceholder)
      return
    }
    
    if (!formData.shippingCountry) {
      alert(dict.auctionScreen.selectCountry)
      return
    }
    
    if (!formData.detailedAddress.trim()) {
      alert(dict.auctionScreen.detailedAddressPlaceholder)
      return
    }

    if (!formData.unitId) {
      alert(dict.auctionScreen.selectUnit)
      return
    }

    if (!formData.pickupPrice) {
      alert(dict.auctionScreen.pickupPrice)
      return
    }

    if (type === 'selling' && !formData.hsCode.trim()) {
      alert(dict.auctionScreen.hsCode)
      return
    }

    setIsSubmitting(true)
    
    try {
      const price = parseFloat(formData.pickupPrice) || 0
      
      const keywords = formData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k)
        .slice(0, 50)

      const listingData = {
        type: type.toUpperCase(),
        title: formData.productName,
        description: formData.productDescription,
        category: selectedLevel5 || selectedLevel4 || selectedLevel3 || selectedLevel2 || selectedLevel1,
        techSpecs: formData.techSpecs,
        productFeatures: formData.productFeatures,
        applicationScope: formData.applicationScope,
        usageMethod: formData.usageMethod,
        keywords: keywords,
        shippingCountry: formData.shippingCountry,
        detailedAddress: formData.detailedAddress,
        currency: formData.currency,
        unitId: formData.unitId,
        price: price,
        isFob: formData.isFob,
        isCif: formData.isCif,
        minOrderQty: parseInt(formData.minOrderQty) || 1,
        verificationStatus: 'PENDING',
        images: formData.images,
        files: formData.files,
        drawings: formData.drawings,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        contactWhatsApp: formData.contactWhatsApp,
        hsCode: formData.hsCode,
        hsCodeDescription: formData.hsCodeDescription,
        paymentMethods: formData.paymentMethods,
        freightItems: formData.freightItems,
        exportDocuments: formData.exportDocuments,
        hasExportLicense: formData.hasExportLicense,
        exportLicenseNo: formData.exportLicenseNo,
        incoterms: formData.incoterms,
        portOfLoading: formData.portOfLoading,
        portOfDestination: formData.portOfDestination,
      }

      const res = await fetch('/api/auction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      })
      
      if (res.ok) {
        setIsSubmitting(false)
        alert(dict.auctionScreen.listingCreated)
        onClose()
      } else {
        const data = await res.json()
        alert(data.message || data.error || dict.common.error)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Apply verification error:', error)
      alert(dict.common.error)
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    if (!validateForm()) return

    const price = parseFloat(formData.pickupPrice) || 0

    const listingData = {
      type: type.toUpperCase(),
      title: formData.productName,
      description: formData.productDescription,
      category: selectedLevel5 || selectedLevel4 || selectedLevel3 || selectedLevel2 || selectedLevel1,
      techSpecs: formData.techSpecs,
      productFeatures: formData.productFeatures,
      applicationScope: formData.applicationScope,
      usageMethod: formData.usageMethod,
      shippingCountry: formData.shippingCountry,
      detailedAddress: formData.detailedAddress,
      currency: formData.currency,
      unitId: formData.unitId,
      price: price,
      isFob: formData.isFob,
      isCif: formData.isCif,
      minOrderQty: parseInt(formData.minOrderQty) || 1,
      stockQuantity: parseFloat(formData.stockQuantity) || 0,
      verificationStatus: formData.verificationStatus,
      images: formData.images,
      files: formData.files,
      drawings: formData.drawings,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      contactWhatsApp: formData.contactWhatsApp,
      hsCode: formData.hsCode,
      hsCodeDescription: formData.hsCodeDescription,
      paymentMethods: formData.paymentMethods,
      freightItems: formData.freightItems,
      exportDocuments: formData.exportDocuments,
      hasExportLicense: formData.hasExportLicense,
      exportLicenseNo: formData.exportLicenseNo,
      incoterms: formData.incoterms,
      portOfLoading: formData.portOfLoading,
      portOfDestination: formData.portOfDestination,
    }

    onSubmitFee(listingData)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Selection - Five Level Cascade */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.selectLevelCategory} *</label>
            {loadingCategories ? (
              <div className="text-gray-400">{dict.common.loading}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <select
                    value={selectedLevel1}
                    onChange={(e) => handleLevel1Change(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{dict.auctionScreen.level1Category}</option>
                    {level1Categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedLevel2}
                    onChange={(e) => handleLevel2Change(e.target.value)}
                    disabled={!selectedLevel1}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">{dict.auctionScreen.level2Category}</option>
                    {level2Categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedLevel3}
                    onChange={(e) => handleLevel3Change(e.target.value)}
                    disabled={!selectedLevel2}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">{dict.auctionScreen.level3Category}</option>
                    {level3Categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedLevel4}
                    onChange={(e) => handleLevel4Change(e.target.value)}
                    disabled={!selectedLevel3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">{dict.auctionScreen.level4Category}</option>
                    {level4Categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedLevel5}
                    onChange={(e) => setSelectedLevel5(e.target.value)}
                    disabled={!selectedLevel4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">{dict.auctionScreen.level5Category}</option>
                    {level5Categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.productName} *</label>
            <input
              required
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
              placeholder={dict.auctionScreen.productNamePlaceholder}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Product Description */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.productDescription}</label>
            <textarea
              value={formData.productDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, productDescription: e.target.value }))}
              placeholder={dict.auctionScreen.productDescriptionPlaceholder}
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tech Specs */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.techSpecs}</label>
            <textarea
              value={formData.techSpecs}
              onChange={(e) => setFormData(prev => ({ ...prev, techSpecs: e.target.value }))}
              placeholder={dict.auctionScreen.techSpecsPlaceholder}
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.keywords}</label>
            <textarea
              value={formData.keywords}
              onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
              placeholder={dict.auctionScreen.keywordsPlaceholder}
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-400 text-sm mt-1">
              {formData.keywords.split(',').filter(k => k.trim()).length} {dict.auctionScreen.keywordCount}
              {formData.keywords.split(',').filter(k => k.trim()).length > 50 && (
                <span className="text-red-400">{dict.auctionScreen.keywordLimitExceeded}</span>
              )}
            </p>
          </div>

          {/* Location Info - Required */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.shippingCountry} *</label>
            <select
              required
              value={formData.shippingCountry}
              onChange={(e) => setFormData(prev => ({ ...prev, shippingCountry: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{dict.auctionScreen.selectCountry}</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.detailedAddress} *</label>
            <input
              required
              type="text"
              value={formData.detailedAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, detailedAddress: e.target.value }))}
              placeholder={dict.auctionScreen.detailedAddressPlaceholder}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">{dict.auctionScreen.priceInfo}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.currency} *</label>
                <select
                  required
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CNY">离岸人民币 (CNY)</option>
                  <option value="USD">美元 (USD)</option>
                  <option value="EUR">欧元 (EUR)</option>
                  <option value="JPY">日元 (JPY)</option>
                  <option value="KRW">韩元 (KRW)</option>
                  <option value="GBP">英镑 (GBP)</option>
                  <option value="AUD">澳元 (AUD)</option>
                  <option value="CAD">加元 (CAD)</option>
                  <option value="SGD">新加坡元 (SGD)</option>
                  <option value="HKD">港币 (HKD)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.unit} *</label>
                <select
                  required
                  value={formData.unitId}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitId: e.target.value }))}
                  disabled={loadingUnits}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">{dict.auctionScreen.selectUnit}</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol || unit.nameEn})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.pickupPrice} *</label>
                <input
                  required
                  type="number"
                  value={formData.pickupPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickupPrice: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* FOB & CIF Options */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.fobAvailable}</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isFob"
                      value="YES"
                      checked={formData.isFob === 'YES'}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFob: e.target.value }))}
                      className="text-blue-500"
                    />
                    <span className="text-gray-300">{dict.auctionScreen.yes}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isFob"
                      value="NEGOTIATE"
                      checked={formData.isFob === 'NEGOTIATE'}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFob: e.target.value }))}
                      className="text-blue-500"
                    />
                    <span className="text-gray-300">{dict.auctionScreen.negotiate}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isFob"
                      value="NO"
                      checked={formData.isFob === 'NO'}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFob: e.target.value }))}
                      className="text-blue-500"
                    />
                    <span className="text-gray-300">{dict.auctionScreen.no}</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.cifAvailable}</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isCif"
                      value="YES"
                      checked={formData.isCif === 'YES'}
                      onChange={(e) => setFormData(prev => ({ ...prev, isCif: e.target.value }))}
                      className="text-blue-500"
                    />
                    <span className="text-gray-300">{dict.auctionScreen.yes}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isCif"
                      value="NEGOTIATE"
                      checked={formData.isCif === 'NEGOTIATE'}
                      onChange={(e) => setFormData(prev => ({ ...prev, isCif: e.target.value }))}
                      className="text-blue-500"
                    />
                    <span className="text-gray-300">{dict.auctionScreen.negotiate}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isCif"
                      value="NO"
                      checked={formData.isCif === 'NO'}
                      onChange={(e) => setFormData(prev => ({ ...prev, isCif: e.target.value }))}
                      className="text-blue-500"
                    />
                    <span className="text-gray-300">{dict.auctionScreen.no}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Min Order Qty */}
            <div className="mt-4">
              <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.minOrderQty}</label>
              <input
                type="number"
                value={formData.minOrderQty}
                onChange={(e) => setFormData(prev => ({ ...prev, minOrderQty: e.target.value }))}
                placeholder="1"
                min="1"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          {/* Foreign Trade Fields */}
          {type === 'selling' && (
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h3 className="text-lg font-bold text-white mb-3">🌍 {dict.auctionScreen.foreignTradeInfo}</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.hsCode} *</label>
                  <input
                    type="text"
                    value={formData.hsCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, hsCode: e.target.value }))}
                    placeholder={dict.auctionScreen.hsCodePlaceholder}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.hsCodeDescription}</label>
                  <input
                    type="text"
                    value={formData.hsCodeDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, hsCodeDescription: e.target.value }))}
                    placeholder={dict.auctionScreen.hsCodeDescriptionPlaceholder}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.incotermsLabel}</label>
                <div className="flex flex-wrap gap-2">
                  {['EXW', 'FCA', 'FOB', 'CIF', 'CFR', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'].map((term) => (
                    <label key={term} className={`px-3 py-1 rounded-full cursor-pointer text-sm ${formData.incoterms.includes(term) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.incoterms.includes(term)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, incoterms: [...prev.incoterms, term] }))
                          } else {
                            setFormData(prev => ({ ...prev, incoterms: prev.incoterms.filter(t => t !== term) }))
                          }
                        }}
                      />
                      {term}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.selectPortOfLoading}</label>
                  <input
                    type="text"
                    value={formData.portOfLoading}
                    onChange={(e) => setFormData(prev => ({ ...prev, portOfLoading: e.target.value }))}
                    placeholder={dict.auctionScreen.selectPortOfLoading}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.selectPortOfDestination}</label>
                  <input
                    type="text"
                    value={formData.portOfDestination}
                    onChange={(e) => setFormData(prev => ({ ...prev, portOfDestination: e.target.value }))}
                    placeholder={dict.auctionScreen.selectPortOfDestination}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.paymentMethodsLabel}</label>
                <div className="flex flex-wrap gap-2">
                  {['T/T', 'L/C', 'D/P', 'D/A', 'O/A', 'Western Union', 'PayPal', 'Cash'].map((method) => (
                    <label key={method} className={`px-3 py-1 rounded-full cursor-pointer text-sm ${formData.paymentMethods.includes(method) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.paymentMethods.includes(method)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, paymentMethods: [...prev.paymentMethods, method] }))
                          } else {
                            setFormData(prev => ({ ...prev, paymentMethods: prev.paymentMethods.filter(m => m !== method) }))
                          }
                        }}
                      />
                      {method}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.freightItemsLabel}</label>
                <div className="flex flex-wrap gap-2">
                  {['Sea Freight', 'Air Freight', 'Rail Freight', 'Road Freight', 'Insurance', 'Packaging', 'Documentation'].map((item) => (
                    <label key={item} className={`px-3 py-1 rounded-full cursor-pointer text-sm ${formData.freightItems.includes(item) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.freightItems.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, freightItems: [...prev.freightItems, item] }))
                          } else {
                            setFormData(prev => ({ ...prev, freightItems: prev.freightItems.filter(i => i !== item) }))
                          }
                        }}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.exportDocumentsLabel}</label>
                <div className="flex flex-wrap gap-2">
                  {['Commercial Invoice', 'Packing List', 'Bill of Lading', 'Certificate of Origin', 'CO Form A', 'CO Form B', 'Insurance Policy', 'Quality Certificate'].map((doc) => (
                    <label key={doc} className={`px-3 py-1 rounded-full cursor-pointer text-sm ${formData.exportDocuments.includes(doc) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.exportDocuments.includes(doc)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, exportDocuments: [...prev.exportDocuments, doc] }))
                          } else {
                            setFormData(prev => ({ ...prev, exportDocuments: prev.exportDocuments.filter(d => d !== doc) }))
                          }
                        }}
                      />
                      {doc}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-4 mb-2">
                  <label className="block text-gray-300 font-medium">{dict.auctionScreen.hasExportLicense}</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasExportLicense"
                        checked={formData.hasExportLicense}
                        onChange={() => setFormData(prev => ({ ...prev, hasExportLicense: true }))}
                        className="text-blue-500"
                      />
                      <span className="text-gray-300">{dict.auctionScreen.yes}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasExportLicense"
                        checked={!formData.hasExportLicense}
                        onChange={() => setFormData(prev => ({ ...prev, hasExportLicense: false }))}
                        className="text-blue-500"
                      />
                      <span className="text-gray-300">{dict.auctionScreen.no}</span>
                    </label>
                  </div>
                </div>
                {formData.hasExportLicense && (
                  <input
                    type="text"
                    value={formData.exportLicenseNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, exportLicenseNo: e.target.value }))}
                    placeholder={dict.auctionScreen.exportLicenseNumberPlaceholder}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>
          )}
          </div>

          {/* Product Features, Application, Usage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.productFeatures}</label>
              <textarea
                value={formData.productFeatures}
                onChange={(e) => setFormData(prev => ({ ...prev, productFeatures: e.target.value }))}
                placeholder={dict.auctionScreen.productFeaturesPlaceholder}
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.applicationScope}</label>
              <textarea
                value={formData.applicationScope}
                onChange={(e) => setFormData(prev => ({ ...prev, applicationScope: e.target.value }))}
                placeholder={dict.auctionScreen.applicationScopePlaceholder}
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.usageMethod}</label>
            <textarea
              value={formData.usageMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, usageMethod: e.target.value }))}
              placeholder={dict.auctionScreen.usageMethodPlaceholder}
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.uploadImages}</label>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer transition flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {dict.auctionScreen.selectImages}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <span className="text-gray-400 text-sm">支持 JPG、PNG、GIF、WebP 格式</span>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.uploadFiles}</label>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg cursor-pointer transition flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {dict.auctionScreen.selectFiles}
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-gray-400 text-sm">支持 PDF、Word、Excel 格式</span>
            </div>
            {formData.files.length > 0 && (
              <div className="space-y-2 mt-3">
                {formData.files.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                    <span className="text-gray-300 truncate">{url.split('/').pop()}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawing Upload */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">{dict.auctionScreen.uploadDrawings}</label>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg cursor-pointer transition flex items-center gap-2">
                <File className="w-4 h-4" />
                {dict.auctionScreen.selectDrawings}
                <input
                  type="file"
                  multiple
                  onChange={handleDrawingUpload}
                  className="hidden"
                />
              </label>
              <span className="text-gray-400 text-sm">支持 PDF、DWG、DXF、PNG、JPG 格式</span>
            </div>
            {formData.drawings.length > 0 && (
              <div className="space-y-2 mt-3">
                {formData.drawings.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                    <span className="text-gray-300 truncate">{url.split('/').pop()}</span>
                    <button
                      type="button"
                      onClick={() => removeDrawing(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-bold text-white mb-4">{dict.auctionScreen.contactInfo}</h3>
            <div className="grid grid-cols-3 gap-4">
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
                <label className="block text-gray-300 mb-2 font-medium">电话</label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+86 138..."
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

          {/* Verification Info */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{dict.auctionScreen.platformVerification}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                formData.verificationStatus === 'VERIFIED' ? 'bg-green-500 text-white' :
                formData.verificationStatus === 'PENDING' ? 'bg-yellow-500 text-white' :
                formData.verificationStatus === 'REJECTED' ? 'bg-red-500 text-white' :
                'bg-gray-600 text-gray-300'
              }`}>
                {formData.verificationStatus === 'VERIFIED' ? dict.auctionScreen.yes :
                 formData.verificationStatus === 'PENDING' ? dict.auctionScreen.verificationPending :
                 formData.verificationStatus === 'REJECTED' ? dict.auctionScreen.verificationRejected : dict.auctionScreen.verificationNotApplied}
              </span>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
              {formData.verificationStatus === 'VERIFIED' ? dict.auctionScreen.platformVerification :
               formData.verificationStatus === 'PENDING' ? dict.auctionScreen.verificationPending :
               formData.verificationStatus === 'REJECTED' ? dict.auctionScreen.verificationRejected :
               dict.auctionScreen.verificationNotApplied}
            </p>
            
            {formData.verificationStatus !== 'VERIFIED' && formData.verificationStatus !== 'PENDING' && (
              <button
                type="button"
                onClick={handleApplyVerification}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-bold transition"
              >
                {dict.auctionScreen.applyVerification}
              </button>
            )}
            
            {formData.verificationStatus === 'PENDING' && (
              <p className="text-yellow-400 text-sm mt-2 text-center">{dict.auctionScreen.verificationPending}</p>
            )}
          </div>


        </form>
      </div>
    </div>
  )
}