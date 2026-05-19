/**
 * RTL (Right-to-Left) Language Support
 * Handle bidirectional text for Arabic, Hebrew, etc.
 */

// RTL languages list
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/**
 * Check if language is RTL
 */
export function isRTL(language: string): boolean {
  return RTL_LANGUAGES.includes(language.toLowerCase());
}

/**
 * Get text direction
 */
export function getDirection(language: string): 'ltr' | 'rtl' {
  return isRTL(language) ? 'rtl' : 'ltr';
}

/**
 * Apply RTL styles to document
 */
export function applyRTL(language: string): void {
  const direction = getDirection(language);
  
  if (typeof document !== 'undefined') {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    
    // Add/remove RTL class for CSS targeting
    if (direction === 'rtl') {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
    }
  }
}

/**
 * Mirror CSS properties for RTL
 * Example: margin-left becomes margin-right in RTL
 */
export function mirrorCSS(property: string, value: string): { property: string; value: string } {
  const rtlMap: Record<string, string> = {
    'margin-left': 'margin-right',
    'margin-right': 'margin-left',
    'padding-left': 'padding-right',
    'padding-right': 'padding-left',
    'left': 'right',
    'right': 'left',
    'text-align: left': 'text-align: right',
    'text-align: right': 'text-align: left',
    'border-left': 'border-right',
    'border-right': 'border-left',
    'border-radius-topleft': 'border-radius-topright',
    'border-radius-topright': 'border-radius-topleft',
    'border-radius-bottomleft': 'border-radius-bottomright',
    'border-radius-bottomright': 'border-radius-bottomleft',
  };

  const mirroredProperty = rtlMap[property] || property;
  
  return {
    property: mirroredProperty,
    value
  };
}

/**
 * React Hook for RTL support
 */
export function useRTL(language: string) {
  const rtl = isRTL(language);
  const direction = getDirection(language);

  return {
    rtl,
    direction,
    className: rtl ? 'rtl' : 'ltr',
    dir: direction
  };
}

/**
 * Tailwind CSS RTL plugin configuration
 * Add to tailwind.config.js
 */
export const tailwindRTLConfig = {
  plugins: [
    function({ addVariant }: { addVariant: (name: string, variant: string) => void }) {
      addVariant('rtl', '&:where([dir="rtl"], [dir="rtl"] *)');
      addVariant('ltr', '&:where([dir="ltr"], [dir="ltr"] *)');
    }
  ]
};
