'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, Building, Globe, MapPin, Save, Package, Clock, CheckCircle, XCircle, RefreshCw, Trash2, Edit3 } from 'lucide-react'

export default function BuyerProfilePage() {
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'auctions'>('profile')
  
  const [profileData, setProfileData] = useState({
    displayName: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    bio: ''
  })

  const [auctionListings, setAuctionListings] = useState<any[]>([])
  const [auctionLoading, setAuctionLoading] = useState(true)
  
  const loadProfileData = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      if (data.user) {
        setProfileData({
          displayName: data.user.displayName || '',
          company: data.user.company || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          website: data.user.website || '',
          location: data.user.location || '',
          bio: data.user.bio || ''
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const loadAuctionListings = async () => {
    setAuctionLoading(true)
    try {
      const response = await fetch('/api/auction/listings/me')
      const data = await response.json()
      if (data.success) {
        setAuctionListings(data.data)
      }
    } catch (error) {
      console.error('Failed to load auction listings:', error)
    }
    setAuctionLoading(false)
  }
  
  useEffect(() => {
    const fetchData = async () => {
      await loadProfileData()
    }
    void fetchData()
  }, [])

  useEffect(() => {
    if (activeTab === 'auctions') {
      loadAuctionListings()
    }
  }, [activeTab])
  
  useEffect(() => {
    const cookies = document.cookie.split(';')
    const langCookie = cookies.find(c => c.trim().startsWith('language='))
    if (langCookie) {
      const lang = langCookie.split('=')[1]
      setLanguage(lang || 'en')
    }
  }, [])
  
  const t = {
    title: language === 'zh' ? '个人资料' : 'Profile',
    subtitle: language === 'zh' ? '管理您的联系信息和个人资料' : 'Manage your contact information and profile',
    
    displayName: language === 'zh' ? '显示名称' : 'Display Name',
    company: language === 'zh' ? '公司' : 'Company',
    email: language === 'zh' ? '邮箱' : 'Email',
    phone: language === 'zh' ? '电话' : 'Phone',
    website: language === 'zh' ? '网站' : 'Website',
    location: language === 'zh' ? '位置' : 'Location',
    bio: language === 'zh' ? '个人简介' : 'Bio',
    
    saveChanges: language === 'zh' ? '保存更改' : 'Save Changes',
    saving: language === 'zh' ? '保存中...' : 'Saving...',
    
    saved: language === 'zh' ? '资料已保存！' : 'Profile saved successfully!',
    error: language === 'zh' ? '保存失败，请重试' : 'Failed to save. Please try again.',

    profileTab: language === 'zh' ? '个人资料' : 'Profile',
    auctionsTab: language === 'zh' ? '我的拍卖商品' : 'My Auctions',
    
    auctionListings: language === 'zh' ? '拍卖商品列表' : 'Auction Listings',
    noListings: language === 'zh' ? '暂无拍卖商品' : 'No auction listings',
    loading: language === 'zh' ? '加载中...' : 'Loading...',
    refresh: language === 'zh' ? '刷新' : 'Refresh',
    
    titleCol: language === 'zh' ? '商品名称' : 'Title',
    statusCol: language === 'zh' ? '审核状态' : 'Status',
    createdAtCol: language === 'zh' ? '创建时间' : 'Created',
    actionCol: language === 'zh' ? '操作' : 'Action',
    
    pending: language === 'zh' ? '审核中' : 'Pending',
    verified: language === 'zh' ? '已通过' : 'Verified',
    rejected: language === 'zh' ? '未通过' : 'Rejected',
    notApplied: language === 'zh' ? '未申请' : 'Not Applied',
    
    viewDetails: language === 'zh' ? '查看详情' : 'View Details',
    deleteListing: language === 'zh' ? '删除' : 'Delete',
    resubmit: language === 'zh' ? '重新提交审核' : 'Resubmit',
    
    deleteConfirm: language === 'zh' ? '确定要删除这个商品吗？' : 'Are you sure you want to delete this listing?',
    rejectReason: language === 'zh' ? '拒绝原因' : 'Rejection Reason',
    
    price: language === 'zh' ? '价格' : 'Price',
    shippingCountry: language === 'zh' ? '发货国家' : 'Shipping Country',
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { text: t.pending, color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> }
      case 'VERIFIED':
        return { text: t.verified, color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> }
      case 'REJECTED':
        return { text: t.rejected, color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> }
      default:
        return { text: t.notApplied, color: 'bg-gray-100 text-gray-800', icon: <Package className="w-4 h-4" /> }
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm(t.deleteConfirm)) return
    try {
      const response = await fetch(`/api/auction/${listingId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        loadAuctionListings()
      } else {
        alert(t.error)
      }
    } catch (error) {
      console.error('Failed to delete listing:', error)
      alert(t.error)
    }
  }

  const handleResubmit = async (listingId: string) => {
    try {
      const response = await fetch('/api/auction/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resubmit', listingId }),
      })
      if (response.ok) {
        alert(language === 'zh' ? '已重新提交审核' : 'Resubmitted for review')
        loadAuctionListings()
      } else {
        const data = await response.json()
        alert(data.error || t.error)
      }
    } catch (error) {
      console.error('Failed to resubmit:', error)
      alert(t.error)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(t.saved)
      } else {
        setMessage(data.error || t.error)
      }
    } catch (error) {
      console.error('Save error:', error)
      setMessage(t.error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="mt-1 text-sm text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {t.profileTab}
          </button>
          <button
            onClick={() => setActiveTab('auctions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'auctions'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {t.auctionsTab} ({auctionListings.length})
          </button>
        </div>

        {message && activeTab === 'profile' && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') || message.includes('saved')
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    {t.displayName}
                  </label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    {t.company}
                  </label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    {t.email}
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    {t.website}
                  </label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.yourcompany.com"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {t.location}
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, Country"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.bio}
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? t.saving : t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'auctions' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t.auctionListings}</h2>
              <button
                onClick={loadAuctionListings}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t.refresh}
              </button>
            </div>

            {auctionLoading ? (
              <div className="text-center py-8">{t.loading}</div>
            ) : auctionListings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>{t.noListings}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t.titleCol}</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t.price}</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t.shippingCountry}</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t.statusCol}</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t.createdAtCol}</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t.actionCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {auctionListings.map((listing) => {
                      const statusInfo = getStatusInfo(listing.verificationStatus)
                      return (
                        <tr key={listing.id}>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{listing.title}</p>
                              <p className="text-sm text-gray-500">ID: {listing.id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">
                              {listing.currency} {listing.price?.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">{listing.shippingCountry}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                              {statusInfo.icon}
                              {statusInfo.text}
                            </span>
                            {listing.verificationNotes && listing.verificationStatus === 'REJECTED' && (
                              <div className="mt-2 text-sm text-red-600">
                                <strong>{t.rejectReason}:</strong> {listing.verificationNotes}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">{new Date(listing.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {listing.verificationStatus === 'REJECTED' && (
                                <button
                                  onClick={() => handleResubmit(listing.id)}
                                  className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                                >
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  {t.resubmit}
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteListing(listing.id)}
                                className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                {t.deleteListing}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}