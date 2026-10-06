'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRIES, getCountryName } from '@/lib/countries';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

const MAX_OPTIONS = 60;

/**
 * Editable country combobox
 * - Type to fuzzy-filter (matches localized name, English name, or ISO code)
 * - Stores the canonical English name for cross-language consistency
 * - Legacy values not in the country list are preserved as a custom option
 */
export default function CountrySelect({
  value,
  onChange,
  language = 'en',
  placeholder = 'Select country',
  className = '',
  id,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const options = useMemo(
    () =>
      COUNTRIES.map((c) => ({
        code: c.code,
        canonical: c.name,
        label: getCountryName(c, language),
      })),
    [language]
  );

  const selected = options.find((o) => o.canonical === value);
  const displayText = selected ? selected.label : value || '';
  const isCustomValue = !!value && !selected;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? options.filter(
          (o) =>
            o.label.toLowerCase().includes(q) ||
            o.canonical.toLowerCase().includes(q) ||
            o.code.toLowerCase() === q
        )
      : options;
    return list.slice(0, MAX_OPTIONS);
  }, [options, query]);

  // Close on click outside
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const choose = (canonical: string) => {
    onChange(canonical);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        value={open ? query : displayText}
        placeholder={placeholder}
        onFocus={() => {
          setQuery(displayText);
          setOpen(true);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[0]) choose(filtered[0].canonical);
          } else if (e.key === 'Escape') {
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        onBlur={() => {
          // Delay close so the option's mousedown handler can fire first
          setTimeout(() => setOpen(false), 150);
          setQuery('');
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 py-1">
          {isCustomValue && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                choose(value);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {value}
            </button>
          )}
          {filtered.length === 0 && !isCustomValue && (
            <div className="px-3 py-2 text-sm text-gray-400">—</div>
          )}
          {filtered.map((o) => (
            <button
              key={o.code}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                choose(o.canonical);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between ${
                o.canonical === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
              }`}
            >
              <span>{o.label}</span>
              <span className="text-xs text-gray-400 ml-2">{o.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
