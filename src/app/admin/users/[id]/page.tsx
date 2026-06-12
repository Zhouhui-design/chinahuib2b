'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Trash2, User, Mail, Building, Calendar, Clock, Shield, Activity } from 'lucide-react'

interface UserDetail {
  id: string
  email: string
  username: string
  role: string
  isActive: boolean
  displayName?: string
  company?: string
  createdAt: string
  lastLoginAt?: string
  _count?: {
    inquiries: number
  }
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/users/${userId}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch user')
      }

      setUser(data)
    } catch (err) {
      const error = err as Error
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!user) return
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update user')
      }

      setUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null)
    } catch (err) {
      const error = err as Error
      alert(error.message)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个用户吗？此操作不可撤销。')) {
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return '管理员'
      case 'SELLER': return '卖家'
      case 'BUYER': return '买家'
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800'
      case 'SELLER': return 'bg-green-100 text-green-800'
      case 'BUYER': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
        <Link href="/admin/users" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          返回用户列表
        </Link>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">用户不存在</p>
        <Link href="/admin/users" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          返回用户列表
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/users"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用户详情</h1>
            <p className="text-sm text-gray-600 mt-1">查看和管理用户信息</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-lg transition-colors ${
              user.isActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {user.isActive ? '禁用用户' : '启用用户'}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2 inline" />
            删除用户
          </button>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2" />
            基本信息
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Avatar & Name */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {user.displayName || user.username}
                </h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>

            {/* Role & Status */}
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? '已激活' : '已禁用'}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Email */}
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">邮箱</p>
                <p className="text-sm text-gray-900">{user.email}</p>
              </div>
            </div>

            {/* Company */}
            <div className="flex items-start space-x-3">
              <Building className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">公司</p>
                <p className="text-sm text-gray-900">{user.company || '未设置'}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">角色</p>
                <p className="text-sm text-gray-900">{getRoleLabel(user.role)}</p>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">注册时间</p>
                <p className="text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Last Login */}
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">最后登录</p>
                <p className="text-sm text-gray-900">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '从未登录'}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start space-x-3">
              <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">状态</p>
                <p className="text-sm text-gray-900">
                  {user.isActive ? '账号正常' : '账号已禁用'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">活动统计</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">咨询数量</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {user._count?.inquiries || 0}
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">登录次数</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {user.lastLoginAt ? '1+' : '0'}
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">账号天数</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User ID */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs text-gray-500">
          用户 ID: <span className="font-mono">{user.id}</span>
        </p>
      </div>
    </div>
  )
}