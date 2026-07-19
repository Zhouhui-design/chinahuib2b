import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { rateLimitByIP } from "@/lib/rate-limiter"
import { checkLoginAttempts, incrementLoginAttempt, resetLoginAttempts } from "@/lib/auth-rate-limit"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email/username and password are required" },
        { status: 400 }
      )
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    const rateLimitResult = await rateLimitByIP(ip, {
      maxRequests: 5,
      windowMs: 60 * 1000,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      )
    }

    const input = email.toLowerCase().trim()
    
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input },
          { username: input },
        ],
      },
    })

    if (!user || !user.password) {
      await incrementLoginAttempt(input)
      return NextResponse.json(
        { error: "Invalid email/username or password" },
        { status: 401 }
      )
    }

    if (user.role === 'ADMIN') {
      const loginAttemptCheck = await checkLoginAttempts(input, ip)
      if (!loginAttemptCheck.allowed) {
        return NextResponse.json(
          { error: "Too many login attempts for admin account. Please try again later." },
          { status: 429 }
        )
      }
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      await incrementLoginAttempt(input)
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 403 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    await resetLoginAttempts(input)

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        }
      }
    )

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}
