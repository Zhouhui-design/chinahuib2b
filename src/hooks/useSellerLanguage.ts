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
    // Initial load
    setLanguage(getLanguageFromCookie())
    
    // Poll for language changes every 100ms
    const interval = setInterval(() => {
      const currentLang = getLanguageFromCookie()
      setLanguage(prev => {
        if (prev !== currentLang) {
          return currentLang
        }
        return prev
      })
    }, 100)
    
    return () => clearInterval(interval)
  }, [])
  
  return language
}
