'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchIcon, XIcon } from './icons';

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
  const [query, setQuery] = useState(defaultValue);
  const [isSearching, setIsSearching] = useState(false);

  // Sync state when defaultValue changes (e.g., navigating via link)
  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  // Debounced search handler
  const performSearch = useCallback((searchQuery: string) => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      const params = new URLSearchParams();
      params.set('q', searchQuery);

      // Preserve type filter if it exists
      const currentType = searchParams.get('type');
      if (currentType) {
        params.set('type', currentType);
      }

      router.push(`/search?${params.toString()}`);
      setIsSearching(false);
    } else if (searchQuery.length === 0) {
      // Clear search when input is empty
      router.push('/');
    }
  }, [router, searchParams]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== defaultValue) {
        performSearch(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, defaultValue, performSearch]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    performSearch(query);
  };

  const handleClear = (): void => {
    setQuery('');
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          <SearchIcon className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-12 pr-12 py-3 sm:py-3.5 text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-link focus:border-transparent bg-surface text-foreground"
          aria-label="Search"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-2 -m-2"
            aria-label="Clear search"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-14 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-link border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </form>
  );
}
