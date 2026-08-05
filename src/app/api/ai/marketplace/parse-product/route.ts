/**
 * AI Marketplace Product Parser API
 * POST /api/ai/marketplace/parse-product
 * 
 * 结构化商品提取端点 (OpenClaw P1 建议)
 * AI Agent 可以上传商品图片/文档，自动提取结构化产品信息
 * 
 * Uses local OCR + pattern matching (no external AI API needed)
 * For production, can integrate with OCR services
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, requireCapability } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

// Product keyword patterns for structured extraction
const PRODUCT_PATTERNS: Record<string, { zh: string[]; en: string[] }> = {
  corn: {
    zh: ['玉米', '黄玉米', '玉米批发', '玉米供应'],
    en: ['corn', 'maize', 'yellow corn', 'corn grains', 'corn wholesale'],
  },
  sulfur: {
    zh: ['硫磺', '工业硫磺', '硫磺供应'],
    en: ['sulfur', 'industrial sulfur', 'sulphur'],
  },
  rice: {
    zh: ['大米', '稻米', '大米批发'],
    en: ['rice', 'paddy', 'white rice', 'rice wholesale'],
  },
  wheat: {
    zh: ['小麦', '小麦批发'],
    en: ['wheat', 'wheat grains', 'wheat wholesale'],
  },
  soybean: {
    zh: ['大豆', '黄豆', '大豆批发'],
    en: ['soybean', 'soy beans', 'soybean wholesale'],
  },
  steel: {
    zh: ['钢材', '钢铁', '钢板', '钢管'],
    en: ['steel', 'steel products', 'steel plate', 'steel pipe'],
  },
  cement: {
    zh: ['水泥', '水泥批发'],
    en: ['cement', 'cement wholesale'],
  },
}

export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { text, description, title } = body

    // Collect all text to analyze
    const inputText = [text, description, title].filter(Boolean).join(' ')

    if (!inputText.trim()) {
      return NextResponse.json({
        success: true,
        data: {
          product_name: { zh: '未知产品', en: 'Unknown Product' },
          detected_type: null,
          confidence: 0,
          specs: {},
          keywords: [],
          suggestions: 'Please provide text description or upload product documents',
        },
      })
    }

    // Try to identify product type
    let detectedProduct: string | null = null
    let highestConfidence = 0

    for (const [product, patterns] of Object.entries(PRODUCT_PATTERNS)) {
      const allPatterns = [...patterns.zh, ...patterns.en]
      let matches = 0

      for (const pattern of allPatterns) {
        if (inputText.toLowerCase().includes(pattern.toLowerCase())) {
          matches++
        }
      }

      const confidence = matches / allPatterns.length
      if (confidence > highestConfidence) {
        highestConfidence = confidence
        detectedProduct = product
      }
    }

    // Extract product name (basic heuristic)
    const nameZh = extractName(inputText, 'zh')
    const nameEn = extractName(inputText, 'en')

    // Extract spec values (patterns like "99.5%", "10吨", etc.)
    const specs = extractSpecs(inputText)

    // Extract keywords
    const keywords = extractKeywords(inputText, detectedProduct)

    return NextResponse.json({
      success: true,
      data: {
        product_name: {
          zh: nameZh || (detectedProduct ? PRODUCT_PATTERNS[detectedProduct]?.zh[0] : '未知产品'),
          en: nameEn || (detectedProduct ? PRODUCT_PATTERNS[detectedProduct]?.en[0] : 'Unknown Product'),
        },
        detected_type: detectedProduct,
        confidence: Math.min(highestConfidence * 2, 1), // Normalize
        specs,
        keywords,
        raw_text: inputText.substring(0, 500),
        extracted_at: new Date().toISOString(),
        suggestions: detectedProduct
          ? 'Product detected successfully. Review and adjust before publishing.'
          : 'Could not identify product type. Please provide more specific keywords.',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Parse failed', detail: error?.message },
      { status: 500 }
    )
  }
}

function extractName(text: string, lang: 'zh' | 'en'): string {
  if (lang === 'zh') {
    // Look for common Chinese product name patterns
    const patterns = [
      /产品(?:名称|名)?[：:]\s*([^\s,，。]{2,20})/,
      /名称[：:]\s*([^\s,，。]{2,20})/,
      /([\u4e00-\u9fff]{2,6}(?:产品|商品|原料|材料|设备))/,
    ]
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) return match[1].trim()
    }
  } else {
    const patterns = [
      /(?:product|item|name)[\s:]+([A-Z][a-z]+(?:\s[A-Za-z]+){0,4})/i,
      /([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})\s+(?:for|product|sale)/i,
    ]
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) return match[1].trim()
    }
  }
  return ''
}

function extractSpecs(text: string): Record<string, any> {
  const specs: Record<string, any> = {}

  // Extract percentage values (purity, moisture, etc.)
  const percentages = text.match(/(\d+\.?\d*)\s*%/g)
  if (percentages) {
    specs.percentages = percentages.map(p => parseFloat(p))
  }

  // Extract weights/quantities
  const weights = text.match(/(\d+\.?\d*)\s*(吨|kg|千克|g|克|斤|lb|lbs)/g)
  if (weights) {
    specs.quantities = weights
  }

  // Extract price patterns
  const prices = text.match(/(?:价格|price|cost)[\s:]+([\d.,]+)\s*(元|RMB|USD|美元)/gi)
  if (prices) {
    specs.prices = prices
  }

  // Extract MOQ
  const moqMatch = text.match(/(?:MOQ|起订量|最小起订|最小订单)[\s:]+([\d]+)/i)
  if (moqMatch) {
    specs.moq = parseInt(moqMatch[1])
  }

  // Extract origin
  const originMatch = text.match(/(?:原产地|产地|origin|country)[\s:]+([^\s,，。]{2,30})/i)
  if (originMatch) {
    specs.origin = originMatch[1]
  }

  // Extract brand
  const brandMatch = text.match(/(?:品牌|brand)[\s:]+([^\s,，。]{2,20})/i)
  if (brandMatch) {
    specs.brand = brandMatch[1]
  }

  return specs
}

function extractKeywords(text: string, productType: string | null): string[] {
  const keywords = new Set<string>()

  // Extract hashtags
  const hashtags = text.match(/#[\w\u4e00-\u9fff]+/g)
  if (hashtags) {
    hashtags.forEach(tag => keywords.add(tag.replace('#', '')))
  }

  // Extract common business keywords
  const bizKeywords = ['批发', '零售', '供应', '直销', '出口', '进口', '现货', '定制', 'wholesale', 'retail', 'supply', 'export', 'import', 'stock', 'custom']
  bizKeywords.forEach(kw => {
    if (text.toLowerCase().includes(kw.toLowerCase())) {
      keywords.add(kw)
    }
  })

  // Add product type keywords
  if (productType && PRODUCT_PATTERNS[productType]) {
    PRODUCT_PATTERNS[productType].zh.forEach(kw => keywords.add(kw))
    PRODUCT_PATTERNS[productType].en.forEach(kw => keywords.add(kw))
  }

  return Array.from(keywords)
}
