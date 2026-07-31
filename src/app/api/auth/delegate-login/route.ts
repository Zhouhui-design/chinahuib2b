import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

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

    const now = Math.floor(Date.now() / 1000)
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const sessionPayload = {
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role,
      },
      role: user.role,
      id: user.id,
      expires,
      iat: now,
      exp: now + 30 * 24 * 60 * 60,
    }

    const sessionToken = jwt.sign(sessionPayload, secret, {
      algorithm: 'HS256',
      header: { typ: 'JWT', alg: 'HS256' },
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.username,
        role: user.role,
      }
    })

    const isSecure = process.env.NODE_ENV === "production"

    response.cookies.set("next-auth.session-token", sessionToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })

    response.cookies.set("__Secure-next-auth.session-token", sessionToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
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
