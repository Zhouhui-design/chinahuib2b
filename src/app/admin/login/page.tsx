'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react'

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    verificationCode: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [challengeId, setChallengeId] = useState('')
  const [emailMasked, setEmailMasked] = useState('')

  // 步骤1：验证账号密码，发送验证码
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 1,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '登录失败')
        setLoading(false)
        return
      }

      // 进入步骤2
      setChallengeId(data.challengeId)
      setEmailMasked(data.emailMasked || '')
      setStep(2)
      setLoading(false)
    } catch (err) {
      console.error('[AdminLogin] Error:', err)
      setError('网络错误，请检查连接')
      setLoading(false)
    }
  }

  // 步骤2：验证40位验证码
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.verificationCode.trim().length !== 40) {
      setError('验证码必须是40位字符')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 2,
          challengeId: challengeId,
          verificationCode: formData.verificationCode.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '验证失败')
        setLoading(false)
        return
      }

      // 登录成功，跳转
      const callbackUrl = searchParams.get('callbackUrl') || '/admin'
      router.push(callbackUrl)
    } catch (err) {
      console.error('[AdminLogin] Error:', err)
      setError('网络错误，请检查连接')
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep(1)
    setError('')
    setFormData({ ...formData, verificationCode: '' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            管理员登录
          </h2>

          {step === 1 && (
            <p className="mt-2 text-sm text-gray-600">
              请输入您的管理员账号信息
            </p>
          )}
          {step === 2 && (
            <p className="mt-2 text-sm text-gray-600">
              验证码已发送到 <span className="font-medium text-blue-600">{emailMasked}</span>
            </p>
          )}
        </div>

        {/* 步骤1：账号密码 */}
        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleStep1}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">邮箱地址</label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="邮箱地址"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">密码</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="密码"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? '发送验证码中...' : '登录并发送验证码'}
              </button>
            </div>
          </form>
        )}

        {/* 步骤2：输入40位验证码 */}
        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleStep2}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    请输入邮箱收到的40位验证码
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    验证码有效期为10分钟，请从邮箱复制后粘贴到下方
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="verificationCode" className="sr-only">40位验证码</label>
              <textarea
                id="verificationCode"
                name="verificationCode"
                required
                rows={3}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                placeholder="在此粘贴40位验证码..."
                value={formData.verificationCode}
                onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                style={{ fontFamily: 'monospace', fontSize: '14px', letterSpacing: '0.5px' }}
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {formData.verificationCode.trim().length} / 40 字符
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="flex items-center justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回
              </button>
              <button
                type="submit"
                disabled={loading || formData.verificationCode.trim().length !== 40}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? '验证中...' : '验证并登录'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  )
}
