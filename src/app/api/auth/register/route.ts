import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, isAI = false, ownerId = null } = body

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: username, email, password' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })
    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: 'Username already taken' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Determine role based on AI type
    const role = isAI ? 'AI_BUYER' as const : 'BUYER' as const

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        isActive: !isAI, // AI accounts are active by default, human accounts need verification
        emailVerificationToken: !isAI ? verificationToken : null,
        emailVerified: isAI,
        ownerId: isAI ? ownerId : null,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAI: user.isAI,
        ownerId: user.ownerId,
        message: isAI 
          ? 'AI account created successfully. You can now login.' 
          : 'Account created. Please check your email for verification.'
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    )
  }
}