'use client'

import { useState, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import type { LanguageCode } from '@/lib/languages'

function ForgotPasswordForm() {
  const params = useParams()
  const locale = params.locale as LanguageCode
  const router = useRouter()
  const [formData, setFormData] = useState({
    identifier: '',
    type: 'email' as 'email' | 'phone'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const t = {
    title: locale === 'zh' ? '忘记密码' : 
           locale === 'ar' ? 'نسيت كلمة المرور' :
           locale === 'es' ? 'Olvidé mi contraseña' :
           locale === 'fr' ? 'Mot de passe oublié' :
           locale === 'de' ? 'Passwort vergessen' :
           locale === 'ja' ? 'パスワードを忘れた' :
           locale === 'ko' ? '비밀번호 찾기' :
           locale === 'ru' ? 'Забыли пароль' :
           locale === 'pt' ? 'Esqueci minha senha' :
           locale === 'hi' ? 'मेरा पासवर्ड भूल गया' :
           locale === 'th' ? 'ลืมรหัสผ่าน' :
           locale === 'vi' ? 'Quên mật khẩu' :
           'Forgot Password',
    subtitle: locale === 'zh' ? '输入您的邮箱或手机号，我们将向您发送重置链接' : 
               locale === 'ja' ? 'メールアドレスまたは電話番号を入力してください' :
               'Enter your email or phone number and we will send you a reset link',
    email: locale === 'zh' ? '邮箱地址' : 'Email address',
    phone: locale === 'zh' ? '手机号码' : 'Phone number',
    sendResetLink: locale === 'zh' ? '发送重置链接' : 'Send Reset Link',
    sending: locale === 'zh' ? '发送中...' : 'Sending...',
    backToLogin: locale === 'zh' ? '返回登录' : 'Back to Login',
    successMessage: locale === 'zh' ? '如果账户存在，您将收到密码重置链接' : 'If an account exists, you will receive a password reset link'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const result = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await result.json()

      if (!result.ok) {
        throw new Error(data.error)
      }

      setSuccess(data.message)
      
      // For demo purposes, show the reset link
      if (data.demoResetLink) {
        setTimeout(() => {
          router.push(data.demoResetLink)
        }, 2000)
      }
    } catch (err) {
      setError((err as Error).message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t.subtitle}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="email"
                    checked={formData.type === 'email'}
                    onChange={(e) => setFormData({ ...formData, type: 'email', identifier: '' })}
                    className="mr-2"
                  />
                  {t.email}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="phone"
                    checked={formData.type === 'phone'}
                    onChange={(e) => setFormData({ ...formData, type: 'phone', identifier: '' })}
                    className="mr-2"
                  />
                  {t.phone}
                </label>
              </div>
              <input
                type={formData.type === 'email' ? 'email' : 'tel'}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={formData.type === 'email' ? t.email : t.phone}
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? t.sending : t.sendResetLink}
            </button>
            <Link
              href={`/${locale}/auth/login`}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {t.backToLogin}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  )
}