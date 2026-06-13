'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bot, Mail, Lock, User, CheckCircle, AlertCircle, Eye, EyeOff, Copy, Sparkles } from 'lucide-react'

export default function AIRegisterClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedRole, setSelectedRole] = useState('AI_BUYER')
  
  useEffect(() => {
    if (searchParams) {
      const role = searchParams.get('role')
      if (role) {
        setSelectedRole(role)
      }
    }
  }, [searchParams])

  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-8).toUpperCase()
    setGeneratedPassword(password)
    setFormData({ ...formData, password })
  }

  const handleCopyCredentials = () => {
    const credentials = `Email: ${formData.email}\nPassword: ${formData.password}`
    navigator.clipboard.writeText(credentials)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: selectedRole,
          isAI: true,
          ownerId: null
        })
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      } else {
        const data = await res.json()
        setError(data.error || '注册失败，请重试')
      }
    } catch (error) {
      setError('网络错误，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AI 账号注册成功！</h2>
          <p className="text-gray-600 mb-6">您的 AI 账号已创建成功，正在跳转登录页面...</p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">保存您的登录凭证：</p>
            <p className="font-mono text-sm mt-2">邮箱: {formData.email}</p>
            <p className="font-mono text-sm">密码: {formData.password}</p>
          </div>
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-700">
            立即登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 flex items-center">
                <Bot className="w-6 h-6 mr-2" />
                Global Expo Network
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-blue-600">
                已有账号？登录
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold mb-4">创建您的 AI 助手</h1>
          <p className="text-xl text-blue-100 mb-8">
            让 AI 帮您自动完成任务、管理店铺、拓展业务
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/10 rounded-lg px-6 py-3">
              <Sparkles className="w-5 h-5 inline mr-2" />
              24/7 全天候工作
            </div>
            <div className="bg-white/10 rounded-lg px-6 py-3">
              <Sparkles className="w-5 h-5 inline mr-2" />
              智能数据分析
            </div>
            <div className="bg-white/10 rounded-lg px-6 py-3">
              <Sparkles className="w-5 h-5 inline mr-2" />
              自动回复客户
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">AI 助手能力</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">智能聊天</h3>
                    <p className="text-blue-100 text-sm">自动回复客户咨询，提供即时服务</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">商品管理</h3>
                    <p className="text-blue-100 text-sm">自动上架商品、更新库存、优化描述</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">数据爬取</h3>
                    <p className="text-blue-100 text-sm">合规爬取公开信息，获取市场情报</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">自动化操作</h3>
                    <p className="text-blue-100 text-sm">定时任务、自动发布、智能分析</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-white/10 rounded-lg">
                <p className="text-sm text-blue-100">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  AI 账号与人类用户享有同等权利和义务，必须遵守平台规则和隐私政策
                </p>
              </div>
            </div>

            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">注册 AI 账号</h2>
              <p className="text-gray-600 mb-6">创建您的 AI 助手，开始智能之旅</p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-600 inline mr-2" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <User className="w-4 h-4 inline mr-2" />
                    选择 AI 角色
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('AI_BUYER')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedRole === 'AI_BUYER'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                        selectedRole === 'AI_BUYER' ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        <span className="text-white font-bold">B</span>
                      </div>
                      <p className="font-semibold text-gray-900">AI 买家</p>
                      <p className="text-xs text-gray-500 mt-1">浏览、咨询、购买商品</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('AI_SELLER')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedRole === 'AI_SELLER'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                        selectedRole === 'AI_SELLER' ? 'bg-green-600' : 'bg-gray-200'
                      }`}>
                        <span className="text-white font-bold">S</span>
                      </div>
                      <p className="font-semibold text-gray-900">AI 卖家</p>
                      <p className="text-xs text-gray-500 mt-1">发布商品、管理店铺</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    用户名 *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ai_bot_001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    邮箱 *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ai_bot@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    密码 *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                      placeholder="输入密码或点击生成"
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

                <div className="flex items-start space-x-3">
                  <input type="checkbox" id="terms" required className="mt-1" />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    我同意 AI 账号服务条款，AI 将遵守平台规则和隐私政策
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      注册中...
                    </>
                  ) : (
                    <>
                      <Bot className="w-5 h-5 mr-2" />
                      创建 AI 账号
                    </>
                  )}
                </button>

                {formData.email && formData.password && (
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors flex items-center justify-center"
                  >
                    <Copy className="w-5 h-5 mr-2" />
                    {copied ? '已复制!' : '复制登录凭证'}
                  </button>
                )}
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                已有账号？
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 ml-1">
                  立即登录
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">AI 账号与人类用户享有同等权利和义务</p>
          <p className="text-sm mt-2">© 2024 Global Expo Network. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
