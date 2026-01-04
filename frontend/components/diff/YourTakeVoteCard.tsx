'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { Work, ScreenWork } from '@/lib/types';
import { BookOpenIcon, FilmIcon } from '@/components/ui/Icons';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

interface YourTakeVoteCardProps {
  work: Work;
  screenWork: ScreenWork;
  diffCount: number;
  onVoteSubmitted?: () => void;
  onAddDiff: () => void;
}

type PreferenceChoice = 'BOOK' | 'SCREEN' | 'TIE';

export default function YourTakeVoteCard({
  work,
  screenWork,
  diffCount,
  onVoteSubmitted,
  onAddDiff,
}: YourTakeVoteCardProps): JSX.Element {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedPreference, setSelectedPreference] = useState<PreferenceChoice | null>(null);
  const [showFaithfulness, setShowFaithfulness] = useState(false);
  const [faithfulness, setFaithfulness] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePreferenceClick = async (preference: PreferenceChoice) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setSelectedPreference(preference);
    setIsSubmitting(true);

    try {
      const { submitComparisonVote } = await import('@/app/actions/comparison-votes');
      const result = await submitComparisonVote(work.id, screenWork.id, preference, null);

      if (result.success) {
        onVoteSubmitted?.();
      }
    } catch (error) {
      console.error('Vote submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFaithfulnessSubmit = async () => {
    if (!faithfulness || !selectedPreference) return;

    setIsSubmitting(true);
    try {
      const { submitComparisonVote } = await import('@/app/actions/comparison-votes');
      await submitComparisonVote(work.id, screenWork.id, selectedPreference, faithfulness);
      setShowFaithfulness(false);
      onVoteSubmitted?.();
    } catch (error) {
      console.error('Faithfulness submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} p-6`}>
      <h3 className={`${TEXT.body} font-bold text-black dark:text-white mb-4 uppercase tracking-widest`} style={{ fontFamily: FONTS.mono }}>
        Pick a Side
      </h3>

      {!selectedPreference ? (
        <>
          {/* Team buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handlePreferenceClick('BOOK')}
              disabled={isSubmitting}
              className={`flex flex-col items-center justify-center gap-2 py-6 px-4 border-2 ${BORDERS.solid} bg-transparent hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black font-bold ${RADIUS.control} transition-all disabled:opacity-50 disabled:cursor-not-allowed text-black dark:text-white ${TEXT.secondary} uppercase tracking-widest`}
              style={{ fontFamily: FONTS.mono }}
            >
              <BookOpenIcon className="w-8 h-8" />
              <span>Team Book</span>
            </button>
            <button
              onClick={() => handlePreferenceClick('SCREEN')}
              disabled={isSubmitting}
              className={`flex flex-col items-center justify-center gap-2 py-6 px-4 border-2 ${BORDERS.solid} bg-transparent hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black font-bold ${RADIUS.control} transition-all disabled:opacity-50 disabled:cursor-not-allowed text-black dark:text-white ${TEXT.secondary} uppercase tracking-widest`}
              style={{ fontFamily: FONTS.mono }}
            >
              <FilmIcon className="w-8 h-8" />
              <span>Team Screen</span>
            </button>
          </div>

          {/* Optional: Tie */}
          <button
            onClick={() => handlePreferenceClick('TIE')}
            disabled={isSubmitting}
            className={`w-full py-2 ${TEXT.secondary} ${TEXT.mutedMedium} hover:text-black hover:dark:text-white transition-colors uppercase tracking-wide`}
            style={{ fontFamily: FONTS.mono }}
          >
            Both were equally good
          </button>

          {/* Primary CTA */}
          <div className={`mt-6 pt-6 border-t ${BORDERS.medium}`}>
            <button
              onClick={onAddDiff}
              className={`w-full py-3 px-4 border ${BORDERS.solid} bg-transparent hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black text-black dark:text-white font-bold ${RADIUS.control} transition-all ${TEXT.secondary} uppercase tracking-widest`}
              style={{ fontFamily: FONTS.mono }}
            >
              {diffCount === 0 ? 'Add the first difference' : 'Add a difference'}
            </button>
          </div>
        </>
      ) : showFaithfulness ? (
        // Faithfulness rating (optional, shown after vote)
        <div>
          <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-4 uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
            Rate faithfulness (optional)
          </p>
          <p className={`${TEXT.label} ${TEXT.mutedLight} mb-4`} style={{ fontFamily: FONTS.mono }}>
            1 = Completely different · 5 = Nearly identical
          </p>

          {/* 1-5 buttons */}
          <div className="flex justify-center gap-3 mb-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setFaithfulness(rating)}
                className={`w-12 h-12 rounded-full font-bold transition-all border-2 ${
                  faithfulness === rating
                    ? `${BORDERS.solid} bg-black dark:bg-white text-white dark:text-black scale-110`
                    : `${BORDERS.medium} bg-transparent text-black dark:text-white hover:${BORDERS.solid}`
                }`}
                style={{ fontFamily: FONTS.mono }}
              >
                {rating}
              </button>
            ))}
          </div>

          <button
            onClick={handleFaithfulnessSubmit}
            disabled={!faithfulness || isSubmitting}
            className={`w-full py-3 border ${BORDERS.solid} bg-transparent hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black text-black dark:text-white font-bold ${RADIUS.control} transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${TEXT.secondary} uppercase tracking-widest`}
            style={{ fontFamily: FONTS.mono }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit rating'}
          </button>

          <button
            onClick={() => setShowFaithfulness(false)}
            className={`w-full mt-2 ${TEXT.secondary} ${TEXT.mutedMedium} hover:text-black hover:dark:text-white uppercase tracking-wide`}
            style={{ fontFamily: FONTS.mono }}
          >
            Skip
          </button>
        </div>
      ) : (
        // After vote confirmation
        <div className="text-center py-4">
          <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-3 uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
            ✓ Vote submitted:{' '}
            <span className="font-bold text-black dark:text-white">
              {selectedPreference === 'BOOK' ? 'Team Book' : selectedPreference === 'SCREEN' ? 'Team Screen' : 'Tie'}
            </span>
          </p>

          {/* Optional: Rate faithfulness link */}
          <button
            onClick={() => setShowFaithfulness(true)}
            className={`${TEXT.secondary} text-black dark:text-white hover:underline mb-4 uppercase tracking-wide`}
            style={{ fontFamily: FONTS.mono }}
          >
            Rate faithfulness (optional)
          </button>

          {/* Primary CTA */}
          <div className={`pt-4 border-t ${BORDERS.medium}`}>
            <button
              onClick={onAddDiff}
              className={`w-full py-3 px-4 border ${BORDERS.solid} bg-transparent hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black text-black dark:text-white font-bold ${RADIUS.control} transition-colors ${TEXT.secondary} uppercase tracking-widest`}
              style={{ fontFamily: FONTS.mono }}
            >
              {diffCount === 0 ? 'Add the first difference' : 'Add a difference'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
