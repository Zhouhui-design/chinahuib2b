'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { languages, type LanguageCode, getLanguage } from '@/lib/languages';

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Extract current language from URL or use default
  const getCurrentLanguage = (): LanguageCode => {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];
    const lang = languages.find(l => l.code === firstSegment);
    return (lang?.code || 'en') as LanguageCode;
  };

  const currentLang = getCurrentLanguage();
  const currentLanguage = getLanguage(currentLang);

  const switchLanguage = (langCode: LanguageCode) => {
    // Remove current language prefix if exists
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];
    const isCurrentLang = languages.some(l => l.code === firstSegment);
    
    let newPath = pathname;
    if (isCurrentLang) {
      newPath = '/' + segments.slice(1).join('/');
    }
    
    // Add new language prefix
    const pathWithoutLang = newPath.startsWith('/') ? newPath.slice(1) : newPath;
    const newUrl = `/${langCode}/${pathWithoutLang}`;
    
    router.push(newUrl);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Select language"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium hidden sm:inline">{currentLanguage.nativeName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 border border-gray-200 max-h-96 overflow-y-auto">
            <div className="py-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => switchLanguage(lang.code)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors ${
                    lang.code === currentLang ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{lang.nativeName}</div>
                    <div className="text-xs text-gray-500">{lang.name}</div>
                  </div>
                  {lang.code === currentLang && (
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
