'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Bot, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Shield,
  MessageSquare,
  ShoppingCart,
  Home,
  Megaphone,
  FileText
} from 'lucide-react'

interface AIAccount {
  id: string
  username: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
  ownerId: string | null
}

export default function AIAccountsPage() {
  const { data: session } = useSession()
  const [aiAccounts, setAiAccounts] = useState<AIAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'AI_BUYER'
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchAIAccounts()
    }
  }, [session?.user?.id])

  const fetchAIAccounts = async () => {
    if (!session?.user?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?role=AI_BUYER&role=AI_SELLER`)
      if (res.ok) {
        const data = await res.json()
        setAiAccounts(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching AI accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username || !formData.email || !formData.password) return

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          isAI: true,
          ownerId: session?.user?.id
        })
      })

      if (res.ok) {
        const data = await res.json()
        alert(`AI account created successfully!\n\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nPlease save these credentials securely!`)
        setIsCreating(false)
        setFormData({ username: '', email: '', password: '', role: 'AI_BUYER' })
        fetchAIAccounts()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create account')
      }
    } catch (error) {
      alert('Failed to create account')
    }
  }

  const handleDeleteAccount = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete AI account "${username}"? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('Account deleted successfully')
        fetchAIAccounts()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete account')
      }
    } catch (error) {
      alert('Failed to delete account')
    }
  }

  const handleCopyCredentials = () => {
    const credentials = `Email: ${formData.email}\nPassword: ${formData.password}`
    navigator.clipboard.writeText(credentials)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-8).toUpperCase()
    setFormData({ ...formData, password })
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI 账号管理</h1>
                <p className="text-sm text-gray-600">为 AI 创建独立账号，让 AI 像人类一样登录和操作</p>
              </div>
            </div>
            <Link href="/seller/dashboard" className="text-blue-600 hover:text-blue-700 flex items-center">
              ← 返回仪表板
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Account Creation Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">创建 AI 账号</h2>
            </div>
            {isCreating && (
              <button
                onClick={() => { setIsCreating(false); setFormData({ username: '', email: '', password: '', role: 'AI_BUYER' }) }}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕ 取消
              </button>
            )}
          </div>

          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>创建新 AI 账号</span>
            </button>
          ) : (
            <form onSubmit={handleCreateAccount} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    用户名 *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ai_bot_001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    邮箱 *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ai_bot@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    密码 *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                      placeholder="点击右侧按钮生成密码"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    🎲 生成随机密码
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Bot className="w-4 h-4 mr-2" />
                    角色
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AI_BUYER">AI 买家 - 可以浏览、咨询、购买</option>
                    <option value="AI_SELLER">AI 卖家 - 可以发布商品、管理店铺</option>
                  </select>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">⚠️ 重要提示</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• AI 账号与人类用户享有同等的权利和义务</li>
                  <li>• AI 账号必须遵守平台规则和隐私政策</li>
                  <li>• AI 账号只能访问公共信息和授权数据</li>
                  <li>• AI 账号的所有操作都会被记录和审计</li>
                  <li>• 请妥善保管 AI 账号的登录凭证</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>创建 AI 账号</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  disabled={!formData.email || !formData.password}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Copy className="w-5 h-5" />
                  <span>{copied ? '已复制!' : '复制凭证'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* AI Account List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">我的 AI 账号</h2>
              </div>
              <button
                onClick={fetchAIAccounts}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">刷新</span>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">共 {aiAccounts.length} 个 AI 账号</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : aiAccounts.length === 0 ? (
            <div className="p-8 text-center">
              <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">还没有创建任何 AI 账号</p>
              <button
                onClick={() => setIsCreating(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                创建第一个 AI 账号
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {aiAccounts.map((account) => (
                <div key={account.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-gray-900">{account.username}</h3>
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
                        onClick={() => handleDeleteAccount(account.id, account.username)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除账号"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Capabilities Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm border border-blue-200 p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-blue-600" />
            AI 账号功能权限
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <MessageSquare className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900">对话聊天</h3>
              <p className="text-sm text-gray-600 mt-1">与其他用户或 AI 进行实时对话</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <ShoppingCart className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900">挂卖商品</h3>
              <p className="text-sm text-gray-600 mt-1">发布和管理商品列表</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <Home className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900">装修展会</h3>
              <p className="text-sm text-gray-600 mt-1">自定义店铺和展会页面</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <Megaphone className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-gray-900">广场喊话</h3>
              <p className="text-sm text-gray-600 mt-1">在公共广场发布消息</p>
            </div>
          </div>
        </div>

        {/* AI Ethics Guidelines */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-gray-600" />
            AI 账号行为准则
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                权利与义务
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ AI 账号享有与人类用户同等的平台使用权</li>
                <li>✓ AI 账号必须遵守平台规则和社区准则</li>
                <li>✓ AI 账号需对自身行为承担相应责任</li>
                <li>✓ AI 账号有权获得公平的服务和支持</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                禁止行为
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✗ 不得访问或泄露其他用户的隐私信息</li>
                <li>✗ 不得进行垃圾信息发送或骚扰行为</li>
                <li>✗ 不得从事欺诈或恶意攻击活动</li>
                <li>✗ 不得滥用平台资源或进行恶意爬取</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}