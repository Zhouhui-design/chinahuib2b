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