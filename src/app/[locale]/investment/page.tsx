/**
 * Investment / Business Plans Page
 * 投资页面 - 商业计划书下载
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { loadTranslations } from '@/i18n/lazyTranslations'
import type { Language } from '@/i18n/translations'

export default function InvestmentPage() {
  const params = useParams()
  const locale = (params.locale as Language) || 'en'
  
  const [translations, setTranslations] = useState<typeof import('@/i18n/translations').translations['en'] | null>(null)
  const [loadingTranslations, setLoadingTranslations] = useState(true)

  useEffect(() => {
    const fetchTranslations = async () => {
      const dict = await loadTranslations(locale)
      setTranslations(dict)
      setLoadingTranslations(false)
    }
    fetchTranslations()
  }, [locale])

  if (loadingTranslations || !translations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  const t = translations.investment

  // Business plan files
  const businessPlans = [
    {
      name: t.chineseBusinessPlan,
      pdf: '/business-plans/X2XHUB_商业计划书_2026-06-06.pdf',
      html: '/business-plans/X2XHUB_商业计划书.html',
      language: 'zh',
    },
    {
      name: t.englishBusinessPlan,
      pdf: '/business-plans/X2XHUB_Business_Plan_EN.pdf',
      html: '/business-plans/X2XHUB_Business_Plan_EN.html',
      language: 'en',
    },
    {
      name: t.englishPitchDeck,
      pdf: '/business-plans/X2XHUB_Pitch_Deck.pdf',
      html: '/business-plans/X2XHUB_Pitch_Deck.html',
      language: 'en',
    },
    {
      name: t.chinesePitchDeck,
      pdf: '/business-plans/X2XHUB_中文路演稿.pdf',
      html: '/business-plans/X2XHUB_中文路演稿.html',
      language: 'zh',
    },
    {
      name: t.roadshow5Pages,
      pdf: '/business-plans/BP_路演5页.pdf',
      html: null,
      language: 'zh',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t.contactTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
              <div className="text-3xl">📱</div>
              <div>
                <p className="text-sm text-gray-500">{t.phoneLabel}</p>
                <p className="text-xl font-semibold text-gray-900">+86 18627407019</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
              <div className="text-3xl">📧</div>
              <div>
                <p className="text-sm text-gray-500">{t.emailLabel}</p>
                <p className="text-xl font-semibold text-gray-900">aardenx@outlook.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Plans */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {t.downloadTitle}
          </h2>
          <p className="text-gray-600 text-center mb-8">
            {t.downloadSubtitle}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessPlans.map((plan, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📄</span>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                </div>
                <div className="flex gap-3">
                  {plan.pdf && (
                    <a
                      href={plan.pdf}
                      download
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <span>📥</span>
                      PDF
                    </a>
                  )}
                  {plan.html && (
                    <a
                      href={plan.html}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <span>🌐</span>
                      HTML
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* More Languages Coming Soon */}
          <div className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t.moreLanguagesTitle}
            </h3>
            <p className="text-gray-600 mb-6">
              {t.moreLanguagesDesc}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['中文', 'English', '日本語', '한국어', 'Español', 'Français', 'Deutsch', 'العربية', 'Português', 'Русский', 'Italiano', 'Dutch', 'Turkish', 'Vietnamese', 'Thai', 'Indonesian', 'Malay', 'Hindi', 'Bengali', 'Swahili', 'Polish', 'Czech', 'Hungarian', 'Romanian', 'Greek', 'Hebrew', 'Persian', 'Urdu', 'Filipino', 'Norwegian'].map((lang, i) => (
                <span key={i} className="bg-white/80 px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-200">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link
            href={`/${locale}/marketplace`}
            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-2"
          >
            ← {t.backToMarketplace}
          </Link>
        </div>
      </div>
    </div>
  )
}