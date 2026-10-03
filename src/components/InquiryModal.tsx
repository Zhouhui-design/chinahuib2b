'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, Loader2, CheckCircle2 } from 'lucide-react'

/**
 * InquiryModal - the buyer-facing "Send Inquiry" form on a product page.
 *
 * The previous implementation rendered a button with no onClick handler, so
 * the single most important conversion action on every product page was dead.
 * This wires it to POST /api/inquiries and keeps the form short enough that a
 * cold B2B buyer will actually complete it.
 */
interface Props {
  productId: string
  sellerId: string
  productTitle: string
  locale: string
}

export default function InquiryModal({ productId, sellerId, productTitle, locale }: Props) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const zh = locale === 'zh'
  const t = {
    button: zh ? '立即询盘' : 'Send Inquiry',
    title: zh ? '发送询盘' : 'Send Inquiry',
    about: zh ? '关于产品：' : 'Regarding: ',
    name: zh ? '您的姓名' : 'Your name',
    email: zh ? '联系邮箱 *' : 'Contact email *',
    company: zh ? '公司名称' : 'Company',
    country: zh ? '国家/地区' : 'Country / Region',
    quantity: zh ? '预计采购数量' : 'Estimated quantity',
    message: zh ? '需求描述 *（规格、数量、目标价格、交货期等）' : 'Your requirement * (specs, quantity, target price, lead time…)',
    submit: zh ? '提交询盘' : 'Submit Inquiry',
    sending: zh ? '提交中…' : 'Sending…',
    successTitle: zh ? '询盘已发送' : 'Inquiry Sent',
    successBody: zh ? '供应商会尽快通过您留下的邮箱与您联系。' : 'The supplier will reach you at the email you provided.',
    close: zh ? '关闭' : 'Close',
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const fd = new FormData(e.currentTarget)
    const payload = {
      productId,
      sellerId,
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      company: String(fd.get('company') || ''),
      country: String(fd.get('country') || ''),
      quantity: String(fd.get('quantity') || ''),
      message: String(fd.get('message') || ''),
    }

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || (zh ? '提交失败，请重试。' : 'Submission failed. Please try again.'))
        setSubmitting(false)
        return
      }
      setDone(true)
    } catch {
      setError(zh ? '网络错误，请稍后重试。' : 'Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function close() {
    setOpen(false)
    // reset after the close transition
    setTimeout(() => { setDone(false); setError(null) }, 200)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        <MessageCircle className="w-5 h-5 mr-2" />
        {t.button}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={close}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
              <button onClick={close} className="text-gray-400 hover:text-gray-600" aria-label={t.close}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {done ? (
              <div className="px-6 py-12 text-center">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{t.successTitle}</h4>
                <p className="text-gray-600 mb-6">{t.successBody}</p>
                <button
                  onClick={close}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  {t.close}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <p className="text-sm text-gray-500 line-clamp-2">
                  {t.about}
                  <span className="font-medium text-gray-700">{productTitle}</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input name="name" placeholder={t.name}
                    className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input name="email" type="email" required placeholder={t.email}
                    className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input name="company" placeholder={t.company}
                    className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input name="country" placeholder={t.country}
                    className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <input name="quantity" placeholder={t.quantity}
                  className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" />

                <textarea name="message" required rows={4} placeholder={t.message}
                  className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none resize-y" />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center"
                >
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t.sending}</>
                  ) : (
                    <><Send className="w-5 h-5 mr-2" />{t.submit}</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
