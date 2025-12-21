'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Work, ScreenWork, DiffItem, DiffCategory } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

interface CompareSidebarProps {
  work: Work;
  screenWork: ScreenWork;
  diffs: DiffItem[];
  onCategoryFilter: (category: DiffCategory | null) => void;
  onScrollToDiff: (diffId: number) => void;
  activeCategory: DiffCategory | null;
}

interface CategoryStats {
  category: DiffCategory;
  count: number;
  label: string;
}

interface TopDiff {
  diff: DiffItem;
  totalVotes: number;
  netScore: number;
  disputeRatio: number;
}

export default function CompareSidebar({
  work,
  screenWork,
  diffs,
  onCategoryFilter,
  onScrollToDiff,
  activeCategory,
}: CompareSidebarProps): JSX.Element {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isSticky, setIsSticky] = useState(false);

  // Calculate category breakdown
  const categoryStats: CategoryStats[] = [
    { category: 'PLOT', count: 0, label: 'Plot' },
    { category: 'CHARACTER', count: 0, label: 'Character' },
    { category: 'ENDING', count: 0, label: 'Ending' },
    { category: 'SETTING', count: 0, label: 'Setting' },
    { category: 'THEME', count: 0, label: 'Theme' },
    { category: 'TONE', count: 0, label: 'Tone' },
    { category: 'TIMELINE', count: 0, label: 'Timeline' },
    { category: 'WORLDBUILDING', count: 0, label: 'Worldbuilding' },
    { category: 'OTHER', count: 0, label: 'Other' },
  ];

  diffs.forEach((diff) => {
    const stat = categoryStats.find((s) => s.category === diff.category);
    if (stat) stat.count++;
  });

  const sortedCategories = categoryStats
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);

  const mostCommonCategory = sortedCategories[0];

  // Calculate top 3 most voted diffs
  const topDiffs: TopDiff[] = diffs
    .map((diff) => {
      const totalVotes =
        diff.vote_counts.accurate +
        diff.vote_counts.needs_nuance +
        diff.vote_counts.disagree;
      const netScore =
        diff.vote_counts.accurate -
        diff.vote_counts.disagree +
        diff.vote_counts.needs_nuance * 0.5;
      const disputeRatio =
        totalVotes > 0 ? diff.vote_counts.disagree / totalVotes : 0;

      return {
        diff,
        totalVotes,
        netScore,
        disputeRatio,
      };
    })
    .filter((td) => td.totalVotes > 0)
    .sort((a, b) => b.netScore - a.netScore)
    .slice(0, 3);

  // Calculate most disputed (highest disagree ratio with minimum votes)
  const mostDisputed: TopDiff[] = diffs
    .map((diff) => {
      const totalVotes =
        diff.vote_counts.accurate +
        diff.vote_counts.needs_nuance +
        diff.vote_counts.disagree;
      const netScore =
        diff.vote_counts.accurate -
        diff.vote_counts.disagree +
        diff.vote_counts.needs_nuance * 0.5;
      const disputeRatio =
        totalVotes > 0 ? diff.vote_counts.disagree / totalVotes : 0;

      return {
        diff,
        totalVotes,
        netScore,
        disputeRatio,
      };
    })
    .filter((td) => td.totalVotes >= 3) // Minimum 3 votes to be considered
    .sort((a, b) => b.disputeRatio - a.disputeRatio)
    .slice(0, 2);

  // Track scroll position for sticky state
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddDiff = (): void => {
    if (!isAuthenticated) {
      router.push(`/auth/login?returnUrl=/compare/${work.slug}/${screenWork.slug}/add`);
      return;
    }
    router.push(`/compare/${work.slug}/${screenWork.slug}/add`);
  };

  const getSpoilerBadgeColor = (scope: string): string => {
    switch (scope) {
      case 'NONE':
        return 'bg-success/10 text-success';
      case 'BOOK_ONLY':
        return 'bg-cyan/10 text-cyan';
      case 'SCREEN_ONLY':
        return 'bg-purple/10 text-purple';
      case 'FULL':
        return 'bg-magenta/10 text-magenta';
      default:
        return 'bg-surface2 text-muted';
    }
  };

  return (
    <aside
      className={`space-y-4 transition-all duration-200 ${
        isSticky ? 'opacity-95' : 'opacity-100'
      }`}
    >
      {/* Book Info Card */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex gap-3">
          {work.cover_url && (
            <img
              src={work.cover_url}
              alt={`${work.title} cover`}
              className="w-16 h-24 object-cover rounded border border-border"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {work.title}
            </h3>
            {work.year && (
              <p className="text-xs text-muted">({work.year})</p>
            )}
            <div className="mt-2 text-xs text-muted">
              <span className="font-mono">vs</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-3 pt-3 border-t border-border">
          {screenWork.poster_url && (
            <img
              src={screenWork.poster_url}
              alt={`${screenWork.title} poster`}
              className="w-16 h-24 object-cover rounded border border-border"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {screenWork.title}
            </h3>
            {screenWork.year && (
              <p className="text-xs text-muted">({screenWork.year})</p>
            )}
            <p className="text-xs text-muted mt-1">
              {screenWork.type === 'MOVIE' ? 'Movie' : 'TV Series'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 font-mono">
          [ STATS ]
        </h3>

        <div className="space-y-3">
          {/* Total differences */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Total Differences:</span>
            <span className="font-bold text-foreground font-mono">{diffs.length}</span>
          </div>

          {/* Category breakdown header */}
          {sortedCategories.length > 0 && (
            <>
              <div className="border-t border-border pt-3">
                <div className="text-xs text-muted mb-2 font-mono">Categories:</div>
                <div className="space-y-1.5">
                  {sortedCategories.map((stat) => (
                    <button
                      key={stat.category}
                      onClick={() =>
                        onCategoryFilter(
                          activeCategory === stat.category ? null : stat.category
                        )
                      }
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                        activeCategory === stat.category
                          ? 'bg-link/10 text-link border border-link/30'
                          : 'hover:bg-surface2 text-foreground'
                      } ${
                        stat === mostCommonCategory
                          ? 'font-semibold'
                          : 'font-normal'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {stat === mostCommonCategory && (
                          <span className="text-magenta" title="Most common">★</span>
                        )}
                        <span>{stat.label}</span>
                      </span>
                      <span className="font-mono font-bold">{stat.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filter button */}
              {activeCategory && (
                <button
                  onClick={() => onCategoryFilter(null)}
                  className="w-full text-xs text-link hover:text-link-hover underline"
                >
                  Clear filter
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Top Diffs */}
      {topDiffs.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 font-mono">
            [ TOP DIFFS ]
          </h3>
          <div className="space-y-2">
            {topDiffs.map((topDiff, index) => (
              <button
                key={topDiff.diff.id}
                onClick={() => onScrollToDiff(topDiff.diff.id)}
                className="w-full text-left p-2 rounded hover:bg-surface2 transition-colors group"
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-mono text-muted mt-0.5 shrink-0">
                    {index + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground group-hover:text-link line-clamp-2 leading-relaxed">
                      {topDiff.diff.claim}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-mono ${getSpoilerBadgeColor(
                          topDiff.diff.spoiler_scope
                        )}`}
                      >
                        {topDiff.diff.spoiler_scope.toLowerCase()}
                      </span>
                      <span className="text-xs text-muted font-mono">
                        {topDiff.totalVotes}↑
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Most Disputed */}
      {mostDisputed.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 font-mono">
            [ MOST DISPUTED ]
          </h3>
          <div className="space-y-2">
            {mostDisputed.map((disputedDiff) => (
              <button
                key={disputedDiff.diff.id}
                onClick={() => onScrollToDiff(disputedDiff.diff.id)}
                className="w-full text-left p-2 rounded hover:bg-surface2 transition-colors group"
              >
                <div className="flex items-start gap-2">
                  <span className="text-danger text-xs mt-0.5 shrink-0">⚠</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground group-hover:text-link line-clamp-2 leading-relaxed">
                      {disputedDiff.diff.claim}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-mono ${getSpoilerBadgeColor(
                          disputedDiff.diff.spoiler_scope
                        )}`}
                      >
                        {disputedDiff.diff.spoiler_scope.toLowerCase()}
                      </span>
                      <span className="text-xs text-danger font-mono">
                        {Math.round(disputedDiff.disputeRatio * 100)}% disagree
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sticky CTA */}
      <div className="sticky bottom-4">
        <button
          onClick={handleAddDiff}
          className="w-full px-4 py-3 bg-link text-white rounded-md hover:bg-link/90 transition-colors font-semibold shadow-lg hover:shadow-xl"
        >
          + Add Difference
        </button>
      </div>
    </aside>
  );
}
