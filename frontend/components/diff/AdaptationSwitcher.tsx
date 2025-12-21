'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { AdaptationEdge, ApiResponse } from '@/lib/types';
import { api } from '@/lib/api';

interface AdaptationSwitcherProps {
  workId: number;
  workSlug: string;
  currentScreenWorkId: number;
  currentScreenWorkTitle: string;
  currentScreenWorkYear?: number;
  currentScreenWorkType: 'MOVIE' | 'TV';
}

export default function AdaptationSwitcher({
  workId,
  workSlug,
  currentScreenWorkId,
  currentScreenWorkTitle,
  currentScreenWorkYear,
  currentScreenWorkType,
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

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-adaptation-switcher]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Don't render switcher if loading or only one adaptation
  if (loading || otherAdaptations.length === 0) {
    return (
      <div className="text-xl sm:text-2xl md:text-3xl font-bold">
        {currentScreenWorkTitle}
      </div>
    );
  }

  return (
    <div className="relative inline-block" data-adaptation-switcher>
      {/* Current adaptation button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xl sm:text-2xl md:text-3xl font-bold text-left hover:text-link transition-colors flex items-center gap-2 group !border-0 !bg-transparent !p-0"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{currentScreenWorkTitle}</span>
        <span
          className="text-base sm:text-lg text-muted group-hover:text-link transition-colors"
          aria-hidden="true"
        >
          {isOpen ? '▴' : '▾'}
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-background border-2 border-border rounded-lg shadow-xl z-50 overflow-hidden"
          role="menu"
        >
          {/* Current adaptation (highlighted) */}
          <div
            className="px-4 py-3 bg-link/10 border-b border-border"
            role="menuitem"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {currentScreenWorkTitle}
                </div>
                <div className="text-xs text-muted mt-1">
                  {currentScreenWorkType === 'MOVIE' ? 'Movie' : 'TV Series'}
                  {currentScreenWorkYear && ` • ${currentScreenWorkYear}`}
                </div>
              </div>
              <span
                className="text-xs px-2 py-1 bg-link/20 text-link rounded font-medium whitespace-nowrap"
                aria-label="Currently viewing"
              >
                Current
              </span>
            </div>
          </div>

          {/* Other adaptations */}
          <div className="max-h-80 overflow-y-auto">
            {otherAdaptations.map((edge) => {
              const screen = edge.screen_work_detail;
              return (
                <button
                  key={edge.id}
                  onClick={() => handleAdaptationChange(screen.slug)}
                  className="w-full px-4 py-3 text-left hover:bg-muted/10 transition-colors border-b border-border/50 last:border-0 !bg-transparent"
                  role="menuitem"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {screen.title}
                      </div>
                      <div className="text-xs text-muted mt-1">
                        {screen.type === 'MOVIE' ? 'Movie' : 'TV Series'}
                        {screen.year && ` • ${screen.year}`}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* View all link */}
          <button
            onClick={handleViewAll}
            className="w-full px-4 py-3 text-sm text-link hover:bg-muted/10 border-t-2 border-border font-medium transition-colors text-left !bg-transparent"
            role="menuitem"
          >
            View all adaptations →
          </button>
        </div>
      )}
    </div>
  );
}
