'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const T = {
  zh: { prev: '上一页', next: '下一页', page: '第', of: '页，共', pages: '页' },
  en: { prev: 'Previous', next: 'Next', page: 'Page', of: 'of', pages: '' },
  de: { prev: 'Zurück', next: 'Weiter', page: 'Seite', of: 'von', pages: '' },
  es: { prev: 'Anterior', next: 'Siguiente', page: 'Página', of: 'de', pages: '' },
  fr: { prev: 'Précédent', next: 'Suivant', page: 'Page', of: 'sur', pages: '' },
} as const;

type Locale = keyof typeof T;

function t(locale: string, key: keyof typeof T['en']): string {
  const dict = T[(locale as Locale) in T ? (locale as Locale) : 'en'];
  return dict[key] ?? T.en[key];
}

type Props = {
  locale: string;
  basePath: string;   // e.g. "/de/exhibitions"
  currentPage: number;
  totalPages: number;
};

export default function Pagination({ locale, basePath, currentPage, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${basePath}?${params.toString()}`, { scroll: true });
  };

  // Build page numbers with ellipsis
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const buildPages = (): (number | '...')[] => {
    const delta = 2;
    if (totalPages <= 7) return range(1, totalPages);
    const pages: (number | '...')[] = [1];
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    if (left > 2) pages.push('...');
    pages.push(...range(left, right));
    if (right < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const pages = buildPages();

  return (
    <div className="flex flex-col items-center gap-2 mt-8">
      <div className="text-sm text-gray-600">
        {t(locale, 'page')} <span className="font-semibold">{currentPage}</span> {t(locale, 'of')}{' '}
        <span className="font-semibold">{totalPages}</span> {t(locale, 'pages')}
      </div>
      <div className="flex items-center gap-1 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t(locale, 'prev')}
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="px-2 py-2 text-sm text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                p === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {t(locale, 'next')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
