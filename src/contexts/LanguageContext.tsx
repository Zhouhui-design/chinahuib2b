'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, translations, Translations } from '../i18n/translations'
import { loadTranslations } from '../i18n/lazyTranslations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Detect language from browser
const getBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en'
  
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('zh')) return 'zh'
  if (browserLang.startsWith('es')) return 'es'
  if (browserLang.startsWith('fr')) return 'fr'
  if (browserLang.startsWith('de')) return 'de'
  if (browserLang.startsWith('ar')) return 'ar'
  if (browserLang.startsWith('pt')) return 'pt'
  if (browserLang.startsWith('ru')) return 'ru'
  if (browserLang.startsWith('ja')) return 'ja'
  if (browserLang.startsWith('ko')) return 'ko'
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [currentTranslations, setCurrentTranslations] = useState<Translations>(translations.en)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load translations when language changes
  useEffect(() => {
    const loadLangTranslations = async () => {
      if (!isInitialized) return
      
      console.log(`[i18n] Language changed to: ${language}`)
      setIsLoading(true)
      try {
        const loadedTranslations = await loadTranslations(language)
        setCurrentTranslations(loadedTranslations)
        console.log(`[i18n] Translations loaded successfully for: ${language}`)
      } catch (error) {
        console.error(`[i18n] Failed to load translations for ${language}:`, error)
        setCurrentTranslations(translations.en)
      } finally {
        setIsLoading(false)
      }
    }

    loadLangTranslations()
  }, [language, isInitialized])

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      // Priority 1: Check localStorage (user's explicit choice)
      const saved = typeof window !== 'undefined' ? localStorage.getItem('language') : null
      if (saved && translations[saved as Language]) {
        setLanguageState(saved as Language)
        setIsInitialized(true)
        console.log('[i18n] Using saved language preference:', saved)
        return
      }

      // Priority 2: Detect from browser
      const browserLang = getBrowserLanguage()
      setLanguageState(browserLang)
      setIsInitialized(true)
      console.log('[i18n] Detected browser language:', browserLang)
    }

    initializeLanguage()
  }, [])

  // Save language preference
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('language', language)
      document.documentElement.lang = language
    }
  }, [language, isInitialized])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: currentTranslations, isLoading }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
