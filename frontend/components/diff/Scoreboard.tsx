'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { Work, ScreenWork, ComparisonVoteStats } from '@/lib/types';
import { api } from '@/lib/api';
import { calculateVotePercentage } from '@/lib/vote-utils';
import { BookOpenIcon, FilmIcon } from '@/components/ui/Icons';
import { FONTS, BORDERS, TEXT, RADIUS, COLORS } from '@/lib/brutalist-design';

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
      <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} ${RADIUS.control} p-4`}>
        <div className={`${TEXT.body} ${TEXT.mutedMedium} animate-pulse`} style={FONTS.mono ? { fontFamily: FONTS.mono } : undefined}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} ${RADIUS.control} p-4`}>
      {/* Two-column layout: Stats | Vote */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Community Stats */}
        <div>
          <h3 className={`${TEXT.body} font-bold ${TEXT.mutedMedium} uppercase tracking-widest mb-3`} style={{ fontFamily: FONTS.mono }}>
            Community
          </h3>

          {totalVotes === 0 ? (
            <div className="text-center py-3">
              <p className={`${TEXT.body} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>No votes yet</p>
              <p className={`${TEXT.secondary} ${TEXT.mutedLight} mt-1`} style={{ fontFamily: FONTS.mono }}>Be the first</p>
            </div>
          ) : (
            <>
              {/* Vote percentages */}
              <div className="flex items-center justify-between mb-2">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${TEXT.primary}`} style={{ fontFamily: FONTS.mono, color: COLORS.book }}>{bookPct}%</div>
                  <div className={`${TEXT.secondary} ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Book</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${TEXT.primary}`} style={{ fontFamily: FONTS.mono, color: COLORS.screen }}>{screenPct}%</div>
                  <div className={`${TEXT.secondary} ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Screen</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className={`relative h-2 bg-black/10 dark:bg-white/10 ${RADIUS.control} overflow-hidden mb-2`}>
                <div
                  className="absolute left-0 top-0 h-full transition-all duration-500"
                  style={{ width: `${bookPct}%`, backgroundColor: COLORS.book }}
                />
                <div
                  className="absolute right-0 top-0 h-full transition-all duration-500"
                  style={{ width: `${screenPct}%`, backgroundColor: COLORS.screen }}
                />
              </div>

              {/* Vote count */}
              <div className={`text-center ${TEXT.secondary} ${TEXT.mutedLight}`} style={{ fontFamily: FONTS.mono }}>
                {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
              </div>

              {/* Faithfulness */}
              {stats && stats.faithfulness.average !== null && (
                <div className={`flex items-center justify-between ${TEXT.body} border-t ${BORDERS.subtle} pt-3 mt-3`}>
                  <span className={TEXT.mutedMedium} style={{ fontFamily: FONTS.mono }}>Faithfulness:</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-bold ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>
                      {stats.faithfulness.average.toFixed(1)}
                    </span>
                    <span className={`${TEXT.secondary} ${TEXT.mutedLight}`} style={{ fontFamily: FONTS.mono }}>/5</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Your Vote */}
        <div>
          <h3 className={`${TEXT.body} font-bold ${TEXT.mutedMedium} uppercase tracking-widest mb-3`} style={{ fontFamily: FONTS.mono }}>
            Your Vote
          </h3>

          {!selectedPreference ? (
            <div className="space-y-2">
              {/* Book button */}
              <button
                onClick={() => handlePreferenceClick('BOOK')}
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 border font-bold ${RADIUS.control} transition-all disabled:opacity-50 ${TEXT.secondary}`}
                style={{
                  fontFamily: FONTS.mono,
                  borderColor: COLORS.book,
                  color: COLORS.book,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.book;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = COLORS.book;
                }}
              >
                <BookOpenIcon className="w-5 h-5" />
                <span className="uppercase tracking-wider">Book</span>
              </button>

              {/* Screen button */}
              <button
                onClick={() => handlePreferenceClick('SCREEN')}
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 border font-bold ${RADIUS.control} transition-all disabled:opacity-50 ${TEXT.secondary}`}
                style={{
                  fontFamily: FONTS.mono,
                  borderColor: COLORS.screen,
                  color: COLORS.screen,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.screen;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = COLORS.screen;
                }}
              >
                <FilmIcon className="w-5 h-5" />
                <span className="uppercase tracking-wider">Screen</span>
              </button>

              {/* Tie button */}
              <button
                onClick={() => handlePreferenceClick('TIE')}
                disabled={isSubmitting}
                className={`w-full py-2 ${TEXT.body} ${TEXT.mutedMedium} hover:text-black hover:dark:text-white transition-colors uppercase tracking-wider font-bold`}
                style={{ fontFamily: FONTS.mono }}
              >
                Both equal
              </button>
            </div>
          ) : (
            <div className="text-center py-3">
              <p className={`${TEXT.body} ${TEXT.mutedMedium} mb-2`} style={{ fontFamily: FONTS.mono }}>
                ✓ Voted:{' '}
                <span className={`font-bold ${TEXT.primary}`}>
                  {selectedPreference === 'BOOK' ? 'Book' : selectedPreference === 'SCREEN' ? 'Screen' : 'Tie'}
                </span>
              </p>
              <button
                onClick={() => setSelectedPreference(null)}
                className={`${TEXT.body} ${TEXT.primary} hover:underline font-bold uppercase tracking-wider`}
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
