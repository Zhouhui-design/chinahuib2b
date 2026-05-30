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

    const { content } = await request.json()
    
    if (!content || content.length > 100) {
      return NextResponse.json({ error: 'Message must be 1-100 characters' }, { status: 400 })
    }

    const userId = session.user.id

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayWorldMessages = await prisma.worldChatMessage.count({
      where: {
        senderId: userId,
        createdAt: { gte: today }
      }
    })

    const FREE_LIMIT = 10
    const COST_PER_MESSAGE = 0.1
    const isFree = todayWorldMessages < FREE_LIMIT
    const remainingFree = FREE_LIMIT - todayWorldMessages

    if (!isFree) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true }
      })

      if (!user || (user.balance || 0) < COST_PER_MESSAGE) {
        return NextResponse.json({ 
          error: 'Insufficient balance',
          stats: { remainingFree: -1, costPerMessage: COST_PER_MESSAGE }
        }, { status: 400 })
      }

      await prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: COST_PER_MESSAGE } }
      })
    }

    const message = await prisma.worldChatMessage.create({
      data: {
        content,
        senderId: userId,
        isFree,
        cost: isFree ? null : COST_PER_MESSAGE
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            role: true,
            isOnline: true,
            sellerProfile: {
              select: {
                id: true,
                companyName: true,
                logoUrl: true,
                isVerified: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      data: message,
      stats: {
        remainingFree: isFree ? remainingFree - 1 : remainingFree,
        costPerMessage: COST_PER_MESSAGE,
        isFree
      }
    })
  } catch (error) {
    console.error('Error creating world chat message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const messages = await prisma.worldChatMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            role: true,
            isOnline: true,
            sellerProfile: {
              select: {
                id: true,
                companyName: true,
                logoUrl: true,
                isVerified: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ data: messages })
  } catch (error) {
    console.error('Error fetching world chat messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}