/**
 * AI API 认证中间件
 * 
 * 验证 API Key，检查速率限制，确保 AI 有必要的权限
 */

import { verifyAIApiKey, checkRateLimit } from '@/lib/ai-identity'

export interface AIRequestContext {
  aiIdentity?: {
    id: string
    name: string
    type: string
    capabilities: any
  }
}

export async function verifyAIRequest(request: Request) {
  // 1. 提取 API Key
  const authHeader = request.headers.get('authorization')
  const apiKey = authHeader?.replace('Bearer ', '')
  
  if (!apiKey) {
    return {
      authenticated: false,
      error: 'Authorization header with Bearer token required'
    }
  }
  
  // 2. 验证 API Key
  const identity = await verifyAIApiKey(apiKey)
  if (!identity) {
    return {
      authenticated: false,
      error: 'Invalid API key'
    }
  }
  
  // 3. 检查速率限制
  const rateCheck = await checkRateLimit(identity.id, 'request')
  if (!rateCheck.allowed) {
    return {
      authenticated: false,
      error: 'Rate limit exceeded',
      remaining: rateCheck.remaining
    }
  }
  
  // 4. 返回认证信息
  return {
    authenticated: true,
    identity: {
      id: identity.id,
      name: identity.name,
      type: identity.type,
      capabilities: identity.capabilities
    },
    remaining: rateCheck.remaining
  }
}

export function checkAICapability(
  identity: { capabilities: any },
  capability: 'canBuy' | 'canSell' | 'canChat' | 'canUpload' | 'canManageStore' | 'canAccessAdmin'
) {
  return identity.capabilities[capability] === true
}
