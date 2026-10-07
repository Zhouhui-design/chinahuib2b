'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import CountryFilterCombobox from '@/components/common/CountryFilterCombobox'
import type { CountryFacet } from '@/services/sellerService'

interface StoresSearchBarProps {
  locale: string
  facets: CountryFacet[]
  placeholder?: string
  buttonText?: string
}

function buildHref(keyword: string, country: string) {
  const qs = new URLSearchParams()
  if (keyword) qs.set('search', keyword)
  if (country) qs.set('country', country)
  const s = qs.toString()
  return s ? `?${s}` : '?'
}

export default function StoresSearchBar({
  locale,
  facets,
  placeholder = '搜索公司、产品、展会、关键词…',
  buttonText = '搜索',
}: StoresSearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('search') || '')
  const [country, setCountry] = useState(searchParams.get('country') || '')
  const keywordParam = searchParams.get('search') || ''
  const countryParam = searchParams.get('country') || ''

  // Keyword search: keep the active country filter, reset to page 1
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(buildHref(value.trim(), countryParam))
  }

  // Clearing the keyword input keeps the country filter
  const clear = () => {
    setValue('')
    router.push(buildHref('', countryParam))
  }

  // Country applies immediately; keeps the keyword, resets to page 1
  const handleCountryChange = (next: string) => {
    setCountry(next)
    router.push(buildHref(keywordParam, next))
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {value && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="清除"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="w-full sm:w-56 flex-shrink-0">
          <CountryFilterCombobox
            value={country}
            onChange={handleCountryChange}
            facets={facets}
            language={locale}
            placeholder={locale === 'zh' ? '全部国家' : 'All countries'}
            allLabel={locale === 'zh' ? '全部国家' : 'All countries'}
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
        >
          {buttonText}
        </button>
      </div>
    </form>
  )
}
