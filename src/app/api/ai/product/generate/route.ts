import { NextRequest, NextResponse } from "next/server"
import { verifyAIApiKey } from '@/lib/ai-identity'

interface GenerateProductRequest {
  description: string
  category?: string
  targetLanguage?: string
  sellerId?: string
}

interface GeneratedProduct {
  title: string
  description: string
  price: number
  currency: string
  category: string
  images: string[]
  moq: number
  specifications: Record<string, string>
  languages: string[]
  features: string[]
  packaging: string
  supplyAbility: string
  qualityAssurance: string
}

const PRODUCT_TEMPLATES: Record<string, any> = {
  electronics: {
    features: ['High quality', 'Durable', 'Energy efficient', 'Modern design', 'Safe to use'],
    specifications: {
      'Material': 'Premium ABS plastic',
      'Power': 'DC 5V/2A',
      'Certification': 'CE, FCC, RoHS',
      'Warranty': '1 Year'
    },
    packaging: 'Retail box packaging',
    qualityAssurance: 'Factory tested'
  },
  clothing: {
    features: ['Comfortable', 'Breathable', 'Durable', 'Easy to wash', 'Trendy design'],
    specifications: {
      'Material': '100% Cotton',
      'Size': 'S-3XL available',
      'Color': 'Multiple colors',
      'Washing': 'Machine washable'
    },
    packaging: 'Polybag or box',
    qualityAssurance: 'QC checked'
  },
  default: {
    features: ['High quality', 'Competitive price', 'Fast delivery', 'Professional service', 'Customizable'],
    specifications: {
      'Material': 'Premium quality',
      'Origin': 'China',
      'Certification': 'Available',
      'Warranty': '6 months - 1 year'
    },
    packaging: 'Standard export packaging',
    qualityAssurance: 'Quality guaranteed'
  }
}

function analyzeProductDescription(description: string): string {
  const lowerDesc = description.toLowerCase()
  if (lowerDesc.includes('phone') || lowerDesc.includes('laptop') || lowerDesc.includes('camera') ||
      lowerDesc.includes('headphone') || lowerDesc.includes('speaker') || lowerDesc.includes('charger') ||
      lowerDesc.includes('electronic') || lowerDesc.includes('digital') || lowerDesc.includes('smart')) {
    return 'electronics'
  }
  if (lowerDesc.includes('shirt') || lowerDesc.includes('dress') || lowerDesc.includes('pants') ||
      lowerDesc.includes('jacket') || lowerDesc.includes('shoe') || lowerDesc.includes('clothing') ||
      lowerDesc.includes('wear') || lowerDesc.includes('fabric')) {
    return 'clothing'
  }
  return 'default'
}

function generateTitle(description: string, category: string): string {
  const words = description.split(/[,，\s]+/).filter(w => w.length > 2).slice(0, 5)
  const categoryNames: Record<string, string[]> = {
    electronics: ['Smart', 'Digital', 'Portable', 'Wireless', 'Premium'],
    clothing: ['Classic', 'Modern', 'Elegant', 'Comfortable', 'Trendy'],
    default: ['High Quality', 'Wholesale', 'Custom', 'Professional', 'Premium']
  }
  const prefixes = categoryNames[category] || categoryNames['default']
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${words.join(' ')}`
}

function generateDescription(title: string, description: string, features: string[]): string {
  return `${description}\n\n${title}\n\nKey Features:\n${features.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nThis product is manufactured with strict quality control standards. Suitable for wholesale and retail. We offer competitive pricing and reliable delivery. Contact us for custom orders and bulk pricing.`
}

function generatePrice(category: string): number {
  const priceRanges: Record<string, [number, number]> = {
    electronics: [29.99, 299.99],
    clothing: [9.99, 79.99],
    default: [4.99, 99.99]
  }
  const range = priceRanges[category] || priceRanges['default']
  return Math.round((Math.random() * (range[1] - range[0]) + range[0]) * 100) / 100
}

function generateMOQ(category: string): number {
  const moqRanges: Record<string, [number, number]> = {
    electronics: [5, 50],
    clothing: [50, 500],
    default: [10, 100]
  }
  const range = moqRanges[category] || moqRanges['default']
  return Math.floor(Math.random() * (range[1] - range[0]) + range[0])
}

function generateSupplyAbility(category: string): string {
  const abilities: Record<string, string[]> = {
    electronics: [
      '10000 pieces per month',
      '50000 pieces per month',
      'Based on order quantity'
    ],
    clothing: [
      '100000 pieces per month',
      '50000 pieces per month',
      'Flexible based on order'
    ],
    default: [
      '100000 pieces per month',
      '50000 pieces per month',
      'Negotiable'
    ]
  }
  const items = abilities[category] || abilities['default']
  return items[Math.floor(Math.random() * items.length)] || 'Negotiable'
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let aiIdentity = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const apiKey = authHeader.replace('Bearer ', '')
      aiIdentity = await verifyAIApiKey(apiKey)
    }

    const body: GenerateProductRequest = await request.json()
    const { description, category: categoryHint, targetLanguage, sellerId } = body

    if (!description || description.trim().length < 5) {
      return NextResponse.json(
        { error: 'Product description is required (minimum 5 characters)' },
        { status: 400 }
      )
    }

    const detectedCategory = categoryHint || analyzeProductDescription(description)
    const template = PRODUCT_TEMPLATES[detectedCategory] || PRODUCT_TEMPLATES['default']

    const title = generateTitle(description, detectedCategory)
    const features = [...template.features]
    const specifications = { ...template.specifications }

    if (specifications.Origin === 'China' && sellerId) {
      specifications['Production Capacity'] = generateSupplyAbility(detectedCategory)
    }

    const generatedProduct: GeneratedProduct = {
      title,
      description: generateDescription(title, description, features),
      price: generatePrice(detectedCategory),
      currency: 'USD',
      category: detectedCategory,
      images: [],
      moq: generateMOQ(detectedCategory),
      specifications,
      languages: targetLanguage ? [targetLanguage] : ['en'],
      features,
      packaging: template.packaging,
      supplyAbility: generateSupplyAbility(detectedCategory),
      qualityAssurance: template.qualityAssurance
    }

    await new Promise(resolve => setTimeout(resolve, 1500))

    return NextResponse.json({
      success: true,
      product: generatedProduct,
      metadata: {
        detectedCategory,
        generatedAt: new Date().toISOString(),
        aiPowered: !!aiIdentity
      }
    })

  } catch (error) {
    console.error('AI Product generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate product' },
      { status: 500 }
    )
  }
}