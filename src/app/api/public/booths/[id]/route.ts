import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// In-memory dedup for booth views (1-hour window per booth+viewer)
const boothViewDedup = new Map<string, number>()

function hashIp(ip: string): string {
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `ip_${Math.abs(hash)}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const booth = await prisma.booth.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            companyName: true,
            country: true,
            city: true,
            logoUrl: true,
            userId: true,
          }
        },
        products: {
          where: { isActive: true },
          orderBy: { viewCount: 'desc' },
          take: 60,
          include: {
            unit: {
              select: { name: true, nameEn: true }
            }
          }
        }
      }
    })

    if (!booth) {
      return NextResponse.json({ error: 'Booth not found' }, { status: 404 })
    }

    // View counting with dedup
    const session = await getServerSession(authOptions)
    const viewerId = session?.user?.id || null
    const isOwner = viewerId && booth.seller?.userId === viewerId

    if (!isOwner) {
      const forwarded = request.headers.get('x-forwarded-for')
      const ip = (forwarded?.split(',')[0]?.trim() ||
                  request.headers.get('x-real-ip') ||
                  request.ip || 'unknown') as string

      // Skip local IPs
      if (!['unknown', '::1', '127.0.0.1', 'localhost'].includes(ip)) {
        const now = Date.now()
        const dedupKey = `${id}:${hashIp(ip)}:${viewerId || 'anon'}`
        const lastView = boothViewDedup.get(dedupKey)

        if (!lastView || now - lastView > 60 * 60 * 1000) {
          await prisma.booth.update({
            where: { id },
            data: { viewCount: { increment: 1 } }
          })
          boothViewDedup.set(dedupKey, now)
        }
      }
    }

    return NextResponse.json({ booth })
  } catch (error) {
    console.error('Get booth detail error:', error)
    return NextResponse.json({ error: 'Failed to fetch booth' }, { status: 500 })
  }
}
