import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { checkPasswordBreach, getPasswordStrength } from "@/lib/password-security"


const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["BUYER", "SELLER"]).optional().default("BUYER"),
})

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Registration attempt:', { email: body.email, username: body.username, role: body.role })
    
    const validation = registerSchema.safeParse(body)
    
    if (!validation.success) {
      console.log('Validation failed:', validation.error.issues)
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      )
    }
    
    const { email, username, password, role } = validation.data

    const normalizedEmail = email.toLowerCase().trim()

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { username }
        ]
      }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Email or username already exists" },
        { status: 400 }
      )
    }

    // Check password breach
    const breachCheck = await checkPasswordBreach(password)
    if (breachCheck.isBreached) {
      return NextResponse.json(
        {
          error: "Password security issue detected",
          details: breachCheck.message,
          warning: "Please choose a different password that hasn't been exposed in data breaches."
        },
        { status: 400 }
      )
    }

    // Check password strength
    const strength = getPasswordStrength(password)
    if (strength.score < 40) {
      return NextResponse.json(
        {
          error: "Password is too weak",
          details: strength.feedback,
          strength: strength.level
        },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username,
        password: hashedPassword,
        role: role as any,
      },
    })
    
    // If seller, create seller profile
    if (role === "SELLER") {
      await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          companyName: username,
          companyType: "MANUFACTURER",
          country: "Unknown",
          city: "Unknown",
          subscriptionStatus: "FREE_TRIAL",
          subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        },
      })
    }
    
    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}
