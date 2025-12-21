'use client';

import { useState, useEffect } from 'react';
import type { Work, ScreenWork, ComparisonVoteStats } from '@/lib/types';
import { api } from '@/lib/api';
import ComparisonVoting from './ComparisonVoting';

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

  if (isExpanded) {
    return (
      <div className="space-y-3">
        <div className="flex justify-end">
          <button
            onClick={() => setIsExpanded(false)}
            aria-expanded="true"
            className="text-sm text-link hover:text-link-hover transition-colors focus:outline-none focus:ring-2 focus:ring-link/50 rounded px-2 py-1"
          >
            Collapse
          </button>
        </div>
        <ComparisonVoting work={work} screenWork={screenWork} />
      </div>
    );
  }

  return (
    <div className="bg-muted/5 rounded-md px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 min-h-[44px]">
      <div className="flex items-center gap-2 sm:gap-3 text-sm text-muted flex-wrap">
        {totalVotes > 0 ? (
          <>
            <span className="font-medium text-foreground">Community:</span>
            <span className="whitespace-nowrap">📖 Book {bookPct}%</span>
            <span className="text-muted/50" aria-hidden="true">•</span>
            <span className="whitespace-nowrap">🎬 Screen {screenPct}%</span>
            <span className="text-muted/50" aria-hidden="true">•</span>
            <span className="whitespace-nowrap">🤝 Tie {tiePct}%</span>
            <span className="text-muted/50 hidden sm:inline" aria-hidden="true">•</span>
            <span className="text-xs hidden sm:inline whitespace-nowrap">
              (n={totalVotes})
            </span>
          </>
        ) : (
          <span>No votes yet</span>
        )}
      </div>
      <button
        onClick={() => setIsExpanded(true)}
        aria-expanded="false"
        aria-label={totalVotes > 0 ? 'Expand voting panel' : 'Open voting panel'}
        className="text-sm text-link hover:text-link-hover hover:underline transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-link/50 rounded px-2 py-1"
      >
        {totalVotes > 0 ? 'Expand to vote' : 'Vote now'}
      </button>
    </div>
  );
}
