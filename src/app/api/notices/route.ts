import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, priority = 'medium' } = await request.json()
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        priority,
        senderId: session.user.id,
        isGlobal: true
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true
          }
        }
      }
    })

    return NextResponse.json({ data: notice })
  } catch (error) {
    console.error('Error creating notice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true
          }
        }
      }
    })

    return NextResponse.json({ data: notices })
  } catch (error) {
    console.error('Error fetching notices:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}