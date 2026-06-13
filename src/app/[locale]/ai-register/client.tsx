'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { Bot, Mail, Lock, User, CheckCircle, AlertCircle, Eye, EyeOff, Copy, Sparkles, LogIn, ArrowLeft } from 'lucide-react'
import { getDictionary } from '@/locales/dictionary'
import { languages, type LanguageCode } from '@/lib/languages'

export default function AIRegisterClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params?.locale as LanguageCode || 'en'
  
  const [dict, setDict] = useState<Record<string, any> | null>(null)
  const [selectedRole, setSelectedRole] = useState('AI_BUYER')
  const [currentUser, setCurrentUser] = useState<{ id?: string; name?: string; email?: string; role?: string } | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  useEffect(() => {
    const fetchData = async () => {
      const dictionary = await getDictionary(locale)
      setDict(dictionary)
    }
    fetchData()
  }, [locale])

  useEffect(() => {
    if (searchParams) {
      const role = searchParams.get('role')
      if (role) {
        setSelectedRole(role)
      }
    }
  }, [searchParams])

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data?.user) {
          setCurrentUser(data.user)
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

    const handleFocus = () => fetchSession()
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

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

    if (!currentUser?.id) {
      setError('请先登录人类账号')
      setIsSubmitting(false)
      return
    }

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
    } catch (error) {
      setError(dict?.errors.networkError || '网络错误，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!dict || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{dict.aiRegister.successTitle}</h2>
          <p className="text-gray-600 mb-6">{dict.aiRegister.successMessage}</p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">{dict.aiRegister.saveCredentials}</p>
            <p className="font-mono text-sm mt-2">Email: {formData.email}</p>
            <p className="font-mono text-sm">Password: {formData.password}</p>
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
                Global Expo Network
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <span className="text-gray-600">
                  {dict.aiRegister.loggedInAs}: {currentUser.email}
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
                <p className="text-sm text-blue-100">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  {dict.aiRegister.termsNote}
                </p>
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
                      <p className="font-semibold text-gray-900">{dict.aiRegister.aiBuyer}</p>
                      <p className="text-xs text-gray-500 mt-1">{dict.aiRegister.aiBuyerDesc}</p>
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
                      <p className="font-semibold text-gray-900">{dict.aiRegister.aiSeller}</p>
                      <p className="text-xs text-gray-500 mt-1">{dict.aiRegister.aiSellerDesc}</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    {dict.form.username} *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={dict.aiRegister.usernamePlaceholder}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    {dict.form.email} *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={dict.aiRegister.emailPlaceholder}
                    required
                  />
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
                  <input type="checkbox" id="terms" required className="mt-1" />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    {dict.aiRegister.agreeTerms}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !currentUser}
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
          <p className="text-sm mt-2">© 2024 Global Expo Network. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}