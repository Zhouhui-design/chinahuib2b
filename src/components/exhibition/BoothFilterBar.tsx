'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const T = {
  zh: {
    title: '搜索展会',
    exhibition: '展会信息',
    company: '公司名称',
    product: '产品',
    keyword: '关键词',
    placeholderExhibition: '输入展会名称...',
    placeholderCompany: '输入公司名称...',
    placeholderProduct: '输入产品名称...',
    placeholderKeyword: '输入关键词...',
    search: '搜索',
    reset: '重置',
    results: '个结果',
  },
  en: {
    title: 'Search Exhibitions',
    exhibition: 'Exhibition',
    company: 'Company',
    product: 'Product',
    keyword: 'Keyword',
    placeholderExhibition: 'Enter exhibition name...',
    placeholderCompany: 'Enter company name...',
    placeholderProduct: 'Enter product name...',
    placeholderKeyword: 'Enter keyword...',
    search: 'Search',
    reset: 'Reset',
    results: 'results',
  },
  de: {
    title: 'Ausstellungen suchen',
    exhibition: 'Ausstellung',
    company: 'Firma',
    product: 'Produkt',
    keyword: 'Stichwort',
    placeholderExhibition: 'Ausstellungsname eingeben...',
    placeholderCompany: 'Firmennamen eingeben...',
    placeholderProduct: 'Produktnamen eingeben...',
    placeholderKeyword: 'Stichwort eingeben...',
    search: 'Suchen',
    reset: 'Zurücksetzen',
    results: 'Ergebnisse',
  },
  es: {
    title: 'Buscar exposiciones',
    exhibition: 'Exposición',
    company: 'Empresa',
    product: 'Producto',
    keyword: 'Palabra clave',
    placeholderExhibition: 'Introduzca el nombre de la exposición...',
    placeholderCompany: 'Introduzca el nombre de la empresa...',
    placeholderProduct: 'Introduzca el nombre del producto...',
    placeholderKeyword: 'Introduzca la palabra clave...',
    search: 'Buscar',
    reset: 'Restablecer',
    results: 'resultados',
  },
  fr: {
    title: 'Rechercher des expositions',
    exhibition: 'Exposition',
    company: 'Entreprise',
    product: 'Produit',
    keyword: 'Mot-clé',
    placeholderExhibition: "Entrez le nom de l'exposition...",
    placeholderCompany: "Entrez le nom de l'entreprise...",
    placeholderProduct: 'Entrez le nom du produit...',
    placeholderKeyword: 'Entrez un mot-clé...',
    search: 'Rechercher',
    reset: 'Réinitialiser',
    results: 'résultats',
  },
} as const;

type Locale = keyof typeof T;

function t(locale: string, key: keyof typeof T['en']): string {
  const dict = T[(locale as Locale) in T ? (locale as Locale) : 'en'];
  return dict[key] ?? T.en[key];
}

export default function BoothFilterBar({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);

  const [exhibition, setExhibition] = useState(searchParams.get('exhibition') || '');
  const [company, setCompany] = useState(searchParams.get('company') || '');
  const [product, setProduct] = useState(searchParams.get('product') || '');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');

  const applyFilters = useCallback(
    (next: { exhibition?: string; company?: string; product?: string; keyword?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      const map: [string, string | undefined][] = [
        ['exhibition', next.exhibition],
        ['company', next.company],
        ['product', next.product],
        ['keyword', next.keyword],
      ];
      map.forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      params.set('page', '1');
      startTransition(() => {
        router.push(`/${locale}/exhibitions?${params.toString()}`, { scroll: false });
      });
    },
    [locale, router, searchParams]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ exhibition, company, product, keyword });
  };

  const handleReset = () => {
    setExhibition('');
    setCompany('');
    setProduct('');
    setKeyword('');
    startTransition(() => {
      router.push(`/${locale}/exhibitions`, { scroll: false });
    });
  };

  const activeCount = [exhibition, company, product, keyword].filter(Boolean).length;

  const inputCls =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">{t(locale, 'title')}</span>
          {activeCount > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{activeCount}</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <form onSubmit={handleSubmit} className="px-4 pb-4 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t(locale, 'exhibition')}</label>
              <input
                type="text"
                value={exhibition}
                onChange={(e) => setExhibition(e.target.value)}
                placeholder={t(locale, 'placeholderExhibition')}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t(locale, 'company')}</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={t(locale, 'placeholderCompany')}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t(locale, 'product')}</label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder={t(locale, 'placeholderProduct')}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t(locale, 'keyword')}</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t(locale, 'placeholderKeyword')}
                className={inputCls}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2 mt-3">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60 transition-colors"
            >
              <Search className="w-4 h-4" />
              {t(locale, 'search')}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isPending}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-60 transition-colors"
            >
              <X className="w-4 h-4" />
              {t(locale, 'reset')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
