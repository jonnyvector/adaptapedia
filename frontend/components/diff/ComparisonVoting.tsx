'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Work, ScreenWork, PreferenceChoice, ComparisonVoteStats } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { calculateVotePercentage } from '@/lib/vote-utils';
import { Button } from '@/components/ui/Button';
import { CheckCircleIcon } from '@/components/ui/Icons';
import { submitComparisonVote, getComparisonVoteStats } from '@/app/actions/comparison-votes';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase, COLORS } from '@/lib/brutalist-design';

interface ComparisonVotingProps {
  work: Work;
  screenWork: ScreenWork;
  initialStats?: ComparisonVoteStats | null;
  onVoteSubmitted?: () => void;
}

export default function ComparisonVoting({ work, screenWork, initialStats = null, onVoteSubmitted }: ComparisonVotingProps): JSX.Element {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [stats, setStats] = useState<ComparisonVoteStats | null>(initialStats);
  const [loading, setLoading] = useState(!initialStats);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showFaithfulnessPrompt, setShowFaithfulnessPrompt] = useState(false);

  // Form state
  const [preference, setPreference] = useState<PreferenceChoice | null>(null);
  const [faithfulnessRating, setFaithfulnessRating] = useState<number | null>(null);

  const fetchStats = async () => {
    try {
      const result = await getComparisonVoteStats(work.id, screenWork.id);
      if (result.success && result.data) {
        setStats(result.data);

        // Pre-fill form if user has already voted
        if (result.data.user_vote) {
          setPreference(result.data.user_vote.preference);
          setFaithfulnessRating(result.data.user_vote.faithfulness_rating);
        }
      }
    } catch (err) {
      console.error('Failed to fetch voting stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have initial stats
    if (!initialStats) {
      fetchStats();
    } else {
      // Pre-fill form from initial stats
      if (initialStats.user_vote) {
        setPreference(initialStats.user_vote.preference);
        setFaithfulnessRating(initialStats.user_vote.faithfulness_rating);
      }
    }
  }, [work.id, screenWork.id, initialStats]);

  const submitVote = async (selectedPreference: PreferenceChoice, faithfulness: number | null = null) => {
    if (!isAuthenticated) {
      // Store the vote data in sessionStorage
      const voteData = {
        work: work.id,
        screen_work: screenWork.id,
        has_read_book: true,  // Assume yes for instant voting
        has_watched_adaptation: true,
        preference: selectedPreference,
        faithfulness_rating: faithfulness,
      };
      sessionStorage.setItem(`pendingComparisonVote_${work.id}_${screenWork.id}`, JSON.stringify(voteData));
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Use server action instead of direct API call
      const result = await submitComparisonVote(
        work.id,
        screenWork.id,
        selectedPreference,
        faithfulness || faithfulnessRating
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit vote');
      }

      setPreference(selectedPreference);
      setShowSuccess(true);

      // If this was a primary choice and they haven&apos;t rated faithfulness, prompt them
      if ((selectedPreference === 'BOOK' || selectedPreference === 'SCREEN') && !faithfulness && !faithfulnessRating) {
        setShowFaithfulnessPrompt(true);
      }

      setTimeout(() => setShowSuccess(false), 3000);

      // Refresh stats
      await fetchStats();
      onVoteSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrimaryVote = async (choice: 'BOOK' | 'SCREEN') => {
    await submitVote(choice);
  };

  const handleSecondaryVote = async (choice: PreferenceChoice) => {
    await submitVote(choice);
    setShowMoreOptions(false);
  };

  const handleFaithfulnessUpdate = async (rating: number) => {
    setFaithfulnessRating(rating);
    if (preference) {
      await submitVote(preference, rating);
      setShowFaithfulnessPrompt(false);
    }
  };

  const getPreferencePercentage = (pref: PreferenceChoice): number => {
    if (!stats) return 0;
    return calculateVotePercentage(stats.preference_breakdown[pref], stats.total_votes);
  };

  if (loading) {
    return (
      <div className={`${RADIUS.control} p-4 bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium}`}>
        <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>Loading...</p>
      </div>
    );
  }

  const adaptationType = screenWork.type === 'MOVIE' ? 'Movie' : 'Series';

  return (
    <div className={`${RADIUS.control} p-4 sm:p-5 bg-white dark:bg-black border ${BORDERS.medium}`}>
      {/* Stats Display */}
      {stats && stats.total_votes > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`${TEXT.secondary} font-bold text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>Community preference</span>
              {stats.total_votes < 10 && (
                <span className={`px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ${TEXT.metadata} font-bold ${RADIUS.control}`} style={{ fontFamily: FONTS.mono }}>
                  Early votes
                </span>
              )}
            </div>
            <span className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
              {stats.total_votes} {stats.total_votes === 1 ? 'vote' : 'votes'}
            </span>
          </div>

          {/* Split Bar Visualization */}
          <div className={`h-7 flex overflow-hidden border ${BORDERS.solid}`}>
            <div
              className={`flex items-center justify-center text-white ${TEXT.metadata} font-bold transition-all duration-300`}
              style={{ width: `${getPreferencePercentage('BOOK')}%`, backgroundColor: COLORS.book, fontFamily: FONTS.mono }}
            >
              {getPreferencePercentage('BOOK') > 12 && `${getPreferencePercentage('BOOK')}%`}
            </div>
            <div
              className={`flex items-center justify-center text-white ${TEXT.metadata} font-bold transition-all duration-300`}
              style={{ width: `${getPreferencePercentage('SCREEN')}%`, backgroundColor: COLORS.screen, fontFamily: FONTS.mono }}
            >
              {getPreferencePercentage('SCREEN') > 12 && `${getPreferencePercentage('SCREEN')}%`}
            </div>
            {getPreferencePercentage('TIE') > 0 && (
              <div
                className={`bg-black/60 dark:bg-white/60 flex items-center justify-center text-white dark:text-black ${TEXT.metadata} font-bold transition-all duration-300`}
                style={{ width: `${getPreferencePercentage('TIE')}%`, fontFamily: FONTS.mono }}
              >
                {getPreferencePercentage('TIE') > 8 && `${getPreferencePercentage('TIE')}%`}
              </div>
            )}
          </div>

          {/* Labels */}
          <div className={`flex items-center justify-between mt-1.5 ${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS.book }}></span>
              Book
            </span>
            {stats.faithfulness.average !== null && (
              <span className="flex items-center gap-1">
                <span className={TEXT.mutedMedium}>Faithfulness:</span>
                <span className="font-bold text-black dark:text-white">{stats.faithfulness.average.toFixed(1)}</span>
                <span className={TEXT.mutedMedium}>/5</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS.screen }}></span>
              {adaptationType}
            </span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className={`mb-4 p-3 bg-black dark:bg-white border ${BORDERS.solid} ${RADIUS.control} flex items-center gap-2 ${TEXT.secondary} text-white dark:text-black`} style={{ fontFamily: FONTS.mono }}>
          <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
          <span className="font-bold">Vote recorded!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={`mb-4 p-3 bg-red-50 dark:bg-red-950/20 border ${BORDERS.solid} border-red-600 dark:border-red-400 ${RADIUS.control} ${TEXT.secondary} text-red-600 dark:text-red-400`} style={{ fontFamily: FONTS.mono }}>
          {error}
        </div>
      )}

      {/* Quick Rating - Primary Actions */}
      <div className="space-y-3">
        <div className="text-center">
          <h3 className={`${TEXT.secondary} font-bold text-black dark:text-white mb-1 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>Which did you prefer?</h3>
          <p className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>Vote on the adaptation</p>
        </div>

        {/* Primary Vote Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handlePrimaryVote('BOOK')}
            disabled={submitting}
            className={`px-4 py-3 ${RADIUS.control} border font-bold ${TEXT.secondary} transition-all ${monoUppercase} ${
              preference === 'BOOK'
                ? `text-white border ${BORDERS.solid}`
                : `bg-white dark:bg-black border ${BORDERS.medium} text-black dark:text-white hover:border-black hover:dark:border-white`
            } disabled:opacity-50`}
            style={preference === 'BOOK' ? { backgroundColor: COLORS.book, fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight } : { fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            Book
          </button>
          <button
            onClick={() => handlePrimaryVote('SCREEN')}
            disabled={submitting}
            className={`px-4 py-3 ${RADIUS.control} border font-bold ${TEXT.secondary} transition-all ${monoUppercase} ${
              preference === 'SCREEN'
                ? `text-white border ${BORDERS.solid}`
                : `bg-white dark:bg-black border ${BORDERS.medium} text-black dark:text-white hover:border-black hover:dark:border-white`
            } disabled:opacity-50`}
            style={preference === 'SCREEN' ? { backgroundColor: COLORS.screen, fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight } : { fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            {adaptationType}
          </button>
        </div>

        {/* More Options Toggle */}
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="p-0 min-h-0 h-auto"
          >
            {showMoreOptions ? 'Hide options' : 'More options'}
          </Button>
        </div>

        {/* More Options - Expanded */}
        {showMoreOptions && (
          <div className={`grid grid-cols-2 gap-2 pt-2 border-t ${BORDERS.subtle}`}>
            <button
              onClick={() => handleSecondaryVote('TIE')}
              disabled={submitting}
              className={`px-3 py-2 ${RADIUS.control} border ${TEXT.metadata} font-bold transition-colors ${monoUppercase} ${
                preference === 'TIE'
                  ? `bg-black/20 dark:bg-white/20 border ${BORDERS.solid} text-black dark:text-white`
                  : `bg-white dark:bg-black border ${BORDERS.medium} text-black dark:text-white hover:border-black hover:dark:border-white`
              } disabled:opacity-50`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
            >
              Equal/Tie
            </button>
            <button
              onClick={() => handleSecondaryVote('DIDNT_FINISH')}
              disabled={submitting}
              className={`px-3 py-2 ${RADIUS.control} border ${TEXT.metadata} font-bold transition-colors ${monoUppercase} ${
                preference === 'DIDNT_FINISH'
                  ? `bg-black/20 dark:bg-white/20 border ${BORDERS.solid} text-black dark:text-white`
                  : `bg-white dark:bg-black border ${BORDERS.medium} text-black dark:text-white hover:border-black hover:dark:border-white`
              } disabled:opacity-50`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
            >
              Didn't finish
            </button>
          </div>
        )}

        {/* Faithfulness Prompt - After Vote */}
        {showFaithfulnessPrompt && (
          <div className={`mt-4 p-3 bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} ${RADIUS.control}`}>
            <div className={`${TEXT.secondary} font-bold text-black dark:text-white mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
              How faithful was the adaptation? (optional)
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleFaithfulnessUpdate(rating)}
                  className={`flex-1 px-2 py-1.5 ${RADIUS.control} border ${TEXT.secondary} font-bold transition-colors ${
                    faithfulnessRating === rating
                      ? `bg-black dark:bg-white border ${BORDERS.solid} text-white dark:text-black`
                      : `bg-white dark:bg-black border ${BORDERS.medium} text-black dark:text-white hover:border-black hover:dark:border-white`
                  }`}
                  style={{ fontFamily: FONTS.mono }}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className={`${TEXT.metadata} ${TEXT.mutedMedium} mt-1.5`} style={{ fontFamily: FONTS.mono }}>
              1 = Very different · 5 = Very faithful
            </div>
          </div>
        )}

        {/* Add Faithfulness Rating - For Existing Votes */}
        {preference && (preference === 'BOOK' || preference === 'SCREEN') && !showFaithfulnessPrompt && (
          <div className={`mt-4 pt-3 border-t ${BORDERS.subtle}`}>
            <div className={`${TEXT.metadata} font-bold ${TEXT.mutedMedium} mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
              {faithfulnessRating ? 'Update faithfulness rating' : 'Add faithfulness rating (optional)'}
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleFaithfulnessUpdate(rating)}
                  disabled={submitting}
                  className={`flex-1 px-2 py-1.5 ${RADIUS.control} border ${TEXT.secondary} font-bold transition-colors ${
                    faithfulnessRating === rating
                      ? `bg-black dark:bg-white border ${BORDERS.solid} text-white dark:text-black`
                      : `bg-white dark:bg-black border ${BORDERS.medium} text-black dark:text-white hover:border-black hover:dark:border-white`
                  } disabled:opacity-50`}
                  style={{ fontFamily: FONTS.mono }}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className={`${TEXT.metadata} ${TEXT.mutedMedium} mt-1.5`} style={{ fontFamily: FONTS.mono }}>
              1 = Very different · 5 = Very faithful
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
