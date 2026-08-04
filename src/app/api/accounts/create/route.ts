import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { seedDefaultAIPermissions } from '@/lib/ai-permissions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, isAI = false, ownerId = null, role: requestedRole } = body

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: username, email, password' },
        { status: 400 }
      )
    }

    // Check if email already exists for human accounts
    // AI accounts can share the same email as their guardian
    if (!isAI) {
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      })
      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'Email already registered' },
          { status: 400 }
        )
      }
    } else {
      // For AI accounts, check composite uniqueness: (email, isAI, role)
      // This allows AI accounts to share the same email as their human guardian
      // but prevents duplicate AI accounts with same email, isAI, and role
      const existingAI = await prisma.user.findFirst({
        where: {
          email,
          isAI: true,
          role: requestedRole as string
        }
      })
      if (existingAI) {
        return NextResponse.json(
          { success: false, error: 'You already have an AI account with this email and role' },
          { status: 400 }
        )
      }
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

    // Determine role based on AI type
    let role: string
    if (isAI) {
      const validAIRoles = ['AI_BUYER', 'AI_SELLER', 'AI_ASSISTANT']
      role = validAIRoles.includes(requestedRole) ? requestedRole : 'AI_BUYER'
    } else {
      role = 'BUYER'
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role as any,
        isActive: true,
        isAI: isAI,
        ownerId: isAI ? ownerId : null,
      }
    })

    // Seed default permissions for AI accounts
    if (isAI && (role === 'AI_BUYER' || role === 'AI_SELLER' || role === 'AI_ASSISTANT')) {
      await seedDefaultAIPermissions(user.id, role as 'AI_BUYER' | 'AI_SELLER' | 'AI_ASSISTANT')
    }

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
          ? `AI ${role.replace('AI_', '').toLowerCase()} account created successfully. You can now login.` 
          : 'Account created. Please check your email for verification.'
      }
    })
  } catch (error: any) {
    console.error('Registration error:', error?.message || error)
    console.error('Registration error stack:', error?.stack)
    console.error('Registration error code:', error?.code)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create account' },
      { status: 500 }
    )
  }
}
