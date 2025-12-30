'use client';

import { useState, useEffect } from 'react';
import type { Work, ScreenWork, ComparisonVoteStats } from '@/lib/types';
import { api } from '@/lib/api';
import ComparisonVoting from './ComparisonVoting';
import { BookOpenIcon, FilmIcon, InformationCircleIcon } from '@/components/ui/Icons';
import { calculateVotePercentage } from '@/lib/vote-utils';

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
      <div className="bg-muted/5 rounded-md px-4 py-2.5 h-[44px] flex items-center">
        <span className="text-sm text-muted animate-pulse">Loading voting data...</span>
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
              className="text-sm text-link hover:text-link-hover transition-colors focus:outline-none focus:ring-2 focus:ring-link/50 rounded px-2 py-1"
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
              <span className="text-xs font-semibold text-muted uppercase tracking-wide">Which version did people prefer?</span>
              {hasLowSampleSize && (
                <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  Early votes
                </span>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              aria-expanded="false"
              aria-label={stats?.user_vote ? 'Edit your vote' : 'Vote now'}
              className="text-sm font-medium text-link hover:text-link-hover transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-link/50 rounded px-3 py-1.5 border border-link/20 hover:border-link/40 hover:bg-link/5"
            >
              {stats?.user_vote ? 'Edit your vote' : 'Vote now'}
            </button>
          </div>

          {/* Blue-tinted Meter Bar */}
          <div className="relative h-12 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden mb-2.5 shadow-inner">
            {/* Book segment - darker blue */}
            <div
              className="absolute left-0 top-0 h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
              style={{ width: `${bookPct}%` }}
              aria-label={`Book preference: ${bookPct}%`}
            />
            {/* Screen segment - lighter blue */}
            <div
              className="absolute right-0 top-0 h-full bg-blue-400 dark:bg-blue-300 transition-all duration-500"
              style={{ width: `${screenPct}%` }}
              aria-label={`Screen preference: ${screenPct}%`}
            />
            {/* Tie segment (if any) - neutral blue */}
            {tiePct > 0 && (
              <div
                className="absolute top-0 h-full bg-blue-300 dark:bg-blue-400 transition-all duration-500"
                style={{
                  left: `${bookPct}%`,
                  width: `${tiePct}%`
                }}
                aria-label={`Tie: ${tiePct}%`}
              />
            )}

            {/* Percentages inside segments */}
            <div className="absolute inset-0 flex items-center justify-between px-4 text-sm font-bold">
              <div className={`flex items-center gap-2 transition-opacity ${bookPct > 12 ? 'opacity-100 text-white' : 'opacity-40 text-gray-400'}`}>
                <BookOpenIcon className="w-4 h-4" />
                <span>Book {bookPct}%</span>
              </div>
              <div className={`flex items-center gap-2 transition-opacity ${screenPct > 12 ? 'opacity-100 text-white' : 'opacity-40 text-gray-400'}`}>
                <span>Screen {screenPct}%</span>
                <FilmIcon className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Stats Row - Compact */}
          <div className="flex items-center justify-between text-xs text-muted">
            <div className="flex items-center gap-3">
              {stats && stats.faithfulness.average !== null && (
                <div className="flex items-center gap-1.5 group relative">
                  <span>Faithfulness:</span>
                  <span className="text-lg font-black text-link">{stats.faithfulness.average.toFixed(1)}</span>
                  <span>/5</span>
                  <button
                    className="ml-0.5 text-muted hover:text-foreground transition-colors focus:outline-none"
                    aria-label="Faithfulness explanation"
                  >
                    <InformationCircleIcon className="w-3.5 h-3.5" />
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block group-focus-within:block z-50">
                    <div className="bg-surface2 text-foreground text-xs rounded-lg px-3 py-2 shadow-lg border border-border whitespace-nowrap">
                      How closely the movie follows the book (community rating)
                      <div className="absolute top-full left-4 w-2 h-2 bg-surface2 border-r border-b border-border transform rotate-45 -mt-1"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <span>
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </span>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Which did you prefer?</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Vote on the adaptation + rate faithfulness</p>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-border rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-surface2"
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
