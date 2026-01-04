'use client';

import { useState, useEffect } from 'react';
import type { Work, ScreenWork, ComparisonVoteStats } from '@/lib/types';
import { api } from '@/lib/api';
import ComparisonVoting from './ComparisonVoting';
import { BookOpenIcon, FilmIcon, InformationCircleIcon } from '@/components/ui/Icons';
import { calculateVotePercentage } from '@/lib/vote-utils';
import { FONTS, BORDERS, TEXT, RADIUS, COLORS } from '@/lib/brutalist-design';

interface CompactVoteStripProps {
  work: Work;
  screenWork: ScreenWork;
}

export default function CompactVoteStrip({
  work,
  screenWork
}: CompactVoteStripProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState<ComparisonVoteStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-expand if there's a pending comparison vote
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pendingVoteKey = `pendingComparisonVote_${work.id}_${screenWork.id}`;
      if (sessionStorage.getItem(pendingVoteKey)) {
        setIsExpanded(true);
      }
    }
  }, [work.id, screenWork.id]);

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

  useEffect(() => {
    fetchStats();
  }, [work.id, screenWork.id]);

  const handleVoteSubmitted = () => {
    fetchStats();
  };

  const bookPct = stats ? calculateVotePercentage(stats.preference_breakdown.BOOK, stats.total_votes) : 0;
  const screenPct = stats ? calculateVotePercentage(stats.preference_breakdown.SCREEN, stats.total_votes) : 0;
  const tiePct = stats ? calculateVotePercentage(stats.preference_breakdown.TIE, stats.total_votes) : 0;
  const totalVotes = stats?.total_votes || 0;

  if (loading) {
    return (
      <div className={`bg-stone-50 dark:bg-stone-950 ${RADIUS.control} px-4 py-2.5 h-[44px] flex items-center`}>
        <span className={`${TEXT.body} ${TEXT.mutedMedium} animate-pulse`} style={{ fontFamily: FONTS.mono }}>Loading voting data...</span>
      </div>
    );
  }

  const hasLowSampleSize = totalVotes > 0 && totalVotes < 10;

  return (
    <div className="px-4 py-3 transition-all duration-300 ease-in-out overflow-hidden">
      {isExpanded ? (
        <div
          key="expanded"
          className="space-y-3"
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div className="flex justify-end">
            <button
              onClick={() => setIsExpanded(false)}
              aria-expanded="true"
              className={`${TEXT.body} ${TEXT.primary} hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-black/50 focus:dark:ring-white/50 ${RADIUS.control} px-2 py-1 font-bold uppercase tracking-wider`}
              style={{ fontFamily: FONTS.mono }}
            >
              Collapse
            </button>
          </div>
          <div style={{ animation: 'fadeIn 0.4s ease-out 0.1s backwards' }}>
            <ComparisonVoting work={work} screenWork={screenWork} onVoteSubmitted={handleVoteSubmitted} />
          </div>
        </div>
      ) : (
        <div
          key="collapsed"
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
      {totalVotes > 0 ? (
        <>
          {/* Header Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className={`${TEXT.label} font-bold ${TEXT.mutedMedium} uppercase tracking-widest`} style={{ fontFamily: FONTS.mono }}>Which version did people prefer?</span>
              {hasLowSampleSize && (
                <span className={`inline-flex items-center ${TEXT.label} px-2 py-0.5 ${RADIUS.control} bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 border ${BORDERS.medium} font-bold uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
                  Early votes
                </span>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              aria-expanded="false"
              aria-label={stats?.user_vote ? 'Edit your vote' : 'Vote now'}
              className={`${TEXT.body} font-bold ${TEXT.primary} hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-black/50 focus:dark:ring-white/50 ${RADIUS.control} px-3 py-1.5 border ${BORDERS.solid} uppercase tracking-wider`}
              style={{ fontFamily: FONTS.mono }}
            >
              {stats?.user_vote ? 'Edit your vote' : 'Vote now'}
            </button>
          </div>

          {/* Meter Bar */}
          <div className={`relative h-12 bg-stone-100 dark:bg-stone-900 border ${BORDERS.medium} ${RADIUS.control} overflow-hidden mb-2.5`}>
            {/* Book segment */}
            <div
              className="absolute left-0 top-0 h-full transition-all duration-500"
              style={{ width: `${bookPct}%`, backgroundColor: COLORS.book }}
              aria-label={`Book preference: ${bookPct}%`}
            />
            {/* Screen segment */}
            <div
              className="absolute right-0 top-0 h-full transition-all duration-500"
              style={{ width: `${screenPct}%`, backgroundColor: COLORS.screen }}
              aria-label={`Screen preference: ${screenPct}%`}
            />
            {/* Tie segment (if any) */}
            {tiePct > 0 && (
              <div
                className={`absolute top-0 h-full bg-black/20 dark:bg-white/20 transition-all duration-500`}
                style={{
                  left: `${bookPct}%`,
                  width: `${tiePct}%`
                }}
                aria-label={`Tie: ${tiePct}%`}
              />
            )}

            {/* Percentages inside segments */}
            <div className={`absolute inset-0 flex items-center justify-between px-4 ${TEXT.body} font-bold uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
              <div className={`flex items-center gap-2 transition-opacity ${bookPct > 12 ? 'opacity-100 text-white' : 'opacity-40 text-black/40 dark:text-white/40'}`}>
                <BookOpenIcon className="w-4 h-4" />
                <span>Book {bookPct}%</span>
              </div>
              <div className={`flex items-center gap-2 transition-opacity ${screenPct > 12 ? 'opacity-100 text-white' : 'opacity-40 text-black/40 dark:text-white/40'}`}>
                <span>Screen {screenPct}%</span>
                <FilmIcon className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Stats Row - Compact */}
          <div className={`flex items-center justify-between ${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
            <div className="flex items-center gap-3">
              {stats && stats.faithfulness.average !== null && (
                <div className="flex items-center gap-1.5 group relative">
                  <span className="uppercase tracking-wider">Faithfulness:</span>
                  <span className={`text-lg font-black ${TEXT.primary}`}>{stats.faithfulness.average.toFixed(1)}</span>
                  <span>/5</span>
                  <button
                    className={`ml-0.5 ${TEXT.mutedMedium} hover:text-black hover:dark:text-white transition-colors focus:outline-none`}
                    aria-label="Faithfulness explanation"
                  >
                    <InformationCircleIcon className="w-3.5 h-3.5" />
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block group-focus-within:block z-50">
                    <div className={`bg-white dark:bg-black ${TEXT.secondary} ${RADIUS.control} px-3 py-2 shadow-lg border ${BORDERS.medium} whitespace-nowrap`} style={{ fontFamily: FONTS.mono }}>
                      How closely the movie follows the book (community rating)
                      <div className={`absolute top-full left-4 w-2 h-2 bg-white dark:bg-black border-r border-b ${BORDERS.medium} transform rotate-45 -mt-1`}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <span className="uppercase tracking-wider">
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </span>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <p className={`${TEXT.body} font-bold ${TEXT.primary} mb-1`} style={{ fontFamily: FONTS.mono }}>Which did you prefer?</p>
          <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-3`} style={{ fontFamily: FONTS.mono }}>Vote on the adaptation + rate faithfulness</p>
          <button
            onClick={() => setIsExpanded(true)}
            className={`${TEXT.body} font-bold ${TEXT.primary} hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black transition-all border ${BORDERS.solid} ${RADIUS.control} px-4 py-2 uppercase tracking-wider`}
            style={{ fontFamily: FONTS.mono }}
          >
            Vote: Book vs Screen
          </button>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
