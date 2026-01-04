'use client';

import { useState, useEffect } from 'react';
import type { Work, ScreenWork, ComparisonVoteStats } from '@/lib/types';
import { api } from '@/lib/api';
import { calculateVotePercentage } from '@/lib/vote-utils';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

interface CommunitySnapshotCardProps {
  work: Work;
  screenWork: ScreenWork;
}

export default function CommunitySnapshotCard({
  work,
  screenWork,
}: CommunitySnapshotCardProps): JSX.Element {
  const [stats, setStats] = useState<ComparisonVoteStats | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} p-6`}>
        <div className={`${TEXT.secondary} ${TEXT.mutedMedium} animate-pulse uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>Loading community data...</div>
      </div>
    );
  }

  const totalVotes = stats?.total_votes || 0;
  const bookPct = stats ? calculateVotePercentage(stats.preference_breakdown.BOOK, totalVotes) : 0;
  const screenPct = stats ? calculateVotePercentage(stats.preference_breakdown.SCREEN, totalVotes) : 0;

  return (
    <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} p-6`}>
      <h3 className={`${TEXT.body} font-bold text-black dark:text-white mb-4 uppercase tracking-widest`} style={{ fontFamily: FONTS.mono }}>
        Community Verdict
      </h3>

      {totalVotes === 0 ? (
        <div className="text-center py-4">
          <p className={`${TEXT.secondary} ${TEXT.mutedMedium} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>No votes yet</p>
          <p className={`${TEXT.label} ${TEXT.mutedLight} mt-1 uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>Be the first to weigh in</p>
        </div>
      ) : (
        <>
          {/* Preference breakdown */}
          <div className="mb-4">
            {/* Big percentages */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-black dark:text-white" style={{ fontFamily: FONTS.mono }}>{bookPct}%</div>
                <div className={`${TEXT.label} ${TEXT.mutedMedium} font-bold uppercase tracking-widest`} style={{ fontFamily: FONTS.mono }}>Team Book</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black dark:text-white" style={{ fontFamily: FONTS.mono }}>{screenPct}%</div>
                <div className={`${TEXT.label} ${TEXT.mutedMedium} font-bold uppercase tracking-widest`} style={{ fontFamily: FONTS.mono }}>Team Screen</div>
              </div>
            </div>

            {/* Thin elegant bar */}
            <div className={`relative h-2 border ${BORDERS.medium} overflow-hidden`}>
              {/* Book segment */}
              <div
                className="absolute left-0 top-0 h-full bg-black dark:bg-white transition-all duration-500"
                style={{ width: `${bookPct}%` }}
              />
              {/* Screen segment */}
              <div
                className="absolute right-0 top-0 h-full bg-black/40 dark:bg-white/40 transition-all duration-500"
                style={{ width: `${screenPct}%` }}
              />
            </div>

            {/* Vote count */}
            <div className={`text-center mt-3 ${TEXT.label} ${TEXT.mutedMedium} uppercase tracking-widest font-bold`} style={{ fontFamily: FONTS.mono }}>
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </div>
          </div>

          {/* Faithfulness (if available) */}
          {stats && stats.faithfulness.average !== null && (
            <div className={`flex items-center justify-between ${TEXT.secondary} border-t ${BORDERS.medium} pt-3`}>
              <span className={`${TEXT.mutedMedium} uppercase tracking-wide font-bold`} style={{ fontFamily: FONTS.mono }}>Faithfulness:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-black dark:text-white" style={{ fontFamily: FONTS.mono }}>
                  {stats.faithfulness.average.toFixed(1)}
                </span>
                <span className={`${TEXT.label} ${TEXT.mutedLight}`} style={{ fontFamily: FONTS.mono }}>/5</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
