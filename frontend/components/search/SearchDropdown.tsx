'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { WorkWithAdaptations, ScreenWork } from '@/lib/types';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

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
      className={`absolute top-full left-0 right-0 mt-2 bg-white dark:bg-black border ${BORDERS.medium} rounded-md max-h-96 overflow-y-auto z-50`}
    >
      {isLoading ? (
        <div className={`p-4 text-center ${TEXT.mutedMedium}`}>
          <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
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
                className={`flex items-center gap-3 px-4 py-3 hover:bg-stone-100 hover:dark:bg-stone-900 transition-colors border-b ${BORDERS.subtle} last:border-0 ${
                  index === selectedIndex ? 'bg-stone-100 dark:bg-stone-900' : ''
                }`}
              >
                {work.cover_url ? (
                  <Image
                    src={work.cover_url}
                    alt={work.title}
                    width={40}
                    height={56}
                    className="w-10 h-14 object-cover"
                  />
                ) : (
                  <div className={`w-10 h-14 bg-stone-100 dark:bg-stone-900 flex items-center justify-center ${TEXT.metadata} ${TEXT.mutedMedium}`}>
                    No cover
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-black dark:text-white truncate`} style={{ fontFamily: FONTS.mono }}>
                    {work.title}
                  </div>
                  {work.author && (
                    <div className={`${TEXT.secondary} ${TEXT.mutedMedium} truncate`} style={{ fontFamily: FONTS.mono }}>
                      by {work.author}
                    </div>
                  )}
                  {work.adaptations && work.adaptations.length > 0 && (
                    <div className={`${TEXT.metadata} ${TEXT.mutedMedium} mt-1 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
                      {work.adaptations.length}{' '}
                      {work.adaptations.length === 1 ? 'adaptation' : 'adaptations'}
                    </div>
                  )}
                </div>
                {work.year && (
                  <div className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>{work.year}</div>
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
                className={`flex items-center gap-3 px-4 py-3 hover:bg-stone-100 hover:dark:bg-stone-900 transition-colors border-b ${BORDERS.subtle} last:border-0 ${
                  index === selectedIndex ? 'bg-stone-100 dark:bg-stone-900' : ''
                }`}
              >
                {screenWork.poster_url ? (
                  <Image
                    src={screenWork.poster_url}
                    alt={screenWork.title}
                    width={40}
                    height={56}
                    className="w-10 h-14 object-cover"
                  />
                ) : (
                  <div className={`w-10 h-14 bg-stone-100 dark:bg-stone-900 flex items-center justify-center ${TEXT.metadata} ${TEXT.mutedMedium}`}>
                    No poster
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-black dark:text-white truncate`} style={{ fontFamily: FONTS.mono }}>
                    {screenWork.title}
                  </div>
                  <div className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
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
            className={`block px-4 py-3 text-center ${TEXT.secondary} text-black dark:text-white hover:bg-stone-100 hover:dark:bg-stone-900 border-t ${BORDERS.subtle} transition-colors font-bold ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            {results.total_count && results.total_count > results.results.length
              ? `View all ${results.total_count} results for "${query}" →`
              : `View ${results.results.length === 1 ? 'result' : `all ${results.results.length} results`} for "${query}" →`
            }
          </Link>
        </div>
      ) : (
        <div className={`p-4 text-center ${TEXT.mutedMedium} ${TEXT.secondary}`} style={{ fontFamily: FONTS.mono }}>
          No results found
        </div>
      )}
    </div>
  );
}
