import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

/**
 * AI 搜索引擎优化的 API 端点
 * 
 * 专门为 AI 爬虫（GPTBot, ClaudeBot, PerplexityBot等）提供结构化数据
 * 帮助 AI 更好地理解和索引平台内容
 */

// GET /api/ai/platform-info
// 返回平台的结构化信息
export async function GET() {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  
  // 记录 AI 爬虫访问
  if (isAIBot(userAgent)) {
    console.log(`[AI Bot Access] ${userAgent} accessed platform info`)
  }
  
  const platformInfo = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ChinaHui B2B',
    description: 'Leading B2B marketplace connecting Chinese manufacturers with global buyers',
    url: 'https://chinahuib2b.top',
    logo: 'https://chinahuib2b.top/logo.png',
    sameAs: [
      'https://linkedin.com/company/chinahuib2b',
      'https://twitter.com/chinahuib2b',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+86-xxx-xxxx-xxxx',
      contactType: 'customer service',
      availableLanguage: ['English', 'Chinese', 'Spanish', 'Arabic'],
    },
    areaServed: 'Global',
    knowsAbout: [
      'Wholesale Products',
      'Manufacturing',
      'B2B Trading',
      'Supply Chain',
      'Import Export',
    ],
    numberOfEmployees: '50-100',
    foundingDate: '2024',
  }
  
  return NextResponse.json(platformInfo, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/ld+json',
    },
  })
}

// GET /api/ai/categories
// 返回产品分类的结构化数据
export async function GET_categories() {
  const categories = [
    {
      '@type': 'Category',
      name: 'Electronics',
      description: 'Consumer electronics, components, and accessories',
      url: 'https://chinahuib2b.top/categories/electronics',
      productCount: 15000,
    },
    {
      '@type': 'Category',
      name: 'Machinery',
      description: 'Industrial machinery and equipment',
      url: 'https://chinahuib2b.top/categories/machinery',
      productCount: 8000,
    },
    {
      '@type': 'Category',
      name: 'Textiles',
      description: 'Fabrics, garments, and textile products',
      url: 'https://chinahuib2b.top/categories/textiles',
      productCount: 12000,
    },
    // ... more categories
  ]
  
  return NextResponse.json({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: categories,
  })
}

// GET /api/ai/faq
// 返回常见问题解答
export async function GET_faq() {
  const faqs = [
    {
      '@type': 'Question',
      name: 'How do I find suppliers on ChinaHui B2B?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can search for suppliers by category, location, or product name. Use our advanced filters to narrow down results by minimum order quantity, price range, and supplier verification status.',
      },
    },
    {
      '@type': 'Question',
      name: 'What payment methods are accepted?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We support multiple payment methods including T/T (Bank Transfer), L/C (Letter of Credit), PayPal, and Alibaba Trade Assurance. Payment terms are negotiated directly with suppliers.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I verify a supplier?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Look for verified badges on supplier profiles. We conduct business license verification, factory audits, and collect customer reviews. You can also request samples before placing large orders.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the minimum order quantity (MOQ)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MOQ varies by supplier and product. Most suppliers list their MOQ on product pages. You can negotiate MOQ directly with suppliers through our messaging system.',
      },
    },
  ]
  
  return NextResponse.json({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs,
  })
}

// Helper function to detect AI bots
function isAIBot(userAgent: string): boolean {
  const aiPatterns = [
    /GPTBot/i,
    /ChatGPT-User/i,
    /Google-Extended/i,
    /ClaudeBot/i,
    /PerplexityBot/i,
    /BingBot/i,
    /YouBot/i,
  ]
  
  return aiPatterns.some(pattern => pattern.test(userAgent))
}
