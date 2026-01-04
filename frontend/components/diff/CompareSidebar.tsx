'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Work, ScreenWork, DiffItem, DiffCategory } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

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
      <div className={`bg-white dark:bg-black border ${BORDERS.medium} ${RADIUS.control} p-4`}>
        <div className="flex gap-3">
          {work.cover_url && (
            <img
              src={work.cover_url}
              alt={`${work.title} cover`}
              className={`w-16 h-24 object-cover ${RADIUS.control} border ${BORDERS.subtle}`}
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className={`${TEXT.body} font-bold text-black dark:text-white truncate`} style={{ fontFamily: FONTS.mono }}>
              {work.title}
            </h3>
            {work.year && (
              <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>({work.year})</p>
            )}
            <div className={`mt-2 ${TEXT.secondary} ${TEXT.mutedMedium} font-bold`} style={{ fontFamily: FONTS.mono }}>
              <span>vs</span>
            </div>
          </div>
        </div>

        <div className={`flex gap-3 mt-3 pt-3 border-t ${BORDERS.subtle}`}>
          {screenWork.poster_url && (
            <img
              src={screenWork.poster_url}
              alt={`${screenWork.title} poster`}
              className={`w-16 h-24 object-cover ${RADIUS.control} border ${BORDERS.subtle}`}
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className={`${TEXT.body} font-bold text-black dark:text-white truncate`} style={{ fontFamily: FONTS.mono }}>
              {screenWork.title}
            </h3>
            {screenWork.year && (
              <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>({screenWork.year})</p>
            )}
            <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mt-1`} style={{ fontFamily: FONTS.mono }}>
              {screenWork.type === 'MOVIE' ? 'Movie' : 'TV Series'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={`bg-white dark:bg-black border ${BORDERS.medium} ${RADIUS.control} p-4`}>
        <h3 className={`${TEXT.body} font-bold text-black dark:text-white mb-3 uppercase tracking-wider`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.1em' }}>
          [ STATS ]
        </h3>

        <div className="space-y-3">
          {/* Total differences */}
          <div className={`flex items-center justify-between ${TEXT.body}`}>
            <span className={TEXT.mutedMedium} style={{ fontFamily: FONTS.mono }}>Total Differences:</span>
            <span className="font-bold text-black dark:text-white" style={{ fontFamily: FONTS.mono }}>{diffs.length}</span>
          </div>

          {/* Category breakdown header */}
          {sortedCategories.length > 0 && (
            <>
              <div className={`border-t ${BORDERS.subtle} pt-3`}>
                <div className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-2 font-bold uppercase tracking-wider`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.1em' }}>Categories:</div>
                <div className="space-y-1.5">
                  {sortedCategories.map((stat) => (
                    <button
                      key={stat.category}
                      onClick={() =>
                        onCategoryFilter(
                          activeCategory === stat.category ? null : stat.category
                        )
                      }
                      className={`w-full flex items-center justify-between px-2 py-1.5 ${RADIUS.control} ${TEXT.secondary} transition-colors ${
                        activeCategory === stat.category
                          ? `bg-stone-200 dark:bg-stone-800 text-black dark:text-white border ${BORDERS.solid}`
                          : `hover:bg-stone-100 hover:dark:bg-stone-900 text-black dark:text-white border ${BORDERS.subtle}`
                      } ${
                        stat === mostCommonCategory
                          ? 'font-bold'
                          : 'font-normal'
                      }`}
                      style={{ fontFamily: FONTS.mono }}
                    >
                      <span className="flex items-center gap-1.5">
                        {stat === mostCommonCategory && (
                          <span className="text-amber-600 dark:text-amber-400" title="Most common">★</span>
                        )}
                        <span>{stat.label}</span>
                      </span>
                      <span className="font-bold">{stat.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filter button */}
              {activeCategory && (
                <button
                  onClick={() => onCategoryFilter(null)}
                  className={`w-full ${TEXT.secondary} text-black dark:text-white hover:opacity-70 underline font-bold`}
                  style={{ fontFamily: FONTS.mono }}
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
        <div className={`bg-white dark:bg-black border ${BORDERS.medium} ${RADIUS.control} p-4`}>
          <h3 className={`${TEXT.body} font-bold text-black dark:text-white mb-3 uppercase tracking-wider`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.1em' }}>
            [ TOP DIFFS ]
          </h3>
          <div className="space-y-2">
            {topDiffs.map((topDiff, index) => (
              <button
                key={topDiff.diff.id}
                onClick={() => onScrollToDiff(topDiff.diff.id)}
                className={`w-full text-left p-2 ${RADIUS.control} hover:bg-stone-100 hover:dark:bg-stone-900 transition-colors group`}
              >
                <div className="flex items-start gap-2">
                  <span className={`${TEXT.secondary} ${TEXT.mutedMedium} mt-0.5 shrink-0 font-bold`} style={{ fontFamily: FONTS.mono }}>
                    {index + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`${TEXT.secondary} text-black dark:text-white group-hover:opacity-70 line-clamp-2 leading-relaxed font-bold`} style={{ fontFamily: FONTS.mono }}>
                      {topDiff.diff.claim}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`${TEXT.secondary} px-1.5 py-0.5 ${RADIUS.control} font-bold uppercase`}
                        style={{ fontFamily: FONTS.mono, letterSpacing: '0.08em' }}
                      >
                        {topDiff.diff.spoiler_scope.toLowerCase()}
                      </span>
                      <span className={`${TEXT.secondary} ${TEXT.mutedMedium} font-bold`} style={{ fontFamily: FONTS.mono }}>
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
        <div className={`bg-white dark:bg-black border ${BORDERS.medium} ${RADIUS.control} p-4`}>
          <h3 className={`${TEXT.body} font-bold text-black dark:text-white mb-3 uppercase tracking-wider`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.1em' }}>
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
          className={`w-full px-4 py-3 bg-black dark:bg-white text-white dark:text-black ${RADIUS.control} hover:bg-white hover:dark:bg-black hover:text-black hover:dark:text-white border ${BORDERS.solid} transition-all font-bold shadow-lg hover:shadow-xl uppercase tracking-wider`}
          style={{ fontFamily: FONTS.mono, letterSpacing: '0.08em' }}
        >
          + Add Difference
        </button>
      </div>
    </aside>
  );
}
