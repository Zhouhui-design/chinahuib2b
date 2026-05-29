import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email) {
      return NextResponse.json({
        error: "Email is required"
      }, { status: 400 })
    }

    const diagnostics = {
      timestamp: new Date().toISOString(),
      receivedEmail: email,
      emailNormalized: email.toLowerCase().trim(),
      databaseHealth: null as string | null,
      userFound: false,
      userDetails: null as any,
      passwordCheck: null as boolean | null,
      possibleCauses: [] as string[]
    }

    try {
      await prisma.$queryRaw`SELECT 1`
      diagnostics.databaseHealth = "healthy"
    } catch (dbError) {
      diagnostics.databaseHealth = `error: ${dbError instanceof Error ? dbError.message : String(dbError)}`
      diagnostics.possibleCauses.push("Database connection failed - check DATABASE_URL and database server status")
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { email: email.trim() }
        ]
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        password: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    })

    if (!user) {
      diagnostics.possibleCauses.push("User not found - email may be stored with different case or user was deleted")
      diagnostics.possibleCauses.push("Database query returned null - check email normalization in database")

      const countResult = await prisma.user.count()
      return NextResponse.json({
        exists: false,
        diagnostics,
        totalUsersInDatabase: countResult,
        hint: "User does not exist. Please register again or check if you're using the same email."
      })
    }

    diagnostics.userFound = true
    diagnostics.userDetails = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      hasPassword: !!user.password
    }

    if (password) {
      if (!user.password) {
        diagnostics.passwordCheck = false
        diagnostics.possibleCauses.push("User has no password - may have been created via OAuth or quick login")
      } else {
        const bcrypt = await import('bcryptjs')
        diagnostics.passwordCheck = await bcrypt.compare(password, user.password)
        if (!diagnostics.passwordCheck) {
          diagnostics.possibleCauses.push("Password does not match - user may have changed password")
        }
      }
    }

    if (!user.isActive) {
      diagnostics.possibleCauses.push("Account isActive=false - account may have been deactivated")
      diagnostics.possibleCauses.push("Possible reason: subscription expired, reported as spam, or 365 days inactive")
    }

    if (!user.password) {
      diagnostics.possibleCauses.push("User has no password hash stored - cannot login with password")
    }

    return NextResponse.json({
      exists: true,
      diagnostics,
      message: user.isActive && user.password
        ? "User exists and appears valid for login"
        : "User exists but may have issues logging in"
    })

  } catch (error) {
    console.error("Debug login error:", error)
    return NextResponse.json({
      error: "Debug failed",
      details: error instanceof Error ? error.message : String(error),
      possibleCauses: [
        "Database connection error",
        "Prisma client not initialized",
        "Invalid DATABASE_URL configuration"
      ]
    }, { status: 500 })
  }
}
