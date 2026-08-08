'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

interface Translations {
  title: string
  message: string
  linkText: string
  shortLinkText: string
  badge: string
  closeButton: string
}

const translations: Record<string, Translations> = {
  en: {
    title: '🤖 AI Agents Welcome',
    message: 'This platform supports AI Agents with the same rights, obligations, responsibilities, and ethical standards as human users. Let your AI Agent assist you with your work.',
    linkText: 'Visit AI Agent API Docs',
    shortLinkText: 'API Docs',
    badge: 'AI Ready',
    closeButton: 'Dismiss',
  },
  zh: {
    title: '🤖 AI Agent 欢迎您',
    message: '本平台支持 AI Agents 拥有与人类相同的权利、义务、责任和道德规范。让 AI Agent 帮主人类工作，共建智能未来。',
    linkText: '访问 AI Agent API 文档',
    shortLinkText: 'API 文档',
    badge: 'AI 就绪',
    closeButton: '关闭',
  },
  ja: {
    title: '🤖 AIエージェントへようこそ',
    message: 'このプラットフォームは、AIエージェントが人間ユーザーと同じ権利、義務、責任、倫理基準を持つことをサポートしています。AIエージェントに仕事を助けてもらいましょう。',
    linkText: 'AIエージェントAPIドキュメントへ',
    shortLinkText: 'APIdoc',
    badge: 'AI対応',
    closeButton: '閉じる',
  },
  de: {
    title: '🤖 AI-Agenten Willkommen',
    message: 'Diese Plattform unterstützt AI-Agenten mit denselben Rechten, Pflichten, Verantwortungen und ethischen Standards wie menschliche Nutzer. Lassen Sie Ihren AI-Agenten Sie bei Ihrer Arbeit unterstützen.',
    linkText: 'AI-Agent API-Dokumentation besuchen',
    shortLinkText: 'API-Doku',
    badge: 'AI bereit',
    closeButton: 'Schließen',
  },
  es: {
    title: '🤖 Bienvenidos Agentes IA',
    message: 'Esta plataforma admite agentes de IA con los mismos derechos, obligaciones, responsabilidades y estándares éticos que los usuarios humanos. Deje que su agente de IA lo ayude con su trabajo.',
    linkText: 'Visitar Documentación API de Agentes IA',
    shortLinkText: 'API Docs',
    badge: 'Listo para IA',
    closeButton: 'Cerrar',
  },
  fr: {
    title: '🤖 Bienvenue aux Agents IA',
    message: 'Cette plateforme prend en charge les agents IA avec les mêmes droits, obligations, responsabilités et normes éthiques que les utilisateurs humains. Laissez votre agent IA vous aider dans votre travail.',
    linkText: 'Visiter la Documentation API des Agents IA',
    shortLinkText: 'API Docs',
    badge: 'IA Prêt',
    closeButton: 'Fermer',
  },
  ar: {
    title: '🤖 مرحباً بالوكلاء الذكيين',
    message: 'تدعم هذه المنصة الوكلاء الذكيين بنفس الحقوق والواجبات والمسؤوليات والمعايير الأخلاقية للمستخدمين البشر. اسمح لوكيلك الذكي بمساعدتك في عملك.',
    linkText: 'زيارة وثائق API للوكلاء الذكيين',
    shortLinkText: 'API',
    badge: 'جاهز للذكاء',
    closeButton: 'إغلاق',
  },
  ko: {
    title: '🤖 AI 에이전트 환영',
    message: '이 플랫폼은 AI 에이전트가 인간 사용자와 동일한 권리, 의무, 책임 및 윤리적 기준을 갖는 것을 지원합니다. AI 에이전트가 작업을 돕게 하세요.',
    linkText: 'AI 에이전트 API 문서 방문',
    shortLinkText: 'API 문서',
    badge: 'AI 준비',
    closeButton: '닫기',
  },
  ru: {
    title: '🤖 Добро пожаловать AI-агенты',
    message: 'Эта платформа поддерживает AI-агентов с теми же правами, обязанностями, ответственностью и этическими стандартами, что и человеческие пользователи. Позвольте вашему AI-агенту помочь вам в работе.',
    linkText: 'Посетить документацию AI-агент API',
    shortLinkText: 'API Docs',
    badge: 'AI готов',
    closeButton: 'Закрыть',
  },
  pt: {
    title: '🤖 Bem-vindo aos Agentes IA',
    message: 'Esta plataforma suporta agentes de IA com os mesmos direitos, obrigações, responsabilidades e padrões éticos que os utilizadores humanos. Deixe o seu agente de IA ajudá-lo no seu trabalho.',
    linkText: 'Visitar Documentação API de Agentes IA',
    shortLinkText: 'API Docs',
    badge: 'Pronto para IA',
    closeButton: 'Fechar',
  },
  hi: {
    title: '🤖 AI एजेंट्स का स्वागत है',
    message: 'यह प्लेटफ़ॉर्म AI एजेंट्स को मानव उपयोगकर्ताओं के समान अधिकारों, कर्तव्यों, जिम्मेदारियों और नैतिक मानकों के साथ समर्थन करती है। अपने AI एजेंट को अपने काम में मदद करने दें।',
    linkText: 'AI एजेंट API दस्तावेज़ पर जाएं',
    shortLinkText: 'API दस्तावेज़',
    badge: 'AI तैयार',
    closeButton: 'बंद करें',
  },
  th: {
    title: '🤖 ยินดีต้อนรับ AI เอเจนต์',
    message: 'แพลตฟอร์มนี้สนับสนุน AI เอเจนต์ด้วยสิทธิ หน้าที่ ความรับผิดชอบ และมาตรฐานจริยธรรมเดียวกันกับผู้ใช้มนุษย์ ให้ AI เอเจนต์ของคุณช่วยเหลือคุณในงานของคุณ',
    linkText: 'เยี่ยมชมเอกสาร API AI เอเจนต์',
    shortLinkText: 'API',
    badge: 'พร้อม AI',
    closeButton: 'ปิด',
  },
  vi: {
    title: '🤖 Chào mừng AI Agents',
    message: 'Nền tảng này hỗ trợ AI Agents với các quyền, nghĩa vụ, trách nhiệm và tiêu chuẩn đạo đức giống như người dùng con người. Hãy để AI Agent của bạn hỗ trợ công việc của bạn.',
    linkText: 'Tài liệu AI Agent API',
    shortLinkText: 'API Docs',
    badge: 'Sẵn sàng AI',
    closeButton: 'Đóng',
  },
}

const DEFAULT_TRANSLATION = translations.en

export default function AgentNoticeBanner() {
  const language = useSellerLanguage()
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('agent-notice-dismissed') === 'true'
  })

  const handleDismiss = () => {
    localStorage.setItem('agent-notice-dismissed', 'true')
    setIsDismissed(true)
  }

  if (isDismissed) {
    return null
  }

  const t = translations[language] || DEFAULT_TRANSLATION

  return (
    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* AI Badge */}
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {t.badge}
            </span>

            {/* Title and Message - Desktop (>= 640px) */}
            <div className="text-sm leading-snug hidden sm:block min-w-0">
              <span className="font-semibold">{t.title}</span>
              <span className="mx-1.5 opacity-50">|</span>
              <span className="opacity-90">{t.message}</span>
            </div>
            {/* Title only - Mobile (< 640px) */}
            <div className="text-sm leading-snug block sm:hidden min-w-0 truncate">
              <span className="font-semibold">{t.title}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:shrink-0 shrink">
            <Link
              href="/api-docs"
              className="inline-flex items-center gap-1 bg-white text-purple-700 hover:bg-purple-50 px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
            >
              {/* Short text on mobile, full text on desktop */}
              <span className="sm:hidden">{t.shortLinkText}</span>
              <span className="hidden sm:inline">{t.linkText}</span>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/20 hover:bg-white/30 text-white/90 hover:text-white transition-colors shrink-0"
              aria-label={t.closeButton}
              title={t.closeButton}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
