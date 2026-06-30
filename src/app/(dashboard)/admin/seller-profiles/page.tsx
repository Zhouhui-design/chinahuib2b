'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, User, Building2, Mail, Phone, Globe, MapPin, Loader2 } from 'lucide-react'

interface SellerProfile {
  id: string
  companyName: string
  companyType: string
  country: string
  city: string
  address?: string
  phone?: string
  email?: string
  website?: string
  organizationType: string
  registeredCapital?: string
  registeredAddress?: string
  businessAddress?: string
  employeeCount?: string
  foundingYear?: string
  businessScope?: string
  legalRepresentative?: string
  registrationNumber?: string
  description?: string
  logoUrl?: string
  bannerUrl?: string
  profileStatus: string
  profileSubmittedAt?: string
  profileReviewNotes?: string
  user: {
    id: string
    email: string
    username: string
  }
}

export default function SellerProfileApprovalsPage() {
  const [sellers, setSellers] = useState<SellerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)

  const fetchSellers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/seller-profiles?status=${statusFilter}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch sellers')
      }

      setSellers(data.sellers)
    } catch (err) {
      const error = err as Error
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSellers()
  }, [statusFilter])

  const handleApprove = async (sellerId: string) => {
    if (!confirm('确定要批准这个卖家的组织信息吗？批准后，买家可以在 /stores 页面看到该卖家的信息。')) {
      return
    }

    try {
      setProcessingId(sellerId)
      const res = await fetch(`/api/admin/seller-profiles/${sellerId}/approval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve profile')
      }

      alert('批准成功！买家现在可以在 /stores 页面看到这个卖家的信息。')
      fetchSellers()
    } catch (err) {
      const error = err as Error
      alert(error.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async () => {
    if (!selectedSeller) return

    try {
      setProcessingId(selectedSeller.id)
      const res = await fetch(`/api/admin/seller-profiles/${selectedSeller.id}/approval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', notes: rejectNotes }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reject profile')
      }

      alert('已拒绝该卖家的组织信息。')
      setShowRejectModal(false)
      setSelectedSeller(null)
      setRejectNotes('')
      fetchSellers()
    } catch (err) {
      const error = err as Error
      alert(error.message)
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            待审核
          </span>
        )
      case 'APPROVED':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            已批准
          </span>
        )
      case 'REJECTED':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            已拒绝
          </span>
        )
      case 'DRAFT':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            草稿
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">组织信息审核</h1>
        <p className="text-sm text-gray-600 mt-1">
          审核卖家提交的组织信息，批准后买家可以在 /stores 页面查看
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {['PENDING', 'APPROVED', 'REJECTED', 'DRAFT'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === status
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {status === 'PENDING' && '待审核'}
            {status === 'APPROVED' && '已批准'}
            {status === 'REJECTED' && '已拒绝'}
            {status === 'DRAFT' && '草稿'}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : sellers.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">暂无数据</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sellers.map((seller) => (
            <div
              key={seller.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {seller.logoUrl ? (
                    <img
                      src={seller.logoUrl}
                      alt={seller.companyName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{seller.companyName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(seller.profileStatus)}
                      <span className="text-sm text-gray-500">
                        {seller.organizationType === 'ENTERPRISE' && '企业'}
                        {seller.organizationType === 'INDIVIDUAL' && '个体户'}
                        {seller.organizationType === 'STATE_OWNED' && '国企'}
                        {seller.organizationType === 'PERSONAL' && '个人'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {seller.user.username}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {seller.user.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {seller.country}, {seller.city}
                      </span>
                      {seller.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {seller.phone}
                        </span>
                      )}
                    </div>
                    {seller.profileSubmittedAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        提交时间: {new Date(seller.profileSubmittedAt).toLocaleString('zh-CN')}
                      </p>
                    )}
                    {seller.profileReviewNotes && (
                      <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
                        拒绝原因: {seller.profileReviewNotes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSeller(seller)
                      setShowDetailModal(true)
                    }}
                    className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    查看详情
                  </button>
                  {seller.profileStatus === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(seller.id)}
                        disabled={processingId === seller.id}
                        className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {processingId === seller.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        批准
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSeller(seller)
                          setShowRejectModal(true)
                        }}
                        disabled={processingId === seller.id}
                        className="px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        拒绝
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">拒绝组织信息</h3>
            </div>
            <p className="text-gray-600 mb-4">
              拒绝 <strong>{selectedSeller.companyName}</strong> 的组织信息，请填写拒绝原因：
            </p>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="请输入拒绝原因（可选）"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedSeller(null)
                  setRejectNotes('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={processingId === selectedSeller.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {processingId === selectedSeller.id ? '处理中...' : '确认拒绝'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 my-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">卖家详情</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedSeller(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-6">
              {/* Company Header */}
              <div className="flex items-center gap-4">
                {selectedSeller.logoUrl ? (
                  <img
                    src={selectedSeller.logoUrl}
                    alt={selectedSeller.companyName}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-blue-600" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedSeller.companyName}</h2>
                  <p className="text-gray-600">{selectedSeller.companyType}</p>
                  {getStatusBadge(selectedSeller.profileStatus)}
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">基本信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">组织形式：</span>
                    <span className="text-gray-900">{selectedSeller.organizationType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">注册资金：</span>
                    <span className="text-gray-900">{selectedSeller.registeredCapital || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">法定代表人：</span>
                    <span className="text-gray-900">{selectedSeller.legalRepresentative || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">注册号：</span>
                    <span className="text-gray-900">{selectedSeller.registrationNumber || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">成立年份：</span>
                    <span className="text-gray-900">{selectedSeller.foundingYear || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">员工人数：</span>
                    <span className="text-gray-900">{selectedSeller.employeeCount || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Address Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">地址信息</h4>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">注册地址：</span>
                    <span className="text-gray-900">{selectedSeller.registeredAddress || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">经营地址：</span>
                    <span className="text-gray-900">{selectedSeller.businessAddress || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">国家/城市：</span>
                    <span className="text-gray-900">{selectedSeller.country}, {selectedSeller.city}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">联系方式</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">电话：</span>
                    <span className="text-gray-900">{selectedSeller.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">邮箱：</span>
                    <span className="text-gray-900">{selectedSeller.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">网站：</span>
                    <span className="text-gray-900">{selectedSeller.website || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Business Scope */}
              {selectedSeller.businessScope && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">经营范围</h4>
                  <p className="text-sm text-gray-700">{selectedSeller.businessScope}</p>
                </div>
              )}

              {/* Description */}
              {selectedSeller.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">公司简介</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedSeller.description}</p>
                </div>
              )}

              {/* Banner Image */}
              {selectedSeller.bannerUrl && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">横幅图片</h4>
                  <img
                    src={selectedSeller.bannerUrl}
                    alt="Banner"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
