'use client';

import { useMemo } from 'react';
import { getCountriesForLanguage } from '@/lib/countries';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

/**
 * Reusable country select dropdown
 * - Displays country names in the current language (fallback to English)
 * - Supports all 190+ countries and territories
 * - Values stored as English names for cross-language consistency
 */
export default function CountrySelect({
  value,
  onChange,
  language = 'en',
  placeholder = 'Select country',
  className = '',
  id,
}: CountrySelectProps) {
  const countries = useMemo(() => getCountriesForLanguage(language), [language]);

  // If current value is not in the list (legacy data), keep it as a custom option
  const isCustomValue = value && !countries.some(c => c.name === value);

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      <option value="">{placeholder}</option>
      {isCustomValue && (
        <option value={value}>{value}</option>
      )}
      {countries.map((c) => (
        <option key={c.code} value={c.name}>{c.name}</option>
      ))}
    </select>
  );
}
