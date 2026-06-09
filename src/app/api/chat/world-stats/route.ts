import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    let remainingFree = 10
    const costPerMessage = 0.1

    if (session?.user) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todayWorldMessages = await prisma.worldChatMessage.count({
        where: {
          senderId: session.user.id,
          createdAt: { gte: today }
        }
      })

      remainingFree = 10 - todayWorldMessages
    }

    return NextResponse.json({
      remainingFree: Math.max(0, remainingFree),
      costPerMessage
    })
  } catch (error) {
    console.error('Error fetching world chat stats:', error)
    return NextResponse.json({
      remainingFree: 10,
      costPerMessage: 0.1
    })
  }
}