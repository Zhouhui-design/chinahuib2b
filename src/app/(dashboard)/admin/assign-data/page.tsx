'use client'

import { useState, useEffect } from 'react'

interface Seller {
  id: string
  companyName: string
  userEmail: string | null
  userName: string | null
  userRole: string | null
}

interface Booth {
  id: string
  name: string
  sellerId: string
  sellerName: string
  sellerEmail: string
  productCount: number
}

interface Product {
  id: string
  title: string
  sellerId: string
  sellerName: string
  sellerEmail: string
}

interface UserProfile {
  user: {
    id: string
    email: string
    username: string
    role: string
  }
  sellerProfile: {
    id: string
    companyName: string
    boothCount: number
    productCount: number
    booths: { id: string; name: string; boothNumber: string; productCount: number }[]
    standaloneProducts: { id: string; title: string }[]
  } | null
}

export default function AssignDataPage() {
  const [targetEmail, setTargetEmail] = useState('sardenesy@gmail.com')
  const [sellers, setSellers] = useState<Seller[]>([])
  const [booths, setBooths] = useState<Booth[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedBooths, setSelectedBooths] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const fetchData = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/assign-data')
      const data = await res.json()
      setSellers(data.sellers || [])
      setBooths(data.booths || [])
      setProducts(data.standaloneProducts || [])
    } catch (err) {
      setMessage('Failed to load data')
    }
    setLoading(false)
  }

  const fetchUserProfile = async () => {
    if (!targetEmail) return
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`/api/admin/assign-data?email=${encodeURIComponent(targetEmail)}`)
      const data = await res.json()
      setUserProfile(data)
      if (!res.ok) {
        setMessage(data.error || 'User not found')
      }
    } catch (err) {
      setMessage('Failed to load user profile')
    }
    setLoading(false)
  }

  const handleAssignBooths = async () => {
    if (!targetEmail || selectedBooths.length === 0) return
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/assign-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_booths',
          targetEmail,
          boothIds: selectedBooths
        })
      })
      const data = await res.json()
      setMessage(data.message || data.error)
      if (res.ok) {
        setSelectedBooths([])
        fetchData()
        fetchUserProfile()
      }
    } catch (err) {
      setMessage('Failed to assign booths')
    }
    setLoading(false)
  }

  const handleAssignProducts = async () => {
    if (!targetEmail || selectedProducts.length === 0) return
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/assign-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_products',
          targetEmail,
          productIds: selectedProducts
        })
      })
      const data = await res.json()
      setMessage(data.message || data.error)
      if (res.ok) {
        setSelectedProducts([])
        fetchData()
        fetchUserProfile()
      }
    } catch (err) {
      setMessage('Failed to assign products')
    }
    setLoading(false)
  }

  const toggleBooth = (id: string) => {
    setSelectedBooths(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    )
  }

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">数据分配管理</h1>
        <p className="mt-1 text-sm text-gray-600">
          将展会和产品分配到指定卖家账号
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('成功') || message.includes('Updated') || message.includes('Transferred') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* Target User Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">1. 选择目标卖家账号</h2>
        <div className="flex gap-4">
          <input
            type="email"
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
            placeholder="卖家邮箱地址"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={fetchUserProfile}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            查询用户
          </button>
        </div>

        {userProfile && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold">用户信息</h3>
            <p>邮箱: {userProfile.user.email}</p>
            <p>用户名: {userProfile.user.username}</p>
            <p>角色: {userProfile.user.role}</p>
            {userProfile.sellerProfile ? (
              <div className="mt-2">
                <p><strong>卖家档案:</strong> {userProfile.sellerProfile.companyName}</p>
                <p>展会数量: {userProfile.sellerProfile.boothCount}</p>
                <p>产品数量: {userProfile.sellerProfile.productCount}</p>
              </div>
            ) : (
              <p className="text-yellow-600 mt-2">⚠️ 此用户没有卖家档案</p>
            )}
          </div>
        )}
      </div>

      {/* Booths Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">2. 展会列表 ({booths.length})</h2>
          {selectedBooths.length > 0 && (
            <button
              onClick={handleAssignBooths}
              disabled={loading || !userProfile?.sellerProfile}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              分配选中的 {selectedBooths.length} 个展会
            </button>
          )}
        </div>

        {booths.length === 0 ? (
          <p className="text-gray-500">暂无展会</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">选择</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">展会名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">当前卖家</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">产品数量</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {booths.map(booth => (
                  <tr key={booth.id}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedBooths.includes(booth.id)}
                        onChange={() => toggleBooth(booth.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-3">{booth.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {booth.sellerName} ({booth.sellerEmail})
                    </td>
                    <td className="px-4 py-3">{booth.productCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Products Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">3. 独立产品列表 ({products.length})</h2>
          {selectedProducts.length > 0 && (
            <button
              onClick={handleAssignProducts}
              disabled={loading || !userProfile?.sellerProfile}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              分配选中的 {selectedProducts.length} 个产品
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500">暂无独立产品</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">选择</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">产品名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">当前卖家</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-3">{product.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {product.sellerName} ({product.sellerEmail})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sellers Reference */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">卖家账号列表 ({sellers.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">公司名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户邮箱</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sellers.map(seller => (
                <tr key={seller.id}
                    className={seller.userEmail === targetEmail ? 'bg-blue-50' : ''}>
                  <td className="px-4 py-3 font-medium">{seller.companyName}</td>
                  <td className="px-4 py-3">{seller.userEmail}</td>
                  <td className="px-4 py-3">{seller.userName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      seller.userRole === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      seller.userRole === 'SELLER' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {seller.userRole}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}