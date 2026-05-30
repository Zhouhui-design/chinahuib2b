'use client'

import { useState, useEffect } from 'react'
import { Globe, Languages, Sparkles, Check, X, RefreshCw, Zap } from 'lucide-react'

interface MultilingualInputProps {
  value: Record<string, string>
  onChange: (value: Record<string, string>) => void
  placeholder?: Record<string, string>
  label?: string
  rows?: number
  autoTranslate?: boolean
  sourceLanguage?: string
  className?: string
  showPreview?: boolean
}

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
]

export default function MultilingualInput({
  value = {},
  onChange,
  placeholder,
  label,
  rows = 4,
  className = '',
  showPreview = true
}: MultilingualInputProps) {
  const [activeLang, setActiveLang] = useState('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationProgress, setTranslationProgress] = useState<number>(0)
  const [lastTranslateLang, setLastTranslateLang] = useState<string>('')
  const [showPreviewPanel, setShowPreviewPanel] = useState(false)

  const currentValue = value[activeLang] || ''
  const hasContent = Object.values(value).some(v => v && v.trim().length > 0)
  const filledLanguages = Object.keys(value).filter(k => value[k] && value[k].trim().length > 0)
  const hasTranslation = filledLanguages.length > 1

  const handleChange = (langCode: string, text: string) => {
    onChange({
      ...value,
      [langCode]: text
    })
  }

  const handleSingleTranslate = async (targetLang: string) => {
    const sourceText = value['en'] || value['zh'] || Object.values(value).find(v => v)
    if (!sourceText || value[targetLang]) return

    const sourceLang = value['en'] ? 'en' : value['zh'] ? 'zh' : 'en'
    if (sourceLang === targetLang) return

    try {
      const response = await fetch('/api/translate/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLangs: [targetLang]
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.translations[targetLang]) {
          onChange({
            ...value,
            [targetLang]: data.translations[targetLang]
          })
        }
      }
    } catch (error) {
      console.error('Translation error:', error)
    }
  }

  const handleAutoTranslate = async () => {
    const sourceText = value['en'] || value['zh'] || Object.values(value).find(v => v)
    if (!sourceText) return

    const sourceLang = value['en'] ? 'en' : value['zh'] ? 'zh' : 'en'
    const targetLangs = languages.map(l => l.code).filter(c => c !== sourceLang && !value[c])
    
    if (targetLangs.length === 0) {
      setLastTranslateLang('all')
      return
    }

    setIsTranslating(true)
    setTranslationProgress(0)
    
    try {
      const response = await fetch('/api/translate/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLangs
        })
      })

      if (response.ok) {
        const data = await response.json()
        const newValue = { ...value, [sourceLang]: sourceText }
        let translatedCount = 0
        
        languages.forEach(lang => {
          if (data.translations[lang.code]) {
            newValue[lang.code] = data.translations[lang.code]
            translatedCount++
            setTranslationProgress(Math.round((translatedCount / targetLangs.length) * 100))
          }
        })
        onChange(newValue)
        setLastTranslateLang('all')
      }
    } catch (error) {
      console.error('Translation error:', error)
    } finally {
      setIsTranslating(false)
      setTranslationProgress(100)
      
      setTimeout(() => {
        setLastTranslateLang('')
        setTranslationProgress(0)
      }, 3000)
    }
  }

  const handleClearLanguage = (langCode: string) => {
    const newValue = { ...value }
    delete newValue[langCode]
    onChange(newValue)
  }

  const getSourceLang = () => {
    if (value['en']) return 'en'
    if (value['zh']) return 'zh'
    return Object.keys(value)[0] || 'en'
  }

  useEffect(() => {
    if (showPreview && hasTranslation) {
      setShowPreviewPanel(true)
    }
  }, [hasTranslation, showPreview])

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          {showPreview && hasTranslation && (
            <button
              type="button"
              onClick={() => setShowPreviewPanel(!showPreviewPanel)}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {showPreviewPanel ? 'Hide Preview' : 'Show Preview'}
            </button>
          )}
        </div>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-3 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 overflow-x-auto flex-1">
              {languages.map(lang => {
                const isFilled = value[lang.code] && value[lang.code].trim().length > 0
                const isSource = getSourceLang() === lang.code
                
                return (
                  <div key={lang.code} className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveLang(lang.code)}
                      className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-all ${
                        activeLang === lang.code
                          ? 'bg-blue-600 text-white shadow-md'
                          : isFilled
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                      title={lang.name}
                    >
                      <span className="mr-1">{lang.flag}</span>
                      <span className="text-xs font-medium">{lang.code.toUpperCase()}</span>
                      {isSource && activeLang === lang.code && (
                        <span className="ml-1 text-xs">*</span>
                      )}
                    </button>
                    
                    {isFilled && activeLang !== lang.code && (
                      <button
                        type="button"
                        onClick={() => handleClearLanguage(lang.code)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                        title="Clear"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    
                    {!isFilled && hasContent && (
                      <button
                        type="button"
                        onClick={() => handleSingleTranslate(lang.code)}
                        disabled={isTranslating}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50"
                        title={`Translate to ${lang.name}`}
                      >
                        <Sparkles className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {isTranslating && (
                <div className="flex items-center gap-2 mr-2">
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-xs text-gray-600">{translationProgress}%</span>
                </div>
              )}
              
              {lastTranslateLang && !isTranslating && (
                <div className="flex items-center gap-1 mr-2 text-green-600 text-xs">
                  <Check className="w-4 h-4" />
                  Translated!
                </div>
              )}
              
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={isTranslating || !hasContent}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm hover:shadow-md transition-all"
              >
                <Sparkles className={`w-4 h-4 ${isTranslating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline font-medium">AI Translate All</span>
                <Zap className="w-3 h-3 hidden sm:block" />
              </button>
            </div>
          </div>

          {hasContent && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <Globe className="w-3 h-3" />
              <span>Source: {languages.find(l => l.code === getSourceLang())?.nativeName}</span>
              <span className="text-gray-300">|</span>
              <span>{filledLanguages.length} / {languages.length} languages</span>
            </div>
          )}
        </div>

        <textarea
          value={currentValue}
          onChange={(e) => handleChange(activeLang, e.target.value)}
          placeholder={placeholder?.[activeLang] || `Enter ${languages.find(l => l.code === activeLang)?.name} content...`}
          rows={rows}
          className="w-full px-4 py-3 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none bg-white text-gray-900 placeholder-gray-400"
        />

        <div className="bg-gray-50 px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-gray-500">
              <Languages className="w-4 h-4" />
              {filledLanguages.length} filled
            </span>
            {activeLang && (
              <span className="text-gray-600 font-medium">
                Current: {languages.find(l => l.code === activeLang)?.nativeName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <span className="text-xs">Tip: Fill English or Chinese first, then auto-translate</span>
          </div>
        </div>
      </div>

      {showPreviewPanel && hasTranslation && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Translation Preview
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
            {filledLanguages.map(code => {
              const lang = languages.find(l => l.code === code)
              return (
                <div key={code} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <span>{lang?.flag}</span>
                    <span className="text-xs font-medium text-gray-700">{lang?.code.toUpperCase()}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{value[code]}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
