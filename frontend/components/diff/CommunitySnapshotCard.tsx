'use client';

import { useState, useEffect } from 'react';
import type { Work, ScreenWork, ComparisonVoteStats } from '@/lib/types';
import { api } from '@/lib/api';
import { calculateVotePercentage } from '@/lib/vote-utils';

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
      <div className="bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-xl p-6">
        <div className="text-sm text-gray-500 animate-pulse">Loading community data...</div>
      </div>
    );
  }

  const totalVotes = stats?.total_votes || 0;
  const bookPct = stats ? calculateVotePercentage(stats.preference_breakdown.BOOK, totalVotes) : 0;
  const screenPct = stats ? calculateVotePercentage(stats.preference_breakdown.SCREEN, totalVotes) : 0;

  return (
    <div className="bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Community Verdict
      </h3>

      {totalVotes === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">No votes yet</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Be the first to weigh in</p>
        </div>
      ) : (
        <>
          {/* Preference breakdown */}
          <div className="mb-4">
            {/* Big percentages */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{bookPct}%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Team Book</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{screenPct}%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Team Screen</div>
              </div>
            </div>

            {/* Thin elegant bar */}
            <div className="relative h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              {/* Book segment */}
              <div
                className="absolute left-0 top-0 h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                style={{ width: `${bookPct}%` }}
              />
              {/* Screen segment */}
              <div
                className="absolute right-0 top-0 h-full bg-purple-600 dark:bg-purple-500 transition-all duration-500"
                style={{ width: `${screenPct}%` }}
              />
            </div>

            {/* Vote count */}
            <div className="text-center mt-3 text-xs text-gray-500 dark:text-gray-500">
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </div>
          </div>

          {/* Faithfulness (if available) */}
          {stats && stats.faithfulness.average !== null && (
            <div className="flex items-center justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-3">
              <span className="text-gray-600 dark:text-gray-400">Faithfulness:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {stats.faithfulness.average.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">/5</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
