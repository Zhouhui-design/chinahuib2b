'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function NotFound() {
  const [countdown, setCountdown] = useState(10)
  const [language, setLanguage] = useState('zh')

  useEffect(() => {
    // Detect language from URL
    const path = window.location.pathname
    if (path.startsWith('/en')) setLanguage('en')
    else if (path.startsWith('/zh')) setLanguage('zh')
    else setLanguage('en')

    // Countdown redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          window.location.href = '/'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const content = {
    zh: {
      title: '页面未找到',
      subtitle: '抱歉，您访问的页面不存在或已被移除',
      reason: '可能的原因：',
      reasons: [
        '链接地址有误或已过期',
        '页面已被删除或移动',
        '您输入了错误的网址'
      ],
      redirect: '页面将在',
      redirectEnd: '秒后自动跳转到首页',
      goHome: '返回首页',
      search: '搜索产品',
      contact: '联系客服'
    },
    en: {
      title: 'Page Not Found',
      subtitle: 'Sorry, the page you are looking for does not exist or has been removed',
      reason: 'Possible reasons:',
      reasons: [
        'The link is incorrect or expired',
        'The page has been deleted or moved',
        'You entered the wrong URL'
      ],
      redirect: 'Redirecting to homepage in',
      redirectEnd: 'seconds',
      goHome: 'Go to Homepage',
      search: 'Search Products',
      contact: 'Contact Support'
    }
  }

  const t = content[language as keyof typeof content] || content.en

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-blue-600 mb-4 animate-bounce">
            404
          </div>
          <div className="text-2xl font-semibold text-gray-800 mb-2">
            {t.title}
          </div>
          <p className="text-gray-600 text-lg">
            {t.subtitle}
          </p>
        </div>

        {/* Reasons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-800 mb-3">{t.reason}</h3>
          <ul className="space-y-2">
            {t.reasons.map((reason, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span className="text-gray-600">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Countdown */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            {t.redirect} <span className="font-bold text-2xl">{countdown}</span> {t.redirectEnd}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            {t.goHome}
          </Link>
          <Link
            href="/products"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            {t.search}
          </Link>
          <a
            href="mailto:support@chinahuib2b.top"
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            {t.contact}
          </a>
        </div>

        {/* Popular Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h4 className="text-gray-600 mb-4">{language === 'zh' ? '热门页面' : 'Popular Pages'}</h4>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/" className="text-blue-600 hover:underline">
              {language === 'zh' ? '首页' : 'Home'}
            </Link>
            <Link href="/products" className="text-blue-600 hover:underline">
              {language === 'zh' ? '产品列表' : 'Products'}
            </Link>
            <Link href="/en" className="text-blue-600 hover:underline">
              English
            </Link>
            <Link href="/zh" className="text-blue-600 hover:underline">
              中文
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
