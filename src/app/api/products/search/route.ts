/**
 * Example: Protected Product Search API with AI Agent Authentication
 * Demonstrates how to integrate AI Agent auth middleware into existing APIs
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateAgent } from '@/middleware/ai-agent-auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/products/search
 * Search products (with optional AI Agent authentication)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keyword = searchParams.get('keyword')
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    // Check if request is from an AI Agent
    const authHeader = request.headers.get('authorization')
    
    let agentInfo = null
    if (authHeader) {
      const auth = await authenticateAgent(request)
      
      if (!auth.success) {
        return NextResponse.json(
          { error: auth.error },
          { status: 401 }
        )
      }
      
      agentInfo = auth.agent
      
      // Log that this is an AI Agent request
      if (agentInfo) {
        console.log(`[AI Agent] ${agentInfo.role} searching products`, {
          userId: agentInfo.userId,
          keyword,
          timestamp: new Date().toISOString()
        })
      }
    }

    // Build query
    const where: any = {}

    if (keyword) {
      // 关键词搜索：标题 + 英文标题 + 描述 + keywords 数组（JSONB array_contains 命中 GIN 索引）
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { titleEn: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
        { keywords: { path: [], array_contains: keyword } },
      ]
    }

    if (category) {
      where.categoryId = category
    }

    // TODO: Product 模型没有 price 字段（价格在 AuctionListing），此条件不生效，待后续修复
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    // Query database
    const products = await prisma.product.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        seller: {
          select: {
            id: true,
            userId: true
          }
        }
      }
    })

    const total = await prisma.product.count({ where })

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      meta: agentInfo ? {
        authenticated: true,
        role: agentInfo.role,
        rateLimitRemaining: agentInfo.rateLimit
      } : {
        authenticated: false
      }
    })
  } catch (error) {
    console.error('[Products Search] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search products' },
      { status: 500 }
    )
  }
}
