import { NextRequest, NextResponse } from "next/server"
import { verifyAIApiKey } from '@/lib/ai-identity'

const LANGUAGE_NAMES: Record<string, string> = {
  'zh': 'Chinese', 'ja': 'Japanese', 'ar': 'Arabic', 'es': 'Spanish',
  'fr': 'French', 'de': 'German', 'ko': 'Korean', 'ru': 'Russian',
  'pt': 'Portuguese', 'hi': 'Hindi', 'th': 'Thai', 'vi': 'Vietnamese',
  'en': 'English', 'id': 'Indonesian', 'ms': 'Malay', 'tr': 'Turkish',
  'pl': 'Polish', 'nl': 'Dutch', 'it': 'Italian', 'ro': 'Romanian', 'hu': 'Hungarian'
}

const MYMEMORY_API = 'https://api.mymemory.translated.net/get'

async function translateWithMyMemory(text: string, sourceLang: string, targetLang: string): Promise<{ translated: string; match: number }> {
  const langPair = `${sourceLang}|${targetLang}`
  const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${langPair}`

  try {
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!response.ok) throw new Error(`MyMemory API error: ${response.status}`)

    const data = await response.json()
    if (data.responseStatus === 200 && data.responseData) {
      return { translated: data.responseData.translatedText, match: data.responseData.match || 0 }
    }
    throw new Error(data.responseDetails || 'Translation failed')
  } catch (error) {
    console.error('MyMemory translation error:', error)
    throw error
  }
}

function detectLanguage(text: string): string {
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh'
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja'
  if (/[\uac00-\ud7af]/.test(text)) return 'ko'
  if (/[\u0600-\u06ff]/.test(text)) return 'ar'
  if (/[\u0400-\u04ff]/.test(text)) return 'ru'
  return 'en'
}

async function translateText(text: string, targetLang: string, sourceLang?: string): Promise<string> {
  if (!text.trim()) return ''

  const detectedSource = sourceLang || detectLanguage(text)
  if (detectedSource === targetLang) return text

  try {
    const result = await translateWithMyMemory(text, detectedSource, targetLang)
    return result.translated
  } catch (error) {
    console.error(`Translation error for ${targetLang}:`, error)
    return text
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      await verifyAIApiKey(authHeader.replace('Bearer ', ''))
    }

    const body = await request.json()
    const { text, targetLanguages } = body

    if (!text || !targetLanguages || !Array.isArray(targetLanguages)) {
      return NextResponse.json(
        { error: 'Text and targetLanguages array are required' },
        { status: 400 }
      )
    }

    const validLanguages = Object.keys(LANGUAGE_NAMES)
    for (const lang of targetLanguages) {
      if (!validLanguages.includes(lang)) {
        return NextResponse.json(
          { error: `Invalid target language: ${lang}. Supported: ${validLanguages.join(', ')}` },
          { status: 400 }
        )
      }
    }

    const translations: Record<string, { success: boolean; translated?: string; error?: string }> = {}

    for (const targetLang of targetLanguages) {
      try {
        const translated = await translateText(text, targetLang)
        translations[targetLang] = {
          success: true,
          translated
        }
      } catch (error) {
        translations[targetLang] = {
          success: false,
          error: error instanceof Error ? error.message : 'Translation failed'
        }
      }

      await new Promise(resolve => setTimeout(resolve, 200))
    }

    return NextResponse.json({
      success: true,
      original: text,
      translations,
      metadata: {
        translatedAt: new Date().toISOString(),
        languagesCount: targetLanguages.length
      }
    })
  } catch (error) {
    console.error('Bulk translation error:', error)
    return NextResponse.json(
      { error: 'Bulk translation failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
