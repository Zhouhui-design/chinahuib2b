'use client'

import { useState, useEffect } from 'react'
import { Gavel, Plus, Search, Edit2, Trash2, Eye } from 'lucide-react'

interface AuctionListing {
  id: string
  title: string
  type: string
  status: string
  currentPrice: number
  startPrice: number
  endTime: string
  bids: number
  sellerName: string
}

export default function AdminAuctionListingsPage() {
  const [listings, setListings] = useState<AuctionListing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/auction-listings')
      if (res.ok) {
        const data = await res.json()
        setListings(data.listings || data.data || [])
      } else {
        setListings([])
      }
    } catch {
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = listings.filter(l =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">拍卖列表管理</h1>
          <p className="text-sm text-gray-600 mt-1">管理平台上的所有拍卖列表</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="搜索拍卖列表..."
            />
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
            <p>加载中...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filtered.map((listing) => (
              <div key={listing.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg">
                      <Gavel className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{listing.title}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          listing.status === 'ENDED' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>卖家: {listing.sellerName}</span>
                        <span>起拍价: ${listing.startPrice}</span>
                        <span>当前价: ${listing.currentPrice}</span>
                        <span>出价次数: {listing.bids}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <Gavel className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>暂无拍卖列表</p>
          </div>
        )}
      </div>
    </div>
  )
}