import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 获取所有用户列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')
    const includeAI = searchParams.get('includeAI') === 'true'
    const isAIParam = searchParams.get('isAI')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    // Default: exclude AI accounts (they are sub-accounts of guardians, not independent entities)
    // Only include AI if explicitly requested via includeAI=true or isAI=true
    if (isAIParam !== null && isAIParam !== '') {
      where.isAI = isAIParam === 'true'
    } else if (!includeAI) {
      // isAI is a non-nullable Boolean @default(false); `isAI: null` is invalid
      // for Prisma and used to throw PrismaClientValidationError.
      where.isAI = false
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (role) {
      where.role = role
    }
    
    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    // Get users with pagination
    // Include AI sub-accounts (accounts where ownerId = this user's id AND isAI = true)
    // so admins can see guardian + AI agents merged in one row.
    // SECURITY: Never select password / resetToken / apiKey etc. Only safe display fields.
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          isOnline: true,
          displayName: true,
          company: true,
          createdAt: true,
          lastLoginAt: true,
          lastSeenAt: true,
          // Guardian's AI sub-accounts (merged into the same row on the frontend)
          aiAccounts: {
            where: { isAI: true },
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
              isActive: true,
              isOnline: true,
              displayName: true,
              lastLoginAt: true,
              lastSeenAt: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              inquiries: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - 创建新用户（仅限管理员）
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, username, password, role, displayName, company } = body

    // Validate required fields
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      )
    }

    // Create user (password should be hashed in production)
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password, // Note: In production, hash this password
        role: role || 'BUYER',
        displayName,
        company,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        displayName: true,
        company: true,
        createdAt: true,
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
