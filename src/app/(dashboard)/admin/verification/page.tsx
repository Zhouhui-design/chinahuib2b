'use client'

import { useState, useEffect } from 'react'
import { Check, X, Eye, Globe, Plus, Search, RefreshCw, XCircle, Clock, CheckCircle } from 'lucide-react'

export default function VerificationPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [countries, setCountries] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'requests' | 'countries'>('requests')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [pendingOnly, setPendingOnly] = useState(true)

  useEffect(() => {
    fetchData()
  }, [activeTab, searchTerm, pendingOnly])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'requests') {
        const url = pendingOnly 
          ? `/api/auction/verification?status=PENDING`
          : `/api/auction/verification`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setRequests(data.data)
          }
        }
      } else {
        const res = await fetch(`/api/admin/verification?type=countries`)
        if (res.ok) {
          const data = await res.json()
          setCountries(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const handleViewDetail = (listing: any) => {
    console.log('handleViewDetail called with:', listing?.id)
    setSelectedListing(listing)
    setShowDetailModal(true)
  }

  const handleApprove = async (listingId: string) => {
    try {
      const res = await fetch('/api/auction/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', listingId }),
      })
      if (res.ok) {
        alert('审核通过')
        setShowDetailModal(false)
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('Error approving:', error)
      alert('操作失败')
    }
  }

  const handleReject = async (listingId: string) => {
    if (!rejectReason.trim()) {
      alert('请输入拒绝原因')
      return
    }

    try {
      const res = await fetch('/api/auction/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', listingId, reason: rejectReason }),
      })
      if (res.ok) {
        alert('已拒绝并通知用户')
        setShowRejectModal(false)
        setRejectReason('')
        setShowDetailModal(false)
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('Error rejecting:', error)
      alert('操作失败')
    }
  }

  const handleToggleCountry = async (id: string) => {
    try {
      await fetch('/api/admin/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleCountry', id }),
      })
      fetchData()
    } catch (error) {
      console.error('Error updating country:', error)
    }
  }

  const handleAddCountry = async () => {
    const name = prompt('请输入国家名称（英文）：')
    const nameZh = prompt('请输入国家名称（中文）：')
    if (name) {
      try {
        await fetch('/api/admin/verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'addCountry', name, nameZh }),
        })
        fetchData()
      } catch (error) {
        console.error('Error adding country:', error)
        alert('添加失败，可能已存在')
      }
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { text: '审核中', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> }
      case 'VERIFIED':
        return { text: '已通过', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> }
      case 'REJECTED':
        return { text: '未通过', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> }
      default:
        return { text: '未申请', color: 'bg-gray-100 text-gray-800', icon: <Eye className="w-4 h-4" /> }
    }
  }

  const filteredRequests = requests.filter(
    (r) =>
      r.poster?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.poster?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.shippingCountry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">平台审核管理</h1>
          <button
            onClick={() => fetchData()}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </button>
        </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'requests'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          审核申请 ({requests.filter(r => r.verificationStatus === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('countries')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'countries'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          开通国家/地区 ({countries.filter((c) => c.isEnabled).length})
        </button>
      </div>

      {activeTab === 'requests' && (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索用户名、邮箱、国家或商品名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pendingOnly}
                onChange={(e) => setPendingOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">仅显示待审核</span>
            </label>
          </div>

          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : (
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">商品信息</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">发布者</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">发货国家</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">申请时间</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => {
                    const statusInfo = getStatusText(request.verificationStatus)
                    return (
                      <tr key={request.id}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{request.title}</p>
                            <p className="text-sm text-gray-500">ID: {request.id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{request.poster?.username}</p>
                            <p className="text-sm text-gray-500">{request.poster?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">{request.shippingCountry}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(request.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetail(request)}
                              className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                              <Eye className="w-4 h-4" />
                              查看详情
                            </button>
                            {request.verificationStatus === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApprove(request.id)}
                                  className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  通过
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedListing(request)
                                    setShowRejectModal(true)
                                  }}
                                  className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  拒绝
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {filteredRequests.length === 0 && (
                <div className="text-center py-12 text-gray-500">暂无审核申请</div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'countries' && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">开通国家/地区管理</h2>
            <button
              onClick={handleAddCountry}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加国家/地区
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {countries.map((country) => (
                <div
                  key={country.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    country.isEnabled
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <Globe className={`w-5 h-5 mr-3 ${country.isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium text-gray-900">{country.name}</p>
                      {country.nameZh && <p className="text-sm text-gray-500">{country.nameZh}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleCountry(country.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      country.isEnabled
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {country.isEnabled ? '已开通' : '未开通'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {countries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无国家/地区配置</p>
              <p className="text-sm">点击上方按钮添加开通的国家/地区</p>
            </div>
          )}
        </div>
      )}

      {showDetailModal && selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">商品审核详情</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">商品名称</p>
                  <p className="font-medium text-gray-900">{selectedListing.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">审核状态</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusText(selectedListing.verificationStatus).color}`}>
                    {getStatusText(selectedListing.verificationStatus).icon}
                    {getStatusText(selectedListing.verificationStatus).text}
                  </span>
                </div>
              </div>

              {selectedListing.images && selectedListing.images.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">商品图片</p>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedListing.images.map((url: string, index: number) => (
                      <img key={index} src={url} alt={`Image ${index}`} className="w-full h-32 object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              )}

              {selectedListing.description && (
                <div>
                  <p className="text-sm text-gray-500">商品描述</p>
                  <p className="text-gray-900">{selectedListing.description}</p>
                </div>
              )}

              {selectedListing.techSpecs && (
                <div>
                  <p className="text-sm text-gray-500">技术参数</p>
                  <p className="text-gray-900">{selectedListing.techSpecs}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">价格</p>
                  <p className="font-medium text-gray-900">{selectedListing.currency} {selectedListing.price?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">最小起订量</p>
                  <p className="font-medium text-gray-900">{selectedListing.minOrderQty}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">发货国家</p>
                  <p className="font-medium text-gray-900">{selectedListing.shippingCountry}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">详细地址</p>
                  <p className="font-medium text-gray-900">{selectedListing.detailedAddress}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">发布者信息</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {selectedListing.poster?.displayName?.charAt(0) || selectedListing.poster?.username?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedListing.poster?.displayName || selectedListing.poster?.username}</p>
                    <p className="text-sm text-gray-500">{selectedListing.poster?.email}</p>
                  </div>
                </div>
              </div>

              {selectedListing.verificationNotes && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">审核备注</p>
                  <p className="text-yellow-700">{selectedListing.verificationNotes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  关闭
                </button>
                {selectedListing.verificationStatus === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedListing.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 inline mr-1" />
                      同意
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectModal(true)
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      不同意
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">拒绝审核申请</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">请输入拒绝原因，用户将收到此通知：</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请输入拒绝原因..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectReason('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  onClick={() => handleReject(selectedListing.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  确认拒绝
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
}