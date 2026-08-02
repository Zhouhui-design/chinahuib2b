'use client'

import { useState, useEffect } from 'react'
import { Cookie, X, Settings, Check } from 'lucide-react'

export interface CookieConsentState {
  analytics: boolean
  marketing: boolean
  necessary: boolean
}

const DEFAULT_STATE: CookieConsentState = {
  analytics: false,
  marketing: false,
  necessary: true,
}

const STORAGE_KEY = 'seaheart_global_cookie_consent'

function getStoredConsent(): CookieConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function setStoredConsent(state: CookieConsentState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
}

function applyConsentToGA4(state: CookieConsentState): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      analytics_storage: state.analytics ? 'granted' : 'denied',
      ad_storage: state.marketing ? 'granted' : 'denied',
      functionality_storage: state.necessary ? 'granted' : 'denied',
      personalization_storage: state.marketing ? 'granted' : 'denied',
    })
  }
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [consent, setConsent] = useState<CookieConsentState>(DEFAULT_STATE)

  useEffect(() => {
    const stored = getStoredConsent()
    if (!stored) {
      setIsVisible(true)
    } else {
      setConsent(stored)
      applyConsentToGA4(stored)
    }
  }, [])

  const handleAcceptAll = () => {
    const newState: CookieConsentState = {
      analytics: true,
      marketing: true,
      necessary: true,
    }
    setConsent(newState)
    setStoredConsent(newState)
    applyConsentToGA4(newState)
    setIsVisible(false)
    setShowSettings(false)
  }

  const handleRejectAll = () => {
    const newState: CookieConsentState = {
      analytics: false,
      marketing: false,
      necessary: true,
    }
    setConsent(newState)
    setStoredConsent(newState)
    applyConsentToGA4(newState)
    setIsVisible(false)
    setShowSettings(false)
  }

  const handleSaveSettings = () => {
    setStoredConsent(consent)
    applyConsentToGA4(consent)
    setIsVisible(false)
    setShowSettings(false)
  }

  const handleToggle = (type: keyof CookieConsentState) => {
    if (type === 'necessary') return
    setConsent(prev => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-black/80 backdrop-blur-sm text-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {!showSettings ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Cookie Consent</h3>
                  <p className="text-gray-300 text-sm md:text-base">
                    We use cookies to improve your experience, analyze site traffic, and serve personalized content. 
                    By clicking "Accept All", you agree to our use of cookies.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Cookie Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium">Necessary Cookies</div>
                    <div className="text-gray-400 text-sm">Required for basic site functionality. Cannot be disabled.</div>
                  </div>
                  <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => handleToggle('analytics')}
                >
                  <div>
                    <div className="font-medium">Analytics Cookies</div>
                    <div className="text-gray-400 text-sm">Help us understand how visitors interact with the site.</div>
                  </div>
                  <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                    consent.analytics ? 'bg-blue-600 justify-end' : 'bg-gray-600 justify-start'
                  }`}>
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => handleToggle('marketing')}
                >
                  <div>
                    <div className="font-medium">Marketing Cookies</div>
                    <div className="text-gray-400 text-sm">Used to deliver personalized ads and content.</div>
                  </div>
                  <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                    consent.marketing ? 'bg-blue-600 justify-end' : 'bg-gray-600 justify-start'
                  }`}>
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsentState>(DEFAULT_STATE)

  useEffect(() => {
    const stored = getStoredConsent()
    if (stored) {
      setConsent(stored)
    }
  }, [])

  const updateConsent = (newConsent: CookieConsentState) => {
    setConsent(newConsent)
    setStoredConsent(newConsent)
    applyConsentToGA4(newConsent)
  }

  return { consent, updateConsent }
}