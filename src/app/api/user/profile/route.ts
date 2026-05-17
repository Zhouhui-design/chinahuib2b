import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const profileUpdateSchema = z.object({
  displayName: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
})

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        displayName: true,
        company: true,
        phone: true,
        website: true,
        location: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch profile' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = profileUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validation.error.issues 
      }, { status: 400 })
    }

    const data = validation.data

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email && { email: data.email }),
        ...(data.website && { website: data.website }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        displayName: true,
        company: true,
        phone: true,
        website: true,
        location: true,
        bio: true,
        avatarUrl: true,
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ 
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
