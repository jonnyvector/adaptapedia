'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { NeedsHelpResponse, NeedsHelpComparison } from '@/lib/types';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

type TabType = 'no_comments' | 'disputed' | 'needs_diffs';

export default function NeedsHelpClient() {
  const router = useRouter();
  const [data, setData] = useState<NeedsHelpResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('no_comments');
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  const filterSkipped = (items: NeedsHelpComparison[]) =>
    items.filter(item => !skippedIds.has(`${item.work_id}-${item.screen_work_id}`));

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

  const handleReviewNext = () => {
    if (!data) return;

    // Get filtered queues
    const filteredNoComments = filterSkipped(data.no_comments);
    const filteredDisputed = filterSkipped(data.most_disputed);
    const filteredNeedsDiffs = filterSkipped(data.needs_differences);

    // Get first item from active queue
    let targetUrl: string | null = null;

    if (activeTab === 'no_comments' && filteredNoComments.length > 0) {
      const comparison = filteredNoComments[0];
      targetUrl = `/compare/${comparison.work_slug}/${comparison.screen_work_slug}`;
    } else if (activeTab === 'disputed' && filteredDisputed.length > 0) {
      const comparison = filteredDisputed[0];
      targetUrl = `/compare/${comparison.work_slug}/${comparison.screen_work_slug}`;
    } else if (activeTab === 'needs_diffs' && filteredNeedsDiffs.length > 0) {
      const comparison = filteredNeedsDiffs[0];
      targetUrl = `/compare/${comparison.work_slug}/${comparison.screen_work_slug}`;
    }

    if (targetUrl) {
      router.push(targetUrl);
    }
  };

  const handleSkip = (workId: number, screenWorkId: number) => {
    const key = `${workId}-${screenWorkId}`;
    setSkippedIds(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

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

  // Get current queue data and filter out skipped items
  const filteredNoComments = filterSkipped(data.no_comments);
  const filteredDisputed = filterSkipped(data.most_disputed);
  const filteredNeedsDiffs = filterSkipped(data.needs_differences);

  const currentQueue =
    activeTab === 'no_comments' ? filteredNoComments :
    activeTab === 'disputed' ? filteredDisputed :
    filteredNeedsDiffs;

  const queueCount = currentQueue.length;

  return (
    <div className="container py-8">
      {/* Mission Bar */}
      {hasAnyContent && (
        <div className="mb-6 bg-gradient-to-r from-link/5 to-purple/5 border border-link/20 rounded-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-foreground mb-1">
                Help Queue: {queueCount} {queueCount === 1 ? 'comparison needs' : 'comparisons need'} your input
              </h2>
              <p className="text-xs text-muted">
                Add comments and context to help the community vote accurately
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-link">{queueCount}</div>
              <div className="text-xs text-muted">{queueCount === 1 ? 'comparison' : 'comparisons'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Help Queue</h1>
            <p className="text-muted text-lg">
              These differences need discussion. Add context so others can vote smarter.
            </p>
          </div>

          {hasAnyContent && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReviewNext}
                className="btn-primary btn-lg inline-flex items-center gap-2"
              >
                <svg className="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Review Next
              </button>
              <Link
                href="/browse"
                className="btn-secondary btn-lg"
              >
                Browse All
              </Link>
            </div>
          )}
        </div>

        {/* Tabs */}
        {hasAnyContent && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('no_comments')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'no_comments'
                  ? 'border-link text-link'
                  : 'border-transparent text-muted hover:text-foreground hover:border-border'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Needs Discussion
                {filteredNoComments.length > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-link/10 text-link">
                    {filteredNoComments.length}
                  </span>
                )}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('disputed')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'disputed'
                  ? 'border-link text-link'
                  : 'border-transparent text-muted hover:text-foreground hover:border-border'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                Contested
                {filteredDisputed.length > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500/10 text-rose-500">
                    {filteredDisputed.length}
                  </span>
                )}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('needs_diffs')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'needs_diffs'
                  ? 'border-link text-link'
                  : 'border-transparent text-muted hover:text-foreground hover:border-border'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Needs Differences
                {filteredNeedsDiffs.length > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/10 text-amber-500">
                    {filteredNeedsDiffs.length}
                  </span>
                )}
              </span>
            </button>
          </div>
        )}
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
        <div>
          {/* Queue Content */}
          {activeTab === 'no_comments' && (
            filteredNoComments.length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm text-muted mb-4">
                  {filteredNoComments.length} {filteredNoComments.length === 1 ? 'comparison' : 'comparisons'} with diffs that need comments
                </div>
                {filteredNoComments.map((comparison) => (
                  <CompactComparisonCard
                    key={`${comparison.work_id}-${comparison.screen_work_id}`}
                    comparison={comparison}
                    needType="no_comments"
                    onSkip={handleSkip}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-surface border border-border rounded-lg">
                <p className="text-muted">All comparisons have been skipped or reviewed.</p>
              </div>
            )
          )}

          {activeTab === 'disputed' && (
            filteredDisputed.length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm text-muted mb-4">
                  {filteredDisputed.length} {filteredDisputed.length === 1 ? 'comparison with' : 'comparisons with'} contested differences
                </div>
                {filteredDisputed.map((comparison) => (
                  <CompactComparisonCard
                    key={`${comparison.work_id}-${comparison.screen_work_id}`}
                    comparison={comparison}
                    needType="disputed"
                    onSkip={handleSkip}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-surface border border-border rounded-lg">
                <p className="text-muted">All comparisons have been skipped or reviewed.</p>
              </div>
            )
          )}

          {activeTab === 'needs_diffs' && (
            filteredNeedsDiffs.length > 0 ? (
              <div>
                <div className="text-sm text-muted mb-4">
                  {filteredNeedsDiffs.length} {filteredNeedsDiffs.length === 1 ? 'comparison' : 'comparisons'} with fewer than 3 differences
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNeedsDiffs.map((comparison) => (
                    <ComparisonCard key={`${comparison.work_slug}-${comparison.screen_work_slug}`} comparison={comparison} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-surface border border-border rounded-lg">
                <p className="text-muted">All comparisons have been skipped or reviewed.</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// Compact Comparison Card Component - Shows grouped comparisons with diff counts
function CompactComparisonCard({
  comparison,
  needType,
  onSkip
}: {
  comparison: NeedsHelpComparison;
  needType: 'no_comments' | 'disputed';
  onSkip: (workId: number, screenWorkId: number) => void;
}) {
  const comparisonUrl = `/compare/${comparison.work_slug}/${comparison.screen_work_slug}`;

  // Calculate counts based on need type
  const diffCount = needType === 'no_comments'
    ? comparison.no_comment_diff_count || 0
    : comparison.disputed_diff_count || 0;

  // Determine reason chip
  const reasonChip = needType === 'no_comments'
    ? {
        label: `${diffCount} ${diffCount === 1 ? 'diff needs' : 'diffs need'} comments`,
        color: 'bg-link text-white',
        icon: '💬'
      }
    : {
        label: `${diffCount} ${diffCount === 1 ? 'diff is' : 'diffs are'} contested`,
        color: 'bg-rose-500 text-white',
        icon: '⚖️'
      };

  return (
    <div className="group relative border border-border rounded-lg hover:border-link/50 hover:shadow-sm transition-all duration-200 bg-surface overflow-hidden">
      {/* Left border indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        needType === 'no_comments' ? 'bg-link' : 'bg-rose-500'
      }`} />

      <div className="p-3 pl-4">
        {/* Hero: Reason Chip with count */}
        <div className="mb-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-md ${reasonChip.color} shadow-sm`}>
            <span>{reasonChip.icon}</span>
            {reasonChip.label}
          </span>
        </div>

        {/* Comparison Context - Real covers for instant recognition */}
        <Link
          href={comparisonUrl}
          className="flex items-center gap-2 mb-3 group/link"
        >
          {/* Book side */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {/* Book cover thumbnail */}
            <div className="w-9 h-12 rounded border border-border overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 flex-shrink-0 flex items-center justify-center shadow-sm group-hover/link:shadow transition-shadow">
              {comparison.cover_url ? (
                <img
                  src={comparison.cover_url}
                  alt={comparison.work_title || 'Book cover'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-orange-600 dark:text-orange-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-foreground group-hover/link:text-link transition-colors line-clamp-1">
                {comparison.work_title}
              </div>
              <div className="text-xs text-muted">Book{comparison.work_author && ` · ${comparison.work_author}`}</div>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-muted text-sm flex-shrink-0">→</div>

          {/* Screen side */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="flex-1 min-w-0 text-right">
              <div className="text-xs font-semibold text-foreground group-hover/link:text-link transition-colors line-clamp-1">
                {comparison.screen_work_title}
              </div>
              <div className="text-xs text-muted">
                {comparison.screen_work_type}{comparison.screen_work_year && ` · ${comparison.screen_work_year}`}
              </div>
            </div>
            {/* Screen poster thumbnail */}
            <div className="w-9 h-12 rounded border border-border overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 flex-shrink-0 flex items-center justify-center shadow-sm group-hover/link:shadow transition-shadow">
              {comparison.poster_url ? (
                <img
                  src={comparison.poster_url}
                  alt={comparison.screen_work_title || 'Poster'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-purple-600 dark:text-purple-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Stats row */}
        {comparison.total_votes !== undefined && comparison.total_votes > 0 && (
          <div className="mb-3 text-xs text-muted">
            {comparison.total_votes} total {comparison.total_votes === 1 ? 'vote' : 'votes'} across all diffs
          </div>
        )}

        {/* Primary CTA + Skip - tighter spacing */}
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <Link
              href={comparisonUrl}
              className="btn btn-primary flex-1 text-center justify-center"
              title="Review this comparison and add context to help others vote accurately"
            >
              <svg className="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Review comparison
            </Link>
            <button
              onClick={() => onSkip(comparison.work_id, comparison.screen_work_id)}
              className="px-3 py-2 text-xs font-medium text-muted hover:text-foreground transition-colors"
              title="Not familiar with this comparison"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Comparison Card Component for needs_differences tab
function ComparisonCard({ comparison }: { comparison: NeedsHelpComparison }) {
  return (
    <Link
      href={`/compare/${comparison.work_slug}/${comparison.screen_work_slug}`}
      className="block bg-surface border-2 border-border-strong rounded-lg overflow-hidden hover:border-link hover:shadow-lg transition-all shadow-md"
    >
      {/* Images at top */}
      <div className="flex h-48">
        <div className="w-1/2 relative bg-bg-subtle">
          {comparison.cover_url ? (
            <img
              src={comparison.cover_url}
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
          {comparison.poster_url ? (
            <img
              src={comparison.poster_url}
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
            {comparison.diff_count || 0} {comparison.diff_count === 1 ? 'diff' : 'diffs'}
          </span>
        </div>
      </div>
    </Link>
  );
}

