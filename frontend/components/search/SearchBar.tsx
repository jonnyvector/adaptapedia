'use client';

import { useState, useEffect, useCallback, FormEvent, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SearchIcon, XIcon } from './icons';
import SearchDropdown from './SearchDropdown';
import { api } from '@/lib/api';
import type { SearchWithAdaptationsResponse } from '@/lib/types';

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  defaultValue = '',
  placeholder = 'Search books and adaptations...',
  autoFocus = false,
}: SearchBarProps): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState(defaultValue);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchWithAdaptationsResponse | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const justSubmittedRef = useRef(false);

  // Sync state when defaultValue changes (e.g., navigating via link)
  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  // Move cursor to end when autofocus is enabled and there's a defaultValue
  useEffect(() => {
    if (autoFocus && inputRef.current && defaultValue) {
      const length = defaultValue.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [autoFocus, defaultValue]);

  // Fetch search results for dropdown (debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        try {
          const results = await api.works.searchWithAdaptations(query, 5);
          setSearchResults(results);
          setShowDropdown(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults(null);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown when pathname changes (navigation occurred)
  useEffect(() => {
    setShowDropdown(false);
  }, [pathname]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      const params = new URLSearchParams();
      params.set('q', query.trim());

      // Preserve type filter if it exists
      const currentType = searchParams.get('type');
      if (currentType) {
        params.set('type', currentType);
      }

      // Close dropdown and blur input
      setShowDropdown(false);
      inputRef.current?.blur();
      justSubmittedRef.current = true;

      // Reset the flag after a short delay to allow normal focus behavior later
      setTimeout(() => {
        justSubmittedRef.current = false;
      }, 500);

      router.push(`/search?${params.toString()}`);
    }
  };

  const handleClear = (): void => {
    setQuery('');
    setSearchResults(null);
    setShowDropdown(false);
  };

  const handleResultClick = (): void => {
    setShowDropdown(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative" ref={containerRef}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          <SearchIcon className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            // Don't show dropdown immediately after submitting search
            if (!justSubmittedRef.current && query.length >= 2) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full !pl-14 !pr-12 !py-3 sm:!py-3.5 text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-link focus:border-transparent bg-surface text-foreground"
          aria-label="Search"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors w-5 h-5 flex items-center justify-center"
            aria-label="Clear search"
            style={{ all: 'unset', cursor: 'pointer', position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', transition: 'color 0.15s ease' }}
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-14 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-link border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Dropdown results */}
        {showDropdown && (
          <SearchDropdown
            results={searchResults}
            isLoading={isSearching}
            query={query}
            onResultClick={handleResultClick}
          />
        )}
      </div>
    </form>
  );
}
