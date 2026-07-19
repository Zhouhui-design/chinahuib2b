import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { invalidateCategoryCaches } from "@/lib/cache"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type } = body

    if (type === 'categories') {
      await invalidateCategoryCaches()
      return NextResponse.json({ 
        success: true, 
        message: '分类缓存已清除' 
      }, { status: 200 })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid cache type' 
    }, { status: 400 })
  } catch (error) {
    console.error('Clear cache error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clear cache' 
    }, { status: 500 })
  }
}