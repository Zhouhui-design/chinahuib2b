import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateUniqueStoreSlug } from "@/services/sellerService"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { checkPasswordBreach } from "@/lib/password-security"


// Email is optional: users can register with username only.
// When email is missing we store a unique placeholder so the NOT NULL
// constraint is satisfied and the user can add a real email later.
const registerSchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["BUYER", "SELLER", "BOTH"]).optional().default("BUYER"),
})
.refine((d) => (d.email && d.email.trim().length > 0) || (d.username && d.username.trim().length > 0), {
  message: "Username and email cannot both be empty. Please fill in at least one.",
  path: ["email"],
})

function validateUsername(username: string): { valid: boolean; error?: string } {
  // Trim trailing spaces
  const trimmed = username.trimEnd()
  
  // Check if empty after trimming
  if (trimmed.length === 0) {
    return { valid: false, error: "Username cannot be empty" }
  }
  
  // Check length (1-50 characters)
  if (trimmed.length < 1 || trimmed.length > 50) {
    return { valid: false, error: "Username must be 1-50 characters long" }
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

    // Map BOTH to SELLER (Seller already has buyer access inherently)
    // Database UserRole enum doesn't include BOTH
    const dbRole = role === 'BOTH' ? 'SELLER' : role

    // ----- Username: derive from email when missing -----
    let cleanedUsername = (username || '').trimEnd()
    if (!cleanedUsername && email && email.trim()) {
      // Use email local-part as the initial username
      cleanedUsername = email.split('@')[0].slice(0, 50)
    }

    // Validate username with custom rules
    const usernameValidation = validateUsername(cleanedUsername)
    if (!usernameValidation.valid) {
      return NextResponse.json(
        { error: usernameValidation.error },
        { status: 400 }
      )
    }

    // ----- Email: use placeholder when missing -----
    // normalizedEmail is either the real email, or a unique placeholder built
    // from the username so the NOT NULL constraint holds. Placeholders use a
    // reserved .local domain so they are never deliverable.
    let normalizedEmail = (email || '').toLowerCase().trim()
    let usedPlaceholderEmail = false
    if (normalizedEmail) {
      // Validate real email format
      const emailCheck = z.string().email().safeParse(normalizedEmail)
      if (!emailCheck.success) {
        return NextResponse.json(
          { error: "Invalid email address", details: [{ message: "Please enter a valid email address." }] },
          { status: 400 }
        )
      }
    } else {
      // Sanitize username into an email-safe local part
      const local = cleanedUsername.toLowerCase().replace(/[^a-z0-9._-]/g, '_') || 'user'
      normalizedEmail = `${local}@no-email.x2xhub.local`
      usedPlaceholderEmail = true
    }

    // Ensure the placeholder email is unique (append counter if needed)
    if (usedPlaceholderEmail) {
      let candidate = normalizedEmail
      let n = 1
      // eslint-disable-next-line no-await-in-loop
      while (await prisma.user.findFirst({ where: { email: candidate } })) {
        const local = cleanedUsername.toLowerCase().replace(/[^a-z0-9._-]/g, '_') || 'user'
        candidate = `${local}${n}@no-email.x2xhub.local`
        n += 1
      }
      normalizedEmail = candidate
    }

    // Check existing email only when a real email was provided
    const existingEmail = usedPlaceholderEmail
      ? null
      : await prisma.user.findFirst({
          where: { email: normalizedEmail }
        })
    
    let existingUsername = await prisma.user.findFirst({
      where: { username: cleanedUsername }
    })

    // If the username was auto-derived from the email (user left it blank),
    // make it unique by appending a counter instead of erroring out.
    const usernameWasDerived = !(username && username.trim())
    if (existingUsername && usernameWasDerived) {
      let candidate = cleanedUsername
      let n = 1
      // eslint-disable-next-line no-await-in-loop
      while (await prisma.user.findFirst({ where: { username: candidate } })) {
        candidate = `${cleanedUsername}${n}`.slice(0, 50)
        n += 1
      }
      cleanedUsername = candidate
      existingUsername = null
    }

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

    // Password policy: keep it user-friendly. We do NOT block on strength or
    // breach status — only surface a non-blocking warning. Minimum length (>=6)
    // is enforced by the schema. Let users choose simple passwords if they want.
    const breachCheck = await checkPasswordBreach(password)
    const passwordWarning = breachCheck.isBreached
      ? `Note: This password has appeared in data breaches. You may keep it, but a stronger password is safer.`
      : null

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username: cleanedUsername,
        password: hashedPassword,
        role: dbRole,
      },
    })
    
    // If seller (or BOTH mapped to seller), create seller profile
    if (dbRole === "SELLER") {
      const storeSlug = await generateUniqueStoreSlug(username)
      await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          companyName: username,
          companyType: "MANUFACTURER",
          country: "Unknown",
          city: "Unknown",
          subscriptionStatus: "FREE_TRIAL",
          subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
          storeSlug,
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
