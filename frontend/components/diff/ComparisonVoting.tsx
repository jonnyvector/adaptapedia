'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Work, ScreenWork, PreferenceChoice, ComparisonVoteStats } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { calculateVotePercentage } from '@/lib/vote-utils';

interface ComparisonVotingProps {
  work: Work;
  screenWork: ScreenWork;
  onVoteSubmitted?: () => void;
}

export default function ComparisonVoting({ work, screenWork, onVoteSubmitted }: ComparisonVotingProps): JSX.Element {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [stats, setStats] = useState<ComparisonVoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [hasReadBook, setHasReadBook] = useState(false);
  const [hasWatchedAdaptation, setHasWatchedAdaptation] = useState(false);
  const [preference, setPreference] = useState<PreferenceChoice | null>(null);
  const [faithfulnessRating, setFaithfulnessRating] = useState<number | null>(null);

  const fetchStats = async () => {
    try {
      const data = await api.comparisonVotes.getStats(work.id, screenWork.id);
      setStats(data);

      // Pre-fill form if user has already voted
      if (data.user_vote) {
        setHasReadBook(data.user_vote.has_read_book);
        setHasWatchedAdaptation(data.user_vote.has_watched_adaptation);
        setPreference(data.user_vote.preference);
        setFaithfulnessRating(data.user_vote.faithfulness_rating);
      }
    } catch (err) {
      console.error('Failed to fetch voting stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [work.id, screenWork.id]);

  // Auto-submit vote after login if pending
  useEffect(() => {
    const submitPendingVote = async () => {
      if (typeof window !== 'undefined' && isAuthenticated && !submitting) {
        const pendingVoteKey = `pendingComparisonVote_${work.id}_${screenWork.id}`;
        const pendingVoteData = sessionStorage.getItem(pendingVoteKey);

        if (pendingVoteData) {
          const voteData = JSON.parse(pendingVoteData);
          sessionStorage.removeItem(pendingVoteKey);

          // Restore form state
          setHasReadBook(voteData.has_read_book);
          setHasWatchedAdaptation(voteData.has_watched_adaptation);
          setPreference(voteData.preference);
          setFaithfulnessRating(voteData.faithfulness_rating);

          // Auto-submit
          setSubmitting(true);
          setError(null);

          try {
            await api.comparisonVotes.submit(voteData);
            await fetchStats();
            onVoteSubmitted?.();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit vote');
          } finally {
            setSubmitting(false);
          }
        }
      }
    };

    submitPendingVote();
  }, [isAuthenticated, submitting, work.id, screenWork.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      // Store the vote data in sessionStorage
      const voteData = {
        work: work.id,
        screen_work: screenWork.id,
        has_read_book: hasReadBook,
        has_watched_adaptation: hasWatchedAdaptation,
        preference,
        faithfulness_rating: faithfulnessRating,
      };
      sessionStorage.setItem(`pendingComparisonVote_${work.id}_${screenWork.id}`, JSON.stringify(voteData));
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!hasReadBook || !hasWatchedAdaptation) {
      setError('Please confirm that you have read the book and watched the adaptation.');
      return;
    }

    if (!preference) {
      setError('Please select your preference.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.comparisonVotes.submit({
        work: work.id,
        screen_work: screenWork.id,
        has_read_book: hasReadBook,
        has_watched_adaptation: hasWatchedAdaptation,
        preference,
        faithfulness_rating: faithfulnessRating,
      });

      // Refresh stats
      await fetchStats();
      onVoteSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  const getPreferencePercentage = (pref: PreferenceChoice): number => {
    if (!stats) return 0;
    return calculateVotePercentage(stats.preference_breakdown[pref], stats.total_votes);
  };

  if (loading) {
    return (
      <div className="border border-border rounded-lg p-6 bg-surface">
        <p className="text-sm text-muted">Loading voting data...</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-surface">
      {/* Stats Display */}
      {stats && stats.total_votes > 0 && (
        <div className="mb-4">
          {/* Main Preference Visualization */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Community Preference</span>
                {stats.total_votes < 10 && (
                  <span className="px-2 py-0.5 bg-accent-amber/10 text-accent-amber text-xs font-medium rounded-full">
                    Early votes
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {stats.faithfulness.average !== null && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted">Faithfulness</span>
                    <span className="text-sm font-bold text-link">
                      {stats.faithfulness.average.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted">/5</span>
                  </div>
                )}
                <span className="text-xs text-muted">
                  n={stats.total_votes} {stats.total_votes === 1 ? 'vote' : 'votes'}
                </span>
              </div>
            </div>

            {/* Split Bar Visualization */}
            <div className="h-8 flex rounded-lg overflow-hidden border border-border">
              {/* Book Side */}
              <div
                className="bg-orange-500 dark:bg-orange-600 flex items-center justify-center text-white font-semibold transition-all duration-300"
                style={{ width: `${getPreferencePercentage('BOOK')}%` }}
              >
                {getPreferencePercentage('BOOK') > 15 && (
                  <span className="text-sm">{getPreferencePercentage('BOOK')}%</span>
                )}
              </div>

              {/* Screen Side */}
              <div
                className="flex items-center justify-center text-white font-semibold transition-all duration-300"
                style={{ width: `${getPreferencePercentage('SCREEN')}%`, backgroundColor: '#a855f7' }}
              >
                {getPreferencePercentage('SCREEN') > 15 && (
                  <span className="text-sm">{getPreferencePercentage('SCREEN')}%</span>
                )}
              </div>

              {/* Tie Section */}
              {getPreferencePercentage('TIE') > 0 && (
                <div
                  className="bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white font-semibold transition-all duration-300"
                  style={{ width: `${getPreferencePercentage('TIE')}%` }}
                >
                  {getPreferencePercentage('TIE') > 10 && (
                    <span className="text-sm">{getPreferencePercentage('TIE')}%</span>
                  )}
                </div>
              )}
            </div>

            {/* Labels */}
            <div className="flex items-center justify-between mt-1.5 text-xs text-muted">
              <span className="flex items-center gap-1">
                <span style={{ width: '10px', height: '10px', backgroundColor: '#f97316', borderRadius: '2px', flexShrink: 0 }}></span>
                Book
              </span>
              <span className="flex items-center gap-1">
                <span style={{ width: '10px', height: '10px', backgroundColor: '#a855f7', borderRadius: '2px', flexShrink: 0 }}></span>
                Screen
              </span>
              {getPreferencePercentage('TIE') > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-600 rounded"></span>
                  Tie
                </span>
              )}
            </div>
          </div>

          {/* Faithfulness Rating */}
          {stats.faithfulness.average !== null && (
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
              <div>
                <div className="text-xs font-medium text-muted mb-0.5">Faithfulness</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-link">
                    {stats.faithfulness.average.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted">/ 5.0</span>
                </div>
              </div>
              <div className="text-xs text-muted text-right">
                {stats.faithfulness.count} {stats.faithfulness.count === 1 ? 'rating' : 'ratings'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voting Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Consumption Confirmation */}
        <div className="space-y-2 p-3 bg-surface2 rounded-lg">
          <div className="text-xs font-medium mb-1.5 text-muted">Confirm you've experienced both:</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={hasReadBook}
                onChange={(e) => setHasReadBook(e.target.checked)}
                className="min-w-[16px] min-h-[16px]"
              />
              <span className="text-sm">Read the book</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={hasWatchedAdaptation}
                onChange={(e) => setHasWatchedAdaptation(e.target.checked)}
                className="min-w-[16px] min-h-[16px]"
              />
              <span className="text-sm">Watched adaptation</span>
            </label>
          </div>
        </div>

        {/* Preference Selection */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted">Your preference:</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPreference('BOOK')}
              disabled={!hasReadBook || !hasWatchedAdaptation}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                preference === 'BOOK'
                  ? 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'bg-surface border-border hover:bg-surface2 disabled:opacity-50'
              }`}
            >
              Book
            </button>
            <button
              type="button"
              onClick={() => setPreference('SCREEN')}
              disabled={!hasReadBook || !hasWatchedAdaptation}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                preference === 'SCREEN'
                  ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'bg-surface border-border hover:bg-surface2 disabled:opacity-50'
              }`}
            >
              Screen
            </button>
            <button
              type="button"
              onClick={() => setPreference('TIE')}
              disabled={!hasReadBook || !hasWatchedAdaptation}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                preference === 'TIE'
                  ? 'bg-gray-400/10 border-gray-400 text-gray-600 dark:text-gray-400'
                  : 'bg-surface border-border hover:bg-surface2 disabled:opacity-50'
              }`}
            >
              Tie
            </button>
            <button
              type="button"
              onClick={() => setPreference('DIDNT_FINISH')}
              disabled={!hasReadBook || !hasWatchedAdaptation}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                preference === 'DIDNT_FINISH'
                  ? 'bg-muted/10 border-muted text-muted'
                  : 'bg-surface border-border hover:bg-surface2 disabled:opacity-50'
              }`}
            >
              Didn't finish
            </button>
          </div>
        </div>

        {/* Faithfulness Rating */}
        {preference && preference !== 'DIDNT_FINISH' && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted">Faithfulness rating:</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFaithfulnessRating(rating)}
                  className={`flex-1 px-2 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    faithfulnessRating === rating
                      ? 'bg-link/10 border-link text-link'
                      : 'bg-surface border-border hover:bg-surface2'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="text-xs text-muted">
              1 = Very different · 5 = Very faithful
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-2 bg-danger/10 border border-danger rounded-lg text-xs text-danger">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !hasReadBook || !hasWatchedAdaptation || !preference}
          className="w-full px-4 py-2 bg-link text-white rounded-lg hover:bg-link-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {submitting ? 'Submitting...' : stats?.user_vote ? 'Update Vote' : 'Submit Vote'}
        </button>
      </form>
    </div>
  );
}
