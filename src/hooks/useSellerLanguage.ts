'use client'

import { useState, useEffect } from 'react'

export function useSellerLanguage() {
  const [language, setLanguage] = useState('en')
  
  useEffect(() => {
    // Get language from cookie
    const cookies = document.cookie.split(';')
    const langCookie = cookies.find(c => c.trim().startsWith('language='))
    if (langCookie) {
      setLanguage(langCookie.split('=')[1])
    }
    
    // Listen for language changes
    const handleStorageChange = () => {
      const cookies = document.cookie.split(';')
      const langCookie = cookies.find(c => c.trim().startsWith('language='))
      if (langCookie) {
        setLanguage(langCookie.split('=')[1])
      }
    }
    
    // Check for language changes every second (since cookie changes don't trigger storage events)
    const interval = setInterval(handleStorageChange, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return language
}
