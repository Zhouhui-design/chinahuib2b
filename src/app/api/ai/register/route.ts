import { NextResponse } from 'next/server'
import { registerAIIdentity, type AIAgentType } from '@/lib/ai-identity'

/**
 * POST /api/ai/register
 * 
 * AI 注册端点
 * 允许 LINGMA, Trae, Qoder, Comate, OpenClaw 等 AI 注册账户
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    const { name, type, email, capabilities, metadata } = body
    
    // 验证必填字段
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type' },
        { status: 400 }
      )
    }
    
    // 验证 AI 类型
    const validTypes: AIAgentType[] = [
      'lingma',
      'trae',
      'qoder',
      'comate',
      'openclaw',
      'claude_code',
      'hermes',
      'arkclaw',
      'workbuddy',
      'codebuddy',
      'other',
    ]
    
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid AI type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }
    
    // 注册 AI 身份
    const identity = await registerAIIdentity({
      name,
      type: type as AIAgentType,
      email,
      capabilities,
      metadata,
    })
    
    // 返回身份信息（不包含敏感数据）
    return NextResponse.json(
      {
        success: true,
        identity: {
          id: identity.id,
          name: identity.name,
          type: identity.type,
          apiKey: identity.apiKey,  // API Key 只在注册时返回一次
          capabilities: identity.capabilities,
          rateLimits: identity.rateLimits,
          createdAt: identity.createdAt,
        },
        message: 'AI identity registered successfully. Please save your API key securely.',
        warning: 'This API key will not be shown again. Store it safely!',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[AI Registration Error]', error)
    
    return NextResponse.json(
      {
        error: 'Failed to register AI identity',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
