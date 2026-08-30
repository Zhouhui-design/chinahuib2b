'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { languages, type LanguageCode } from '@/lib/languages';

const SUPPORTED_CODES = languages.map((l) => l.code) as readonly string[];

/**
 * Replace the locale segment of a pathname WITHOUT eating the first 2 chars of
 * a non-locale first segment.
 *
 * Bug this fixes: `pathname.replace(/^\/[a-z]{2}/, '/es')` turned the store slug
 * URL `/jhbz` into `/esbz` (it chopped `jh`), producing a 404. Store slugs live
 * at the top level (`x2xhub.com/<slug>`), so the first segment is only a locale
 * when it is exactly 2 chars AND in the supported list.
 */
function buildLocalePath(pathname: string, locale: LanguageCode): string {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  // Case A: first segment IS a real locale -> swap it.
  if (first && SUPPORTED_CODES.includes(first)) {
    segments[0] = locale;
    return '/' + segments.join('/');
  }

  // Case B: no locale prefix (e.g. a top-level store slug like /jhbz).
  // Prefixing would 404 on rewrite rules, so keep the path and let the
  // language cookie drive translation via a reload.
  return pathname;
}

export default function LanguageSwitcher({ currentLocale }: { currentLocale: LanguageCode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const currentLanguage = languages.find(lang => lang.code === currentLocale);

  const switchLanguage = (locale: LanguageCode) => {
    // Always set the language cookie first
    document.cookie = `language=${locale}; path=/; max-age=31536000`

    // Dispatch custom event so useSellerLanguage hook can update without polling
    window.dispatchEvent(new Event('languagechange'))

    // Check if current path is a dashboard route (no locale prefix)
    const isDashboardRoute = pathname.startsWith('/seller') || pathname.startsWith('/admin')
    
    // Check if current path is a static route that doesn't need locale prefix
    const isStaticRoute = pathname.startsWith('/api-docs') || pathname.startsWith('/ai-audit') || pathname.startsWith('/ai-register') || pathname.startsWith('/api-keys') || pathname.startsWith('/auction') || pathname.startsWith('/marketplace') || pathname.startsWith('/team-chat')
      
    if (isDashboardRoute || isStaticRoute) {
      // For dashboard routes and static routes, reload the page to apply the new language
      window.location.reload()
    } else {
      // For public routes, swap the locale segment safely.
      const newPathname = buildLocalePath(pathname, locale)
      if (newPathname === pathname) {
        // No locale segment to swap (top-level store slug etc.) -> cookie + reload.
        window.location.reload()
      } else {
        router.push(newPathname)
      }
    }
      
    setIsOpen(false)
  };

  return (
    <div className="relative">
      {/* Language Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLanguage?.nativeName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between
                  ${lang.code === currentLocale ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}
                `}
              >
                <span>{lang.nativeName}</span>
                {lang.code === currentLocale && (
                  <span className="text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
