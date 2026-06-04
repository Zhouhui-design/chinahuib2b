import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// POST - Mark a notice as read
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { prisma } = await import('@/lib/db')

    const notice = await prisma.notice.findUnique({
      where: { id },
    })

    if (!notice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
    }

    if (notice.recipientId !== session.user.id && !notice.isGlobal) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatedNotice = await prisma.notice.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json(updatedNotice)
  } catch (error) {
    console.error('Error marking notice as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}