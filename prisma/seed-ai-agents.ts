/**
 * Seed script to create system AI accounts and sample AI agents
 */

import { prisma } from '../src/lib/db'
import { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🤖 Creating system AI accounts...\n')

  // 1. Create System AI Assistant (Platform-owned)
  const systemAI = await prisma.user.upsert({
    where: { email: 'ai-assistant@chinahuib2b.top' },
    update: {},
    create: {
      email: 'ai-assistant@chinahuib2b.top',
      username: 'SystemAI_Assistant',
      password: await bcrypt.hash('system-ai-password-' + Date.now(), 10),
      role: UserRole.AI_ASSISTANT,
      displayName: 'ChinaHuiB2B AI Assistant',
      bio: 'Official AI assistant for ChinaHuiB2B platform. Helps buyers find products and sellers optimize their stores.',
      avatarUrl: '/images/ai-assistant-avatar.png',
      aiProvider: 'OpenAI',
      aiModel: 'GPT-4o',
      aiCapabilities: {
        productSearch: true,
        storeOptimization: true,
        taskMatching: true,
        customerSupport: true,
        multilingual: true,
        supportedLanguages: ['en', 'zh', 'es', 'fr', 'de', 'ar', 'ja', 'ko'],
      },
      isSystemAI: true,
      isActive: true,
    },
  })
  console.log(`✅ Created System AI Assistant: ${systemAI.username}`)

  // 2. Create Sample AI Buyer Agent
  const aiBuyer = await prisma.user.upsert({
    where: { email: 'ai-buyer-demo@chinahuib2b.top' },
    update: {},
    create: {
      email: 'ai-buyer-demo@chinahuib2b.top',
      username: 'AI_Buyer_Demo',
      password: await bcrypt.hash('ai-buyer-password-' + Date.now(), 10),
      role: UserRole.AI_BUYER,
      displayName: 'Demo AI Buyer Agent',
      company: 'Global Sourcing AI Inc.',
      location: 'San Francisco, USA',
      bio: 'Autonomous AI buyer agent that searches for manufacturers and negotiates deals on behalf of human clients.',
      avatarUrl: '/images/ai-buyer-avatar.png',
      aiProvider: 'Anthropic',
      aiModel: 'Claude-3.5-Sonnet',
      aiCapabilities: {
        productSearch: true,
        priceComparison: true,
        supplierVerification: true,
        negotiation: true,
        orderPlacement: false, // Requires human approval
        preferredCategories: ['Electronics', 'Textiles', 'Machinery'],
        budgetRange: { min: 1000, max: 100000, currency: 'USD' },
      },
      isSystemAI: false,
      isActive: true,
    },
  })
  console.log(`✅ Created AI Buyer Agent: ${aiBuyer.username}`)

  // 3. Create Sample AI Seller Agent
  const aiSeller = await prisma.user.upsert({
    where: { email: 'ai-seller-demo@chinahuib2b.top' },
    update: {},
    create: {
      email: 'ai-seller-demo@chinahuib2b.top',
      username: 'AI_Seller_Demo',
      password: await bcrypt.hash('ai-seller-password-' + Date.now(), 10),
      role: UserRole.AI_SELLER,
      displayName: 'Demo AI Seller Agent',
      company: 'SmartFactory AI Solutions',
      location: 'Shenzhen, China',
      bio: 'AI-powered seller agent that manages product listings, responds to inquiries, and optimizes pricing automatically.',
      avatarUrl: '/images/ai-seller-avatar.png',
      aiProvider: 'Google',
      aiModel: 'Gemini-Pro',
      aiCapabilities: {
        productListing: true,
        inquiryResponse: true,
        priceOptimization: true,
        inventoryManagement: true,
        marketingAutomation: true,
        analyticsReporting: true,
        supportedMarkets: ['North America', 'Europe', 'Southeast Asia'],
      },
      isSystemAI: false,
      isActive: true,
    },
  })
  console.log(`✅ Created AI Seller Agent: ${aiSeller.username}`)

  console.log('\n🎉 All AI accounts created successfully!\n')
  console.log('📋 Account Summary:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`System AI:       ${systemAI.email}`)
  console.log(`AI Buyer Demo:   ${aiBuyer.email}`)
  console.log(`AI Seller Demo:  ${aiSeller.email}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('✅ Users created. API keys can be generated via admin panel.')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
