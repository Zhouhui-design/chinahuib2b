'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const COMPANY_TYPES = [
  { value: 'MANUFACTURER', label: { zh: '制造商', en: 'Manufacturer', de: 'Hersteller', es: 'Fabricante', fr: 'Fabricant', ja: 'メーカー', ko: '제조업체', ru: 'Производитель', pt: 'Fabricante', ar: 'مُصنّع' } },
  { value: 'TRADER', label: { zh: '贸易商', en: 'Trader', de: 'Händler', es: 'Comerciante', fr: 'Négociant', ja: '商社', ko: '트레이더', ru: 'Трейдер', pt: 'Comerciante', ar: 'تاجر' } },
  { value: 'BOTH', label: { zh: '制造商+贸易商', en: 'Manufacturer & Trader', de: 'Hersteller & Händler', es: 'Fabricante y comerciante', fr: 'Fabricant & négociant', ja: 'メーカー＆商社', ko: '제조·트레이더', ru: 'Производитель и трейдер', pt: 'Fabricante e comerciante', ar: 'مُصنّع وتاجر' } },
];

const T = {
  zh: {
    title: '筛选产品',
    companyName: '公司名称',
    productName: '产品名称',
    keyword: '关键词',
    country: '国家',
    companyType: '公司类型',
    allTypes: '全部类型',
    placeholderCompany: '输入公司名称...',
    placeholderProduct: '输入产品名称...',
    placeholderKeyword: '输入关键词...',
    placeholderCountry: '输入国家（如 China / 中国）...',
    search: '搜索',
    reset: '重置',
    results: '个结果',
  },
  en: {
    title: 'Filter Products',
    companyName: 'Company',
    productName: 'Product',
    keyword: 'Keyword',
    country: 'Country',
    companyType: 'Company Type',
    allTypes: 'All types',
    placeholderCompany: 'Enter company name...',
    placeholderProduct: 'Enter product name...',
    placeholderKeyword: 'Enter keyword...',
    placeholderCountry: 'Country (e.g. China / 中国)...',
    search: 'Search',
    reset: 'Reset',
    results: 'results',
  },
} as const;

type Locale = keyof typeof T;

function t(locale: string, key: keyof typeof T['en']): string {
  const dict = T[(locale as Locale) in T ? (locale as Locale) : 'en'];
  return dict[key] ?? T.en[key];
}

export default function ProductFilterBar({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);

  const [companyName, setCompanyName] = useState(searchParams.get('companyName') || '');
  const [productName, setProductName] = useState(searchParams.get('productName') || '');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [companyType, setCompanyType] = useState(searchParams.get('companyType') || '');

  const applyFilters = useCallback(
    (next: { companyName?: string; productName?: string; keyword?: string; country?: string; companyType?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      const map: [string, string | undefined][] = [
        ['companyName', next.companyName],
        ['productName', next.productName],
        ['keyword', next.keyword],
        ['country', next.country],
        ['companyType', next.companyType],
      ];
      map.forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      params.set('page', '1');
      startTransition(() => {
        router.push(`/${locale}/products?${params.toString()}`, { scroll: false });
      });
    },
    [locale, router, searchParams]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ companyName, productName, keyword, country, companyType });
  };

  const handleReset = () => {
    setCompanyName('');
    setProductName('');
    setKeyword('');
    setCountry('');
    setCompanyType('');
    startTransition(() => {
      router.push(`/${locale}/products`, { scroll: false });
    });
  };

  const activeCount = [companyName, productName, keyword, country, companyType].filter(Boolean).length;

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t(locale, 'productName')}</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={t(locale, 'placeholderProduct')}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t(locale, 'keyword')}</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t(locale, 'placeholderKeyword')}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t(locale, 'companyName')}</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t(locale, 'placeholderCompany')}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t(locale, 'country')}</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={t(locale, 'placeholderCountry')}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t(locale, 'companyType')}</label>
              <select
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                className={inputCls}
              >
                <option value="">{t(locale, 'allTypes')}</option>
                {COMPANY_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label[(locale as keyof typeof ct.label) in ct.label ? (locale as keyof typeof ct.label) : 'en']}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="sm:col-span-1 flex items-end gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60 transition-colors"
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
          </div>
        </form>
      )}
    </div>
  );
}
