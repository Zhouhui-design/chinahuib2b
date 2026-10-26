'use client';

import { Search } from 'lucide-react';
import CountryFilterCombobox from '@/components/common/CountryFilterCombobox';
import type { CountryFacet } from '@/services/sellerService';

export interface SearchCategoryOption {
  value: string;
  label: string;
}

interface UniversalSearchBarProps {
  locale: string;
  /** GET form action, e.g. /en/products — works without JS for crawlers */
  actionPath: string;
  /** Query param name for the keyword, e.g. 'keyword' (products) or 'search' (stores/marketplace) */
  keywordParam?: string;
  initialKeyword?: string;
  /** Optional category prefix dropdown */
  categories?: SearchCategoryOption[];
  categoryParam?: string;
  initialCategory?: string;
  /** Optional country combobox (uncontrolled, submitted as hidden input) */
  countryFacets?: CountryFacet[];
  countryParam?: string;
  initialCountry?: string;
  /** Extra query params preserved as hidden inputs (e.g. type) */
  hiddenParams?: Record<string, string>;
  /** 3-5 hot keywords rendered as clickable links below the bar */
  hotKeywords?: string[];
  placeholder?: string;
  buttonText?: string;
  allCategoriesLabel?: string;
  allCountriesLabel?: string;
  hotLabel?: string;
}

const isZh = (locale: string) => locale === 'zh';

/**
 * 1688-style prominent search bar shared by products / stores / marketplace.
 * Native GET form: submits without JS so crawlers and no-JS visitors can use
 * it; pagination and canonical stay URL-driven (?keyword= / ?search=).
 */
export default function UniversalSearchBar({
  locale,
  actionPath,
  keywordParam = 'keyword',
  initialKeyword = '',
  categories,
  categoryParam = 'category',
  initialCategory = '',
  countryFacets,
  countryParam = 'country',
  initialCountry = '',
  hiddenParams,
  hotKeywords,
  placeholder,
  buttonText,
  allCategoriesLabel,
  allCountriesLabel,
  hotLabel,
}: UniversalSearchBarProps) {
  const zh = isZh(locale);
  const submitText = buttonText ?? (zh ? '搜索' : 'Search');
  const placeholderText =
    placeholder ??
    (zh ? '搜索产品、公司、关键词…' : 'Search products, companies, keywords…');
  const allCatText = allCategoriesLabel ?? (zh ? '全部类目' : 'All categories');
  const allCountryText = allCountriesLabel ?? (zh ? '全部国家' : 'All countries');
  const hotText = hotLabel ?? (zh ? '热门搜索：' : 'Popular:');

  const hotHref = (word: string) => {
    const qs = new URLSearchParams();
    qs.set(keywordParam, word);
    if (initialCategory) qs.set(categoryParam, initialCategory);
    if (initialCountry) qs.set(countryParam, initialCountry);
    return `${actionPath}?${qs.toString()}`;
  };

  return (
    <div className="mb-6">
      <form
        action={actionPath}
        method="get"
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white border-2 border-orange-500 rounded-xl p-2 shadow-sm"
      >
        {/* Hidden params preserved across submission */}
        {hiddenParams &&
          Object.entries(hiddenParams)
            .filter(([, v]) => v)
            .map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}

        {categories && categories.length > 0 && (
          <select
            name={categoryParam}
            defaultValue={initialCategory}
            className="sm:w-40 px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-label={allCatText}
          >
            <option value="">{allCatText}</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        )}

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            name={keywordParam}
            defaultValue={initialKeyword}
            placeholder={placeholderText}
            maxLength={100}
            className="w-full pl-10 pr-3 py-2.5 h-12 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          />
        </div>

        {countryFacets && countryFacets.length > 0 && (
          <div className="sm:w-52 flex-shrink-0">
            <CountryFilterCombobox
              value={initialCountry}
              name={countryParam}
              facets={countryFacets}
              language={locale}
              placeholder={allCountryText}
              allLabel={allCountryText}
            />
          </div>
        )}

        <button
          type="submit"
          className="h-12 px-8 bg-orange-600 text-white text-base font-semibold rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Search className="w-5 h-5" />
          {submitText}
        </button>
      </form>

      {hotKeywords && hotKeywords.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-500">{hotText}</span>
          {hotKeywords.map((word) => (
            <a
              key={word}
              href={hotHref(word)}
              className="px-2.5 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
            >
              {word}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
