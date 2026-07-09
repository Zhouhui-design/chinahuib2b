import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ success: true, data: units })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
