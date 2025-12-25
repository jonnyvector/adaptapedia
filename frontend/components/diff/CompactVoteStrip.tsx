'use client';

import { useState, useEffect } from 'react';
import type { Work, ScreenWork, ComparisonVoteStats } from '@/lib/types';
import { api } from '@/lib/api';
import ComparisonVoting from './ComparisonVoting';
import { BookOpenIcon, FilmIcon } from '@/components/ui/Icons';

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

  const getPercentage = (count: number): number => {
    if (!stats || stats.total_votes === 0) return 0;
    return Math.round((count / stats.total_votes) * 100);
  };

  const bookPct = stats ? getPercentage(stats.preference_breakdown.BOOK) : 0;
  const screenPct = stats ? getPercentage(stats.preference_breakdown.SCREEN) : 0;
  const tiePct = stats ? getPercentage(stats.preference_breakdown.TIE) : 0;
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
            <ComparisonVoting work={work} screenWork={screenWork} />
          </div>
        </div>
      ) : (
        <div
          key="collapsed"
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Community Preference</span>
          {hasLowSampleSize && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              Early votes
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(true)}
          aria-expanded="false"
          aria-label={stats?.user_vote ? 'Edit your vote' : totalVotes > 0 ? 'Add your vote' : 'Cast first vote'}
          className="text-sm font-medium text-link hover:text-link-hover transition-all duration-200 ease-in-out whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-link/50 rounded px-3 py-1.5 border border-link/20 hover:border-link/40 hover:bg-link/5 hover:scale-105 active:scale-95"
        >
          {stats?.user_vote ? 'Edit your vote' : totalVotes > 0 ? 'Add your vote' : 'Vote now'}
        </button>
      </div>

      {totalVotes > 0 ? (
        <>
          {/* Horizontal Bar */}
          <div className="relative h-8 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
            {/* Book segment */}
            <div
              className="absolute left-0 top-0 h-full bg-orange-500 dark:bg-orange-600 transition-all duration-500"
              style={{ width: `${bookPct}%` }}
              aria-label={`Book preference: ${bookPct}%`}
            />
            {/* Screen segment */}
            <div
              className="absolute right-0 top-0 h-full transition-all duration-500"
              style={{ width: `${screenPct}%`, backgroundColor: '#a855f7' }}
              aria-label={`Screen preference: ${screenPct}%`}
            />
            {/* Tie segment (if any) - in the middle */}
            {tiePct > 0 && (
              <div
                className="absolute top-0 h-full bg-gray-400 dark:bg-gray-600 transition-all duration-500"
                style={{
                  left: `${bookPct}%`,
                  width: `${tiePct}%`
                }}
                aria-label={`Tie: ${tiePct}%`}
              />
            )}

            {/* Labels on bar */}
            <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-semibold">
              <span className={`flex items-center gap-1 ${bookPct > 15 ? 'text-white' : 'text-transparent'}`}>
                <BookOpenIcon className="w-3.5 h-3.5" />
                Book
              </span>
              <span className={`flex items-center gap-1 ${screenPct > 15 ? 'text-white' : 'text-transparent'}`}>
                Screen
                <FilmIcon className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-muted">
              <span className="flex items-center gap-1.5">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316', flexShrink: 0 }}></span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">Book {bookPct}%</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7', flexShrink: 0 }}></span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">Screen {screenPct}%</span>
              </span>
            </div>
            <span className="text-muted">
              <span className="font-medium">n={totalVotes}</span> {totalVotes === 1 ? 'vote' : 'votes'}
            </span>
          </div>
        </>
      ) : (
        <div className="text-center py-2">
          <p className="text-sm text-muted">No community votes yet. Be the first!</p>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
