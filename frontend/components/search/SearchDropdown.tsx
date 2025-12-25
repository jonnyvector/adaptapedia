'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { WorkWithAdaptations, ScreenWork } from '@/lib/types';

interface SearchDropdownProps {
  results: {
    search_type: 'book' | 'screen';
    total_count?: number;
    results: (WorkWithAdaptations | ScreenWork)[];
  } | null;
  isLoading: boolean;
  query: string;
  onResultClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export default function SearchDropdown({
  results,
  isLoading,
  query,
  onResultClick,
  onKeyDown,
}: SearchDropdownProps): JSX.Element | null {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!results?.results || results.results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.results.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const result = results.results[selectedIndex];
        const link = getResultLink(result, results.search_type);
        if (link) {
          window.location.href = link;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex]);

  if (!results && !isLoading) return null;

  const getResultLink = (
    result: WorkWithAdaptations | ScreenWork,
    searchType: 'book' | 'screen'
  ): string => {
    if (searchType === 'book') {
      const work = result as WorkWithAdaptations;
      // If book has adaptations, go to first comparison
      if (work.adaptations && work.adaptations.length > 0) {
        return `/compare/${work.slug}/${work.adaptations[0].slug}`;
      }
      return `/book/${work.slug}`;
    } else {
      const screenWork = result as ScreenWork;
      return `/screen/${screenWork.slug}`;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
    >
      {isLoading ? (
        <div className="p-4 text-center text-muted">
          <div className="w-6 h-6 border-2 border-link border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : results && results.results.length > 0 ? (
        <div className="py-2">
          {results.search_type === 'book' ? (
            // Book results with adaptation count
            (results.results as WorkWithAdaptations[]).map((work, index) => (
              <Link
                key={work.id}
                href={getResultLink(work, 'book')}
                onClick={onResultClick}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-surface2 transition-colors ${
                  index === selectedIndex ? 'bg-surface2' : ''
                }`}
              >
                {work.cover_url ? (
                  <img
                    src={work.cover_url}
                    alt={work.title}
                    className="w-10 h-14 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-14 bg-surface2 rounded flex items-center justify-center text-xs text-muted">
                    No cover
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {work.title}
                  </div>
                  {work.author && (
                    <div className="text-sm text-secondary truncate">
                      by {work.author}
                    </div>
                  )}
                  {work.adaptations && work.adaptations.length > 0 && (
                    <div className="text-xs text-tertiary mt-1">
                      {work.adaptations.length}{' '}
                      {work.adaptations.length === 1 ? 'adaptation' : 'adaptations'}
                    </div>
                  )}
                </div>
                {work.year && (
                  <div className="text-sm text-tertiary">{work.year}</div>
                )}
              </Link>
            ))
          ) : (
            // Screen work results
            (results.results as ScreenWork[]).map((screenWork, index) => (
              <Link
                key={screenWork.id}
                href={getResultLink(screenWork, 'screen')}
                onClick={onResultClick}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-surface2 transition-colors ${
                  index === selectedIndex ? 'bg-surface2' : ''
                }`}
              >
                {screenWork.poster_url ? (
                  <img
                    src={screenWork.poster_url}
                    alt={screenWork.title}
                    className="w-10 h-14 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-14 bg-surface2 rounded flex items-center justify-center text-xs text-muted">
                    No poster
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {screenWork.title}
                  </div>
                  <div className="text-sm text-secondary">
                    {screenWork.type === 'MOVIE' ? 'Movie' : 'TV Series'}
                    {screenWork.year && ` • ${screenWork.year}`}
                  </div>
                </div>
              </Link>
            ))
          )}

          {/* View all results footer */}
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={onResultClick}
            className="block px-4 py-3 text-center text-sm text-link hover:bg-surface2 border-t border-border transition-colors font-medium"
          >
            {results.total_count && results.total_count > results.results.length
              ? `View all ${results.total_count} results for "${query}" →`
              : `View ${results.results.length === 1 ? 'result' : `all ${results.results.length} results`} for "${query}" →`
            }
          </Link>
        </div>
      ) : (
        <div className="p-4 text-center text-muted text-sm">
          No results found
        </div>
      )}
    </div>
  );
}
