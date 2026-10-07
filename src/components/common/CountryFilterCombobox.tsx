'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { findCountry, getCountryName } from '@/lib/countries';
import type { CountryFacet } from '@/services/sellerService';

interface CountryFilterComboboxProps {
  /** Canonical English country name, '' for all */
  value: string;
  onChange?: (value: string) => void;
  facets: CountryFacet[];
  language?: string;
  placeholder?: string;
  allLabel?: string;
  className?: string;
  /** When set, renders a hidden input so native GET forms submit the value */
  name?: string;
  id?: string;
}

/**
 * Buyer-facing country filter: an editable combobox whose dropdown only lists
 * countries that currently have sellers (with counts). Values are always the
 * canonical English country name; labels render in the active language.
 */
export default function CountryFilterCombobox({
  value,
  onChange,
  facets,
  language = 'en',
  placeholder = 'All countries',
  allLabel = 'All countries',
  className = '',
  name,
  id,
}: CountryFilterComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  // Uncontrolled mode (no onChange, e.g. native GET form): keep an internal
  // value that drives the hidden input submitted with the form.
  const [innerValue, setInnerValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentValue = onChange ? value : innerValue;

  const options = useMemo(
    () =>
      facets.map((f) => {
        const country = findCountry(f.name);
        return {
          name: f.name,
          code: f.code ?? country?.code ?? '',
          label: country ? getCountryName(country, language) : f.name,
          count: f.count,
        };
      }),
    [facets, language]
  );

  const selected = options.find((o) => o.name === currentValue)
    ?? (currentValue ? { name: currentValue, code: '', label: (findCountry(currentValue) ? getCountryName(findCountry(currentValue)!, language) : currentValue), count: 0 } : null);
  const displayText = selected?.label || '';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.code.toLowerCase() === q
    );
  }, [options, query]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const choose = (next: string) => {
    if (onChange) onChange(next);
    else setInnerValue(next);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const totalCount = useMemo(() => facets.reduce((sum, f) => sum + f.count, 0), [facets]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={currentValue} />}
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
              if (filtered[0]) choose(filtered[0].name);
              else choose('');
            } else if (e.key === 'Escape') {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          onBlur={() => {
            setTimeout(() => setOpen(false), 150);
            setQuery('');
          }}
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
        {currentValue && (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => {
              e.preventDefault();
              choose('');
            }}
            aria-label={allLabel}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 py-1">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              choose('');
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 flex items-center justify-between"
          >
            <span>{allLabel}</span>
            <span className="text-xs text-gray-400">{totalCount}</span>
          </button>
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">—</div>
          )}
          {filtered.map((o) => (
            <button
              key={o.name}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                choose(o.name);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between gap-2 ${
                o.name === currentValue ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
              }`}
            >
              <span className="truncate">{o.label}</span>
              <span className="flex-shrink-0 text-xs text-gray-400">
                {o.code && <span className="mr-1.5">{o.code}</span>}
                {o.count}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
