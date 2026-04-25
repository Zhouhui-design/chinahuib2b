import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {

export const dynamic = 'force-dynamic'
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Fetch categories error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch categories' 
    }, { status: 500 })
  }
}
