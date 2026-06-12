'use client'

import { useState, useEffect } from 'react'
import { 
  Bot, 
  Shield, 
  BarChart3, 
  Activity,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Save,
  X
} from 'lucide-react'

interface AIPermission {
  id: string
  userId: string
  permission: string
  isAllowed: boolean
  scope: string | null
  grantedAt: string
  expiresAt: string | null
  user: {
    id: string
    username: string
    email: string
    role: string
    isAI: boolean
  }
}

interface AIAuditLog {
  id: string
  userId: string
  action: string
  target: string | null
  result: string | null
  metadata: string | null
  createdAt: string
  user: {
    id: string
    username: string
    email: string
  }
}

interface AIAccount {
  id: string
  username: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
  isAI: boolean
}

const PERMISSIONS_LIST = [
  { name: 'read_public_data', label: '读取公共数据', description: '允许读取公开的产品、店铺信息' },
  { name: 'read_private_data', label: '读取隐私数据', description: '允许读取其他用户的隐私信息' },
  { name: 'write_data', label: '写入数据', description: '允许发布商品、帖子等' },
  { name: 'chat', label: '聊天', description: '允许与其他用户聊天' },
  { name: 'scrape', label: '爬取数据', description: '允许程序化爬取平台数据' },
  { name: 'automated_actions', label: '自动化操作', description: '允许执行自动化操作' },
  { name: 'access_api', label: '访问API', description: '允许通过API访问平台' },
  { name: 'send_messages', label: '发送消息', description: '允许发送私信和广播' },
]

export default function AIMonitoringPage() {
  const [permissions, setPermissions] = useState<AIPermission[]>([])
  const [auditLogs, setAuditLogs] = useState<AIAuditLog[]>([])
  const [aiAccounts, setAiAccounts] = useState<AIAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedUser, setSelectedUser] = useState<AIAccount | null>(null)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [filterRole, setFilterRole] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [permissionsRes, logsRes, usersRes] = await Promise.all([
        fetch('/api/admin/ai-permissions'),
        fetch('/api/admin/users?role=AI_BUYER&role=AI_SELLER'),
        fetch('/api/admin/ai-audit-logs')
      ])

      if (permissionsRes.ok) {
        const data = await permissionsRes.json()
        setPermissions(data.permissions || [])
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        setAiAccounts(data.users || [])
      }

      if (logsRes.ok) {
        const data = await logsRes.json()
        setAuditLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePermission = async (userId: string, permission: string, isAllowed: boolean) => {
    try {
      const res = await fetch('/api/admin/ai-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, permission, isAllowed })
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error saving permission:', error)
    }
  }

  const handleDeletePermission = async (id: string) => {
    if (!confirm('确定要删除这个权限吗？')) return
    try {
      const res = await fetch(`/api/admin/ai-permissions?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting permission:', error)
    }
  }

  const filteredAccounts = aiAccounts.filter(account => {
    const matchesRole = filterRole === 'all' || account.role === filterRole
    const matchesSearch = account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRole && matchesSearch
  })

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'AI_BUYER': return 'AI 买家'
      case 'AI_SELLER': return 'AI 卖家'
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'AI_BUYER': return 'bg-blue-100 text-blue-800'
      case 'AI_SELLER': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    totalAI: aiAccounts.length,
    activeAI: aiAccounts.filter(a => a.isActive).length,
    totalPermissions: permissions.length,
    recentActivity: auditLogs.length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI 监控管理</h1>
                <p className="text-sm text-gray-600 mt-1">监控和管理所有 AI 代理的活动</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>刷新数据</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">AI 账号总数</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAI}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">活跃 AI 账号</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.activeAI}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">权限规则数</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalPermissions}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">最近活动记录</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.recentActivity}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              监控概览
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'permissions'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              访问控制列表
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'audit'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              审计日志
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">加载中...</p>
              </div>
            ) : activeTab === 'dashboard' ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">AI 账号列表</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="搜索用户名或邮箱..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">全部角色</option>
                      <option value="AI_BUYER">AI 买家</option>
                      <option value="AI_SELLER">AI 卖家</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredAccounts.length === 0 ? (
                    <div className="text-center py-12">
                      <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">暂无 AI 账号</p>
                    </div>
                  ) : (
                    filteredAccounts.map((account) => (
                      <div key={account.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                              <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900">{account.username}</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(account.role)}`}>
                                  {getRoleLabel(account.role)}
                                </span>
                                {account.isActive ? (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    活跃
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    已禁用
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{account.email}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>创建于: {new Date(account.createdAt).toLocaleDateString('zh-CN')}</span>
                                {account.lastLoginAt && (
                                  <span>最后登录: {new Date(account.lastLoginAt).toLocaleDateString('zh-CN')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => { setSelectedUser(account); setShowPermissionModal(true) }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                            >
                              <Shield className="w-4 h-4" />
                              <span>管理权限</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : activeTab === 'permissions' ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">访问控制列表</h2>
                
                <div className="space-y-4">
                  {permissions.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">暂无权限规则</p>
                    </div>
                  ) : (
                    permissions.map((perm) => (
                      <div key={perm.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                 style={{ backgroundColor: perm.isAllowed ? '#dcfce7' : '#fee2e2' }}>
                              {perm.isAllowed ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <EyeOff className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900">
                                  {PERMISSIONS_LIST.find(p => p.name === perm.permission)?.label || perm.permission}
                                </span>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                  perm.isAllowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {perm.isAllowed ? '允许' : '禁止'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                用户: {perm.user.username} ({perm.user.email})
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                创建于: {new Date(perm.grantedAt).toLocaleString('zh-CN')}
                                {perm.expiresAt && ` | 到期: ${new Date(perm.expiresAt).toLocaleDateString('zh-CN')}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleSavePermission(perm.userId, perm.permission, !perm.isAllowed)}
                              className={`px-3 py-1.5 rounded-lg text-sm flex items-center space-x-1 ${
                                perm.isAllowed 
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {perm.isAllowed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              <span>{perm.isAllowed ? '禁止' : '允许'}</span>
                            </button>
                            <button
                              onClick={() => handleDeletePermission(perm.id)}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 flex items-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">审计日志</h2>
                
                <div className="space-y-4">
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">暂无审计日志</p>
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900">{log.action}</span>
                                {log.result && (
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    log.result === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {log.result === 'success' ? '成功' : '失败'}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                用户: {log.user.username} | 目标: {log.target || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {new Date(log.createdAt).toLocaleString('zh-CN')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Permission Management Modal */}
      {showPermissionModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">管理 {selectedUser.username} 的权限</h3>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {PERMISSIONS_LIST.map((perm) => {
                const existing = permissions.find(
                  p => p.userId === selectedUser.id && p.permission === perm.name
                )
                const isAllowed = existing?.isAllowed ?? false

                return (
                  <div key={perm.name} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h4 className="font-medium text-gray-900">{perm.label}</h4>
                      <p className="text-sm text-gray-500">{perm.description}</p>
                    </div>
                    <button
                      onClick={() => handleSavePermission(selectedUser.id, perm.name, !isAllowed)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isAllowed
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {isAllowed ? '允许' : '禁止'}
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-end p-4 border-t border-gray-200">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}