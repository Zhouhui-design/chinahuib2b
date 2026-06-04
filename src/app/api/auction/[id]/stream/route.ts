import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const encoder = new TextEncoder()
  let intervalId: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const sendEvent = async () => {
          try {
            const listing = await prisma.auctionListing.findUnique({
              where: { id },
              include: {
                bids: {
                  orderBy: { createdAt: 'desc' },
                  take: 5,
                  include: { bidder: true },
                },
                currentWinner: true,
              },
            })

            if (listing) {
              const event = JSON.stringify({
                type: 'auction_update',
                data: {
                  id: listing.id,
                  title: listing.title,
                  currentPrice: listing.currentPrice?.toNumber() || 0,
                  startingPrice: listing.startingPrice.toNumber(),
                  reservePrice: listing.reservePrice?.toNumber() || 0,
                  currentWinner: listing.currentWinner?.username || null,
                  bids: listing.bids.map(bid => ({
                    id: bid.id,
                    bidderName: bid.bidder.username,
                    amount: bid.amount.toNumber(),
                    createdAt: bid.createdAt,
                  })),
                  endTime: listing.endTime,
                  status: listing.status,
                  bidCount: listing.bidCount,
                },
              })

              controller.enqueue(encoder.encode(`event: auction\ndata: ${event}\n\n`))
            }
          } catch (error) {
            console.error('Error fetching auction data:', error)
          }
        }

        await sendEvent()

        intervalId = setInterval(sendEvent, 2000)
      } catch (error) {
        console.error('Error starting SSE stream:', error)
        controller.error(error)
      }
    },

    cancel() {
      if (intervalId) {
        clearInterval(intervalId)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  })
}