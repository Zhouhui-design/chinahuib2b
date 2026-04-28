import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST - Report a dead link
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url, sourceUrl, statusCode = 404 } = body

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    // Check if already exists and is not resolved
    const existing = await prisma.deadLink.findUnique({
      where: { url }
    })

    if (existing && !existing.isResolved) {
      // Update last checked time
      await prisma.deadLink.update({
        where: { url },
        data: { 
          lastCheckedAt: new Date(),
          statusCode 
        }
      })
      return NextResponse.json({ success: true, message: 'Dead link already reported' })
    }

    // Create new dead link record
    const deadLink = await prisma.deadLink.create({
      data: {
        url,
        sourceUrl: sourceUrl || null,
        statusCode,
      }
    })

    return NextResponse.json({ success: true, deadLink })
  } catch (error) {
    console.error('Failed to report dead link:', error)
    return NextResponse.json({ error: 'Failed to report dead link' }, { status: 500 })
  }
}

// GET - Get all dead links (for admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const resolved = searchParams.get('resolved')

    const where = resolved ? { isResolved: resolved === 'true' } : {}

    const deadLinks = await prisma.deadLink.findMany({
      where,
      orderBy: { detectedAt: 'desc' },
      take: 100
    })

    return NextResponse.json({ success: true, deadLinks })
  } catch (error) {
    console.error('Failed to fetch dead links:', error)
    return NextResponse.json({ error: 'Failed to fetch dead links' }, { status: 500 })
  }
}

// PATCH - Mark dead link as resolved
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    await prisma.deadLink.update({
      where: { url },
      data: {
        isResolved: true,
        resolvedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to resolve dead link:', error)
    return NextResponse.json({ error: 'Failed to resolve dead link' }, { status: 500 })
  }
}
