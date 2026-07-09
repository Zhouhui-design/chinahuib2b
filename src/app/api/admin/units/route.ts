import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const all = searchParams.get('all')

  try {
    if (all === 'true') {
      const units = await prisma.unit.findMany({
        orderBy: { sortOrder: 'asc' },
      })
      return NextResponse.json({ success: true, data: units })
    } else {
      const units = await prisma.unit.findMany({
        where: { isEnabled: true },
        orderBy: { sortOrder: 'asc' },
      })
      return NextResponse.json({ success: true, data: units })
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
    if (action === 'create') {
      const { name, nameEn, symbol, description, sortOrder } = body
      const unit = await prisma.unit.create({
        data: {
          name: name.trim(),
          nameEn: nameEn.trim(),
          symbol: symbol?.trim() || null,
          description: description?.trim() || null,
          sortOrder: sortOrder || 0,
        },
      })
      return NextResponse.json({ success: true, data: unit })
    } else if (action === 'update') {
      const { id, name, nameEn, symbol, description, sortOrder, isEnabled } = body
      const unit = await prisma.unit.update({
        where: { id },
        data: {
          name: name?.trim(),
          nameEn: nameEn?.trim(),
          symbol: symbol?.trim() || null,
          description: description?.trim() || null,
          sortOrder: sortOrder,
          isEnabled,
        },
      })
      return NextResponse.json({ success: true, data: unit })
    } else if (action === 'delete') {
      const { id } = body
      await prisma.unit.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
