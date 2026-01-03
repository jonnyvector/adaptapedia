'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { Work, ScreenWork, ComparisonVoteStats } from '@/lib/types';
import { api } from '@/lib/api';
import { calculateVotePercentage } from '@/lib/vote-utils';

interface ScoreboardCompactProps {
  work: Work;
  screenWork: ScreenWork;
  onVoteSubmitted?: () => void;
}

type PreferenceChoice = 'BOOK' | 'SCREEN' | 'TIE';

export default function ScoreboardCompact({
  work,
  screenWork,
  onVoteSubmitted,
}: ScoreboardCompactProps): JSX.Element {
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
  const isLowConfidence = totalVotes < 10;

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
        <div className="text-xs text-white/50 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      {/* Two-column layout: Stats | Vote */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Community Stats */}
        <div>
          <h3 className="text-xs font-medium text-white/50 uppercase tracking-wide mb-2">
            Community verdict
          </h3>

          {totalVotes === 0 ? (
            <div className="py-2">
              <p className="text-sm text-white/60">No votes yet</p>
              <p className="text-xs text-white/40 mt-1">Be the first</p>
            </div>
          ) : (
            <>
              {/* Low confidence warning */}
              {isLowConfidence && (
                <div className="text-xs text-white/40 mb-2">
                  Early votes ({totalVotes})
                </div>
              )}

              {/* Vote percentages - only show if >= 10 votes */}
              {!isLowConfidence && (
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xl font-bold text-white">{bookPct}%</div>
                    <div className="text-xs text-white/40">Book</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{screenPct}%</div>
                    <div className="text-xs text-white/40">Screen</div>
                  </div>
                </div>
              )}

              {/* Progress bar - always show but muted for low confidence */}
              <div className={`relative h-1.5 bg-white/10 rounded-full overflow-hidden mb-2 ${isLowConfidence ? 'opacity-40' : ''}`}>
                <div
                  className="absolute left-0 top-0 h-full bg-white/60 transition-all duration-500"
                  style={{ width: `${bookPct}%` }}
                />
                <div
                  className="absolute right-0 top-0 h-full bg-white/60 transition-all duration-500"
                  style={{ width: `${screenPct}%` }}
                />
              </div>

              {/* Vote count - show for all */}
              {!isLowConfidence && (
                <div className="text-xs text-white/40">
                  {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                </div>
              )}

              {/* Faithfulness - only if >= 10 votes */}
              {!isLowConfidence && stats && stats.faithfulness.average !== null && (
                <div className="flex items-center justify-between text-xs border-t border-white/10 pt-2 mt-2">
                  <span className="text-white/40">Faithfulness:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-white">
                      {stats.faithfulness.average.toFixed(1)}
                    </span>
                    <span className="text-xs text-white/30">/5</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Your Vote - Segmented Control */}
        <div>
          <h3 className="text-xs font-medium text-white/50 uppercase tracking-wide mb-2">
            Your take
          </h3>

          {!selectedPreference ? (
            <div className="space-y-2">
              {/* Segmented control */}
              <div className="inline-flex bg-white/5 rounded-lg p-0.5 w-full">
                <button
                  onClick={() => handlePreferenceClick('BOOK')}
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                >
                  Book
                </button>
                <button
                  onClick={() => handlePreferenceClick('SCREEN')}
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                >
                  Screen
                </button>
                <button
                  onClick={() => handlePreferenceClick('TIE')}
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                >
                  Tie
                </button>
              </div>

              <p className="text-xs text-white/40">Pick your side</p>
            </div>
          ) : (
            <div className="py-2">
              <p className="text-sm text-white/60 mb-2">
                ✓ {selectedPreference === 'BOOK' ? 'Book' : selectedPreference === 'SCREEN' ? 'Screen' : 'Tie'}
              </p>
              <button
                onClick={() => setSelectedPreference(null)}
                className="text-xs text-white/50 hover:text-white transition-colors"
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
