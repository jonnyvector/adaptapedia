'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { Work, ScreenWork } from '@/lib/types';
import { BookOpenIcon, FilmIcon } from '@/components/ui/Icons';

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
    <div className="bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Pick a Side
      </h3>

      {!selectedPreference ? (
        <>
          {/* Team buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handlePreferenceClick('BOOK')}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-2 py-6 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <BookOpenIcon className="w-8 h-8" />
              <span>Team Book</span>
            </button>
            <button
              onClick={() => handlePreferenceClick('SCREEN')}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-2 py-6 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <FilmIcon className="w-8 h-8" />
              <span>Team Screen</span>
            </button>
          </div>

          {/* Optional: Tie */}
          <button
            onClick={() => handlePreferenceClick('TIE')}
            disabled={isSubmitting}
            className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Both were equally good
          </button>

          {/* Primary CTA */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onAddDiff}
              className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
            >
              {diffCount === 0 ? 'Add the first difference' : 'Add a difference'}
            </button>
          </div>
        </>
      ) : showFaithfulness ? (
        // Faithfulness rating (optional, shown after vote)
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Rate faithfulness (optional)
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
            1 = Completely different · 5 = Nearly identical
          </p>

          {/* 1-5 buttons */}
          <div className="flex justify-center gap-3 mb-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setFaithfulness(rating)}
                className={`w-12 h-12 rounded-full font-bold transition-all ${
                  faithfulness === rating
                    ? 'bg-blue-600 text-white scale-110'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>

          <button
            onClick={handleFaithfulnessSubmit}
            disabled={!faithfulness || isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit rating'}
          </button>

          <button
            onClick={() => setShowFaithfulness(false)}
            className="w-full mt-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Skip
          </button>
        </div>
      ) : (
        // After vote confirmation
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            ✓ Vote submitted:{' '}
            <span className="font-semibold">
              {selectedPreference === 'BOOK' ? 'Team Book' : selectedPreference === 'SCREEN' ? 'Team Screen' : 'Tie'}
            </span>
          </p>

          {/* Optional: Rate faithfulness link */}
          <button
            onClick={() => setShowFaithfulness(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            Rate faithfulness (optional)
          </button>

          {/* Primary CTA */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onAddDiff}
              className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
            >
              {diffCount === 0 ? 'Add the first difference' : 'Add a difference'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
