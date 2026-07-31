import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { EncryptJWT } from "jose"
import hkdf from "@panva/hkdf"
import { v4 as uuidv4 } from "uuid"

const DEFAULT_MAX_AGE = 30 * 24 * 60 * 60 // 30 days
const now = () => (Date.now() / 1000) | 0

/**
 * Derive encryption key from secret + salt, matching next-auth's encode().
 * next-auth uses HKDF with SHA-512, info = "NextAuth.js Generated Encryption Key".
 */
async function getDerivedEncryptionKey(secret: string, salt: string): Promise<Uint8Array> {
  const key = await hkdf(
    "sha512",
    secret,
    "",
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
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const input = String(email).toLowerCase().trim()

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input },
          { username: input },
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
  } catch (error) {
    console.error("[DelegateLogin] Error:", error)
    return NextResponse.json(
      { error: "登录失败，请重试" },
      { status: 500 }
    )
  }
}
