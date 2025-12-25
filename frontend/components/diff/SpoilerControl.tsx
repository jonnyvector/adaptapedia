'use client';

import { useEffect } from 'react';
import type { SpoilerScope } from '@/lib/types';
import { LockClosedIcon, BookOpenIcon, FilmIcon, LockOpenIcon, CheckIcon } from '@/components/ui/Icons';

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
}[] = [
  {
    value: 'SAFE',
    label: 'Safe',
    description: 'No spoilers - high-level changes only',
    icon: LockClosedIcon,
    allowedScopes: ['NONE'],
  },
  {
    value: 'BOOK_ALLOWED',
    label: 'Book',
    description: 'Safe + book plot details',
    icon: BookOpenIcon,
    allowedScopes: ['NONE', 'BOOK_ONLY'],
  },
  {
    value: 'SCREEN_ALLOWED',
    label: 'Screen',
    description: 'Safe + movie/TV plot details',
    icon: FilmIcon,
    allowedScopes: ['NONE', 'SCREEN_ONLY'],
  },
  {
    value: 'FULL',
    label: 'All',
    description: 'Show everything including endings',
    icon: LockOpenIcon,
    allowedScopes: ['NONE', 'BOOK_ONLY', 'SCREEN_ONLY', 'FULL'],
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
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm mb-6">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Segmented Control */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
          {/* Label */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted">
              Spoiler Level
            </span>
          </div>

          {/* Segmented Control Pills */}
          <div className="inline-flex items-center bg-surface2/50 rounded-full p-1 border border-border shadow-inner">
            {preferences.map((pref) => {
              const isActive = currentPreference === pref.value;
              const Icon = pref.icon;
              return (
                <button
                  key={pref.value}
                  onClick={() => onPreferenceChange(pref.value)}
                  className={`
                    relative px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium
                    transition-all duration-200 ease-in-out
                    flex items-center gap-1.5 whitespace-nowrap
                    ${
                      isActive
                        ? 'bg-background text-foreground shadow-md border border-border/50'
                        : 'text-muted hover:text-foreground hover:bg-surface2/30'
                    }
                  `}
                  title={pref.description}
                  aria-pressed={isActive}
                  aria-label={`${pref.label}: ${pref.description}`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="font-mono">{pref.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Badge - Hidden count feedback */}
          {visibleCount !== undefined && hiddenCount !== undefined && (
            <div className="text-xs text-muted font-mono">
              <span className="hidden sm:inline">·</span>{' '}
              <span className="font-semibold text-foreground">{visibleCount}</span> shown
              {hiddenCount > 0 && (
                <>
                  {' · '}
                  <span className="font-semibold text-warn">{hiddenCount}</span> hidden
                </>
              )}
            </div>
          )}
        </div>

        {/* Compact stats line */}
        {(consensusAccuracy !== undefined || topCategories.length > 0) && (
          <div className="text-xs text-muted/70 font-mono flex items-center leading-none">
            {consensusAccuracy !== undefined && consensusAccuracy > 0 && (
              <>
                <span className="text-muted">{Math.round(consensusAccuracy)}% accurate</span>
              </>
            )}
            {topCategories.length > 0 && (
              <>
                {consensusAccuracy !== undefined && consensusAccuracy > 0 && (
                  <span className="mx-1.5">·</span>
                )}
                <span className="text-muted/70">Top:</span>
                {topCategories.map((cat, index) => (
                  <span key={cat.category}>
                    {index > 0 && <span className="text-muted/50">,</span>} {cat.category} ({cat.count})
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
