'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { AdaptationEdge, ApiResponse } from '@/lib/types';
import { api } from '@/lib/api';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

interface AdaptationSwitcherProps {
  workId: number;
  workSlug: string;
  currentScreenWorkId: number;
  currentScreenWorkTitle: string;
  currentScreenWorkYear?: number;
  currentScreenWorkType: 'MOVIE' | 'TV';
  currentScreenWorkPosterUrl?: string;
}

export default function AdaptationSwitcher({
  workId,
  workSlug,
  currentScreenWorkId,
  currentScreenWorkTitle,
  currentScreenWorkYear,
  currentScreenWorkType,
  currentScreenWorkPosterUrl,
}: AdaptationSwitcherProps): JSX.Element {
  const router = useRouter();
  const [adaptations, setAdaptations] = useState<AdaptationEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch adaptations on mount
  useEffect(() => {
    const fetchAdaptations = async (): Promise<void> => {
      try {
        const response = (await api.adaptations.byWork(workId)) as ApiResponse<AdaptationEdge>;
        setAdaptations(response.results);
      } catch (error) {
        console.error('Failed to fetch adaptations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdaptations();
  }, [workId]);

  // Filter out current adaptation and sort by year (newest first)
  const otherAdaptations = useMemo(() => {
    return adaptations
      .filter((edge) => edge.screen_work !== currentScreenWorkId)
      .sort((a, b) => {
        const yearA = a.screen_work_detail.year || 0;
        const yearB = b.screen_work_detail.year || 0;
        return yearB - yearA;
      });
  }, [adaptations, currentScreenWorkId]);

  // Format current adaptation display text
  const currentAdaptationText = useMemo(() => {
    const typeLabel = currentScreenWorkType === 'MOVIE' ? 'Movie' : 'TV';
    const yearText = currentScreenWorkYear ? ` (${currentScreenWorkYear})` : '';
    return `${currentScreenWorkTitle}${yearText}`;
  }, [currentScreenWorkTitle, currentScreenWorkYear, currentScreenWorkType]);

  const handleAdaptationChange = (screenWorkSlug: string): void => {
    setIsOpen(false);
    router.push(`/compare/${workSlug}/${screenWorkSlug}`);
  };

  const handleViewAll = (): void => {
    setIsOpen(false);
    router.push(`/book/${workSlug}`);
  };

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-adaptation-switcher]')) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  // Don't render switcher if loading or only one adaptation
  if (loading || otherAdaptations.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full" data-adaptation-switcher>
      {/* Current adaptation button - subtle switcher */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border ${BORDERS.subtle} bg-transparent text-black dark:text-white hover:border-black hover:dark:border-white transition-colors ${TEXT.label} font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${RADIUS.control}`}
        style={{
          fontFamily: FONTS.mono,
          letterSpacing: '0.12em'
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="truncate">OTHER VERSIONS</span>
        <span className="flex-shrink-0" aria-hidden="true">
          {isOpen ? '▴' : '▾'}
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={`absolute bottom-full right-0 md:right-0 left-auto mb-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-black border ${BORDERS.medium} ${RADIUS.control} shadow-xl z-50 overflow-hidden`}
          role="menu"
        >
          {/* Current adaptation (highlighted) */}
          <div
            className={`px-4 py-3 bg-stone-100 dark:bg-stone-900 border-b ${BORDERS.subtle} flex items-start gap-3`}
            role="menuitem"
          >
            {currentScreenWorkPosterUrl && (
              <Image
                src={currentScreenWorkPosterUrl}
                alt={currentScreenWorkTitle}
                width={48}
                height={72}
                className={`w-12 h-18 object-cover ${RADIUS.control} flex-shrink-0`}
              />
            )}
            <div className="flex-1 min-w-0 py-1 text-left">
              <div className={`${TEXT.body} font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>
                {currentScreenWorkTitle}
              </div>
              <div className={`${TEXT.secondary} ${TEXT.mutedMedium} mt-1`} style={{ fontFamily: FONTS.mono }}>
                {currentScreenWorkType === 'MOVIE' ? 'Movie' : 'TV Series'}
                {currentScreenWorkYear && ` • ${currentScreenWorkYear}`}
              </div>
            </div>
            <span
              className={`${TEXT.secondary} px-2 py-1 bg-stone-200 dark:bg-stone-800 text-black dark:text-white ${RADIUS.control} font-bold whitespace-nowrap flex-shrink-0 self-start uppercase`}
              style={{ fontFamily: FONTS.mono, letterSpacing: '0.1em' }}
              aria-label="Currently viewing"
            >
              Current
            </span>
          </div>

          {/* Other adaptations */}
          <div className="max-h-80 overflow-y-auto">
            {otherAdaptations.map((edge) => {
              const screen = edge.screen_work_detail;
              return (
                <button
                  key={edge.id}
                  onClick={() => handleAdaptationChange(screen.slug)}
                  className={`w-full px-4 py-3 border-b ${BORDERS.subtle} last:border-b-0 hover:bg-stone-50 hover:dark:bg-stone-950 transition-colors flex items-start gap-3 text-left`}
                  role="menuitem"
                >
                  {screen.poster_url && (
                    <Image
                      src={screen.poster_url}
                      alt={screen.title}
                      width={48}
                      height={72}
                      className={`w-12 h-18 object-cover ${RADIUS.control} flex-shrink-0`}
                    />
                  )}
                  <div className="flex-1 min-w-0 py-1">
                    <div className={`${TEXT.body} font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>
                      {screen.title}
                    </div>
                    <div className={`${TEXT.secondary} ${TEXT.mutedMedium} mt-1`} style={{ fontFamily: FONTS.mono }}>
                      {screen.type === 'MOVIE' ? 'Movie' : 'TV Series'}
                      {screen.year && ` • ${screen.year}`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* View all link */}
          <div className={`border-t ${BORDERS.subtle}`}>
            <button
              onClick={handleViewAll}
              className={`w-full px-4 py-3 ${TEXT.body} text-black dark:text-white hover:bg-stone-50 hover:dark:bg-stone-950 font-bold transition-colors text-left`}
              style={{ fontFamily: FONTS.mono }}
              role="menuitem"
            >
              View all adaptations →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
