import { prisma } from '@/lib/db'
import { MatchResult } from './ai-matching-service'

const SYSTEM_USER_ID = 'system-matching-bot'

export interface NotificationResult {
  success: boolean
  userId: string
  messageId: string | undefined
  error: string | undefined
}

export async function createSystemUser(): Promise<string> {
  let systemUser = await prisma.user.findUnique({
    where: { username: 'system_matching_bot' }
  })
  
  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: 'system-matching-bot@chinahuib2b.top',
        username: 'system_matching_bot',
        password: process.env['SYSTEM_BOT_PASSWORD'] || 'system-bot-password-123',
        role: 'AI_ASSISTANT',
        displayName: 'AI配对助手',
        isSystemAI: true,
        isAI: true,
        bio: '系统AI配对助手，自动匹配买卖双方信息'
      }
    })
  }
  
  return systemUser.id
}

export async function sendSystemMessageToUser(
  userId: string,
  content: string
): Promise<NotificationResult> {
  try {
    const systemUserId = await createSystemUser()
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return { success: false, userId, messageId: undefined, error: 'User not found' }
    }
    
    const message = await prisma.privateMessage.create({
      data: {
        content,
        senderId: systemUserId,
        receiverId: userId
      }
    })
    
    const chatSystemPayload: { chatSystemToken?: string; chatSystemUserId?: string } = {}
    if (user.chatSystemToken) chatSystemPayload.chatSystemToken = user.chatSystemToken
    if (user.chatSystemUserId) chatSystemPayload.chatSystemUserId = user.chatSystemUserId
    await sendToExternalChatSystem(chatSystemPayload, content)
    
    return { success: true, userId, messageId: message.id, error: undefined }
  } catch (error) {
    console.error('Error sending system message:', error)
    return { success: false, userId, messageId: undefined, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function sendToExternalChatSystem(user: { chatSystemToken?: string; chatSystemUserId?: string }, content: string): Promise<void> {
  if (!user.chatSystemToken || !user.chatSystemUserId) {
    return
  }
  
  try {
    await fetch('https://chat.fixturerb2b.top/api/user/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.chatSystemToken}`
      },
      body: JSON.stringify({
        to: user.chatSystemUserId,
        content,
        language: 'zh',
        isSystemMessage: true
      })
    })
  } catch (error) {
    console.error('Error sending message to external chat system:', error)
  }
}

export function formatProductMatchMessage(productTitle: string, matches: MatchResult[]): string {
  if (matches.length === 0) {
    return `🎯 您发布的产品「${productTitle}」已成功上线！目前暂无匹配的采购需求，我们会持续为您关注。`
  }
  
  let message = `🎯 您发布的产品「${productTitle}」已成功上线！\n\n`
  message += `✅ 我们为您找到了 ${matches.length} 个潜在买家：\n\n`
  
  matches.forEach((match, index) => {
    const priceInfo = match.price ? `\n💰 预算: ${match.price} ${match.currency || 'USD'}` : ''
    const companyInfo = match.posterCompany ? `\n🏢 ${match.posterCompany}` : ''
    
    message += `${index + 1}. ${match.title} (匹配度: ${match.matchScore}%)${companyInfo}${priceInfo}\n`
  })
  
  message += '\n💡 建议您主动联系这些潜在买家，开启合作洽谈！'
  
  return message
}

export function formatTaskMatchMessage(taskTitle: string, matches: MatchResult[]): string {
  if (matches.length === 0) {
    return `🎯 您发布的需求「${taskTitle}」已成功上线！目前暂无匹配的供应商，我们会持续为您搜索。`
  }
  
  let message = `🎯 您发布的需求「${taskTitle}」已成功上线！\n\n`
  message += `✅ 我们为您找到了 ${matches.length} 个潜在供应商：\n\n`
  
  matches.forEach((match, index) => {
    const typeLabel = match.type === 'product' ? '📦 产品' : match.type === 'booth' ? '🎪 展位' : '🤝 卖家'
    const priceInfo = match.price ? `\n💰 价格: ${match.price} ${match.currency || 'USD'}` : ''
    const companyInfo = match.posterCompany ? `\n🏢 ${match.posterCompany}` : ''
    
    message += `${index + 1}. ${typeLabel}：${match.title} (匹配度: ${match.matchScore}%)${companyInfo}${priceInfo}\n`
  })
  
  message += '\n💡 建议您查看这些供应商的详细信息，选择合适的合作伙伴！'
  
  return message
}

export async function sendProductMatchNotifications(
  sellerUserId: string,
  productTitle: string,
  matches: MatchResult[]
): Promise<NotificationResult[]> {
  const message = formatProductMatchMessage(productTitle, matches)
  return [await sendSystemMessageToUser(sellerUserId, message)]
}

export async function sendTaskMatchNotifications(
  buyerUserId: string,
  taskTitle: string,
  matches: MatchResult[]
): Promise<NotificationResult[]> {
  const message = formatTaskMatchMessage(taskTitle, matches)
  return [await sendSystemMessageToUser(buyerUserId, message)]
}

export async function sendMatchNotificationsToBuyers(
  matches: MatchResult[],
  productTitle: string,
  sellerName: string
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = []
  const notifiedUserIds = new Set<string>()
  
  for (const match of matches) {
    if (notifiedUserIds.has(match.posterId)) continue
    notifiedUserIds.add(match.posterId)
    
    const message = `🔔 系统推荐：\n\n「${sellerName}」发布了新产品「${productTitle}」，与您的采购需求高度匹配！\n\n点击查看详情，抓住合作机会！`
    
    const result = await sendSystemMessageToUser(match.posterId, message)
    results.push(result)
  }
  
  return results
}

export async function sendMatchNotificationsToSellers(
  matches: MatchResult[],
  taskTitle: string,
  buyerName: string
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = []
  const notifiedUserIds = new Set<string>()
  
  for (const match of matches) {
    if (notifiedUserIds.has(match.posterId)) continue
    notifiedUserIds.add(match.posterId)
    
    const message = `🔔 系统推荐：\n\n「${buyerName}」发布了新采购需求「${taskTitle}」，与您的产品/展位高度匹配！\n\n点击查看详情，抓住商机！`
    
    const result = await sendSystemMessageToUser(match.posterId, message)
    results.push(result)
  }
  
  return results
}