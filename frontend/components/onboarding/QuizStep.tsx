'use client';

import { useState } from 'react';
import { FONTS, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';
import { GENRE_OPTIONS } from '@/lib/onboarding-utils';
import type { UserPreferences } from '@/lib/types';

interface QuizStepProps {
  onComplete: (preferences: Partial<UserPreferences>) => void;
  onSkip: () => void;
}

export default function QuizStep({ onComplete, onSkip }: QuizStepProps): JSX.Element {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [bookVsScreen, setBookVsScreen] = useState<'BOOKS' | 'EQUAL' | 'SCREEN' | ''>('');
  const [contributionInterest, setContributionInterest] = useState<'ADD_DIFFS' | 'DISCUSS' | 'EXPLORE' | ''>('');

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleContinue = () => {
    onComplete({
      genres: selectedGenres,
      book_vs_screen: bookVsScreen || undefined,
      contribution_interest: contributionInterest || undefined,
    });
  };

  return (
    <div>
      <h2 className={`text-2xl font-bold mb-6 ${monoUppercase}`} style={{ fontFamily: FONTS.mono }}>
        Tell us what you like
      </h2>

      {/* Genres */}
      <div className="mb-8">
        <label className={`block ${TEXT.secondary} font-bold mb-3 ${monoUppercase}`} style={{ fontFamily: FONTS.mono }}>
          What genres interest you? (Optional)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GENRE_OPTIONS.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={`px-4 py-3 border ${BORDERS.medium} rounded-md font-bold transition-colors ${
                selectedGenres.includes(genre)
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                  : 'bg-white dark:bg-black hover:bg-gray-100 hover:dark:bg-gray-900'
              }`}
              style={{ fontFamily: FONTS.mono }}
            >
              {selectedGenres.includes(genre) && '✓ '}
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Book vs Screen */}
      <div className="mb-8">
        <label className={`block ${TEXT.secondary} font-bold mb-3 ${monoUppercase}`} style={{ fontFamily: FONTS.mono }}>
          What do you prefer?
        </label>
        <div className="space-y-2">
          {[
            { value: 'BOOKS' as const, label: 'I love books more than adaptations' },
            { value: 'EQUAL' as const, label: 'I enjoy both equally' },
            { value: 'SCREEN' as const, label: 'I prefer watching over reading' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setBookVsScreen(value)}
              className={`w-full px-4 py-3 border ${BORDERS.medium} rounded-md text-left font-bold transition-colors ${
                bookVsScreen === value
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                  : 'bg-white dark:bg-black hover:bg-gray-100 hover:dark:bg-gray-900'
              }`}
              style={{ fontFamily: FONTS.mono }}
            >
              {bookVsScreen === value && '• '}{label}
            </button>
          ))}
        </div>
      </div>

      {/* Contribution Interest */}
      <div className="mb-8">
        <label className={`block ${TEXT.secondary} font-bold mb-3 ${monoUppercase}`} style={{ fontFamily: FONTS.mono }}>
          What interests you most?
        </label>
        <div className="space-y-2">
          {[
            { value: 'ADD_DIFFS' as const, label: 'Point out differences' },
            { value: 'DISCUSS' as const, label: 'Discuss with others' },
            { value: 'EXPLORE' as const, label: 'Just exploring' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setContributionInterest(value)}
              className={`w-full px-4 py-3 border ${BORDERS.medium} rounded-md text-left font-bold transition-colors ${
                contributionInterest === value
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                  : 'bg-white dark:bg-black hover:bg-gray-100 hover:dark:bg-gray-900'
              }`}
              style={{ fontFamily: FONTS.mono }}
            >
              {contributionInterest === value && '• '}{label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className={`flex-1 px-6 py-3 border ${BORDERS.medium} rounded-md font-bold hover:bg-gray-100 hover:dark:bg-gray-900 transition-colors ${TEXT.secondary} ${monoUppercase}`}
          style={{ fontFamily: FONTS.mono }}
        >
          Skip
        </button>
        <button
          onClick={handleContinue}
          className={`flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md font-bold hover:bg-black/90 hover:dark:bg-white/90 transition-colors border ${BORDERS.solid} ${TEXT.secondary} ${monoUppercase}`}
          style={{ fontFamily: FONTS.mono }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
