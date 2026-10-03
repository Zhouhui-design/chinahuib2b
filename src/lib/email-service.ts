const getResendApiKey = () => process.env['RESEND_API_KEY']

export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const allChars = uppercase + lowercase + numbers + symbols

  let password = ''
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export async function sendPasswordEmail(
  toEmail: string,
  password: string,
  username: string = 'admin'
): Promise<{ success: boolean; message: string }> {
  return sendEmail(
    toEmail,
    '管理员账号密码 - 心海环球 SeaHeart Global',
    `登录邮箱：${toEmail}\n用户名：${username}\n新密码：${password}`
  )
}

export async function sendMaintenanceNotification(
  toEmails: string[],
  subject: string,
  content: string
): Promise<{ success: boolean; message: string }> {
  return sendEmail(toEmails.join(', '), subject, content)
}

export async function sendEmail(
  toEmail: string,
  subject: string,
  textContent: string,
  htmlContent?: string
): Promise<{ success: boolean; message: string }> {
  const RESEND_API_KEY = getResendApiKey()
  if (!RESEND_API_KEY) {
    return { success: false, message: '邮件发送失败: 未配置RESEND_API_KEY' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'notifications@x2xhub.com',
        to: toEmail.split(',').map(e => e.trim()).filter(Boolean),
        subject: subject,
        text: textContent,
        html: htmlContent || textContent.replace(/\n/g, '<br>'),
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true, message: `邮件发送成功！ID: ${data.id}` }
    }

    console.error('Resend error:', data)
    return { success: false, message: `邮件发送失败: ${data.message || 'Unknown error'}` }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { success: false, message: `邮件发送失败: ${error.message}` }
  }
}

export async function verifyEmailConnection(): Promise<boolean> {
  const RESEND_API_KEY = getResendApiKey()
  if (!RESEND_API_KEY) return false

  try {
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
    })
    return response.ok
  } catch (error) {
    return false
  }
}

// ---- 卖家消息邮件同步通知（需求1） ----

// 邮箱格式校验：仅格式正确才同步
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function isValidEmail(email?: string | null): boolean {
  if (!email) return false
  return EMAIL_REGEX.test(email.trim())
}

// 节流：同一卖家 THROTTLE_MS 内只发一封，避免连续消息轰炸邮箱
const NOTIFY_THROTTLE_MS = 5 * 60 * 1000
const lastNotifyAt = new Map<string, number>()

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://x2xhub.com'

/**
 * 买家给卖家发私聊消息后，同步邮件通知卖家。
 * 仅当卖家 email 格式正确时发送；失败不阻塞主流程。
 */
export async function notifySellerNewMessage(params: {
  sellerUserId: string
  sellerEmail?: string | null
  sellerName?: string | null
  buyerName?: string | null
  content: string
}): Promise<void> {
  try {
    const { sellerUserId, sellerEmail, sellerName, buyerName, content } = params

    if (!isValidEmail(sellerEmail)) return

    const now = Date.now()
    const last = lastNotifyAt.get(sellerUserId) || 0
    if (now - last < NOTIFY_THROTTLE_MS) return
    lastNotifyAt.set(sellerUserId, now)

    const to = sellerEmail!.trim()
    const sellerDisplay = sellerName?.trim() || '卖家'
    const buyerDisplay = buyerName?.trim() || '买家'
    const replyUrl = `${SITE_URL}/zh/seller/messages`
    const safeContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    const subject = `【心海环球】您收到一条来自 ${buyerDisplay} 的新消息`
    const text = [
      `${sellerDisplay}，您好：`,
      '',
      `买家 ${buyerDisplay} 给您发来一条消息：`,
      '',
      content,
      '',
      `立即登录平台回复：${replyUrl}`,
    ].join('\n')

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222">
        <p>${sellerDisplay}，您好：</p>
        <p>买家 <strong>${buyerDisplay}</strong> 给您发来一条消息：</p>
        <div style="background:#f5f7fa;border-left:4px solid #2563eb;padding:14px 16px;margin:16px 0;border-radius:4px;white-space:pre-wrap">${safeContent}</div>
        <p style="margin:24px 0">
          <a href="${replyUrl}" style="background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;display:inline-block;font-weight:bold">立即回复</a>
        </p>
        <p style="color:#888;font-size:12px">此邮件由心海环球 SeaHeart Global 自动发送，请勿直接回复。</p>
      </div>`

    const result = await sendEmail(to, subject, text, html)
    if (!result.success) {
      console.warn('[notifySellerNewMessage] send failed:', result.message)
    }
  } catch (err) {
    console.warn('[notifySellerNewMessage] error:', err instanceof Error ? err.message : String(err))
  }
}