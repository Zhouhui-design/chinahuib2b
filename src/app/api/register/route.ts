import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { checkPasswordBreach, getPasswordStrength } from "@/lib/password-security"


const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["BUYER", "SELLER", "BOTH"]).optional().default("BUYER"),
})

function validateUsername(username: string): { valid: boolean; error?: string } {
  // Trim trailing spaces
  const trimmed = username.trimEnd()
  
  // Check if empty after trimming
  if (trimmed.length === 0) {
    return { valid: false, error: "Username cannot be empty" }
  }
  
  // Check length (1-8 characters)
  if (trimmed.length < 1 || trimmed.length > 8) {
    return { valid: false, error: "Username must be 1-8 characters long" }
  }
  
  // Single character cannot be a space
  if (trimmed.length === 1 && trimmed === " ") {
    return { valid: false, error: "Single character username cannot be a space" }
  }
  
  // First character cannot be a space for multi-character usernames
  if (trimmed.length > 1 && trimmed[0] === " ") {
    return { valid: false, error: "Username cannot start with a space" }
  }
  
  return { valid: true }
}

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

    // Validate username with custom rules
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      return NextResponse.json(
        { error: usernameValidation.error },
        { status: 400 }
      )
    }
    
    // Clean username: trim trailing spaces only
    const cleanedUsername = username.trimEnd()
    
    const normalizedEmail = email.toLowerCase().trim()

    // Check existing username with cleaned version
    const existingEmail = await prisma.user.findFirst({
      where: { email: normalizedEmail }
    })
    
    const existingUsername = await prisma.user.findFirst({
      where: { username: cleanedUsername }
    })
    
    if (existingEmail && existingUsername) {
      return NextResponse.json(
        { 
          error: "Both email and username already exist",
          details: [{ message: "The email and username you entered are already registered. Please use different credentials." }]
        },
        { status: 400 }
      )
    } else if (existingEmail) {
      return NextResponse.json(
        { 
          error: "Email already exists",
          details: [{ message: "This email address is already registered. Please use a different email or log in with your existing account." }]
        },
        { status: 400 }
      )
    } else if (existingUsername) {
      return NextResponse.json(
        { 
          error: "Username already exists",
          details: [{ message: "This username is already taken. Please choose a different username." }]
        },
        { status: 400 }
      )
    }

    // Check password breach (warn only, don't block)
    const breachCheck = await checkPasswordBreach(password)
    const passwordWarning = breachCheck.isBreached 
      ? `Warning: This password has been exposed in ${breachCheck.count.toLocaleString()} data breaches. Consider choosing a more secure password.`
      : null

    // Check password strength
    const strength = getPasswordStrength(password)
    if (strength.score < 40) {
      const feedbackMessages = []
      if (strength.feedback?.suggestions) {
        feedbackMessages.push(...strength.feedback.suggestions)
      }
      if (strength.feedback?.warning) {
        feedbackMessages.push(strength.feedback.warning)
      }
      return NextResponse.json(
        {
          error: "Password is too weak",
          details: feedbackMessages.map(msg => ({ message: msg })),
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
        username: cleanedUsername,
        password: hashedPassword,
        role: role as any,
      },
    })
    
    // If seller, create seller profile
    if (role === "SELLER" || role === "BOTH") {
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
        warning: passwordWarning,
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
