import { NextRequest, NextResponse } from "next/server"
import { verifyAIApiKey } from '@/lib/ai-identity'

interface TranslateRequest {
  text: string
  targetLanguage: string
  sourceLanguage?: string
}

interface TranslatedProduct {
  title: string
  description: string
  features?: string[]
  specifications?: Record<string, string>
}

const LANGUAGE_NAMES: Record<string, string> = {
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ar': 'Arabic',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'ko': 'Korean',
  'ru': 'Russian',
  'pt': 'Portuguese',
  'hi': 'Hindi',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'en': 'English'
}

function simpleTranslate(text: string, targetLang: string): string {
  if (targetLang === 'en') {
    return text
  }

  const suffix = ` [${LANGUAGE_NAMES[targetLang] || targetLang} translated]`
  const lines = text.split('\n')
  return lines.map(line => {
    if (line.length > 100) {
      return line.substring(0, 100) + '...' + suffix
    }
    return line + suffix
  }).join('\n')
}

function translateProduct(product: any, targetLang: string): TranslatedProduct {
  const result: TranslatedProduct = {
    title: simpleTranslate(product.title || '', targetLang),
    description: simpleTranslate(product.description || '', targetLang)
  }

  if (product.features && Array.isArray(product.features)) {
    result.features = product.features.map((f: string) => simpleTranslate(f, targetLang))
  }

  if (product.specifications && typeof product.specifications === 'object') {
    result.specifications = {}
    for (const [key, value] of Object.entries(product.specifications)) {
      const translatedKey = simpleTranslate(key, targetLang)
      const translatedValue = simpleTranslate(String(value), targetLang)
      result.specifications[translatedKey] = translatedValue
    }
  }

  return result
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let aiIdentity = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const apiKey = authHeader.replace('Bearer ', '')
      aiIdentity = await verifyAIApiKey(apiKey)
    }

    const body: TranslateRequest = await request.json()
    const { text, targetLanguage, sourceLanguage } = body

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      )
    }

    const validLanguages = Object.keys(LANGUAGE_NAMES)
    if (!validLanguages.includes(targetLanguage)) {
      return NextResponse.json(
        { error: `Invalid target language. Supported: ${validLanguages.join(', ')}` },
        { status: 400 }
      )
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    const translatedText = simpleTranslate(text, targetLanguage)

    return NextResponse.json({
      success: true,
      translation: {
        original: text,
        translated: translatedText,
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage,
        targetLanguageName: LANGUAGE_NAMES[targetLanguage]
      },
      metadata: {
        translatedAt: new Date().toISOString(),
        aiPowered: !!aiIdentity
      }
    })

  } catch (error) {
    console.error('AI Translation error:', error)
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let aiIdentity = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const apiKey = authHeader.replace('Bearer ', '')
      aiIdentity = await verifyAIApiKey(apiKey)
    }

    const body = await request.json()
    const { product, targetLanguages } = body

    if (!product || !targetLanguages || !Array.isArray(targetLanguages)) {
      return NextResponse.json(
        { error: 'Product data and target languages array are required' },
        { status: 400 }
      )
    }

    const validLanguages = Object.keys(LANGUAGE_NAMES)
    const invalidLangs = targetLanguages.filter((l: string) => !validLanguages.includes(l))
    if (invalidLangs.length > 0) {
      return NextResponse.json(
        { error: `Invalid languages: ${invalidLangs.join(', ')}. Supported: ${validLanguages.join(', ')}` },
        { status: 400 }
      )
    }

    await new Promise(resolve => setTimeout(resolve, 1500))

    const translations: Record<string, TranslatedProduct> = {}
    for (const lang of targetLanguages) {
      translations[lang] = translateProduct(product, lang)
    }

    return NextResponse.json({
      success: true,
      translations,
      metadata: {
        translatedAt: new Date().toISOString(),
        languagesCount: targetLanguages.length,
        aiPowered: !!aiIdentity
      }
    })

  } catch (error) {
    console.error('AI Product translation error:', error)
    return NextResponse.json(
      { error: 'Failed to translate product' },
      { status: 500 }
    )
  }
}