import { Language, translations } from './translations'

// Cache for loaded translations
const translationCache = new Map<string, any>()
const loadedLanguages = new Set<Language>()

/**
 * Load translations for a specific language on-demand
 */
export async function loadTranslations(language: Language): Promise<any> {
  console.log(`[i18n] Loading translations for: ${language}`)
  
  // Return cached translations if already loaded
  if (translationCache.has(language)) {
    console.log(`[i18n] Using cached translations for: ${language}`)
    return translationCache.get(language)
  }

  const bundledTranslations = translations[language]
  
  if (bundledTranslations) {
    console.log(`[i18n] Using bundled translations for: ${language}`)
    translationCache.set(language, bundledTranslations)
    loadedLanguages.add(language)
    return bundledTranslations
  }

  // Fallback to English
  console.log(`[i18n] No translations found for ${language}, using English fallback`)
  return translations.en
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(language?: Language) {
  if (language) {
    translationCache.delete(language)
    loadedLanguages.delete(language)
  } else {
    translationCache.clear()
    loadedLanguages.clear()
  }
}

/**
 * Check if translations for a language are loaded
 */
export function isLanguageLoaded(language: Language): boolean {
  return loadedLanguages.has(language)
}
