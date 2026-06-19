/**
 * Partner Recruitment Page
 * 招募合伙人页面
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { loadTranslations } from '@/i18n/lazyTranslations'
import type { Language } from '@/i18n/translations'

export default function PartnerRecruitmentPage() {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const t = translations.partnerRecruitment

  // Business plan files
  const businessPlans = [
    {
      name: 'X2XHUB Business Plan (Chinese)',
      pdf: '/business-plans/X2XHUB_商业计划书_2026-06-06.pdf',
      html: '/business-plans/X2XHUB_商业计划书.html',
      language: 'zh',
    },
    {
      name: 'X2XHUB Business Plan (English)',
      pdf: '/business-plans/X2XHUB_Business_Plan_EN.pdf',
      html: '/business-plans/X2XHUB_Business_Plan_EN.html',
      language: 'en',
    },
    {
      name: 'Pitch Deck (English)',
      pdf: '/business-plans/X2XHUB_Pitch_Deck.pdf',
      html: '/business-plans/X2XHUB_Pitch_Deck.html',
      language: 'en',
    },
    {
      name: 'Pitch Deck (Chinese)',
      pdf: '/business-plans/X2XHUB_中文路演稿.pdf',
      html: '/business-plans/X2XHUB_中文路演稿.html',
      language: 'zh',
    },
    {
      name: 'BP Roadshow 5 Pages',
      pdf: '/business-plans/BP_路演5页.pdf',
      html: null,
      language: 'zh',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/partner-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              {t.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              {t.subtitle}
            </p>
            <div className="inline-flex items-center gap-2 bg-yellow-500 text-black px-6 py-3 rounded-full font-semibold text-lg">
              <span>🌍</span>
              <span>{t.globalRecruitment}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Types Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          {t.partnerTypesTitle}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '👤', title: t.individual, desc: t.individualDesc },
            { icon: '🏢', title: t.company, desc: t.companyDesc },
            { icon: '💰', title: t.investor, desc: t.investorDesc },
            { icon: '🏛️', title: t.government, desc: t.governmentDesc },
          ].map((partner, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all">
              <div className="text-4xl mb-4">{partner.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{partner.title}</h3>
              <p className="text-gray-300">{partner.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Partnership Methods Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          {t.partnershipMethodsTitle}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💵</span>
              <h3 className="text-2xl font-bold text-white">{t.capitalPartnership}</h3>
            </div>
            <p className="text-gray-200 mb-4">{t.capitalPartnershipDesc}</p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {t.capitalBenefit1}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {t.capitalBenefit2}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {t.capitalBenefit3}
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🤝</span>
              <h3 className="text-2xl font-bold text-white">{t.operationPartnership}</h3>
            </div>
            <p className="text-gray-200 mb-4">{t.operationPartnershipDesc}</p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {t.operationBenefit1}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {t.operationBenefit2}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {t.operationBenefit3}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
            {t.contactTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-6">
              <div className="text-4xl">📱</div>
              <div>
                <p className="text-gray-400 mb-1">{t.phoneLabel}</p>
                <p className="text-2xl font-semibold text-white">+86 18627407019</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-6">
              <div className="text-4xl">📧</div>
              <div>
                <p className="text-gray-400 mb-1">{t.emailLabel}</p>
                <p className="text-2xl font-semibold text-white">aardenx@outlook.com</p>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-300 mb-4">{t.contactNote}</p>
          </div>
        </div>
      </div>

      {/* Business Plans Download Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          {t.businessPlansTitle}
        </h2>
        <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          {t.businessPlansDesc}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessPlans.map((plan, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📄</span>
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
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
        <div className="mt-12 text-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">
            {t.moreLanguagesTitle}
          </h3>
          <p className="text-gray-300 mb-6">
            {t.moreLanguagesDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['中文', 'English', '日本語', '한국어', 'Español', 'Français', 'Deutsch', 'العربية', 'Português', 'Русский', 'Italiano', 'Dutch', 'Turkish', 'Vietnamese', 'Thai', 'Indonesian', 'Malay', 'Hindi', 'Bengali', 'Swahili', 'Polish', 'Czech', 'Hungarian', 'Romanian', 'Greek', 'Hebrew', 'Persian', 'Urdu', 'Filipino', 'Norwegian'].map((lang, i) => (
              <span key={i} className="bg-white/10 px-3 py-1 rounded-full text-sm text-gray-300">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Link
            href={`/${locale}`}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {t.backToHome}
          </Link>
        </div>
      </div>
    </div>
  )
}