import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Get all SEO configs (for admin panel)
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const configs = await prisma.sEOConfig.findMany({
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ success: true, configs })
  } catch (error) {
    console.error('Failed to fetch SEO configs:', error)
    return NextResponse.json({ error: 'Failed to fetch SEO configs' }, { status: 500 })
  }
}
