'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import type { LanguageCode } from '@/lib/languages'

function ResetPasswordForm() {
  const params = useParams()
  const locale = params.locale as LanguageCode
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  const t = {
    title: locale === 'zh' ? '重置密码' : 
           locale === 'ar' ? 'إعادة تعيين كلمة المرور' :
           locale === 'es' ? 'Restablecer contraseña' :
           locale === 'fr' ? 'Réinitialiser le mot de passe' :
           locale === 'de' ? 'Passwort zurücksetzen' :
           locale === 'ja' ? 'パスワードをリセット' :
           locale === 'ko' ? '비밀번호 재설정' :
           locale === 'ru' ? 'Сброс пароля' :
           locale === 'pt' ? 'Redefinir senha' :
           locale === 'hi' ? 'पासवर्ड रीसेट करें' :
           locale === 'th' ? 'รีเซ็ตรหัสผ่าน' :
           locale === 'vi' ? 'Đặt lại mật khẩu' :
           'Reset Password',
    subtitle: locale === 'zh' ? '请输入您的新密码' : 
               locale === 'ja' ? '新しいパスワードを入力してください' :
               'Please enter your new password',
    newPassword: locale === 'zh' ? '新密码' : 'New Password',
    confirmPassword: locale === 'zh' ? '确认密码' : 'Confirm Password',
    resetPassword: locale === 'zh' ? '重置密码' : 'Reset Password',
    resetting: locale === 'zh' ? '重置中...' : 'Resetting...',
    backToLogin: locale === 'zh' ? '返回登录' : 'Back to Login',
    passwordMismatch: locale === 'zh' ? '两次输入的密码不一致' : 'Passwords do not match',
    passwordTooShort: locale === 'zh' ? '密码至少需要8个字符' : 'Password must be at least 8 characters',
    invalidToken: locale === 'zh' ? '无效或已过期的重置链接' : 'Invalid or expired reset link',
    successMessage: locale === 'zh' ? '密码重置成功！正在跳转到登录页面...' : 'Password reset successfully! Redirecting to login...'
  }

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
    } else {
      setTokenValid(true)
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError(t.passwordMismatch)
      return
    }

    if (formData.password.length < 8) {
      setError(t.passwordTooShort)
      return
    }

    setLoading(true)

    try {
      const result = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password: formData.password })
      })

      const data = await result.json()

      if (!result.ok) {
        throw new Error(data.error)
      }

      setSuccess(t.successMessage)

      setTimeout(() => {
        router.push(`/${locale}/auth/login`)
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {t.invalidToken}
          </div>
          <Link
            href={`/${locale}/auth/login`}
            className="group inline-flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            {t.backToLogin}
          </Link>
        </div>
      </div>
    )
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
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">{t.newPassword}</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t.newPassword}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">{t.confirmPassword}</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t.confirmPassword}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? t.resetting : t.resetPassword}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}