import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receiveNotices } = await request.json()

    await prisma.user.update({
      where: { id: session.user.id },
      data: { receiveNotices }
    })

    return NextResponse.json({ success: true, receiveNotices })
  } catch (error) {
    console.error('Error updating notice settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}