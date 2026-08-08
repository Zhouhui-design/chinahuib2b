import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { redis } from "@/lib/redis"
import { sendEmail } from "@/lib/email-service"
import bcrypt from "bcryptjs"
import { EncryptJWT } from "jose"
import hkdf from "@panva/hkdf"
import { v4 as uuidv4 } from "uuid"

const DEFAULT_MAX_AGE = 30 * 24 * 60 * 60 // 30 days
const now = () => (Date.now() / 1000) | 0

// === 配置 ===
const CODE_LENGTH = 40                // 验证码长度
const CODE_EXPIRY = 600               // 验证码有效期：10分钟
const MAX_VERIFY_ATTEMPTS = 5         // 最大验证尝试次数
const RATE_LIMIT_WINDOW = 60          // 速率限制窗口：60秒
const RATE_LIMIT_MAX = 3              // 每窗口最大请求次数

/**
 * 生成40位随机验证码（字母+数字）
 */
function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * 获取客户端IP
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const realIP = request.headers.get("x-real-ip")
  if (realIP) return realIP
  return "unknown"
}

/**
 * Derive encryption key (same as delegate-login)
 */
async function getDerivedEncryptionKey(secret: string, salt: string): Promise<Uint8Array> {
  const key = await hkdf("sha256", secret, salt, `NextAuth.js Generated Encryption Key${salt ? ` (${salt})` : ""}`, 32)
  return key
}

/**
 * Encode JWT session token (same as delegate-login)
 */
async function encodeAuthToken(token: Record<string, any>, secret: string): Promise<string> {
  const maxAge = DEFAULT_MAX_AGE
  const salt = ""
  const encryptionSecret = await getDerivedEncryptionKey(secret, salt)
  const jwt = await new EncryptJWT(token)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(now() + maxAge)
    .setJti(uuidv4())
    .encrypt(encryptionSecret)
  return jwt
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { step, email, password, challengeId, verificationCode } = body

    // === 速率限制 ===
    const clientIP = getClientIP(request)
    const rateLimitKey = `admin-login:${clientIP}`
    try {
      const count = await redis.incr(rateLimitKey)
      if (count === 1) await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW)
      if (count > RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: "请求过于频繁，请稍后再试" },
          { status: 429 }
        )
      }
    } catch (e) {
      // Redis出错不阻塞
    }

    // =========================================================
    // 步骤1：验证账号密码，发送验证码邮件
    // =========================================================
    if (step === 1) {
      if (!email || !password) {
        return NextResponse.json(
          { error: "请输入邮箱和密码" },
          { status: 400 }
        )
      }

      const input = String(email).toLowerCase().trim()

      // 查找用户
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: input },
            { username: String(email).trim() },
          ],
        },
      })

      // 统一错误信息，不泄露账号是否存在
      if (!user || !user.password) {
        return NextResponse.json(
          { error: "账号或密码错误" },
          { status: 401 }
        )
      }

      // 验证密码
      const isValid = await bcrypt.compare(String(password), user.password)
      if (!isValid) {
        return NextResponse.json(
          { error: "账号或密码错误" },
          { status: 401 }
        )
      }

      // 检查账号状态
      if (!user.isActive) {
        return NextResponse.json(
          { error: "账号已被禁用" },
          { status: 403 }
        )
      }

      // 仅允许管理员登录
      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: "此账号没有管理员权限，请使用普通登录页面" },
          { status: 403 }
        )
      }

      // 生成40位验证码
      const code = generateVerificationCode()

      // 存储到Redis，10分钟过期
      const challengeKey = `admin-2fa:${user.id}`
      try {
        await redis.set(challengeKey, JSON.stringify({
          code,
          attempts: 0,
          userId: user.id,
          createdAt: Date.now(),
        }), { EX: CODE_EXPIRY })
      } catch (e) {
        console.error("[AdminLogin] Redis error:", e)
        return NextResponse.json(
          { error: "系统错误，请稍后再试" },
          { status: 500 }
        )
      }

      // 发送验证码邮件
      const emailResult = await sendEmail(
        user.email,
        '管理员登录验证码 - 心海环球 SeaHeart Global',
        `您正在登录管理员后台。\n\n您的验证码（40位）：\n${code}\n\n验证码有效期为10分钟，请尽快使用。\n\n如果不是您本人操作，请忽略此邮件。\n\n心海环球 SeaHeart Global`,
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">管理员登录验证码</h2>
          <p>您正在登录心海环球管理员后台。</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">您的验证码（40位）：</p>
            <p style="margin: 8px 0; font-size: 18px; font-family: monospace; word-break: break-all; color: #1f2937; font-weight: bold;">${code}</p>
          </div>
          <p style="color: #ef4444; font-size: 14px;">⚠️ 验证码有效期为10分钟，请尽快使用。</p>
          <p style="color: #6b7280; font-size: 14px;">如果不是您本人操作，请忽略此邮件。</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">心海环球 SeaHeart Global | x2xhub.com</p>
        </div>`
      )

      if (!emailResult.success) {
        console.error("[AdminLogin] Email send failed:", emailResult.message)
        return NextResponse.json(
          { error: "验证码邮件发送失败，请稍后重试或联系技术支持" },
          { status: 500 }
        )
      }

      // 更新最后登录时间
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })

      return NextResponse.json({
        success: true,
        step: 2,
        challengeId: user.id,
        message: "验证码已发送到您的邮箱，请查收",
        emailMasked: user.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
      })
    }

    // =========================================================
    // 步骤2：验证40位验证码，创建会话
    // =========================================================
    if (step === 2) {
      if (!challengeId || !verificationCode) {
        return NextResponse.json(
          { error: "请输入验证码" },
          { status: 400 }
        )
      }

      const challengeKey = `admin-2fa:${challengeId}`

      // 从Redis获取验证码数据
      let challengeData: { code: string; attempts: number; userId: string } | null = null
      try {
        const stored = await redis.get(challengeKey)
        if (stored) {
          challengeData = JSON.parse(stored as string)
        }
      } catch (e) {
        console.error("[AdminLogin] Redis error:", e)
      }

      if (!challengeData) {
        return NextResponse.json(
          { error: "验证码已过期，请重新登录" },
          { status: 401 }
        )
      }

      // 检查尝试次数
      if (challengeData.attempts >= MAX_VERIFY_ATTEMPTS) {
        await redis.del(challengeKey)
        return NextResponse.json(
          { error: "验证码错误次数过多，请重新登录" },
          { status: 429 }
        )
      }

      // 验证码比较
      if (verificationCode.trim() !== challengeData.code) {
        // 增加尝试次数
        challengeData.attempts++
        await redis.set(challengeKey, JSON.stringify(challengeData), { EX: CODE_EXPIRY })

        const remaining = MAX_VERIFY_ATTEMPTS - challengeData.attempts
        return NextResponse.json(
          { error: `验证码错误，还剩 ${remaining} 次尝试机会` },
          { status: 401 }
        )
      }

      // 验证成功，清除验证码
      await redis.del(challengeKey)

      // 获取用户信息
      const user = await prisma.user.findUnique({
        where: { id: challengeData.userId },
      })

      if (!user || !user.isActive) {
        return NextResponse.json(
          { error: "账号不可用" },
          { status: 403 }
        )
      }

      // 创建NextAuth会话
      const secret = process.env.NEXTAUTH_SECRET || 'x2xhub_fallback_secret_32chars_long_enough'

      const tokenPayload = {
        name: user.username,
        email: user.email,
        picture: null,
        sub: user.id,
        id: user.id,
        role: user.role,
        isAI: user.isAI,
        ownerId: user.ownerId,
      }

      const sessionToken = await encodeAuthToken(tokenPayload, secret)

      const isSecure = process.env.NODE_ENV === "production"
      const cookieName = isSecure
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token"

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role,
        }
      })

      response.cookies.set(cookieName, sessionToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        maxAge: DEFAULT_MAX_AGE,
        path: "/",
      })

      return response
    }

    return NextResponse.json(
      { error: "无效的请求，请指定step参数" },
      { status: 400 }
    )

  } catch (error) {
    console.error("[AdminLogin] Error:", error)
    return NextResponse.json(
      { error: "登录失败，请重试" },
      { status: 500 }
    )
  }
}
