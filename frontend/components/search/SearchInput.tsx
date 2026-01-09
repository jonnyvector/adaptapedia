'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SearchDropdown from '@/components/search/SearchDropdown';
import { api } from '@/lib/api';
import type { SearchWithAdaptationsResponse } from '@/lib/types';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';
import { XMarkIcon } from '@/components/ui/Icons';

interface SearchInputProps {
  /** Whether this is the mobile version */
  mobile?: boolean;
  /** Additional className for the container */
  className?: string;
}

export default function SearchInput({ mobile = false, className = '' }: SearchInputProps): JSX.Element {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchWithAdaptationsResponse | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const justSubmittedRef = useRef(false);

  // Fetch search results for dropdown (debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const results = await api.works.searchWithAdaptations(searchQuery, 5);
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
  }, [searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      setShowDropdown(false);
      justSubmittedRef.current = true;

      // Reset the flag after a short delay
      setTimeout(() => {
        justSubmittedRef.current = false;
      }, 500);

      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleResultClick = (): void => {
    // Don't close immediately - let navigation happen first
    // Dropdown will close when component unmounts on page change
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowDropdown(false);
    setSearchResults(null);
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSearch} className="w-full relative">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (!justSubmittedRef.current && searchQuery.length >= 2) {
              setShowDropdown(true);
            }
          }}
          placeholder="SEARCH BOOKS..."
          className={`w-full px-3 py-2 ${mobile ? '' : 'pr-10'} ${TEXT.body} bg-white dark:bg-black text-black dark:text-white border ${BORDERS.medium} ${RADIUS.control} focus:outline-none focus:ring-0 focus:border-black focus:dark:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white placeholder:${TEXT.mutedLight} placeholder:uppercase min-h-[40px]`}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
          aria-label="Search"
        />
        {searchQuery && !mobile && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-black/40 dark:text-white/40 hover:text-black hover:dark:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white"
            aria-label="Clear search"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Dropdown results */}
      {showDropdown && (
        <SearchDropdown
          results={searchResults}
          isLoading={isSearching}
          query={searchQuery}
          onResultClick={handleResultClick}
        />
      )}
    </div>
  );
}
