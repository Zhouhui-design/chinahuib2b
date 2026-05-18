import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 聊天系统访问控制中间件
 * 
 * 核心原则：
 * 1. AI可以访问公开频道和社区讨论
 * 2. AI完全禁止访问私人对话
 * 3. 所有访问都必须符合隐私保护政策
 */

// AI爬虫用户代理模式
const AI_BOT_PATTERNS = [
  /GPTBot/i,           // OpenAI ChatGPT
  /ChatGPT-User/i,     // ChatGPT用户
  /Google-Extended/i,  // Google Gemini
  /ClaudeBot/i,        // Anthropic Claude
  /Claude-Web/i,       // Claude Web
  /PerplexityBot/i,    // Perplexity
  /BingBot/i,          // Microsoft Bing/Copilot
  /msnbot/i,           // MSN Bot
  /YouBot/i,           // You.com
  /CCBot/i,            // Common Crawl
  /AI21Bot/i,          // AI21 Labs
  /cohere-ai/i,        // Cohere
  /HuggingFaceBot/i,   // Hugging Face
]

/**
 * 检测是否为AI爬虫
 */
function isAIBot(userAgent: string): boolean {
  return AI_BOT_PATTERNS.some(pattern => pattern.test(userAgent))
}

/**
 * 获取AI爬虫名称
 */
function getAIBotName(userAgent: string): string {
  if (/GPTBot/i.test(userAgent)) return 'GPTBot (OpenAI)'
  if (/ChatGPT-User/i.test(userAgent)) return 'ChatGPT User'
  if (/Google-Extended/i.test(userAgent)) return 'Google Extended (Gemini)'
  if (/ClaudeBot/i.test(userAgent)) return 'ClaudeBot (Anthropic)'
  if (/PerplexityBot/i.test(userAgent)) return 'PerplexityBot'
  if (/BingBot|msnbot/i.test(userAgent)) return 'BingBot (Microsoft)'
  if (/YouBot/i.test(userAgent)) return 'YouBot'
  if (/CCBot/i.test(userAgent)) return 'CCBot (Common Crawl)'
  if (/AI21Bot/i.test(userAgent)) return 'AI21Bot'
  if (/cohere-ai/i.test(userAgent)) return 'Cohere AI'
  if (/HuggingFaceBot/i.test(userAgent)) return 'HuggingFaceBot'
  return 'Unknown AI Bot'
}

export function chatAccessControl(req: NextRequest) {
  const path = req.nextUrl.pathname
  const userAgent = req.headers.get('user-agent') || ''
  const isAI = isAIBot(userAgent)
  
  // 记录访问日志（用于审计）
  console.log(`[Chat Access Control] Path: ${path}, AI: ${isAI}, User-Agent: ${userAgent.substring(0, 50)}`)
  
  // ========== 私人对话 - 严格禁止AI访问 ==========
  if (
    path.includes('/chat/private/') || 
    path.includes('/chat-system/private/') ||
    path.match(/\/[a-z]{2}\/chat\/private\//)
  ) {
    if (isAI) {
      const botName = getAIBotName(userAgent)
      console.warn(`[Privacy Violation] ${botName} attempted to access private chat: ${path}`)
      
      // 记录违规尝试
      logPrivacyViolation({
        botName,
        path,
        timestamp: new Date(),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      })
      
      return NextResponse.json(
        {
          error: 'Access Denied',
          message: 'AI bots are strictly prohibited from accessing private conversations',
          reason: 'privacy_protection',
          policy: 'https://chinahuib2b.top/privacy-policy',
        },
        { 
          status: 403,
          headers: {
            'X-Privacy-Policy': 'no-access-to-private-chats',
            'X-Robots-Tag': 'noindex, nofollow, noarchive',
          }
        }
      )
    }
    
    // 人类用户访问私人对话 - 需要认证
    // （这里假设auth middleware已经处理了认证）
  }
  
  // ========== 公开频道 - 允许AI访问 ==========
  if (
    path.includes('/chat/public/') ||
    path.includes('/chat/community/') ||
    path.match(/\/[a-z]{2}\/chat\/(public|community)\//)
  ) {
    if (isAI) {
      const botName = getAIBotName(userAgent)
      console.log(`[AI Access Allowed] ${botName} accessing public channel: ${path}`)
      
      const response = NextResponse.next()
      
      // 添加响应头，标识这是AI访问
      response.headers.set('X-AI-Access', 'allowed-public-only')
      response.headers.set('X-Privacy-Policy', 'no-personal-data-storage')
      response.headers.set('X-Robots-Tag', 'index, follow')
      response.headers.set('Cache-Control', 'public, max-age=3600')
      
      return response
    }
  }
  
  // ========== 其他路径 - 默认行为 ==========
  return NextResponse.next()
}

/**
 * 记录隐私违规尝试
 */
async function logPrivacyViolation(violation: {
  botName: string
  path: string
  timestamp: Date
  ip: string
}) {
  try {
    // 在实际实现中，这里应该写入数据库或日志系统
    // 为了安全，只保留最近24小时的违规记录
    
    const logEntry = {
      ...violation,
      id: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    
    // 写入Redis或文件系统（带TTL）
    // await redis.lpush('privacy:violations', JSON.stringify(logEntry))
    // await redis.expire('privacy:violations', 86400) // 24小时过期
    
    console.error('[Privacy Violation Logged]', logEntry)
  } catch (error) {
    console.error('[Failed to log privacy violation]', error)
  }
}
