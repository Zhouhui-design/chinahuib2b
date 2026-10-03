'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bot, ChevronDown, ChevronUp } from 'lucide-react'

interface AISubAccount {
  id: string
  username: string
  email: string
  role: string
  isActive: boolean
  isOnline: boolean
  displayName?: string
  lastLoginAt?: string
  lastSeenAt?: string
  createdAt: string
}

interface User {
  id: string
  email: string
  username: string
  role: string
  isActive: boolean
  isOnline: boolean
  displayName?: string
  company?: string
  createdAt: string
  lastLoginAt?: string
  lastSeenAt?: string
  aiAccounts?: AISubAccount[]
  _count: {
    products: number
    sellerProfile: number
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  // Track which guardian rows have their AI sub-accounts expanded
  const [expandedAI, setExpandedAI] = useState<Set<string>>(new Set())
  // Track filter: all / with-AI / without-AI
  const [aiFilter, setAiFilter] = useState('')

  const toggleAI = (userId: string) => {
    setExpandedAI(prev => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  // Derived stats for header summary
  const usersWithAI = users.filter(u => (u.aiAccounts?.length ?? 0) > 0).length
  const totalAIAgents = users.reduce((sum, u) => sum + (u.aiAccounts?.length ?? 0), 0)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { isActive: statusFilter }),
      })

      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch users')
      }

      // Client-side filter for "has AI" / "no AI" since the DB returns all guardians
      let filtered = data.users || []
      if (aiFilter === 'with-ai') {
        filtered = filtered.filter((u: User) => (u.aiAccounts?.length ?? 0) > 0)
      } else if (aiFilter === 'without-ai') {
        filtered = filtered.filter((u: User) => (u.aiAccounts?.length ?? 0) === 0)
      }

      setUsers(filtered)
      setTotalPages(data.pagination.totalPages)
    } catch (err) {
      const error = err as Error
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const getData = async () => {
      await fetchUsers()
    }
    void getData()
  }, [page, roleFilter, statusFilter, search, aiFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  const handleDelete = async (userId: string) => {
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
      fetchUsers()
    } catch (err) {
      const error = err as Error
      alert(error.message)
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
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

      fetchUsers()
    } catch (err) {
      const error = err as Error
      alert(error.message)
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <p className="mt-1 text-sm text-gray-600">
          查看和管理所有注册用户（AI 子账号合并到监护人一行显示）
        </p>
        {!loading && users.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
              本页用户：{users.length}
            </span>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full">
              已注册 AI：{usersWithAI} 人
            </span>
            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full">
              AI Agent 总数：{totalAIAgents}
            </span>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="md:col-span-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="搜索邮箱、用户名或昵称..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                搜索
              </button>
            </div>
          </form>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">全部角色</option>
            <option value="ADMIN">管理员</option>
            <option value="SELLER">卖家</option>
            <option value="BUYER">买家</option>
          </select>

          {/* AI Filter */}
          <select
            value={aiFilter}
            onChange={(e) => {
              setAiFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">全部用户</option>
            <option value="with-ai">已注册 AI</option>
            <option value="without-ai">未注册 AI</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">全部状态</option>
            <option value="true">已激活</option>
            <option value="false">已禁用</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户信息（监护人）
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Agents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注册时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最后登录
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    暂无用户数据
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const aiCount = user.aiAccounts?.length ?? 0
                  const isExpanded = expandedAI.has(user.id)
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 align-top">
                      {/* Guardian info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {user.displayName || user.username}
                          </span>
                          <span className="text-sm text-gray-500">{user.email}</span>
                          {user.company && (
                            <span className="text-xs text-gray-400">{user.company}</span>
                          )}
                        </div>
                      </td>

                      {/* AI Agents (merged in same row) */}
                      <td className="px-6 py-4">
                        {aiCount === 0 ? (
                          <span className="text-xs text-gray-400">— 无 AI</span>
                        ) : (
                          <div className="space-y-2">
                            {/* Summary chip */}
                            <button
                              onClick={() => toggleAI(user.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                              title={isExpanded ? '收起 AI 列表' : '展开 AI 列表'}
                            >
                              <Bot className="w-3 h-3" />
                              {aiCount} 个 AI Agent
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>

                            {/* Expanded AI list */}
                            {isExpanded && (
                              <div className="space-y-1 mt-1 border-l-2 border-indigo-200 pl-2">
                                {user.aiAccounts!.map((ai) => (
                                  <div key={ai.id} className="text-xs">
                                    <div className="flex items-center gap-1">
                                      <Bot className="w-3 h-3 text-indigo-500" />
                                      <span className="font-medium text-gray-700">
                                        {ai.displayName || ai.username}
                                      </span>
                                      <span
                                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                                          ai.isOnline ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                        title={ai.isOnline ? '在线' : '离线'}
                                      />
                                    </div>
                                    <div className="text-gray-500 pl-4">
                                      {ai.username} · {ai.role}
                                    </div>
                                    <div className="text-gray-400 pl-4">
                                      {ai.lastLoginAt
                                        ? `登录: ${new Date(ai.lastLoginAt).toLocaleString('zh-CN')}`
                                        : '从未登录'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Compact preview when collapsed */}
                            {!isExpanded && (
                              <div className="text-xs text-gray-500">
                                {user.aiAccounts!.map(ai => ai.displayName || ai.username).join('、')}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'SELLER' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'ADMIN' ? '管理员' :
                           user.role === 'SELLER' ? '卖家' : '买家'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? '已激活' : '已禁用'}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-xs w-fit ${
                            user.isOnline ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                              user.isOnline ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            {user.isOnline ? '在线' : '离线'}
                          </span>
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </td>

                      {/* Last Login */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleString('zh-CN')
                          : '从未登录'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            查看详情
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                            className={`${
                              user.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                            }`}
                          >
                            {user.isActive ? '禁用' : '启用'}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                第 {page} 页，共 {totalPages} 页
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  上一页
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
