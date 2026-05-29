import { NextRequest, NextResponse } from "next/server"
import { verifyAIApiKey } from '@/lib/ai-identity'

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
  'en': 'English',
  'id': 'Indonesian',
  'ms': 'Malay',
  'tr': 'Turkish',
  'pl': 'Polish',
  'nl': 'Dutch',
  'it': 'Italian',
  'ro': 'Romanian',
  'hu': 'Hungarian'
}

const MYMEMORY_API = 'https://api.mymemory.translated.net/get'

interface TranslationResult {
  success: boolean
  translation?: {
    original: string
    translated: string
    sourceLanguage: string
    targetLanguage: string
    targetLanguageName: string
    match?: number
  }
  error?: string
  metadata?: {
    translatedAt: string
    aiPowered: boolean
    cached?: boolean
  }
}

async function translateWithMyMemory(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ translated: string; match: number }> {
  const langPair = `${sourceLang}|${targetLang}`
  const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${langPair}`

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.responseStatus === 200 && data.responseData) {
      return {
        translated: data.responseData.translatedText,
        match: data.responseData.match || 0
      }
    }

    throw new Error(data.responseDetails || 'Translation failed')
  } catch (error) {
    console.error('MyMemory translation error:', error)
    throw error
  }
}

function detectLanguage(text: string): string {
  const chineseRegex = /[\u4e00-\u9fff]/
  const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/
  const koreanRegex = /[\uac00-\ud7af]/
  const arabicRegex = /[\u0600-\u06ff]/
  const cyrillicRegex = /[\u0400-\u04ff]/

  if (chineseRegex.test(text)) return 'zh'
  if (japaneseRegex.test(text)) return 'ja'
  if (koreanRegex.test(text)) return 'ko'
  if (arabicRegex.test(text)) return 'ar'
  if (cyrillicRegex.test(text)) return 'ru'

  return 'en'
}

async function translateText(
  text: string,
  targetLang: string,
  sourceLang?: string,
  useCache: boolean = true
): Promise<TranslationResult> {
  const detectedSource = sourceLang || detectLanguage(text)

  if (detectedSource === targetLang) {
    return {
      success: true,
      translation: {
        original: text,
        translated: text,
        sourceLanguage: detectedSource,
        targetLanguage: targetLang,
        targetLanguageName: LANGUAGE_NAMES[targetLang] || targetLang,
        match: 1
      },
      metadata: {
        translatedAt: new Date().toISOString(),
        aiPowered: false,
        cached: false
      }
    }
  }

  try {
    const result = await translateWithMyMemory(text, detectedSource, targetLang)

    return {
      success: true,
      translation: {
        original: text,
        translated: result.translated,
        sourceLanguage: detectedSource,
        targetLanguage: targetLang,
        targetLanguageName: LANGUAGE_NAMES[targetLang] || targetLang,
        match: result.match
      },
      metadata: {
        translatedAt: new Date().toISOString(),
        aiPowered: false,
        cached: useCache
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Translation failed',
      metadata: {
        translatedAt: new Date().toISOString(),
        aiPowered: false
      }
    }
  }
}

async function translateBatch(
  texts: string[],
  targetLang: string,
  sourceLang?: string
): Promise<{ results: TranslationResult[]; failedCount: number }> {
  const results: TranslationResult[] = []
  let failedCount = 0

  for (const text of texts) {
    const result = await translateText(text, targetLang, sourceLang)
    results.push(result)
    if (!result.success) {
      failedCount++
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return { results, failedCount }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let aiIdentity = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const apiKey = authHeader.replace('Bearer ', '')
      aiIdentity = await verifyAIApiKey(apiKey)
    }

    const body = await request.json()
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

    const result = await translateText(text, targetLanguage, sourceLanguage)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(result)

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

    const translations: Record<string, any> = {}
    for (const lang of targetLanguages) {
      try {
        const titleResult = await translateText(product.title || '', lang)
        const descResult = await translateText(product.description || '', lang)

        translations[lang] = {
          title: titleResult.translation?.translated || product.title,
          description: descResult.translation?.translated || product.description,
          success: titleResult.success && descResult.success
        }

        if (product.features && Array.isArray(product.features)) {
          translations[lang].features = []
          for (const feature of product.features) {
            const featureResult = await translateText(feature, lang)
            translations[lang].features.push(
              featureResult.translation?.translated || feature
            )
          }
        }

        if (product.specifications && typeof product.specifications === 'object') {
          translations[lang].specifications = {}
          for (const [key, value] of Object.entries(product.specifications)) {
            const keyResult = await translateText(key, lang)
            const valueResult = await translateText(String(value), lang)
            translations[lang].specifications[
              keyResult.translation?.translated || key
            ] = valueResult.translation?.translated || String(value)
          }
        }
      } catch (error) {
        console.error(`Translation error for ${lang}:`, error)
        translations[lang] = { success: false, error: 'Translation failed' }
      }

      await new Promise(resolve => setTimeout(resolve, 200))
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const texts = searchParams.get('texts')?.split('|') || []
  const targetLang = searchParams.get('target') || 'en'
  const sourceLang = searchParams.get('source') || undefined

  if (texts.length === 0) {
    return NextResponse.json({
      supportedLanguages: LANGUAGE_NAMES,
      usage: {
        method: 'POST',
        body: {
          text: 'Text to translate',
          targetLanguage: 'Target language code (e.g., zh, ja, es)',
          sourceLanguage: 'Optional source language (auto-detected if omitted)'
        }
      }
    })
  }

  const { results, failedCount } = await translateBatch(texts, targetLang, sourceLang)

  return NextResponse.json({
    success: true,
    results: results.map(r => r.translation?.translated || ''),
    metadata: {
      totalTexts: texts.length,
      failedCount,
      targetLanguage: targetLang,
      targetLanguageName: LANGUAGE_NAMES[targetLang] || targetLang
    }
  })
}
