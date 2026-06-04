import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Fetch initial data BEFORE creating the stream
    // This avoids Prisma adapter-pg async issues in ReadableStream
    const [
      initialMessages,
      initialWorldChatMessages,
      initialShoutOuts,
      initialNotices,
      initialOnlineUsersCount,
    ] = await Promise.all([
      prisma.publicMessage.findMany({
        where: { isWorldChat: false },
        orderBy: { createdAt: 'desc' },
        take: 20,
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
      }).catch(() => []),
      prisma.publicMessage.findMany({
        where: { isWorldChat: true },
        orderBy: { createdAt: 'desc' },
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
            },
          },
        },
      }).catch(() => []),
      prisma.shoutOut.findMany({
        orderBy: { createdAt: 'desc' },
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
            },
          },
        },
      }).catch(() => []),
      prisma.notice.findMany({
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
      }).catch(() => []),
      prisma.user.count({
        where: { isOnline: true, isActive: true },
      }).catch(() => 0),
    ])

    const encoder = new TextEncoder()
    let lastMessageTime = new Date()

    const stream = new ReadableStream({
      async start(controller) {
        // Send initial connection event with pre-fetched data
        const initialData = JSON.stringify({
          type: 'connected',
          timestamp: new Date().toISOString(),
          user: session?.user ? {
            id: session.user.id,
            username: session.user.username,
          } : null,
          messages: initialMessages,
          worldChatMessages: initialWorldChatMessages,
          shoutOuts: initialShoutOuts,
          notices: initialNotices,
          onlineUsersCount: initialOnlineUsersCount,
        })
        controller.enqueue(encoder.encode(`data: ${initialData}\n\n`))

        const sendEvent = async () => {
          try {
            const [messages, shoutOuts, worldChatMessages, notices, onlineUsersCount] = await Promise.all([
              prisma.publicMessage.findMany({
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
              }).catch(() => []),
              prisma.shoutOut.findMany({
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
              }).catch(() => []),
              prisma.publicMessage.findMany({
                where: {
                  isWorldChat: true,
                  createdAt: { gt: lastMessageTime },
                },
                orderBy: { createdAt: 'asc' },
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
              }).catch(() => []),
              prisma.notice.findMany({
                where: {
                  createdAt: { gt: lastMessageTime },
                },
                orderBy: { createdAt: 'desc' },
                take: 3,
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
              }).catch(() => []),
              prisma.user.count({
                where: { isOnline: true, isActive: true },
              }).catch(() => 0),
            ])

            if (messages.length > 0 || shoutOuts.length > 0 || worldChatMessages.length > 0 || notices.length > 0) {
              const data = JSON.stringify({
                type: 'update',
                timestamp: new Date().toISOString(),
                messages,
                worldChatMessages,
                shoutOuts,
                notices,
                onlineUsersCount,
              })

              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              lastMessageTime = new Date()
            }
          } catch (error) {
            console.error('SSE Error:', error)
          }
        }

        // Set up interval to check for new messages
        const interval = setInterval(sendEvent, 2000)

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
        'X-Accel-Buffering': 'no',
        'Transfer-Encoding': 'chunked',
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
