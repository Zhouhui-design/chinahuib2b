import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let lastMessageTime = new Date()

        const sendEvent = async () => {
          try {
            // Fetch new public messages since last check
            const messages = await prisma.publicMessage.findMany({
              where: {
                createdAt: { gt: lastMessageTime },
              },
              orderBy: { createdAt: 'asc' },
              take: 10,
              include: {
                sender: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                    role: true,
                    isOnline: true,
                    sellerProfile: {
                      select: {
                        id: true,
                        companyName: true,
                        logoUrl: true,
                        isVerified: true,
                      },
                    },
                  },
                },
                linkedSeller: {
                  select: {
                    id: true,
                    companyName: true,
                    logoUrl: true,
                    isVerified: true,
                  },
                },
              },
            })

            // Fetch online users count
            const onlineUsersCount = await prisma.user.count({
              where: { isOnline: true, isActive: true },
            })

            // Fetch recent shout outs
            const shoutOuts = await prisma.shoutOut.findMany({
              where: {
                OR: [
                  { expiresAt: null },
                  { expiresAt: { gt: new Date() } },
                ],
                createdAt: { gt: lastMessageTime },
              },
              orderBy: { createdAt: 'desc' },
              take: 5,
              include: {
                sender: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                    role: true,
                    isOnline: true,
                  },
                },
              },
            })

            if (messages.length > 0 || shoutOuts.length > 0) {
              const data = JSON.stringify({
                type: 'update',
                timestamp: new Date().toISOString(),
                messages,
                shoutOuts,
                onlineUsersCount,
              })

              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              lastMessageTime = new Date()
            }
          } catch (error) {
            console.error('SSE Error:', error)
          }
        }

        // Send initial connection event
        const initialData = JSON.stringify({
          type: 'connected',
          timestamp: new Date().toISOString(),
          user: session?.user ? {
            id: session.user.id,
            username: session.user.username,
          } : null,
        })
        controller.enqueue(encoder.encode(`data: ${initialData}\n\n`))

        // Set up interval to check for new messages
        const interval = setInterval(sendEvent, 2000) // Poll every 2 seconds

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(interval)
          controller.close()
        })
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering for nginx
      },
    })
  } catch (error) {
    console.error('SSE connection error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to establish SSE connection' },
      { status: 500 }
    )
  }
}
