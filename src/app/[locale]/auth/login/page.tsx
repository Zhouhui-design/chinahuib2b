'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import { getDictionary } from '@/locales/dictionary'
import type { LanguageCode } from '@/lib/languages'

export default function LoginPage() {
  const params = useParams()
  const locale = params.locale as LanguageCode
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const registered = searchParams.get('registered')

  // Simple translations
  const t = {
    title: locale === 'zh' ? '登录您的账户' : 
           locale === 'ar' ? 'تسجيل الدخول إلى حسابك' :
           locale === 'es' ? 'Iniciar sesión en su cuenta' :
           locale === 'fr' ? 'Connectez-vous à votre compte' :
           locale === 'de' ? 'Melden Sie sich bei Ihrem Konto an' :
           locale === 'ja' ? 'アカウントにログイン' :
           locale === 'ko' ? '계정에 로그인' :
           locale === 'ru' ? 'Войдите в свой аккаунт' :
           locale === 'pt' ? 'Entre na sua conta' :
           locale === 'hi' ? 'अपने खाते में साइन इन करें' :
           locale === 'th' ? 'เข้าสู่ระบบบัญชีของคุณ' :
           locale === 'vi' ? 'Đăng nhập vào tài khoản của bạn' :
           'Sign in to your account',
    or: locale === 'zh' ? '或' : 'Or',
    createAccount: locale === 'zh' ? '创建新账户' : 'create a new account',
    email: locale === 'zh' ? '邮箱地址' : 'Email address',
    password: locale === 'zh' ? '密码' : 'Password',
    signIn: locale === 'zh' ? '登录' : 'Sign in',
    signingIn: locale === 'zh' ? '登录中...' : 'Signing in...',
    registrationSuccess: locale === 'zh' ? '注册成功！请登录。' : 'Registration successful! Please sign in.',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // Redirect to home page or callback URL
      const callbackUrl = searchParams.get('callbackUrl') || '/'
      router.push(callbackUrl)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
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
            {t.or}{' '}
            <Link href={`/${locale}/auth/register`} className="font-medium text-blue-600 hover:text-blue-500">
              {t.createAccount}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {registered && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {t.registrationSuccess}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">{t.email}</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t.email}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">{t.password}</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t.password}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? t.signingIn : t.signIn}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
