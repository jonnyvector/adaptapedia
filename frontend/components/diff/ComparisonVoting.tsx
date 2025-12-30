'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Work, ScreenWork, PreferenceChoice, ComparisonVoteStats } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { calculateVotePercentage } from '@/lib/vote-utils';
import { CheckCircleIcon } from '@/components/ui/Icons';
import { submitComparisonVote, getComparisonVoteStats } from '@/app/actions/comparison-votes';

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

      // If this was a primary choice and they haven't rated faithfulness, prompt them
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
      <div className="rounded-lg p-4 bg-white dark:bg-surface">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  const adaptationType = screenWork.type === 'MOVIE' ? 'Movie' : 'Series';

  return (
    <div className="rounded-lg p-4 sm:p-5 bg-white dark:bg-surface border border-gray-200 dark:border-border">
      {/* Stats Display */}
      {stats && stats.total_votes > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Community preference</span>
              {stats.total_votes < 10 && (
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                  Early votes
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {stats.total_votes} {stats.total_votes === 1 ? 'vote' : 'votes'}
            </span>
          </div>

          {/* Split Bar Visualization */}
          <div className="h-7 flex rounded-lg overflow-hidden border border-gray-300 dark:border-border">
            <div
              className="bg-orange-500 dark:bg-orange-600 flex items-center justify-center text-white text-xs font-semibold transition-all duration-300"
              style={{ width: `${getPreferencePercentage('BOOK')}%` }}
            >
              {getPreferencePercentage('BOOK') > 12 && `${getPreferencePercentage('BOOK')}%`}
            </div>
            <div
              className="flex items-center justify-center text-white text-xs font-semibold transition-all duration-300"
              style={{ width: `${getPreferencePercentage('SCREEN')}%`, backgroundColor: '#a855f7' }}
            >
              {getPreferencePercentage('SCREEN') > 12 && `${getPreferencePercentage('SCREEN')}%`}
            </div>
            {getPreferencePercentage('TIE') > 0 && (
              <div
                className="bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white text-xs font-semibold transition-all duration-300"
                style={{ width: `${getPreferencePercentage('TIE')}%` }}
              >
                {getPreferencePercentage('TIE') > 8 && `${getPreferencePercentage('TIE')}%`}
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="flex items-center justify-between mt-1.5 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-500 dark:bg-orange-600 rounded-sm"></span>
              Book
            </span>
            {stats.faithfulness.average !== null && (
              <span className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-500">Faithfulness:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.faithfulness.average.toFixed(1)}</span>
                <span className="text-gray-500 dark:text-gray-500">/5</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#a855f7' }}></span>
              {adaptationType}
            </span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
          <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">Vote recorded!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Quick Rating - Primary Actions */}
      <div className="space-y-3">
        <div className="text-center">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Which did you prefer?</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Vote on the adaptation</p>
        </div>

        {/* Primary Vote Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handlePrimaryVote('BOOK')}
            disabled={submitting}
            className={`px-4 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
              preference === 'BOOK'
                ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                : 'bg-white dark:bg-surface border-gray-300 dark:border-border text-gray-900 dark:text-white hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20'
            } disabled:opacity-50`}
          >
            Book
          </button>
          <button
            onClick={() => handlePrimaryVote('SCREEN')}
            disabled={submitting}
            className={`px-4 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
              preference === 'SCREEN'
                ? 'border-purple-500 text-white shadow-md'
                : 'bg-white dark:bg-surface border-gray-300 dark:border-border text-gray-900 dark:text-white hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20'
            } disabled:opacity-50`}
            style={preference === 'SCREEN' ? { backgroundColor: '#a855f7' } : {}}
          >
            {adaptationType}
          </button>
        </div>

        {/* More Options Toggle */}
        <div className="text-center">
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {showMoreOptions ? 'Hide options' : 'More options'}
          </button>
        </div>

        {/* More Options - Expanded */}
        {showMoreOptions && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-border">
            <button
              onClick={() => handleSecondaryVote('TIE')}
              disabled={submitting}
              className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                preference === 'TIE'
                  ? 'bg-gray-400/20 border-gray-400 text-gray-700 dark:text-gray-300'
                  : 'bg-white dark:bg-surface border-gray-300 dark:border-border hover:bg-gray-50 dark:hover:bg-surface2'
              } disabled:opacity-50`}
            >
              Equal/Tie
            </button>
            <button
              onClick={() => handleSecondaryVote('DIDNT_FINISH')}
              disabled={submitting}
              className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                preference === 'DIDNT_FINISH'
                  ? 'bg-gray-300/20 border-gray-400 text-gray-600 dark:text-gray-400'
                  : 'bg-white dark:bg-surface border-gray-300 dark:border-border hover:bg-gray-50 dark:hover:bg-surface2'
              } disabled:opacity-50`}
            >
              Didn't finish
            </button>
          </div>
        )}

        {/* Faithfulness Prompt - After Vote */}
        {showFaithfulnessPrompt && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              How faithful was the adaptation? (optional)
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleFaithfulnessUpdate(rating)}
                  className={`flex-1 px-2 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                    faithfulnessRating === rating
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white dark:bg-surface border-gray-300 dark:border-border hover:bg-blue-50 dark:hover:bg-blue-950/20'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-400 mt-1.5">
              1 = Very different · 5 = Very faithful
            </div>
          </div>
        )}

        {/* Add Faithfulness Rating - For Existing Votes */}
        {preference && (preference === 'BOOK' || preference === 'SCREEN') && !showFaithfulnessPrompt && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-border">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              {faithfulnessRating ? 'Update faithfulness rating' : 'Add faithfulness rating (optional)'}
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleFaithfulnessUpdate(rating)}
                  disabled={submitting}
                  className={`flex-1 px-2 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                    faithfulnessRating === rating
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white dark:bg-surface border-gray-300 dark:border-border hover:bg-blue-50 dark:hover:bg-blue-950/20'
                  } disabled:opacity-50`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              1 = Very different · 5 = Very faithful
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
