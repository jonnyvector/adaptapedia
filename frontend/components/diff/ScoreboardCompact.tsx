'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { Work, ScreenWork, ComparisonVoteStats } from '@/lib/types';
import { api } from '@/lib/api';
import { calculateVotePercentage } from '@/lib/vote-utils';
import { FONTS, BORDERS, TEXT, RADIUS, COLORS } from '@/lib/brutalist-design';

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
      <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} ${RADIUS.control} p-3`}>
        <div className={`${TEXT.secondary} ${TEXT.mutedMedium} animate-pulse`} style={{ fontFamily: FONTS.mono }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} ${RADIUS.control} p-3`}>
      {/* Two-column layout: Stats | Vote */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Community Stats */}
        <div>
          <h3 className={`${TEXT.label} font-bold ${TEXT.mutedMedium} uppercase tracking-widest mb-2`} style={{ fontFamily: FONTS.mono }}>
            Community verdict
          </h3>

          {totalVotes === 0 ? (
            <div className="py-2">
              <p className={`${TEXT.body} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>No votes yet</p>
              <p className={`${TEXT.secondary} ${TEXT.mutedLight} mt-1`} style={{ fontFamily: FONTS.mono }}>Be the first</p>
            </div>
          ) : (
            <>
              {/* Low confidence warning */}
              {isLowConfidence && (
                <div className={`${TEXT.secondary} ${TEXT.mutedLight} mb-2`} style={{ fontFamily: FONTS.mono }}>
                  Early votes ({totalVotes})
                </div>
              )}

              {/* Vote percentages - only show if >= 10 votes */}
              {!isLowConfidence && (
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className={`text-xl font-bold`} style={{ fontFamily: FONTS.mono, color: COLORS.book }}>{bookPct}%</div>
                    <div className={`${TEXT.secondary} ${TEXT.mutedLight} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Book</div>
                  </div>
                  <div>
                    <div className={`text-xl font-bold`} style={{ fontFamily: FONTS.mono, color: COLORS.screen }}>{screenPct}%</div>
                    <div className={`${TEXT.secondary} ${TEXT.mutedLight} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Screen</div>
                  </div>
                </div>
              )}

              {/* Progress bar - always show but muted for low confidence */}
              <div className={`relative h-1.5 bg-black/10 dark:bg-white/10 ${RADIUS.control} overflow-hidden mb-2 ${isLowConfidence ? 'opacity-40' : ''}`}>
                <div
                  className="absolute left-0 top-0 h-full transition-all duration-500"
                  style={{ width: `${bookPct}%`, backgroundColor: COLORS.book }}
                />
                <div
                  className="absolute right-0 top-0 h-full transition-all duration-500"
                  style={{ width: `${screenPct}%`, backgroundColor: COLORS.screen }}
                />
              </div>

              {/* Vote count - show for all */}
              {!isLowConfidence && (
                <div className={`${TEXT.secondary} ${TEXT.mutedLight}`} style={{ fontFamily: FONTS.mono }}>
                  {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                </div>
              )}

              {/* Faithfulness - only if >= 10 votes */}
              {!isLowConfidence && stats && stats.faithfulness.average !== null && (
                <div className={`flex items-center justify-between ${TEXT.secondary} border-t ${BORDERS.subtle} pt-2 mt-2`}>
                  <span className={TEXT.mutedLight} style={{ fontFamily: FONTS.mono }}>Faithfulness:</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`${TEXT.body} font-bold ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>
                      {stats.faithfulness.average.toFixed(1)}
                    </span>
                    <span className={`${TEXT.secondary} ${TEXT.mutedLight}`} style={{ fontFamily: FONTS.mono }}>/5</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Your Vote - Segmented Control */}
        <div>
          <h3 className={`${TEXT.label} font-bold ${TEXT.mutedMedium} uppercase tracking-widest mb-2`} style={{ fontFamily: FONTS.mono }}>
            Your take
          </h3>

          {!selectedPreference ? (
            <div className="space-y-2">
              {/* Segmented control */}
              <div className={`inline-flex border ${BORDERS.medium} ${RADIUS.control} p-0.5 w-full bg-white dark:bg-black`}>
                <button
                  onClick={() => handlePreferenceClick('BOOK')}
                  disabled={isSubmitting}
                  className={`flex-1 px-3 py-2 ${TEXT.secondary} font-bold ${TEXT.mutedMedium} hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black ${RADIUS.control} transition-all disabled:opacity-50 uppercase tracking-wider`}
                  style={{ fontFamily: FONTS.mono }}
                >
                  Book
                </button>
                <button
                  onClick={() => handlePreferenceClick('SCREEN')}
                  disabled={isSubmitting}
                  className={`flex-1 px-3 py-2 ${TEXT.secondary} font-bold ${TEXT.mutedMedium} hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black ${RADIUS.control} transition-all disabled:opacity-50 uppercase tracking-wider`}
                  style={{ fontFamily: FONTS.mono }}
                >
                  Screen
                </button>
                <button
                  onClick={() => handlePreferenceClick('TIE')}
                  disabled={isSubmitting}
                  className={`flex-1 px-3 py-2 ${TEXT.secondary} font-bold ${TEXT.mutedMedium} hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black ${RADIUS.control} transition-all disabled:opacity-50 uppercase tracking-wider`}
                  style={{ fontFamily: FONTS.mono }}
                >
                  Tie
                </button>
              </div>

              <p className={`${TEXT.secondary} ${TEXT.mutedLight} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Pick your side</p>
            </div>
          ) : (
            <div className="py-2">
              <p className={`${TEXT.body} ${TEXT.mutedMedium} mb-2`} style={{ fontFamily: FONTS.mono }}>
                ✓ {selectedPreference === 'BOOK' ? 'Book' : selectedPreference === 'SCREEN' ? 'Screen' : 'Tie'}
              </p>
              <button
                onClick={() => setSelectedPreference(null)}
                className={`${TEXT.secondary} ${TEXT.mutedMedium} hover:text-black hover:dark:text-white transition-colors font-bold uppercase tracking-wider`}
                style={{ fontFamily: FONTS.mono }}
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
