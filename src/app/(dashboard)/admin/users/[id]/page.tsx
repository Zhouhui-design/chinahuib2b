'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  username: string
  role: string
  isActive: boolean
  displayName?: string
  company?: string
  phone?: string
  website?: string
  location?: string
  bio?: string
  avatarUrl?: string
  createdAt: string
  lastLoginAt?: string
  updatedAt?: string
  _count: {
    sellerProfile: number
    inquiries: number
  }
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/users/${userId}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch user')
        }

        setUser(data.user)
      } catch (err) {
        const error = err as Error
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      void fetchUser()
    }
  }, [userId])

  const handleToggleStatus = async (currentStatus: boolean) => {
    if (!user) return
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update user')
      }

      setUser(prev => prev ? { ...prev, isActive: !currentStatus } : null)
    } catch (err) {
      const error = err as Error
      alert(error.message)
    }
  }

  const handleDelete = async () => {
    if (!user || !confirm('确定要删除这个用户吗？此操作不可撤销。')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete user')
      }

      alert('用户删除成功')
      router.push('/admin/users')
    } catch (err) {
      const error = err as Error
      alert(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
        {error}
        <div className="mt-2">
          <Link href="/admin/users" className="text-blue-600 hover:underline">
            返回用户列表
          </Link>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
        用户不存在
        <div className="mt-2">
          <Link href="/admin/users" className="text-blue-600 hover:underline">
            返回用户列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用户详情</h1>
            <p className="mt-1 text-sm text-gray-600">
              查看用户的详细信息
            </p>
          </div>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            返回列表
          </Link>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.displayName?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
            </div>
            
            {/* Basic Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {user.displayName || user.username}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'SELLER' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'ADMIN' ? '管理员' :
                   user.role === 'SELLER' ? '卖家' : '买家'}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? '已激活' : '已禁用'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">账户信息</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">用户ID</span>
              <span className="font-mono text-sm text-gray-700">{user.id}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">用户名</span>
              <span className="text-gray-900">{user.username}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">邮箱</span>
              <span className="text-gray-900">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">昵称</span>
              <span className="text-gray-900">{user.displayName || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">公司</span>
              <span className="text-gray-900">{user.company || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">角色</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                user.role === 'SELLER' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {user.role === 'ADMIN' ? '管理员' :
                 user.role === 'SELLER' ? '卖家' : '买家'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-500">状态</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? '已激活' : '已禁用'}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">联系信息</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">电话</span>
              <span className="text-gray-900">{user.phone || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">网站</span>
              <span className="text-gray-900">
                {user.website ? (
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {user.website}
                  </a>
                ) : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">位置</span>
              <span className="text-gray-900">{user.location || '-'}</span>
            </div>
            <div className="flex justify-between items-start py-3">
              <span className="text-gray-500">简介</span>
              <span className="text-gray-900 text-right max-w-xs">{user.bio || '-'}</span>
            </div>
          </div>
        </div>

        {/* Activity Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">活动信息</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">注册时间</span>
              <span className="text-gray-900">
                {new Date(user.createdAt).toLocaleString('zh-CN')}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">最后登录</span>
              <span className="text-gray-900">
                {user.lastLoginAt 
                  ? new Date(user.lastLoginAt).toLocaleString('zh-CN')
                  : '从未登录'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">更新时间</span>
              <span className="text-gray-900">
                {user.updatedAt ? new Date(user.updatedAt).toLocaleString('zh-CN') : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-500">咨询数量</span>
              <span className="text-gray-900">{user._count.inquiries}</span>
            </div>
            {user._count.sellerProfile > 0 && (
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-500">卖家资料</span>
                <span className="text-green-600 font-medium">已创建</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">操作</h3>
        <div className="flex gap-4">
          <button
            onClick={() => handleToggleStatus(user.isActive)}
            className={`px-6 py-2 rounded-lg font-medium ${
              user.isActive 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {user.isActive ? '禁用账户' : '启用账户'}
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
          >
            删除用户
          </button>
        </div>
      </div>
    </div>
  )
}