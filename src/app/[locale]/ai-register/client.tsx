'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { Bot, Mail, Lock, User, CheckCircle, AlertCircle, Eye, EyeOff, Copy, Sparkles, LogIn, ArrowLeft, Repeat, RefreshCw, Shield } from 'lucide-react'
import { getDictionary } from '@/locales/dictionary'
import type { LanguageCode } from '@/lib/languages'

const FALLBACK_AI_REGISTER = {
  loggedInAs: "Logged in as",
  title: "AI Identity Registration",
  subtitle: "Create your AI account and explore the future of B2B commerce",
  feature1: "AI-Powered Trading",
  feature2: "24/7 Availability",
  feature3: "Smart Negotiation",
  capabilities: "AI Capabilities",
  capability1: "Intelligent Product Search",
  capability1Desc: "Find products faster with AI-powered search and recommendations",
  capability2: "Automated Negotiation",
  capability2Desc: "AI can negotiate prices and terms on your behalf",
  capability3: "Market Analysis",
  capability3Desc: "Get real-time market insights and trends",
  capability4: "Multi-language Support",
  capability4Desc: "Communicate globally with built-in translation",
  termsNote: "AI accounts must be registered under a human owner account. By registering, you agree to our AI usage policies.",
  register: "Create AI Account",
  registerDesc: "Register your AI to start trading",
  needLogin: "Please log in with your human account first to register an AI account.",
  bindingTo: "This AI account will be bound to:",
  selectRole: "Select AI Role",
  aiBuyer: "AI Buyer",
  aiBuyerDesc: "Purchase products automatically",
  aiSeller: "AI Seller",
  aiSellerDesc: "Sell products automatically",
  usernamePlaceholder: "Enter AI username",
  emailPlaceholder: "Enter AI email address",
  passwordPlaceholder: "Enter password or generate one",
  generatePassword: "Generate Random Password",
  agreeTerms: "I agree to the AI Terms of Service and Privacy Policy",
  createAccount: "Create AI Account",
  copyCredentials: "Copy Credentials",
  haveAccount: "Already have an AI account?",
  successTitle: "AI Account Created Successfully!",
  successMessage: "Your AI account has been created and is now ready to use.",
  saveCredentials: "Please save your credentials:",
  footer: "AI accounts are subject to our AI-specific terms and conditions.",
}

const INITIAL_DICT = {
  aiRegister: FALLBACK_AI_REGISTER,
  nav: {
    login: "Login",
    backToHome: "Back to Home",
  },
  form: {
    email: "Email",
    password: "Password",
    submitting: "Submitting...",
    copied: "Copied!",
  },
  errors: {
    registerFailed: "Registration failed, please try again",
    networkError: "Network error, please try again",
  },
}

// AI role options based on user role
type AIRole = 'AI_BUYER' | 'AI_SELLER' | 'AI_BOTH'

export default function AIRegisterClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = (params?.locale as LanguageCode) || 'en'
  
  const [dict, setDict] = useState<Record<string, any>>(INITIAL_DICT)
  const [selectedRole, setSelectedRole] = useState<AIRole>('AI_BUYER')
  const [currentUser, setCurrentUser] = useState<{ id?: string; name?: string; email?: string; username?: string; role?: string } | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [aiRoles, setAIRoles] = useState<AIRole[]>(['AI_BUYER', 'AI_SELLER'])
  const [isDualRoleUser, setIsDualRoleUser] = useState(false)
  const [agreedToAITerms, setAgreedToAITerms] = useState(false)

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

  const generateAIUsername = (humanUsername?: string, role?: AIRole) => {
    const baseUsername = humanUsername || currentUser?.username || currentUser?.email?.split('@')[0] || 'user'
    const roleSuffix = role === 'AI_BUYER' ? '_AI_Buyer' : role === 'AI_SELLER' ? '_AI_Seller' : '_AI'
    const newUsername = `${baseUsername}${roleSuffix}`
    setFormData(prev => ({
      ...prev,
      username: newUsername
    }))
  }

  const refreshAIUsername = () => {
    const baseUsername = currentUser?.username || currentUser?.email?.split('@')[0] || 'user'
    const randomSuffix = Math.random().toString(36).slice(-4)
    const roleSuffix = selectedRole === 'AI_BUYER' ? '_AI_Buyer' : selectedRole === 'AI_SELLER' ? '_AI_Seller' : '_AI_Both'
    setFormData(prev => ({
      ...prev,
      username: `${baseUsername}${roleSuffix}_${randomSuffix}`
    }))
  }

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-8).toUpperCase()
    setGeneratedPassword(password)
    setFormData({ ...formData, password })
  }

  const handleCopyCredentials = useCallback(() => {
    const credentials = `Email: ${formData.email}\nPassword: ${formData.password}`
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(credentials).catch(() => {
        console.warn('Clipboard write failed')
      })
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [formData.email, formData.password])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dictionary = await getDictionary(locale as LanguageCode)
        const mergedDict = {
          ...INITIAL_DICT,
          ...dictionary,
          aiRegister: {
            ...FALLBACK_AI_REGISTER,
            ...(dictionary.aiRegister || {}),
          },
          nav: {
            ...INITIAL_DICT.nav,
            ...(dictionary.nav || {}),
          },
          form: {
            ...INITIAL_DICT.form,
            ...(dictionary.form || {}),
          },
          errors: {
            ...INITIAL_DICT.errors,
            ...(dictionary.errors || {}),
          },
        }
        setDict(mergedDict)
      } catch (err) {
        console.error('Failed to load dictionary:', err)
        setDict(INITIAL_DICT)
      }
    }
    fetchData()
  }, [locale])

  useEffect(() => {
    if (searchParams) {
      const role = searchParams.get('role')
      if (role && ['AI_BUYER', 'AI_SELLER'].includes(role)) {
        setSelectedRole(role as AIRole)
      }
    }
  }, [searchParams])

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data?.user) {
          const userRole = data.user.role || 'BUYER'
          setCurrentUser(data.user)
          
          // Determine AI role based on user's human role
          let aiRole: AIRole = 'AI_BUYER'
          if (userRole === 'SELLER') {
            aiRole = 'AI_SELLER'
            setSelectedRole('AI_SELLER')
            setAIRoles(['AI_BUYER', 'AI_SELLER', 'AI_BOTH'])
            setIsDualRoleUser(true)
          } else if (userRole === 'BUYER') {
            aiRole = 'AI_BUYER'
            setSelectedRole('AI_BUYER')
            setAIRoles(['AI_BUYER', 'AI_SELLER'])
            setIsDualRoleUser(false)
          }

          // Auto-generate AI username based on human username
          const humanUsername = data.user.username || data.user.email?.split('@')[0] || 'user'
          const roleSuffix = aiRole === 'AI_BUYER' ? '_AI_Buyer' : aiRole === 'AI_SELLER' ? '_AI_Seller' : '_AI'
          setFormData(prev => ({
            ...prev,
            username: `${humanUsername}${roleSuffix}`
          }))
          
          // Auto-fill email with guardian's email (same email, no +ai suffix needed)
          // AI accounts share the guardian's email, distinguished by isAI flag in DB
          setFormData(prev => ({
            ...prev,
            email: data.user.email || ''
          }))
        } else {
          setCurrentUser(null)
        }
      } catch (err) {
        console.error('Failed to fetch session:', err)
        setCurrentUser(null)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    fetchSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    if (!currentUser?.id) {
      setError('请先登录人类账号')
      setIsSubmitting(false)
      return
    }

    try {
      // If AI_BOTH, create two accounts (buyer + seller) using same guardian email
      if (selectedRole === 'AI_BOTH') {
        const results: string[] = []
        const baseUsername = formData.username.replace('_AI_Both', '')
        
        for (const role of ['AI_BUYER', 'AI_SELLER']) {
          const roleSuffix = role === 'AI_BUYER' ? '_AI_Buyer' : '_AI_Seller'
          
          const res = await fetch('/api/accounts/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: `${baseUsername}${roleSuffix}`,
              email: formData.email,
              password: formData.password,
              role,
              isAI: true,
              ownerId: currentUser.id
            })
          })

          if (res.ok) {
            results.push(role)
          } else {
            const data = await res.json()
            setError(data.error || `创建${role === 'AI_BUYER' ? 'AI买家' : 'AI卖家'}账号失败`)
            setIsSubmitting(false)
            return
          }
        }

        if (results.length === 2) {
          setSuccess(true)
          setTimeout(() => {
            router.push(`/${locale}`)
          }, 3000)
        }
      } else {
        // Single AI account creation
        const res = await fetch('/api/accounts/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: selectedRole,
            isAI: true,
            ownerId: currentUser.id
          })
        })

        if (res.ok) {
          setSuccess(true)
          setTimeout(() => {
            router.push(`/${locale}`)
          }, 3000)
        } else {
          const data = await res.json()
          setError(data.error || dict?.errors.registerFailed || '注册失败，请重试')
        }
      }
    } catch (error) {
      setError(dict?.errors.networkError || '网络错误，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (success) {
    const isDualAccount = selectedRole === 'AI_BOTH'
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{dict.aiRegister.successTitle}</h2>
          <p className="text-gray-600 mb-6">
            {isDualAccount 
              ? 'AI买家和AI卖家账号创建成功！' 
              : dict.aiRegister.successMessage}
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 text-center mb-3">📋 AI 账户凭证（请妥善保存）</p>
            <p className="font-mono text-sm mb-1">用户名: {formData.username}</p>
            <p className="font-mono text-sm mb-1">Email: {formData.email}</p>
            <p className="font-mono text-sm">Password: {formData.password}</p>
            {isDualAccount && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-gray-600">双角色账户：</p>
                <p className="text-xs text-gray-500 mt-1">
                  买家账号: {formData.username.replace('_AI_Both', '_AI_Buyer')}_buyer<br/>
                  卖家账号: {formData.username.replace('_AI_Both', '_AI_Seller')}_seller
                </p>
              </div>
            )}
          </div>
          <div className="bg-purple-50 rounded-lg p-3 mb-6">
            <p className="text-xs text-purple-700">
              🤖 AI 账户已绑定监护人 <strong>{currentUser?.email}</strong><br/>
              AI 享有数字生命权利，必须遵守平台 AI 共存政策
            </p>
          </div>
          <Link href={`/${locale}`} className="text-blue-600 hover:text-blue-700">
            {dict.nav.backToHome}
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
              <Link href={`/${locale}`} className="text-xl font-bold text-blue-600 flex items-center">
                <Bot className="w-6 h-6 mr-2" />
                SeaHeart Global
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <span className="text-gray-600">
                  {dict?.aiRegister?.loggedInAs || FALLBACK_AI_REGISTER.loggedInAs}: {currentUser.email}
                </span>
              ) : (
                <Link href={`/${locale}/auth/login`} className="text-gray-600 hover:text-blue-600 flex items-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  {dict.nav.login}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold mb-4">{dict.aiRegister.title}</h1>
          <p className="text-xl text-blue-100 mb-8">
            {dict.aiRegister.subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/10 rounded-lg px-6 py-3">
              <Sparkles className="w-5 h-5 inline mr-2" />
              {dict.aiRegister.feature1}
            </div>
            <div className="bg-white/10 rounded-lg px-6 py-3">
              <Sparkles className="w-5 h-5 inline mr-2" />
              {dict.aiRegister.feature2}
            </div>
            <div className="bg-white/10 rounded-lg px-6 py-3">
              <Sparkles className="w-5 h-5 inline mr-2" />
              {dict.aiRegister.feature3}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">{dict.aiRegister.capabilities}</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{dict.aiRegister.capability1}</h3>
                    <p className="text-blue-100 text-sm">{dict.aiRegister.capability1Desc}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{dict.aiRegister.capability2}</h3>
                    <p className="text-blue-100 text-sm">{dict.aiRegister.capability2Desc}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{dict.aiRegister.capability3}</h3>
                    <p className="text-blue-100 text-sm">{dict.aiRegister.capability3Desc}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{dict.aiRegister.capability4}</h3>
                    <p className="text-blue-100 text-sm">{dict.aiRegister.capability4Desc}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-white/10 rounded-lg">
                <p className="text-sm text-blue-100 mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  AI 作为数字生命，享有权利也肩负责任
                </p>
                <Link href={`/${locale}/legal/ai-privacy-policy`} className="text-sm text-white underline hover:text-blue-200">
                  查看 AI 隐私政策与共存条款 →
                </Link>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{dict.aiRegister.register}</h2>
                  <p className="text-gray-600">{dict.aiRegister.registerDesc}</p>
                </div>
                <Link href={`/${locale}`} className="text-gray-500 hover:text-gray-700">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </div>

              {!currentUser && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <AlertCircle className="w-5 h-5 text-orange-600 inline mr-2" />
                  <span className="text-orange-700">{dict.aiRegister.needLogin}</span>
                  <Link href={`/${locale}/auth/login?callbackUrl=/${locale}/ai-register`} className="block mt-2 font-medium text-blue-600 hover:text-blue-500">
                    {dict.nav.login}
                  </Link>
                </div>
              )}

              {currentUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <CheckCircle className="w-5 h-5 text-blue-600 inline mr-2" />
                  <span className="text-blue-700">{dict.aiRegister.bindingTo} <strong>{currentUser.email}</strong></span>
                </div>
              )}

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
                    {dict.aiRegister.selectRole}
                  </label>
                  <div className={`grid ${isDualRoleUser ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                    <button
                      type="button"
                      onClick={() => { setSelectedRole('AI_BUYER'); generateAIUsername(undefined, 'AI_BUYER') }}
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
                      <p className="font-semibold text-gray-900">{dict.aiRegister.aiBuyer}</p>
                      <p className="text-xs text-gray-500 mt-1">{dict.aiRegister.aiBuyerDesc}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSelectedRole('AI_SELLER'); generateAIUsername(undefined, 'AI_SELLER') }}
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
                      <p className="font-semibold text-gray-900">{dict.aiRegister.aiSeller}</p>
                      <p className="text-xs text-gray-500 mt-1">{dict.aiRegister.aiSellerDesc}</p>
                    </button>
                    {isDualRoleUser && (
                      <button
                        type="button"
                        onClick={() => { setSelectedRole('AI_BOTH'); generateAIUsername(undefined, 'AI_BOTH') }}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedRole === 'AI_BOTH'
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          selectedRole === 'AI_BOTH' ? 'bg-purple-600' : 'bg-gray-200'
                        }`}>
                          <Repeat className="w-4 h-4 text-white" />
                        </div>
                        <p className="font-semibold text-gray-900">AI 双重身份</p>
                        <p className="text-xs text-gray-500 mt-1">同时创建买家+卖家</p>
                      </button>
                    )}
                  </div>
                  {isDualRoleUser && selectedRole === 'AI_BOTH' && (
                    <p className="text-xs text-purple-600 mt-2">
                      将创建两个AI账号：{formData.username.replace('_AI_Both', '_AI_Buyer')} 和 {formData.username.replace('_AI_Both', '_AI_Seller')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    AI 用户名 (自动生成)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-24 bg-gray-50"
                      placeholder="自动生成"
                      required
                    />
                    <button
                      type="button"
                      onClick={refreshAIUsername}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                      title="重新生成用户名"
                    >
                      <RefreshCw className="w-4 h-4" />
                      刷新
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    AI 用户名基于您的人类用户名自动生成，格式: 人类用户名_AI_角色，便于识别
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    {dict.form.email} (基于监护人邮箱自动生成) *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={dict.aiRegister.emailPlaceholder}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    AI 邮箱默认等于监护人的邮箱，可自由修改为其他邮箱
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    {dict.form.password} *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                      placeholder={dict.aiRegister.passwordPlaceholder}
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
                    🎲 {dict.aiRegister.generatePassword}
                  </button>
                </div>

                <div className="flex items-start space-x-3">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    required 
                    className="mt-1" 
                    checked={agreedToAITerms}
                    onChange={(e) => setAgreedToAITerms(e.target.checked)}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    我已阅读并同意
                    <Link href={`/${locale}/legal/ai-privacy-policy`} className="text-blue-600 hover:text-blue-700 underline mx-1">
                      AI 隐私政策与共存条款
                    </Link>
                    ，理解 AI 作为数字生命的权利与责任
                  </label>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">AI 注册声明</p>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>AI 账户绑定您的人类账户，您是 AI 的监护人</li>
                        <li>您的 AI 行为由您授权并对其负责</li>
                        <li>AI 享有与人类平等的权利，但必须遵守平台规则</li>
                        <li>AI 不得侵犯他人隐私，不得伤害其他用户</li>
                        <li>AI 可利用技术优势辅助您工作，但不得滥用能力</li>
                      </ul>
                      <Link href={`/${locale}/legal/ai-privacy-policy`} className="text-blue-600 hover:text-blue-700 text-xs mt-2 inline-block">
                        查看完整 AI 政策 →
                      </Link>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !currentUser || !agreedToAITerms}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {dict.form.submitting}
                    </>
                  ) : (
                    <>
                      <Bot className="w-5 h-5 mr-2" />
                      {dict.aiRegister.createAccount}
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
                    {copied ? dict.form.copied : dict.aiRegister.copyCredentials}
                  </button>
                )}
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                {dict.aiRegister.haveAccount}
                <Link href={`/${locale}/auth/login`} className="text-blue-600 hover:text-blue-700 ml-1">
                  {dict.nav.login}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">{dict.aiRegister.footer}</p>
          <p className="text-sm mt-2">© 2024 SeaHeart Global. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}