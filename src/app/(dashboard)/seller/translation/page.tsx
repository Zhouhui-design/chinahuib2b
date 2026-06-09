'use client'

import { useState } from 'react'

const LANGUAGES = [
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
]

const PRESET_TEXTS = [
  { label: 'Product Title', text: 'Premium Wireless Bluetooth Headphones with Noise Cancellation' },
  { label: 'Product Description', text: 'Experience crystal-clear audio with our latest wireless headphones. Features active noise cancellation, 30-hour battery life, and premium comfort cushions for extended wear.' },
  { label: 'Welcome Message', text: 'Welcome to our store! We offer the best quality products at competitive prices. Free shipping on orders over $50.' },
  { label: 'Thank You', text: 'Thank you for your purchase! Your order has been received and is being processed. We will send you tracking information once shipped.' },
]

interface TranslationResult {
  success?: boolean
  title?: string
  translated?: string
}

export default function TranslationPage() {
  const [sourceText, setSourceText] = useState('')
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('zh')
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTranslate = async () => {
    if (!sourceText.trim()) return

    setIsTranslating(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          targetLanguage: targetLang,
          sourceLanguage: sourceLang === 'auto' ? undefined : sourceLang
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Translation failed')
      }

      if (data.success && data.translation) {
        setTranslations({
          [targetLang]: data.translation.translated
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleBulkTranslate = async () => {
    if (!sourceText.trim()) return

    setIsTranslating(true)
    setError(null)

    const targetLangs = LANGUAGES.map(l => l.code).filter(code => code !== sourceLang && code !== 'auto')

    try {
      const response = await fetch('/api/ai/translate/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          targetLanguages: targetLangs
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Bulk translation failed')
      }

      if (data.translations) {
        const result: Record<string, string> = {}
        for (const [lang, trans] of Object.entries(data.translations)) {
          const transData = trans as TranslationResult
          if (transData.success !== false) {
            result[lang] = transData.title || transData.translated || sourceText
          }
        }
        setTranslations(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk translation failed')
    } finally {
      setIsTranslating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🌐 Multi-Language Translation</h1>
        <p className="text-gray-600">Translate your product content to multiple languages instantly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Source Text</h2>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="auto">Auto Detect</option>
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
              ))}
            </select>
          </div>

          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Enter text to translate..."
            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !sourceText.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTranslating ? 'Translating...' : 'Translate'}
            </button>
            <button
              onClick={handleBulkTranslate}
              disabled={isTranslating || !sourceText.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTranslating ? 'Translating...' : 'Translate to All Languages'}
            </button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_TEXTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setSourceText(preset.text)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Translation Result</h2>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
              ))}
            </select>
          </div>

          <div className="h-48 p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto">
            {translations[targetLang] ? (
              <p className="text-gray-900 whitespace-pre-wrap">{translations[targetLang]}</p>
            ) : (
              <p className="text-gray-400 italic">Translation will appear here...</p>
            )}
          </div>

          {translations[targetLang] && (
            <button
              onClick={() => copyToClipboard(translations[targetLang] || '')}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Copy to Clipboard
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}

      {Object.keys(translations).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Translations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(translations).map(([lang, text]) => {
              const langInfo = LANGUAGES.find(l => l.code === lang)
              return (
                <div key={lang} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {langInfo?.flag} {langInfo?.name}
                    </span>
                    <button
                      onClick={() => copyToClipboard(text)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{text}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Supported Languages (21 languages)</h3>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <span key={lang.code} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200">
              {lang.flag} {lang.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
