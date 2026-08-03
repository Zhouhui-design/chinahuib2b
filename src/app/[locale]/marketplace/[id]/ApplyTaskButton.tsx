/**
 * ApplyTaskButton — 任务详情页"申请任务"按钮
 *
 * 行为：
 * - 任务发布者本人：不显示按钮（自己不申请自己的任务）
 * - 已登录用户：点击后打开 ChatWidget 与发布者在线沟通
 * - 未登录访客：点击后弹出登录提示对话框，说明在线沟通需登录，
 *   同时展示联系方式（邮箱/电话）供访客直接联系作者
 *
 * 使用 useSession() 实时检测客户端登录状态，
 * 避免登录跳转回来后 useSession 尚未解析完成导致的状态不一致问题。
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MessageCircle, X, LogIn, Mail, Phone, AlertCircle, Loader2 } from 'lucide-react'
import ChatWidget from '@/components/chat/ChatWidget'

interface ApplyTaskButtonProps {
  /** 任务发布者的用户 ID（用于 ChatWidget 的 sellerId） */
  postedById: string
  /** 服务端判断的当前用户登录状态（作为初始值） */
  isLoggedIn: boolean
  /** 任务联系方式信息（可含邮箱、电话等） */
  contactInfo?: string | null
  /** 当前语言 */
  locale: string
}

export default function ApplyTaskButton({
  postedById,
  isLoggedIn: serverIsLoggedIn,
  contactInfo,
  locale,
}: ApplyTaskButtonProps) {
  const router = useRouter()
  // 客户端实时会话状态（优先级高于服务端 prop）
  const { data: session, status: sessionStatus } = useSession()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [chatOpenSignal, setChatOpenSignal] = useState(0)

  // 结合客户端和服务端的登录状态判断
  // - 如果客户端会话已解析完成，以客户端为准
  // - 如果客户端还在加载，使用服务端传递的初始值
  const isClientLoggedIn = sessionStatus === 'authenticated'
  const isClientLoading = sessionStatus === 'loading'
  const isLoggedIn = isClientLoading ? serverIsLoggedIn : isClientLoggedIn
  const isAuthReady = !isClientLoading

  // 多语言文案
  const t = {
    applyTask: locale === 'zh' ? '申请任务' : locale === 'de' ? 'Aufgabe beantragen' : locale === 'ar' ? 'التقدم للمهمة' : 'Apply for Task',
    chatWithAuthor: locale === 'zh' ? '与发布者在线沟通' : locale === 'de' ? 'Mit dem Autor chatten' : locale === 'ar' ? 'الدردشة مع الناشر' : 'Chat with Publisher',
    // 未登录提示对话框
    loginRequiredTitle: locale === 'zh' ? '请先登录' : locale === 'de' ? 'Bitte zuerst anmelden' : locale === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please Log In First',
    loginRequiredDesc: locale === 'zh'
      ? '在线沟通需要登录。作者可能不在线，登录后您可以收到作者回复的消息通知；若您暂时不想登录，也可以通过下方的联系方式直接给作者发邮件或打电话。'
      : locale === 'de'
      ? 'Für die Online-Kommunikation ist eine Anmeldung erforderlich. Der Autor ist möglicherweise nicht online — nach der Anmeldung erhalten Sie Benachrichtigungen, wenn der Autor antwortet. Wenn Sie sich vorerst nicht anmelden möchten, können Sie den Autor auch direkt per E-Mail oder Telefon über die unten stehenden Kontaktdaten erreichen.'
      : locale === 'ar'
      ? 'تتطلب الدردشة عبر الإنترنت تسجيل الدخول. قد لا يكون الناشر متصلاً — بعد تسجيل الدخول، ستتلقى إشعارات عندما يرد الناشر. إذا كنت لا ترغب في تسجيل الدخول الآن، يمكنك أيضاً التواصل مع الناشر مباشرة عبر البريد الإلكتروني أو الهاتف باستخدام معلومات الاتصال أدناه.'
      : 'Online chat requires login. The author may be offline — logging in ensures you receive notifications when they reply. If you prefer not to log in right now, you can also contact the author directly via email or phone using the contact info below.',
    loginNow: locale === 'zh' ? '立即登录' : locale === 'de' ? 'Jetzt anmelden' : locale === 'ar' ? 'تسجيل الدخول الآن' : 'Log In Now',
    contactDirectly: locale === 'zh' ? '或直接联系作者' : locale === 'de' ? 'Oder direkt kontaktieren' : locale === 'ar' ? 'أو تواصل مباشرة' : 'Or Contact Directly',
    cancel: locale === 'zh' ? '关闭' : locale === 'de' ? 'Schließen' : locale === 'ar' ? 'إغلاق' : 'Close',
    noContactInfo: locale === 'zh' ? '作者未公开联系方式' : locale === 'de' ? 'Keine Kontaktdaten verfügbar' : locale === 'ar' ? 'لا توجد معلومات اتصال' : 'No contact info available',
    loadingSession: locale === 'zh' ? '会话加载中...' : locale === 'de' ? 'Sitzung wird geladen...' : locale === 'ar' ? 'جاري تحميل الجلسة...' : 'Loading session...',
  }

  const handleClick = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }
    // 已登录且会话已解析完成：打开 ChatWidget
    setChatOpenSignal(s => s + 1)
  }

  const handleLogin = () => {
    const callbackUrl = window.location.pathname
    router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  // 从 contactInfo 中提取邮箱和电话（简单解析）
  const parseContactInfo = (info: string) => {
    const emailMatch = info.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)
    const phoneMatch = info.match(/(\+?\d[\d\s\-()]{6,}\d)/)
    return {
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null,
    }
  }

  const contact = contactInfo ? parseContactInfo(contactInfo) : { email: null, phone: null }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!isAuthReady && isLoggedIn}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {!isAuthReady && isLoggedIn ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t.loadingSession}
          </>
        ) : (
          <>
            <MessageCircle className="w-5 h-5" />
            {t.applyTask}
          </>
        )}
      </button>

      {/* 已登录且会话就绪后才渲染 ChatWidget */}
      {isLoggedIn && isAuthReady && (
        <ChatWidget
          key={`chat-${session?.user?.id || 'unknown'}`}
          sellerId={postedById}
          sellerUserId={postedById}
          openSignal={chatOpenSignal}
        />
      )}

      {/* 未登录提示对话框 */}
      {showLoginPrompt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white relative">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">{t.loginRequiredTitle}</h3>
              </div>
            </div>

            {/* 内容 */}
            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-sm leading-relaxed">
                {t.loginRequiredDesc}
              </p>

              {/* 登录按钮 */}
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                {t.loginNow}
              </button>

              {/* 分隔线 */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">{t.contactDirectly}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* 联系方式 */}
              {contact.email || contact.phone ? (
                <div className="space-y-2">
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm break-all">{contact.email}</span>
                    </a>
                  )}
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{contact.phone}</span>
                    </a>
                  )}
                </div>
              ) : contactInfo ? (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 text-sm whitespace-pre-wrap">{contactInfo}</span>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <span className="text-gray-400 text-sm">{t.noContactInfo}</span>
                </div>
              )}

              {/* 关闭按钮 */}
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
