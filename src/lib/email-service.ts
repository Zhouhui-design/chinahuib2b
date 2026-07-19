/**
 * Email Service using nodemailer
 * Supports QQ Mail SMTP and other email providers
 */

import nodemailer from 'nodemailer'

const EMAIL_USER = process.env['EMAIL_USER'] || '1994169577@qq.com'

export function createTransporter() {
  return nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail',
  })
}

// Generate secure random password (16 characters: numbers + symbols + upper/lowercase letters)
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const allChars = uppercase + lowercase + numbers + symbols

  let password = ''
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill remaining length with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Send password email
export async function sendPasswordEmail(
  toEmail: string,
  password: string,
  username: string = 'admin'
): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: '"Global Expo Network 管理系统" <1994169577@qq.com>',
      to: toEmail,
      subject: '管理员账号密码 - Global Expo Network',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Global Expo Network</h1>
            <p style="margin: 10px 0 0;">管理员账号密码通知</p>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <p style="color: #333; font-size: 16px;">您好，</p>
            <p style="color: #333; font-size: 16px;">您的管理员账号已创建/更新，以下是登录信息：</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="padding: 10px; color: #666;">登录邮箱：</td>
                  <td style="padding: 10px; color: #333; font-weight: bold;">${toEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; color: #666;">用户名：</td>
                  <td style="padding: 10px; color: #333; font-weight: bold;">${username}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; color: #666;">新密码：</td>
                  <td style="padding: 10px;">
                    <code style="background: #e8f4f8; padding: 8px 12px; border-radius: 4px; font-size: 16px; color: #2196F3; display: inline-block;">${password}</code>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚠️ 安全提示：</strong>
              </p>
              <ul style="color: #856404; margin: 10px 0; padding-left: 20px; font-size: 14px;">
                <li>请妥善保管此密码，不要泄露给他人</li>
                <li>建议登录后立即修改密码</li>
                <li>此密码为16位随机生成，包含大小写字母、数字和符号</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://x2xhub.com/auth/login" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">立即登录</a>
            </div>

            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              此邮件由系统自动发送，请勿回复。<br>
              Global Expo Network - 连接全球买卖双方
            </p>
          </div>
        </div>
      `,
      text: `
Global Expo Network 管理员账号密码通知

您的管理员账号已创建/更新，以下是登录信息：

登录邮箱：${toEmail}
用户名：${username}
新密码：${password}

⚠️ 安全提示：
- 请妥善保管此密码，不要泄露给他人
- 建议登录后立即修改密码
- 此密码为16位随机生成，包含大小写字母、数字和符号

登录地址：https://x2xhub.com/auth/login

此邮件由系统自动发送，请勿回复。
Global Expo Network - 连接全球买卖双方
      `,
    }

    const info = await transporter.sendMail(mailOptions)

    return {
      success: true,
      message: `邮件发送成功！Message ID: ${info.messageId}`,
    }
  } catch (error: any) {
    console.error('Email send error:', error)
    return {
      success: false,
      message: `邮件发送失败: ${error.message}`,
    }
  }
}

// Verify SMTP connection
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    console.log('✅ SMTP connection verified successfully')
    return true
  } catch (error) {
    console.error('❌ SMTP connection failed:', error)
    return false
  }
}