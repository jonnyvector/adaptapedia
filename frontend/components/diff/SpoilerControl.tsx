'use client';

import { useEffect } from 'react';
import type { SpoilerScope } from '@/lib/types';

export type SpoilerPreference = 'SAFE' | 'BOOK_ALLOWED' | 'SCREEN_ALLOWED' | 'FULL';

interface SpoilerControlProps {
  currentPreference: SpoilerPreference;
  onPreferenceChange: (preference: SpoilerPreference) => void;
}

const preferences: {
  value: SpoilerPreference;
  label: string;
  description: string;
  icon: string;
  allowedScopes: SpoilerScope[];
}[] = [
  {
    value: 'SAFE',
    label: 'Safe Only',
    description: 'No spoilers - high-level changes only',
    icon: '🔒',
    allowedScopes: ['NONE'],
  },
  {
    value: 'BOOK_ALLOWED',
    label: 'Book Spoilers',
    description: 'Safe + book plot details',
    icon: '📖',
    allowedScopes: ['NONE', 'BOOK_ONLY'],
  },
  {
    value: 'SCREEN_ALLOWED',
    label: 'Screen Spoilers',
    description: 'Safe + movie/TV plot details',
    icon: '🎬',
    allowedScopes: ['NONE', 'SCREEN_ONLY'],
  },
  {
    value: 'FULL',
    label: 'Full Spoilers',
    description: 'Show everything including endings',
    icon: '🔓',
    allowedScopes: ['NONE', 'BOOK_ONLY', 'SCREEN_ONLY', 'FULL'],
  },
];

export function getPreferenceConfig(preference: SpoilerPreference) {
  return preferences.find((p) => p.value === preference) || preferences[0];
}

export default function SpoilerControl({
  currentPreference,
  onPreferenceChange,
}: SpoilerControlProps): JSX.Element {
  // Persist preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spoilerPreference', currentPreference);
    }
  }, [currentPreference]);

  const currentConfig = getPreferenceConfig(currentPreference);

  return (
    <div className="sticky top-0 z-10 bg-surface border-b-2 border-warn shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        {/* Header with warning indicator */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-lg" aria-hidden="true">
              {currentConfig.icon}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              Spoiler Control
            </h2>
          </div>
          <div className="text-xs text-muted hidden sm:block">
            Your safety setting
          </div>
        </div>

        {/* Preference Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {preferences.map((pref) => {
            const isActive = currentPreference === pref.value;
            return (
              <button
                key={pref.value}
                onClick={() => onPreferenceChange(pref.value)}
                className={`
                  relative px-3 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold
                  transition-all duration-200 min-h-[60px] sm:min-h-[72px]
                  flex flex-col items-center justify-center gap-1
                  ${
                    isActive
                      ? 'bg-link text-white shadow-lg ring-2 ring-link/50'
                      : 'bg-surface2 text-foreground hover:bg-surface2/80 border border-border'
                  }
                `}
                title={pref.description}
                aria-pressed={isActive}
                aria-label={`${pref.label}: ${pref.description}`}
              >
                <span className="text-xl mb-0.5" aria-hidden="true">
                  {pref.icon}
                </span>
                <span className="text-center leading-tight">{pref.label}</span>
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-muted mt-3 text-center sm:text-left">
          <span className="font-semibold">Current setting:</span> {currentConfig.description}
        </p>

        {/* Warning for Safe Mode */}
        {currentPreference === 'SAFE' && (
          <div className="mt-2 px-3 py-2 bg-info/10 border border-info/30 rounded-md text-xs text-info">
            <span className="font-semibold">Safe mode:</span> Many differences will be hidden.
            Increase spoiler level to see more.
          </div>
        )}
      </div>
    </div>
  );
}
