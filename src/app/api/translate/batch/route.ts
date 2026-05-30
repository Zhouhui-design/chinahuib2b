import { NextRequest, NextResponse } from "next/server"
import { translateText } from "@/lib/translation-service"

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLang = 'en', targetLangs = [] } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const translations: Record<string, string> = {}

    for (const targetLang of targetLangs) {
      if (targetLang === sourceLang) continue

      const result = await translateText(text, targetLang, sourceLang)
      if (result.success && result.translatedText) {
        translations[targetLang] = result.translatedText
      }
    }

    return NextResponse.json({
      success: true,
      translations,
      sourceLang,
      originalText: text
    })

  } catch (error) {
    console.error('Batch translation error:', error)
    return NextResponse.json({
      error: 'Translation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
