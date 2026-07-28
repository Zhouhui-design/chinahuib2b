'use client'

import { useState, useEffect } from 'react'
import { Truck, Search, MessageSquare, Calendar } from 'lucide-react'

interface FreightInquiry {
  id: string
  message: string
  contactInfo: string
  status: string
  buyerName: string
  sellerName: string
  createdAt: string
  productName?: string
}

export default function AdminFreightInquiriesPage() {
  const [inquiries, setInquiries] = useState<FreightInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/freight-inquiries')
      if (res.ok) {
        const data = await res.json()
        setInquiries(data.inquiries || data.data || [])
      } else {
        setInquiries([])
      }
    } catch {
      setInquiries([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = inquiries.filter(i =>
    i.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">货代询价管理</h1>
          <p className="text-sm text-gray-600 mt-1">查看和管理买家发起的货代询价</p>
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
              placeholder="搜索询价..."
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
            {filtered.map((inquiry) => (
              <div key={inquiry.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg mt-1">
                    <Truck className="w-4 h-4" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{inquiry.buyerName}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-600">{inquiry.sellerName}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        inquiry.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        inquiry.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{inquiry.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(inquiry.createdAt).toLocaleString('zh-CN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {inquiry.contactInfo}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>暂无货代询价</p>
          </div>
        )}
      </div>
    </div>
  )
}