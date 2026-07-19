import { NextRequest, NextResponse } from "next/server"
import { invalidateCategoryCaches, cacheDelete, CACHE_KEYS } from '@/lib/cache'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    if (type === 'categories') {
      await invalidateCategoryCaches()
      return NextResponse.json({ 
        success: true, 
        message: '分类缓存已清除' 
      }, { status: 200 })
    }

    if (type === 'all') {
      await invalidateCategoryCaches()
      await cacheDelete(CACHE_KEYS.categoryTree())
      return NextResponse.json({ 
        success: true, 
        message: '所有缓存已清除' 
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