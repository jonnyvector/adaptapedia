'use client';

import { useEffect } from 'react';
import type { SpoilerScope } from '@/lib/types';
import { LockClosedIcon, BookOpenIcon, FilmIcon, LockOpenIcon, CheckIcon } from '@/components/ui/Icons';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';

export type SpoilerPreference = 'SAFE' | 'BOOK_ALLOWED' | 'SCREEN_ALLOWED' | 'FULL';

interface SpoilerControlProps {
  currentPreference: SpoilerPreference;
  onPreferenceChange: (preference: SpoilerPreference) => void;
  visibleCount?: number;
  hiddenCount?: number;
  consensusAccuracy?: number;
  topCategories?: Array<{ category: string; count: number }>;
}

const preferences: {
  value: SpoilerPreference;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedScopes: SpoilerScope[];
  color: string;
  activeClass: string;
  hoverClass: string;
}[] = [
  {
    value: 'SAFE',
    label: 'Safe',
    description: 'No spoilers - high-level changes only',
    icon: LockClosedIcon,
    allowedScopes: ['NONE'],
    color: 'emerald',
    activeClass: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30',
    hoverClass: 'hover:bg-accent-emerald/5 hover:text-accent-emerald',
  },
  {
    value: 'BOOK_ALLOWED',
    label: 'Book',
    description: 'Safe + book plot details',
    icon: BookOpenIcon,
    allowedScopes: ['NONE', 'BOOK_ONLY'],
    color: 'amber',
    activeClass: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
    hoverClass: 'hover:bg-accent-amber/5 hover:text-accent-amber',
  },
  {
    value: 'SCREEN_ALLOWED',
    label: 'Screen',
    description: 'Safe + movie/TV plot details',
    icon: FilmIcon,
    allowedScopes: ['NONE', 'SCREEN_ONLY'],
    color: 'amber',
    activeClass: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
    hoverClass: 'hover:bg-accent-amber/5 hover:text-accent-amber',
  },
  {
    value: 'FULL',
    label: 'All',
    description: 'Show everything including endings',
    icon: LockOpenIcon,
    allowedScopes: ['NONE', 'BOOK_ONLY', 'SCREEN_ONLY', 'FULL'],
    color: 'rose',
    activeClass: 'bg-accent-rose/10 text-accent-rose border-accent-rose/30',
    hoverClass: 'hover:bg-accent-rose/5 hover:text-accent-rose',
  },
];

export function getPreferenceConfig(preference: SpoilerPreference) {
  return preferences.find((p) => p.value === preference) || preferences[0];
}

export default function SpoilerControl({
  currentPreference,
  onPreferenceChange,
  visibleCount,
  hiddenCount,
  consensusAccuracy,
  topCategories = [],
}: SpoilerControlProps): JSX.Element {
  // Persist preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spoilerPreference', currentPreference);
    }
  }, [currentPreference]);

  const currentConfig = getPreferenceConfig(currentPreference);

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-black/20 dark:border-white/20 mb-4 sm:mb-6 mt-6 sm:mt-8">
      <div className="py-2 sm:py-3 sm:container">
        {/* Segmented Control */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          {/* Label - Hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2">
            <span className={`${TEXT.label} ${monoUppercase} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>
              Spoiler Level
            </span>
          </div>

          {/* Segmented Control Pills */}
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
            {preferences.map((pref) => {
              const isActive = currentPreference === pref.value;
              const Icon = pref.icon;
              return (
                <button
                  key={pref.value}
                  onClick={() => onPreferenceChange(pref.value)}
                  className={`
                    relative flex-1 sm:flex-initial px-2 sm:px-4 py-3 ${RADIUS.control} ${TEXT.label} font-bold
                    transition-all
                    flex items-center justify-center gap-0.5 sm:gap-1.5 whitespace-nowrap border
                    ${
                      isActive
                        ? `bg-black dark:bg-white ${BORDERS.solid} text-white dark:text-black`
                        : `bg-stone-100 dark:bg-stone-900 ${BORDERS.medium} ${TEXT.mutedStrong} hover:border-black hover:dark:border-white`
                    }
                  `}
                  style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
                  title={pref.description}
                  aria-pressed={isActive}
                  aria-label={`${pref.label}: ${pref.description}`}
                >
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 hidden sm:block" aria-hidden="true" />
                  <span className={`uppercase ${TEXT.metadata}`}>{pref.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Badge - Hidden count feedback */}
          {visibleCount !== undefined && hiddenCount !== undefined && (
            <div className={`${TEXT.label} ${TEXT.mutedMedium} text-center sm:text-left`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>
              <span className="hidden sm:inline">·</span>{' '}
              <span className="font-bold text-black dark:text-white">{visibleCount}</span> shown
              {hiddenCount > 0 && (
                <>
                  {' · '}
                  <span className="font-bold text-black dark:text-white">{hiddenCount}</span> hidden
                </>
              )}
            </div>
          )}
        </div>

        {/* Compact stats line */}
        {(consensusAccuracy !== undefined || topCategories.length > 0) && (
          <div className={`${TEXT.metadata} ${TEXT.mutedLight} text-center sm:text-left px-4 sm:px-0 leading-tight`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}>
            {consensusAccuracy !== undefined && consensusAccuracy > 0 && (
              <>{Math.round(consensusAccuracy)}% accurate</>
            )}
            {topCategories.length > 0 && (
              <>
                {consensusAccuracy !== undefined && consensusAccuracy > 0 && <> · </>}
                <span className="hidden sm:inline">Top: </span>
                <span className="sm:hidden">Most common: </span>
                {topCategories.slice(0, 2).map((cat, index) => (
                  <span key={cat.category}>
                    {index > 0 && <>, </>}{cat.category} ({cat.count})
                  </span>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
