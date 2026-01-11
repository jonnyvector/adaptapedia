'use client';

import { useState } from 'react';
import { FONTS, BORDERS, TEXT, monoUppercase, RADIUS } from '@/lib/brutalist-design';
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
      <fieldset className="mb-8">
        <legend className={`block ${TEXT.secondary} font-bold mb-3 ${monoUppercase}`} style={{ fontFamily: FONTS.mono }}>
          What genres interest you? (Optional)
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="group" aria-label="Genre selection">
          {GENRE_OPTIONS.map((genre) => {
            const isSelected = selectedGenres.includes(genre);
            return (
              <button
                key={genre}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => toggleGenre(genre)}
                className={`px-4 py-3 border ${BORDERS.medium} ${RADIUS.control} font-bold transition-all ${
                  isSelected
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                    : 'bg-white dark:bg-black hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black'
                }`}
                style={{ fontFamily: FONTS.mono }}
              >
                <span aria-hidden="true">{isSelected && '✓ '}</span>
                {genre}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Book vs Screen */}
      <fieldset className="mb-8">
        <legend className={`block ${TEXT.secondary} font-bold mb-3 ${monoUppercase}`} style={{ fontFamily: FONTS.mono }}>
          What do you prefer?
        </legend>
        <div className="space-y-2" role="radiogroup" aria-label="Book versus screen preference">
          {[
            { value: 'BOOKS' as const, label: 'I love books more than adaptations' },
            { value: 'EQUAL' as const, label: 'I enjoy both equally' },
            { value: 'SCREEN' as const, label: 'I prefer watching over reading' },
          ].map(({ value, label }) => {
            const isSelected = bookVsScreen === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setBookVsScreen(value)}
                className={`w-full px-4 py-3 border ${BORDERS.medium} ${RADIUS.control} text-left font-bold transition-all ${
                  isSelected
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                    : 'bg-white dark:bg-black hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black'
                }`}
                style={{ fontFamily: FONTS.mono }}
              >
                <span aria-hidden="true">{isSelected && '• '}</span>{label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Contribution Interest */}
      <fieldset className="mb-8">
        <legend className={`block ${TEXT.secondary} font-bold mb-3 ${monoUppercase}`} style={{ fontFamily: FONTS.mono }}>
          What interests you most?
        </legend>
        <div className="space-y-2" role="radiogroup" aria-label="Contribution interest">
          {[
            { value: 'ADD_DIFFS' as const, label: 'Point out differences' },
            { value: 'DISCUSS' as const, label: 'Discuss with others' },
            { value: 'EXPLORE' as const, label: 'Just exploring' },
          ].map(({ value, label }) => {
            const isSelected = contributionInterest === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setContributionInterest(value)}
                className={`w-full px-4 py-3 border ${BORDERS.medium} ${RADIUS.control} text-left font-bold transition-all ${
                  isSelected
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                    : 'bg-white dark:bg-black hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black'
                }`}
                style={{ fontFamily: FONTS.mono }}
              >
                <span aria-hidden="true">{isSelected && '• '}</span>{label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className={`flex-1 px-6 py-3 border ${BORDERS.medium} ${RADIUS.control} font-bold hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black transition-all ${TEXT.secondary} ${monoUppercase}`}
          style={{ fontFamily: FONTS.mono }}
        >
          Skip
        </button>
        <button
          onClick={handleContinue}
          className={`flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black ${RADIUS.control} font-bold hover:bg-black/90 hover:dark:bg-white/90 transition-colors border ${BORDERS.solid} ${TEXT.secondary} ${monoUppercase}`}
          style={{ fontFamily: FONTS.mono }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
