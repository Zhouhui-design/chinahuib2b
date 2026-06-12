import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const permission = searchParams.get('permission')

    let query: any = {}
    if (userId) {
      query.userId = userId
    }
    if (permission) {
      query.permission = permission
    }

    const permissions = await prisma.aIPermission.findMany({
      where: query,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isAI: true,
          }
        }
      },
      orderBy: { grantedAt: 'desc' }
    })

    return NextResponse.json({ success: true, permissions })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, permission, isAllowed, scope, expiresAt } = body

    if (!userId || !permission) {
      return NextResponse.json({ error: 'userId and permission are required' }, { status: 400 })
    }

    const existing = await prisma.aIPermission.findFirst({
      where: { userId, permission }
    })

    let result
    if (existing) {
      result = await prisma.aIPermission.update({
        where: { id: existing.id },
        data: { isAllowed, scope, expiresAt }
      })
    } else {
      result = await prisma.aIPermission.create({
        data: { userId, permission, isAllowed: isAllowed ?? true, scope, expiresAt }
      })
    }

    return NextResponse.json({ success: true, permission: result })
  } catch (error) {
    console.error('Error creating/updating permission:', error)
    return NextResponse.json({ error: 'Failed to save permission' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await prisma.aIPermission.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting permission:', error)
    return NextResponse.json({ error: 'Failed to delete permission' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, isAllowed, scope, expiresAt } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const result = await prisma.aIPermission.update({
      where: { id },
      data: { isAllowed, scope, expiresAt }
    })

    return NextResponse.json({ success: true, permission: result })
  } catch (error) {
    console.error('Error updating permission:', error)
    return NextResponse.json({ error: 'Failed to update permission' }, { status: 500 })
  }
}