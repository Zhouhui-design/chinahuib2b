'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Building2, Calendar, Eye, MessageCircle, Share2, Flag, Shield } from 'lucide-react'
import type { AuctionListing, AuctionBid, User } from '@prisma/client'

type ListingWithRelations = AuctionListing & {
  seller?: {
    id: string
    displayName?: string | null
    company?: string | null
    avatarUrl?: string | null
    isVerified: boolean
  } | null
  bids: (AuctionBid & {
    bidder?: { displayName?: string | null; company?: string | null } | null
  })[]
}

export default function AuctionDetailClient({ listing }: { listing: ListingWithRelations }) {
  const [activeImage, setActiveImage] = useState(0)
  const [shareUrl, setShareUrl] = useState('')

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      setShareUrl('URL copied to clipboard!')
      setTimeout(() => setShareUrl(''), 2000)
    })
  }

  const formatPrice = (price: number | null | undefined, currency: string) => {
    if (price == null) return 'Contact for price'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price)
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  const typeLabels: Record<string, string> = {
    AUCTION: 'Live Auction',
    BUY_NOW: 'Buy Now',
    NEGOTIATION: 'Negotiation',
    TENDER: 'Tender/RFP',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          {' / '}
          <Link href="/auction-screen" className="hover:text-blue-600">Auction</Link>
          {' / '}
          <span className="text-gray-700">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {listing.images[activeImage] ? (
                  <img
                    src={listing.images[activeImage]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[listing.status] || 'bg-gray-100 text-gray-800'}`}>
                    {listing.status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {typeLabels[listing.type] || listing.type}
                  </span>
                  {listing.isVerified && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
              </div>

              {listing.images.length > 1 && (
                <div className="flex gap-2 p-4">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        activeImage === idx ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.title}</h1>
              
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-4xl font-bold text-blue-600">
                  {formatPrice(listing.price, listing.currency)}
                </span>
                {listing.minOrderQty && (
                  <span className="text-gray-500">
                    MOQ: {listing.minOrderQty}
                  </span>
                )}
              </div>

              {listing.description && (
                <div className="prose max-w-none mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
                </div>
              )}

              {listing.category && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                    {listing.category}
                  </span>
                  {listing.tags?.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {listing.shippingCountry && (
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>Ships from: {listing.shippingCountry}</span>
                </div>
              )}

              {listing.technicalSpecs && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Technical Specifications</h2>
                  <div className="text-gray-700 whitespace-pre-wrap">{listing.technicalSpecs}</div>
                </div>
              )}

              {listing.productFeatures && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Features</h2>
                  <div className="text-gray-700 whitespace-pre-wrap">{listing.productFeatures}</div>
                </div>
              )}
            </div>

            {listing.bids && listing.bids.length > 0 && (
              <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Bids</h2>
                <div className="space-y-3">
                  {listing.bids.map((bid, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {bid.bidder?.displayName || 'Anonymous'}
                        </span>
                        {bid.bidder?.company && (
                          <span className="text-gray-500 ml-2">({bid.bidder.company})</span>
                        )}
                      </div>
                      <span className="font-bold text-blue-600">
                        {formatPrice(bid.amount.toNumber(), listing.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{listing.views} views</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Contact Seller</h3>
                {listing.seller ? (
                  <div className="flex items-center gap-3 mb-4">
                    {listing.seller.avatarUrl ? (
                      <img
                        src={listing.seller.avatarUrl}
                        alt={listing.seller.displayName || 'Seller'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {listing.seller.displayName || listing.seller.company || 'Verified Supplier'}
                      </p>
                      {listing.seller.company && (
                        <p className="text-sm text-gray-500">{listing.seller.company}</p>
                      )}
                      {listing.seller.isVerified && (
                        <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <Shield className="w-3 h-3" /> Verified Supplier
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <Link
                  href={`/chat?listing=${listing.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Seller
                </Link>

                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  <Share2 className="w-5 h-5" />
                  Share Listing
                </button>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                  <Flag className="w-5 h-5" />
                  Report
                </button>
              </div>

              {shareUrl && (
                <div className="mt-4 p-2 bg-green-50 text-green-700 rounded text-sm text-center">
                  {shareUrl}
                </div>
              )}

              {listing.contactEmail && (
                <div className="mt-6 pt-4 border-t text-sm text-gray-600">
                  <p className="mb-1">Email: <a href={`mailto:${listing.contactEmail}`} className="text-blue-600 hover:underline">{listing.contactEmail}</a></p>
                  {listing.contactPhone && (
                    <p className="mb-1">Phone: {listing.contactPhone}</p>
                  )}
                  {listing.contactWhatsApp && (
                    <p>WhatsApp: {listing.contactWhatsApp}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
