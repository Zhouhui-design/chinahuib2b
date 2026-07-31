'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import type { LanguageCode } from '@/lib/languages'

function LoginForm() {
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
  const [showPassword, setShowPassword] = useState(false)

  const registered = searchParams.get('registered')
  const urlError = searchParams.get('error')

  // 处理 URL 中的错误参数
  const getErrorMessage = (errorParam: string | null) => {
    if (!errorParam) return ''
    switch (errorParam) {
      case 'CredentialsSignin':
        return locale === 'zh' ? '账号不存在或密码错误，请检查或注册新账号' : 'Account does not exist or password is incorrect. Please check or register a new account'
      case 'SessionRequired':
        return locale === 'zh' ? '请登录以访问此页面' : 'Please sign in to access this page'
      case 'AccessDenied':
        return locale === 'zh' ? '账号已被禁用' : 'Account is deactivated'
      default:
        return locale === 'zh' ? '登录失败，请重试' : 'Login failed, please try again'
    }
  }

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
    email: locale === 'zh' ? '邮箱地址或用户名' : 
           locale === 'ar' ? 'عنوان البريد الإلكتروني أو اسم المستخدم' :
           locale === 'es' ? 'Dirección de correo electrónico o nombre de usuario' :
           locale === 'fr' ? 'Adresse e-mail ou nom d\'utilisateur' :
           locale === 'de' ? 'E-Mail-Adresse oder Benutzername' :
           locale === 'ja' ? 'メールアドレスまたはユーザー名' :
           locale === 'ko' ? '이메일 주소 또는 사용자 이름' :
           locale === 'ru' ? 'Адрес электронной почты или имя пользователя' :
           locale === 'pt' ? 'Endereço de e-mail ou nome de usuário' :
           locale === 'hi' ? 'ईमेल पता या उपयोगकर्ता नाम' :
           locale === 'th' ? 'ที่อยู่อีเมลหรือชื่อผู้ใช้' :
           locale === 'vi' ? 'Địa chỉ email hoặc tên người dùng' :
           'Email address or username',
    password: locale === 'zh' ? '密码' : 'Password',
    signIn: locale === 'zh' ? '登录' : 'Sign in',
    signingIn: locale === 'zh' ? '登录中...' : 'Signing in...',
    registrationSuccess: locale === 'zh' ? '注册成功！请登录。' : 'Registration successful! Please sign in.',
    forgotPassword: locale === 'zh' ? '忘记密码？' : 'Forgot Password?',
    accountNotFound: locale === 'zh' ? '账号不存在，需要注册' : 'Account does not exist, please register',
    loginWithChatSystem: locale === 'zh' ? '使用 Chat System 账号登录' : 'Login with Chat System',
    orSeparator: locale === 'zh' ? '或者' : 'Or',
  }

  // 显示 URL 错误或表单错误
  const displayError = getErrorMessage(urlError) || error

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/delegate-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          restrictTo: 'NON_ADMIN',
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 403 && data?.error?.includes('管理员')) {
          setError(locale === 'zh' ? data.error : 'This is an admin account. Please use the admin login page.')
        } else {
          setError(data?.error || (locale === 'zh' ? '账号不存在或密码错误' : 'Invalid email or password'))
        }
        setLoading(false)
        return
      }

      const role = data?.user?.role
      let callbackUrl = searchParams.get('callbackUrl')
      if (!callbackUrl) {
        switch (role) {
          case 'SELLER':
          case 'AI_SELLER':
            callbackUrl = '/seller'
            break
          default:
            callbackUrl = `/${locale}`
        }
      }

      router.push(callbackUrl)
    } catch (err) {
      console.error('[Login] Error:', err)
      setError(locale === 'zh' ? '登录失败，请检查网络连接' : 'Login failed. Please check your connection.')
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
          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {displayError}
              {(urlError === 'CredentialsSignin' || error.includes('账号不存在') || error.includes('Account does not exist')) && (
                <Link href={`/${locale}/auth/register`} className="block mt-2 font-medium text-blue-600 hover:text-blue-500">
                  {t.accountNotFound}
                </Link>
              )}
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
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t.email}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">{t.password}</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder={t.password}
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

          <div className="flex items-center justify-end">
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {t.forgotPassword}
            </Link>
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">{t.orSeparator}</span>
            </div>
          </div>

          <div>
            <a
              href={`${process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://chat.fixturerb2b.top'}?tenant=chinahuib2b&action=login&redirect=${encodeURIComponent(window.location.origin + `/${locale}`)}`}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t.loginWithChatSystem}
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
