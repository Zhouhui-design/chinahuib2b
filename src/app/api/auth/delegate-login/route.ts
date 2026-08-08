import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { redis } from "@/lib/redis"
import bcrypt from "bcryptjs"
import { EncryptJWT } from "jose"
import hkdf from "@panva/hkdf"
import { v4 as uuidv4 } from "uuid"

const DEFAULT_MAX_AGE = 30 * 24 * 60 * 60 // 30 days
const now = () => (Date.now() / 1000) | 0

// === 速率限制配置 ===
const MAX_ATTEMPTS = 5        // 最大尝试次数
const WINDOW_SECONDS = 60     // 时间窗口：60秒
const LOCKOUT_SECONDS = 900   // 锁定时间：15分钟

/**
 * 获取客户端IP地址
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  const realIP = request.headers.get("x-real-ip")
  if (realIP) {
    return realIP
  }
  return "unknown"
}

/**
 * 检查速率限制
 * 返回: { allowed: boolean, remaining: number, retryAfter?: number }
 */
async function checkRateLimit(ip: string): Promise<{
  allowed: boolean
  remaining: number
  retryAfter?: number
}> {
  const key = `delegate-login:${ip}`
  const lockoutKey = `delegate-login-lockout:${ip}`

  try {
    // 检查是否被锁定
    const lockoutTTL = await redis.ttl(lockoutKey)
    if (lockoutTTL > 0) {
      return { allowed: false, remaining: 0, retryAfter: lockoutTTL }
    }

    // 获取当前窗口内的尝试次数
    const attempts = await redis.incr(key)
    if (attempts === 1) {
      // 第一次尝试，设置过期时间
      await redis.expire(key, WINDOW_SECONDS)
    }

    if (attempts > MAX_ATTEMPTS) {
      // 超过最大尝试次数，锁定
      await redis.set(lockoutKey, "1", { EX: LOCKOUT_SECONDS })
      return { allowed: false, remaining: 0, retryAfter: LOCKOUT_SECONDS }
    }

    return { allowed: true, remaining: MAX_ATTEMPTS - attempts }
  } catch (error) {
    // Redis出错时不阻塞登录，但记录错误
    console.error("[RateLimit] Redis error:", error)
    return { allowed: true, remaining: MAX_ATTEMPTS }
  }
}

/**
 * 登录成功时清除速率限制计数
 */
async function clearRateLimit(ip: string): Promise<void> {
  try {
    await redis.del(`delegate-login:${ip}`)
  } catch (error) {
    console.error("[RateLimit] Clear error:", error)
  }
}

/**
 * Derive encryption key from secret + salt, matching next-auth's encode().
 * next-auth uses HKDF with SHA-512, info = "NextAuth.js Generated Encryption Key".
 */
async function getDerivedEncryptionKey(secret: string, salt: string): Promise<Uint8Array> {
  const key = await hkdf(
    "sha256",
    secret,
    salt,
    `NextAuth.js Generated Encryption Key${salt ? ` (${salt})` : ""}`,
    32
  )
  return key
}

/**
 * Encode a JWT session token using next-auth's JWE format (A256GCM encrypted).
 * This mirrors next-auth's jwt.encode() which uses jose.EncryptJWT.
 */
async function encodeAuthToken(token: Record<string, any>, secret: string): Promise<string> {
  const maxAge = DEFAULT_MAX_AGE
  const salt = "" // next-auth uses empty salt for session token
  
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
    // === 速率限制检查 ===
    const clientIP = getClientIP(request)
    const rateLimit = await checkRateLimit(clientIP)
    if (!rateLimit.allowed) {
      const minutes = Math.ceil((rateLimit.retryAfter || 0) / 60)
      return NextResponse.json(
        { error: `登录尝试过多，已锁定${minutes}分钟，请稍后再试` },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter || 0),
            "X-RateLimit-Remaining": "0",
          }
        }
      )
    }

    const body = await request.json()
    const { email, password, restrictTo } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // === 安全修复：强制阻止管理员通过delegate-login登录 ===
    // delegate-login 仅供卖家/AI Agent使用，管理员必须通过专用登录页

    // Keep original case for username lookup (usernames like "sardenesy_AI_Seller" are case-sensitive)
    // Only lowercase for email comparison
    const rawInput = String(email).trim()
    const lowerInput = rawInput.toLowerCase()

    // Detect if input looks like an email (contains @)
    const isEmail = rawInput.includes("@")

    // AI agents MUST login with username (not email).
    // When input is an email, only match human (non-AI) accounts.
    // When input is a username, match case-insensitively to handle "sardenesy_AI_Seller" etc.
    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: lowerInput, isAI: false }
        : {
            OR: [
              { username: rawInput },                                    // exact case match
              { username: { equals: rawInput, mode: "insensitive" } },   // case-insensitive fallback
            ],
          },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "账号或密码错误" },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(String(password), user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: "账号或密码错误" },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "账号已被禁用" },
        { status: 403 }
      )
    }

    // === 安全修复：无论restrictTo参数如何，管理员都不能通过delegate-login登录 ===
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: "此账号为管理员账号，请使用管理员登录页面" },
        { status: 403 }
      )
    }

    // 登录成功，清除速率限制计数
    await clearRateLimit(clientIP)

    if (restrictTo) {
      if (restrictTo === 'NON_ADMIN') {
        if (user.role === 'ADMIN') {
          return NextResponse.json(
            { error: "此账号为管理员账号，请使用管理员登录页面" },
            { status: 403 }
          )
        }
      } else {
        const allowedRoles = Array.isArray(restrictTo) ? restrictTo : [restrictTo]
        if (!allowedRoles.includes(user.role)) {
          return NextResponse.json(
            { error: "您没有权限登录此系统" },
            { status: 403 }
          )
        }
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    const secret = process.env.NEXTAUTH_SECRET || 'x2xhub_fallback_secret_32chars_long_enough'

    // Build the JWT payload matching next-auth's format.
    // next-auth's jwt callback sets token.role and token.id when user is present.
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
        isAI: user.isAI,
        ownerId: user.ownerId,
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
  } catch (error) {
    console.error("[DelegateLogin] Error:", error)
    return NextResponse.json(
      { error: "登录失败，请重试" },
      { status: 500 }
    )
  }
}
