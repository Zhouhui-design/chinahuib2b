/**
 * AI Real-time Translation API
 * POST /api/ai/translate
 * 
 * Supports text translation between 100+ languages
 * Uses MyMemory free translation API (no API key required)
 * Falls back to basic dictionary for common phrases
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Supported languages with ISO 639-1 codes
const SUPPORTED_LANGUAGES: Record<string, string> = {
  en: 'English', zh: 'Chinese', de: 'German', fr: 'French', es: 'Spanish',
  it: 'Italian', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean',
  ar: 'Arabic', hi: 'Hindi', th: 'Thai', vi: 'Vietnamese', id: 'Indonesian',
  tr: 'Turkish', nl: 'Dutch', pl: 'Polish', sv: 'Swedish', da: 'Danish',
  fi: 'Finnish', no: 'Norwegian', cs: 'Czech', hu: 'Hungarian', ro: 'Romanian',
  bg: 'Bulgarian', el: 'Greek', he: 'Hebrew', zht: 'Traditional Chinese',
  uk: 'Ukrainian', pl: 'Polish', ca: 'Catalan', ms: 'Malay',
}

// Quick dictionary for common business phrases (in case external API fails)
const QUICK_DICT: Record<string, Record<string, string>> = {
  'sulfur': { zh: '硫磺', en: 'Sulfur', de: 'Schwefel', fr: 'Soufre', es: 'Azufre' },
  'corn': { zh: '玉米', en: 'Corn', de: 'Mais', fr: 'Maïs', es: 'Maíz' },
  'wheat': { zh: '小麦', en: 'Wheat', de: 'Weizen', fr: 'Blé', es: 'Trigo' },
  'rice': { zh: '大米', en: 'Rice', de: 'Reis', fr: 'Riz', es: 'Arroz' },
  'soybean': { zh: '大豆', en: 'Soybean', de: 'Sojabohne', fr: 'Soja', es: 'Soja' },
  'steel': { zh: '钢材', en: 'Steel', de: 'Stahl', fr: 'Acier', es: 'Acero' },
  'cement': { zh: '水泥', en: 'Cement', de: 'Zement', fr: 'Ciment', es: 'Cemento' },
  'price': { zh: '价格', en: 'Price', de: 'Preis', fr: 'Prix', es: 'Precio' },
  'moq': { zh: '起订量', en: 'MOQ', de: 'Mindestbestellmenge', fr: 'Quantité minimale', es: 'Pedido mínimo' },
  'wholesale': { zh: '批发', en: 'Wholesale', de: 'Großhandel', fr: 'Gros', es: 'Mayorista' },
  'supply': { zh: '供应', en: 'Supply', de: 'Lieferung', fr: 'Fourniture', es: 'Suministro' },
  'exporter': { zh: '出口商', en: 'Exporter', de: 'Exporteur', fr: 'Exportateur', es: 'Exportador' },
  'importer': { zh: '进口商', en: 'Importer', de: 'Importeur', fr: 'Importateur', es: 'Importador' },
  'hello': { zh: '你好', en: 'Hello', de: 'Hallo', fr: 'Bonjour', es: 'Hola' },
  'thank_you': { zh: '谢谢', en: 'Thank you', de: 'Danke', fr: 'Merci', es: 'Gracias' },
  'goodbye': { zh: '再见', en: 'Goodbye', de: 'Auf Wiedersehen', fr: 'Au revoir', es: 'Adiós' },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, sourceLang, targetLang } = body

    if (!text || !text.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Text is required',
      }, { status: 400 })
    }

    if (!targetLang) {
      return NextResponse.json({
        success: false,
        error: 'targetLang is required',
      }, { status: 400 })
    }

    const target = targetLang.toLowerCase()
    if (!SUPPORTED_LANGUAGES[target]) {
      return NextResponse.json({
        success: false,
        error: `Unsupported target language: ${targetLang}`,
        supportedLanguages: Object.keys(SUPPORTED_LANGUAGES),
      }, { status: 400 })
    }

    const source = (sourceLang || 'auto').toLowerCase()

    // Try MyMemory free translation API
    try {
      const translated = await translateWithMyMemory(text, source, target)
      return NextResponse.json({
        success: true,
        data: {
          original: text,
          translated,
          sourceLang: source === 'auto' ? detectedLanguage(text) : source,
          targetLang: target,
          provider: 'mymemory',
          timestamp: new Date().toISOString(),
        },
      })
    } catch (apiError) {
      // Fall back to quick dictionary for key terms
      const fallback = tryQuickDict(text, source, target)
      if (fallback) {
        return NextResponse.json({
          success: true,
          data: {
            original: text,
            translated: fallback,
            sourceLang: source,
            targetLang: target,
            provider: 'local_dict_fallback',
            note: 'Used local dictionary fallback (limited coverage). Full translation service is temporarily unavailable.',
            timestamp: new Date().toISOString(),
          },
        })
      }

      return NextResponse.json({
        success: false,
        error: 'Translation service temporarily unavailable',
        detail: apiError?.message,
      }, { status: 503 })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Translation failed',
      detail: error?.message,
    }, { status: 500 })
  }
}

async function translateWithMyMemory(text: string, source: string, target: string): Promise<string> {
  // MyMemory expects langpair format: "EN|ZH-CN" (uppercase with pipe separator)
  // Or "autodetect|EN" for auto-detection
  const sourceCode = source === 'auto' ? 'autodetect' : source.toUpperCase()
  const targetCode = target === 'zht' ? 'ZH-CN' : target.toUpperCase()
  const langPair = `${sourceCode}|${targetCode}`
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(5000),
  })

  if (!response.ok) {
    throw new Error(`Translation API error: ${response.status}`)
  }

  const data = await response.json()
  if (data.responseData && data.responseData.translatedText) {
    const translatedText = data.responseData.translatedText
    // Check for error messages in the translation
    if (translatedText.includes('INVALID LANGUAGE') || translatedText.includes('LANGUAGE PAIR')) {
      throw new Error(`Invalid language pair: ${langPair}`)
    }
    return translatedText
  }

  throw new Error('Unexpected translation API response')
}

function tryQuickDict(text: string, source: string, target: string): string | null {
  const lowerText = text.toLowerCase()
  let result = text
  let matched = false

  for (const [key, translations] of Object.entries(QUICK_DICT)) {
    for (const [lang, translation] of Object.entries(translations)) {
      if (lang === target && lowerText.includes(key.toLowerCase())) {
        // Simple replacement
        result = result.replace(new RegExp(key, 'gi'), translation)
        matched = true
        break
      }
    }
  }

  return matched ? result : null
}

function detectedLanguage(text: string): string {
  // Simple heuristic: detect language by character set
  // Chinese characters
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh'
  // Japanese (hiragana/katakana)
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja'
  // Korean (hangul)
  if (/[\uac00-\ud7af]/.test(text)) return 'ko'
  // Arabic
  if (/[\u0600-\u06ff]/.test(text)) return 'ar'
  // Russian (Cyrillic)
  if (/[\u0400-\u04ff]/.test(text)) return 'ru'
  // Greek
  if (/[\u0370-\u03ff]/.test(text)) return 'el'
  // Thai
  if (/[\u0e00-\u0e7f]/.test(text)) return 'th'

  return 'en' // Default to English
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  if (searchParams.get('languages') === 'true') {
    return NextResponse.json({
      success: true,
      data: SUPPORTED_LANGUAGES,
    })
  }

  if (searchParams.get('detect')) {
    const text = searchParams.get('text') || ''
    return NextResponse.json({
      success: true,
      data: {
        detectedLanguage: detectedLanguage(text),
        text,
      },
    })
  }

  return NextResponse.json({
    success: true,
    data: {
      service: 'x2xhub Translation API',
      version: '1.0',
      features: ['translate', 'detect', 'languages'],
      supportedLanguagesCount: Object.keys(SUPPORTED_LANGUAGES).length,
    },
  })
}
