import { NextRequest, NextResponse } from 'next/server'
import { verifyAIApiKey, getAIIdentity, type AIIdentity } from '@/lib/ai-identity'
import { prisma } from '@/lib/db'

/**
 * GET /api/ai/keys
 * 
 * 获取 AI 密钥信息
 */
export async function GET(req: NextRequest) {
  try {
    // 从 Authorization 头获取 API Key
    const authHeader = req.headers.get('authorization')
    const apiKey = authHeader?.replace('Bearer ', '')
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }
    
    // 验证 API Key
    const identity = await verifyAIApiKey(apiKey)
    if (!identity) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }
    
    // 返回身份信息（不包含 API Key）
    return NextResponse.json({
      success: true,
      identity: {
        id: identity.id,
        name: identity.name,
        type: identity.type,
        capabilities: identity.capabilities,
        rateLimits: identity.rateLimits,
        status: identity.status,
        createdAt: identity.createdAt,
        lastActive: identity.lastActive,
      }
    })
  } catch (error) {
    console.error('[API Keys GET Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ai/keys
 * 
 * 生成新的 API 密钥（轮换密钥）
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const apiKey = authHeader?.replace('Bearer ', '')
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }
    
    const identity = await verifyAIApiKey(apiKey)
    if (!identity) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }
    
    // 导入 registerAIIdentity 来生成新密钥
    const { registerAIIdentity } = await import('@/lib/ai-identity')
    
    // 生成新的身份（保留原有信息）
    const newIdentity = await registerAIIdentity({
      name: identity.name,
      type: identity.type,
      email: identity.email,
      capabilities: identity.capabilities,
      metadata: {
        ...identity.metadata,
        rotatedFrom: identity.id,
        rotatedAt: new Date().toISOString(),
      }
    })
    
    return NextResponse.json({
      success: true,
      identity: {
        id: newIdentity.id,
        name: newIdentity.name,
        type: newIdentity.type,
        apiKey: newIdentity.apiKey,
        capabilities: newIdentity.capabilities,
        rateLimits: newIdentity.rateLimits,
        createdAt: newIdentity.createdAt,
      },
      warning: 'Old API key will be revoked in 7 days. Update your integration immediately!',
    })
  } catch (error) {
    console.error('[API Keys POST Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
