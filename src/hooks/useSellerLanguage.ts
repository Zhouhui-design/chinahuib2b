'use client'

import { useState, useEffect } from 'react'

function getLanguageFromCookie(): string {
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';')
    const langCookie = cookies.find(c => c.trim().startsWith('language='))
    if (langCookie) {
      return langCookie.split('=')[1] || 'en'
    }
  }
  return 'en'
}

export function useSellerLanguage() {
  const [language, setLanguage] = useState<string>('en')

  useEffect(() => {
    // Initial load - read cookie once
    setLanguage(getLanguageFromCookie())

    // Check cookie when tab regains focus (e.g., user switched back from another tab)
    const handleFocus = () => {
      setLanguage(getLanguageFromCookie())
    }

    // Check cookie when page becomes visible (e.g., user returned to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setLanguage(getLanguageFromCookie())
      }
    }

    // Listen for custom language change event (dispatched by LanguageSwitcher)
    const handleLanguageChange = () => {
      setLanguage(getLanguageFromCookie())
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('languagechange', handleLanguageChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('languagechange', handleLanguageChange)
    }
  }, [])

  return language
}
