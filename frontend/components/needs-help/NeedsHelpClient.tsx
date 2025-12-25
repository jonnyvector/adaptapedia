'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { NeedsHelpResponse, BrowseComparison, DiffItem } from '@/lib/types';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function NeedsHelpClient() {
  const [data, setData] = useState<NeedsHelpResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.diffs.getNeedsHelp(20);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load needs help data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center py-12 bg-surface border border-border rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const hasAnyContent =
    data.needs_differences.length > 0 ||
    data.most_disputed.length > 0 ||
    data.no_comments.length > 0;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Help Improve Adaptapedia</h1>
        <p className="text-muted text-lg">
          These comparisons and differences need your expertise. Contribute to make our community knowledge more complete!
        </p>
      </div>

      {!hasAnyContent ? (
        <div className="text-center py-12 bg-surface border border-border rounded-lg">
          <div className="text-4xl mb-4">✨</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Everything's looking great!
          </h2>
          <p className="text-muted">
            No comparisons currently need help. Check back later or explore other content.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Comparisons Needing Differences */}
          {data.needs_differences.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Comparisons Need More Differences
                  </h2>
                  <p className="text-sm text-muted">
                    These comparisons have fewer than 3 differences. Add your knowledge!
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.needs_differences.map((comparison) => (
                  <ComparisonCard key={`${comparison.work_slug}-${comparison.screen_work_slug}`} comparison={comparison} />
                ))}
              </div>
            </section>
          )}

          {/* Most Disputed Diffs */}
          {data.most_disputed.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Most Disputed Differences
                  </h2>
                  <p className="text-sm text-muted">
                    These differences have divided votes. Help clarify or add nuance!
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {data.most_disputed.map((diff) => (
                  <DiffCard key={diff.id} diff={diff} />
                ))}
              </div>
            </section>
          )}

          {/* Diffs With No Comments */}
          {data.no_comments.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Differences Need Discussion
                  </h2>
                  <p className="text-sm text-muted">
                    These differences have votes but no comments. Share your perspective!
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {data.no_comments.map((diff) => (
                  <DiffCard key={diff.id} diff={diff} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// Comparison Card Component
function ComparisonCard({ comparison }: { comparison: BrowseComparison }) {
  return (
    <Link
      href={`/compare/${comparison.work_slug}/${comparison.screen_work_slug}`}
      className="block bg-surface border-2 border-border-strong rounded-lg overflow-hidden hover:border-link hover:shadow-lg transition-all shadow-md"
    >
      {/* Images at top */}
      <div className="flex h-48">
        <div className="w-1/2 relative bg-bg-subtle">
          {comparison.work_cover_url ? (
            <img
              src={comparison.work_cover_url}
              alt={comparison.work_title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <span className="text-4xl">📖</span>
            </div>
          )}
          <div className="absolute top-2 left-2 bg-surface px-2 py-1 rounded text-xs font-semibold">
            BOOK
          </div>
        </div>
        <div className="w-1/2 relative bg-bg-subtle">
          {comparison.screen_poster_url ? (
            <img
              src={comparison.screen_poster_url}
              alt={comparison.screen_work_title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <span className="text-4xl">🎬</span>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-surface px-2 py-1 rounded text-xs font-semibold">
            SCREEN
          </div>
        </div>
      </div>

      {/* Content below */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
          {comparison.work_title}
        </h3>
        <p className="text-sm text-muted mb-2">vs</p>
        <p className="text-sm text-foreground mb-3 line-clamp-2">
          {comparison.screen_work_title}
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-surface2 text-muted rounded">
            {comparison.diff_count} {comparison.diff_count === 1 ? 'diff' : 'diffs'}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Diff Card Component
function DiffCard({ diff }: { diff: DiffItem }) {
  const totalVotes = diff.vote_counts.accurate + diff.vote_counts.needs_nuance + diff.vote_counts.disagree;
  const accuratePercentage = totalVotes > 0
    ? Math.round((diff.vote_counts.accurate / totalVotes) * 100)
    : 0;

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      PLOT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      CHARACTER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      ENDING: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      SETTING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      THEME: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      TONE: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      TIMELINE: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      WORLDBUILDING: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colors[category] || colors.OTHER;
  };

  return (
    <Link
      href={`/compare/${diff.work_slug}/${diff.screen_work_slug}`}
      className="block bg-surface border-2 border-border-strong rounded-lg p-4 hover:border-link hover:shadow-lg transition-all shadow-md"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(diff.category)}`}>
            {diff.category}
          </span>
          {diff.spoiler_scope !== 'NONE' && (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Spoilers
            </span>
          )}
        </div>
        <div className="text-xs text-muted whitespace-nowrap ml-4">
          {accuratePercentage}% accurate
        </div>
      </div>

      <h3 className="font-semibold text-foreground mb-2">{diff.claim}</h3>

      {diff.detail && (
        <p className="text-sm text-muted mb-3 line-clamp-2">{diff.detail}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-muted">
        <span className="flex items-center gap-1">
          <span className="text-green-600 dark:text-green-400">✓ {diff.vote_counts.accurate}</span>
          <span className="text-yellow-600 dark:text-yellow-400">~ {diff.vote_counts.needs_nuance}</span>
          <span className="text-red-600 dark:text-red-400">✕ {diff.vote_counts.disagree}</span>
        </span>
        <span className="text-muted">
          {diff.work_title} vs {diff.screen_work_title}
        </span>
      </div>
    </Link>
  );
}
