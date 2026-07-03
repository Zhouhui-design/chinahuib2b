import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  try {
    if (type === 'countries') {
      const countries = await prisma.verificationCountry.findMany({
        orderBy: { name: 'asc' },
      })
      return NextResponse.json({ success: true, data: countries })
    } else {
      const requests = await prisma.verificationRequest.findMany({
        include: {
          user: {
            select: { username: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ success: true, data: requests })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action } = body

  try {
    if (action === 'addCountry') {
      const { name, nameZh } = body
      const country = await prisma.verificationCountry.create({
        data: { name: name.trim(), nameZh: nameZh?.trim(), isEnabled: true },
      })
      return NextResponse.json({ success: true, data: country })
    } else if (action === 'toggleCountry') {
      const { id } = body
      const country = await prisma.verificationCountry.findUnique({ where: { id } })
      if (country) {
        await prisma.verificationCountry.update({ where: { id }, data: { isEnabled: !country.isEnabled } })
      }
      return NextResponse.json({ success: true })
    } else if (action === 'updateRequestStatus') {
      const { id, status } = body
      await prisma.verificationRequest.update({
        where: { id },
        data: { status, reviewedAt: new Date() },
      })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
