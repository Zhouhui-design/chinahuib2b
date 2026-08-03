/**
 * Translation Service
 * Provides free translation using MyMemory API (primary), Google Translate (fallback), or LibreTranslate
 * Can be extended to support DeepL, OpenAI, etc. in the future
 */

const MYMEMORY_API = 'https://api.mymemory.translated.net/get';
const GOOGLE_TRANSLATE_FREE_API = 'https://translate.google.com/translate_a/single';
const LIBRE_TRANSLATE_API = process.env['LIBRE_TRANSLATE_API'] || 'https://libretranslate.com/translate';

// Language codes mapping
const languageCodeMap: Record<string, string> = {
  'en': 'en',
  'zh': 'zh-CN',
  'ja': 'ja',
  'ko': 'ko',
  'ar': 'ar',
  'es': 'es',
  'fr': 'fr',
  'de': 'de',
  'ru': 'ru',
  'pt': 'pt',
  'hi': 'hi',
  'th': 'th',
  'vi': 'vi',
};

// MyMemory language code mapping (uses ISO 639-1 with optional country code)
const myMemoryLangMap: Record<string, string> = {
  'en': 'en',
  'zh': 'zh-CN',
  'ja': 'ja',
  'ko': 'ko',
  'ar': 'ar',
  'es': 'es',
  'fr': 'fr',
  'de': 'de',
  'ru': 'ru',
  'pt': 'pt',
  'hi': 'hi',
  'th': 'th',
  'vi': 'vi',
};

export interface TranslationResult {
  success: boolean;
  translatedText?: string;
  error?: string;
}

/**
 * Clean translated text by stripping HTML tags (e.g. <g id="1"> from Google Translate)
 * and decoding common HTML entities
 */
function cleanTranslation(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')        // Strip HTML tags
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Translate text from source language to target language
 */
export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = 'auto'
): Promise<TranslationResult> {
  if (!text || text.trim().length === 0) {
    return { success: true, translatedText: text };
  }

  // Skip if same language
  if (sourceLang === targetLang) {
    return { success: true, translatedText: text };
  }

  try {
    // Try MyMemory first (free: 5000 chars/day without key, 50000 with email)
    const myMemoryResult = await translateWithMyMemory(text, targetLang, sourceLang);
    if (myMemoryResult.success && myMemoryResult.translatedText) {
      return myMemoryResult;
    }

    // Fallback to Google Translate (may be blocked in some regions)
    const googleResult = await translateWithGoogle(text, targetLang, sourceLang);
    if (googleResult.success) {
      return googleResult;
    }

    // Last resort: LibreTranslate
    return await translateWithLibre(text, targetLang, sourceLang);
  } catch (error) {
    console.error('Translation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Translation failed'
    };
  }
}

/**
 * Translate text using MyMemory API (free, no API key required)
 * Free tier: 5000 chars/day, 50000 with email parameter
 */
async function translateWithMyMemory(
  text: string,
  targetLang: string,
  sourceLang: string
): Promise<TranslationResult> {
  const targetCode = myMemoryLangMap[targetLang] || targetLang;
  const sourceCode = sourceLang === 'auto' ? 'zh-CN' : (myMemoryLangMap[sourceLang] || sourceLang);

  const params = new URLSearchParams({
    q: text,
    langpair: `${sourceCode}|${targetCode}`,
  });

  // Add email for higher quota if available
  if (process.env['MYMEMORY_EMAIL']) {
    params.append('de', process.env['MYMEMORY_EMAIL']);
  }

  try {
    const response = await fetch(`${MYMEMORY_API}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }

    const data = await response.json();

    if (data?.responseData?.translatedText) {
      const translatedText = cleanTranslation(data.responseData.translatedText);
      // Check for error indicators
      if (translatedText.includes('MYMEMORY WARNING') || translatedText.includes('INVALID')) {
        return { success: false, error: 'MyMemory translation warning' };
      }
      return { success: true, translatedText };
    }

    return { success: false, error: 'Invalid response from MyMemory' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'MyMemory failed' };
  }
}

/**
 * Translate text using Google Translate API (free)
 */
async function translateWithGoogle(
  text: string,
  targetLang: string,
  sourceLang: string
): Promise<TranslationResult> {
  const targetCode = languageCodeMap[targetLang] || targetLang;
  const sourceCode = sourceLang === 'auto' ? 'auto' : (languageCodeMap[sourceLang] || sourceLang);

  const params = new URLSearchParams({
    client: 'gtx',
    sl: sourceCode,
    tl: targetCode,
    dt: 't',
    q: text,
  });

  try {
    const response = await fetch(`${GOOGLE_TRANSLATE_FREE_API}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data[0]) {
      const translatedText = cleanTranslation(
        data[0]
          .map((item: [string, string]) => item[0])
          .join('')
      );
      return { success: true, translatedText };
    }

    return { success: false, error: 'Invalid response from Google Translate' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Google Translate failed' };
  }
}

/**
 * Translate text using LibreTranslate (free, open-source)
 */
async function translateWithLibre(
  text: string,
  targetLang: string,
  sourceLang: string
): Promise<TranslationResult> {
  const targetCode = targetLang === 'zh' ? 'zh' : targetLang;
  const sourceCode = sourceLang === 'auto' ? 'auto' : (sourceLang === 'zh' ? 'zh' : sourceLang);

  try {
    const response = await fetch(LIBRE_TRANSLATE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceCode,
        target: targetCode,
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.translatedText) {
      return { success: true, translatedText: data.translatedText };
    }

    return { success: false, error: 'Invalid response from LibreTranslate' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'LibreTranslate failed' };
  }
}

/**
 * Translate multiple texts in batch
 */
export async function translateBatch(
  texts: string[],
  targetLang: string,
  sourceLang: string = 'auto'
): Promise<TranslationResult[]> {
  const results = await Promise.all(
    texts.map(text => translateText(text, targetLang, sourceLang))
  );
  return results;
}

/**
 * Auto-translate content to all supported languages
 * Returns an object with language codes as keys and translations as values
 */
export async function autoTranslateToAllLanguages(
  content: string,
  sourceLang: string = 'en',
  excludeLanguages: string[] = []
): Promise<Record<string, string>> {
  const supportedLanguages = ['en', 'zh', 'ja', 'ko', 'ar', 'es', 'fr', 'de', 'ru', 'pt', 'hi', 'th', 'vi'];
  const results: Record<string, string> = {};

  // Add original content
  results[sourceLang] = content;

  // Translate to all other languages in parallel
  const translationPromises = supportedLanguages
    .filter(lang => lang !== sourceLang && !excludeLanguages.includes(lang))
    .map(async (lang) => {
      const result = await translateText(content, lang, sourceLang);
      return { lang, result };
    });

  const translations = await Promise.all(translationPromises);

  translations.forEach(({ lang, result }) => {
    if (result.success && result.translatedText) {
      results[lang] = result.translatedText;
    }
  });

  return results;
}
