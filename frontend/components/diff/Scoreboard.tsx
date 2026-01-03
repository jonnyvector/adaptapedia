'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { Work, ScreenWork, ComparisonVoteStats } from '@/lib/types';
import { api } from '@/lib/api';
import { calculateVotePercentage } from '@/lib/vote-utils';
import { BookOpenIcon, FilmIcon } from '@/components/ui/Icons';

interface ScoreboardProps {
  work: Work;
  screenWork: ScreenWork;
  onVoteSubmitted?: () => void;
}

type PreferenceChoice = 'BOOK' | 'SCREEN' | 'TIE';

export default function Scoreboard({
  work,
  screenWork,
  onVoteSubmitted,
}: ScoreboardProps): JSX.Element {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<ComparisonVoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPreference, setSelectedPreference] = useState<PreferenceChoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.comparisonVotes.getStats(work.id, screenWork.id);
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch voting stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [work.id, screenWork.id]);

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
        // Refresh stats
        const data = await api.comparisonVotes.getStats(work.id, screenWork.id);
        setStats(data);
        onVoteSubmitted?.();
      }
    } catch (error) {
      console.error('Vote submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalVotes = stats?.total_votes || 0;
  const bookPct = stats ? calculateVotePercentage(stats.preference_breakdown.BOOK, totalVotes) : 0;
  const screenPct = stats ? calculateVotePercentage(stats.preference_breakdown.SCREEN, totalVotes) : 0;

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="text-sm text-white/50 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      {/* Two-column layout: Stats | Vote */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Community Stats */}
        <div>
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
            Community
          </h3>

          {totalVotes === 0 ? (
            <div className="text-center py-3">
              <p className="text-sm text-white/60">No votes yet</p>
              <p className="text-xs text-white/40 mt-1">Be the first</p>
            </div>
          ) : (
            <>
              {/* Vote percentages */}
              <div className="flex items-center justify-between mb-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{bookPct}%</div>
                  <div className="text-xs text-white/50">Book</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{screenPct}%</div>
                  <div className="text-xs text-white/50">Screen</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div
                  className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${bookPct}%` }}
                />
                <div
                  className="absolute right-0 top-0 h-full bg-orange-500 transition-all duration-500"
                  style={{ width: `${screenPct}%` }}
                />
              </div>

              {/* Vote count */}
              <div className="text-center text-xs text-white/40">
                {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
              </div>

              {/* Faithfulness */}
              {stats && stats.faithfulness.average !== null && (
                <div className="flex items-center justify-between text-sm border-t border-white/10 pt-3 mt-3">
                  <span className="text-white/50">Faithfulness:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-blue-400">
                      {stats.faithfulness.average.toFixed(1)}
                    </span>
                    <span className="text-xs text-white/40">/5</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Your Vote */}
        <div>
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
            Your Vote
          </h3>

          {!selectedPreference ? (
            <div className="space-y-2">
              {/* Book button */}
              <button
                onClick={() => handlePreferenceClick('BOOK')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <BookOpenIcon className="w-5 h-5" />
                <span>Book</span>
              </button>

              {/* Screen button */}
              <button
                onClick={() => handlePreferenceClick('SCREEN')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <FilmIcon className="w-5 h-5" />
                <span>Screen</span>
              </button>

              {/* Tie button */}
              <button
                onClick={() => handlePreferenceClick('TIE')}
                disabled={isSubmitting}
                className="w-full py-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                Both equal
              </button>
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-sm text-white/60 mb-2">
                ✓ Voted:{' '}
                <span className="font-semibold text-white">
                  {selectedPreference === 'BOOK' ? 'Book' : selectedPreference === 'SCREEN' ? 'Screen' : 'Tie'}
                </span>
              </p>
              <button
                onClick={() => setSelectedPreference(null)}
                className="text-sm text-blue-400 hover:underline"
              >
                Change vote
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
