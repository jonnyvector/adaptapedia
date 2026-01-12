'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Work, ScreenWork, DiffItem, SpoilerScope, DiffCategory } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import DiffItemCard from './DiffItemCard';
import MaskedDiffCard from './MaskedDiffCard';
import SpoilerControl, { type SpoilerPreference } from './SpoilerControl';
import DiffFilters from './DiffFilters';
import GetItNowModule from './GetItNowModule';
import DiffSort, { type SortOption } from './DiffSort';
import DiffSearch from './DiffSearch';
import { LockClosedIcon } from '@/components/ui/Icons';
import AdaptationSwitcher from './AdaptationSwitcher';
import MatchupScoreboard from './MatchupScoreboard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import DiffStarterKit from './DiffStarterKit';
import { DIFF_CATEGORIES, CATEGORY_LABELS } from '@/lib/constants';
import {
  loadSpoilerPreference,
  getMaxScopeForAPI,
  filterDiffsByPreference,
  getAllowedScopes,
} from '@/lib/spoiler-utils';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';
import { analytics } from '@/lib/analytics';

interface ComparisonViewProps {
  work: Work;
  screenWork: ScreenWork;
  initialDiffs: DiffItem[];
}

export default function ComparisonView({
  work,
  screenWork,
  initialDiffs,
}: ComparisonViewProps): JSX.Element {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Initialize spoiler preference - start with SAFE to avoid hydration mismatch
  const [spoilerPreference, setSpoilerPreference] = useState<SpoilerPreference>('SAFE');
  const scrollToDiffIdRef = useRef<number | null>(null);

  // Load preference from localStorage after mount
  useEffect(() => {
    setSpoilerPreference(loadSpoilerPreference());
  }, []);

  // Track comparison view on mount
  useEffect(() => {
    analytics.trackComparisonView({
      workId: work.id.toString(),
      workTitle: work.title,
      screenWorkId: screenWork.id.toString(),
      screenWorkTitle: screenWork.title,
      diffCount: initialDiffs.length,
      spoilerPreference,
    });
  }, [work.id, work.title, screenWork.id, screenWork.title, initialDiffs.length, spoilerPreference]);

  // Use initialDiffs directly - no need to fetch client-side
  // All diffs are provided server-side with FULL scope, we filter client-side
  const diffs = initialDiffs;

  // Track which diffs have expanded comments (persists across spoiler changes)
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  // Track which masked diffs have been individually revealed
  const [revealedDiffs, setRevealedDiffs] = useState<Set<number>>(new Set());

  // Track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['PLOT', 'CHARACTER', 'ENDING', 'SETTING', 'THEME', 'TONE', 'TIMELINE', 'WORLDBUILDING', 'OTHER']));

  // Filter and sort state
  const [selectedCategories, setSelectedCategories] = useState<Set<DiffCategory>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>('top');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddDiff = (): void => {
    if (!isAuthenticated) {
      router.push(`/auth/login?returnUrl=/compare/${work.slug}/${screenWork.slug}/add`);
      return;
    }
    router.push(`/compare/${work.slug}/${screenWork.slug}/add`);
  };

  // Filter diffs based on spoiler preference
  const { visible: visibleDiffs, masked: maskedDiffs } = useMemo(() => {
    return filterDiffsByPreference(diffs, spoilerPreference);
  }, [diffs, spoilerPreference]);

  // Calculate actual hidden count (excluding revealed diffs)
  const hiddenCount = useMemo(() => {
    return maskedDiffs.filter(diff => !revealedDiffs.has(diff.id)).length;
  }, [maskedDiffs, revealedDiffs]);

  // Get the current spoiler scope for the API (for the DiffItemCard)
  const currentSpoilerScope = useMemo(() => {
    return getMaxScopeForAPI(spoilerPreference);
  }, [spoilerPreference]);

  // Scroll to a specific diff after spoiler preference change
  useEffect(() => {
    if (scrollToDiffIdRef.current !== null) {
      const diffId = scrollToDiffIdRef.current;
      const element = document.getElementById(`diff-${diffId}`);
      if (element) {
        // Small delay to ensure render is complete
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          scrollToDiffIdRef.current = null;
        }, 100);
      }
    }
  }, [spoilerPreference, visibleDiffs.length]);

  // Filter, sort visible diffs by category, search, and sort option
  const { filteredDiffs, visibleDiffsByCategory, categoryCounts } = useMemo(() => {
    // Step 1: Filter by category
    let filtered = visibleDiffs;
    if (selectedCategories.size > 0) {
      filtered = filtered.filter((diff) => selectedCategories.has(diff.category));
    }

    // Step 2: Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (diff) =>
          diff.claim.toLowerCase().includes(query) ||
          diff.detail?.toLowerCase().includes(query)
      );
    }

    // Step 3: Sort diffs
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'top': {
          // Sort by total net positive votes (accurate - disagree)
          const aScore = a.vote_counts.accurate - a.vote_counts.disagree;
          const bScore = b.vote_counts.accurate - b.vote_counts.disagree;
          return bScore - aScore;
        }
        case 'newest': {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        case 'disputed': {
          // Sort by ratio of disagree votes to total votes
          const aTotal = a.vote_counts.accurate + a.vote_counts.needs_nuance + a.vote_counts.disagree;
          const bTotal = b.vote_counts.accurate + b.vote_counts.needs_nuance + b.vote_counts.disagree;
          const aRatio = aTotal > 0 ? a.vote_counts.disagree / aTotal : 0;
          const bRatio = bTotal > 0 ? b.vote_counts.disagree / bTotal : 0;
          return bRatio - aRatio;
        }
        case 'commented': {
          // Note: Comment count would need to be added to DiffItem type
          // For now, sort by newest as fallback
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        default:
          return 0;
      }
    });

    // Step 4: Group by category
    const grouped = sorted.reduce((acc, diff) => {
      if (!acc[diff.category]) {
        acc[diff.category] = [];
      }
      acc[diff.category].push(diff);
      return acc;
    }, {} as Record<string, DiffItem[]>);

    // Step 5: Calculate category counts from ALL visible diffs (not filtered by category/search)
    const counts = visibleDiffs.reduce((acc, diff) => {
      acc[diff.category] = (acc[diff.category] || 0) + 1;
      return acc;
    }, {} as Record<DiffCategory, number>);

    return {
      filteredDiffs: sorted,
      visibleDiffsByCategory: grouped,
      categoryCounts: counts,
    };
  }, [visibleDiffs, selectedCategories, searchQuery, sortOption]);

  // Group masked diffs by category
  const maskedDiffsByCategory = useMemo(() => {
    return maskedDiffs.reduce((acc, diff) => {
      if (!acc[diff.category]) {
        acc[diff.category] = [];
      }
      acc[diff.category].push(diff);
      return acc;
    }, {} as Record<string, DiffItem[]>);
  }, [maskedDiffs]);

  // Calculate consensus accuracy
  const consensusAccuracy = useMemo(() => {
    if (visibleDiffs.length === 0) return 0;

    let totalAccuracyPercentage = 0;
    let diffsWithVotes = 0;

    visibleDiffs.forEach((diff) => {
      const { accurate, needs_nuance, disagree } = diff.vote_counts;
      const totalVotes = accurate + needs_nuance + disagree;

      if (totalVotes > 0) {
        const accuracyPercent = (accurate / totalVotes) * 100;
        totalAccuracyPercentage += accuracyPercent;
        diffsWithVotes++;
      }
    });

    return diffsWithVotes > 0 ? totalAccuracyPercentage / diffsWithVotes : 0;
  }, [visibleDiffs]);

  // Get top 3 categories
  const topCategories = useMemo(() => {
    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .filter(([, count]) => count > 0)
      .map(([category, count]) => ({
        category: CATEGORY_LABELS[category as DiffCategory],
        count,
      }));
  }, [categoryCounts]);

  const handleToggleCategory = useCallback((category: DiffCategory): void => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const handleClearFilters = useCallback((): void => {
    setSelectedCategories(new Set());
  }, []);

  const handleToggleCategoryExpansion = (category: string): void => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleIncreaseSpoilerLevel = (): void => {
    switch (spoilerPreference) {
      case 'SAFE':
        setSpoilerPreference('BOOK_ALLOWED');
        break;
      case 'BOOK_ALLOWED':
        setSpoilerPreference('SCREEN_ALLOWED');
        break;
      case 'SCREEN_ALLOWED':
        setSpoilerPreference('FULL');
        break;
      default:
        break;
    }
  };

  const hasActiveFilters = selectedCategories.size > 0 || searchQuery.trim().length > 0;

  // Calculate total votes across all diffs
  const totalVotes = useMemo(() => {
    return diffs.reduce((total, diff) => {
      return total + diff.vote_counts.accurate + diff.vote_counts.needs_nuance + diff.vote_counts.disagree;
    }, 0);
  }, [diffs]);

  return (
    <div className="container pb-8 sm:pb-12">
      {/* Matchup Scoreboard */}
      <MatchupScoreboard
        work={work}
        screenWork={screenWork}
        onAddDiff={handleAddDiff}
        workId={work.id}
        screenWorkId={screenWork.id}
      />

      {/* Get It Now Module - Mobile Only (below hero) */}
      <div className="lg:hidden mb-6">
        <GetItNowModule work={work} screenWork={screenWork} />
      </div>

      {/* Main Content Grid - Desktop has sidebar */}
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        {/* Main Content Column */}
        <div className="min-w-0">
          {/* Spoiler Control - Sticky at top */}
          <SpoilerControl
        currentPreference={spoilerPreference}
        onPreferenceChange={setSpoilerPreference}
        visibleCount={visibleDiffs.length}
        hiddenCount={hiddenCount}
        consensusAccuracy={consensusAccuracy}
        topCategories={topCategories}
      />

      {/* Filter Bar - only show when there are diffs */}
      {diffs.length > 0 && (
        <div className="mb-8">
          <div className="space-y-4">
            {/* Search and Sort row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <DiffSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  resultsCount={filteredDiffs.length}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <DiffSort value={sortOption} onChange={setSortOption} />
                <button
                  onClick={handleAddDiff}
                  className={`px-4 py-2 border ${BORDERS.solid} bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:dark:bg-black hover:text-black hover:dark:text-white font-bold transition-all ${TEXT.body} ${RADIUS.control} whitespace-nowrap uppercase tracking-wider`}
                  style={{ fontFamily: FONTS.mono, letterSpacing: '0.08em' }}
                >
                  Add Difference
                </button>
              </div>
            </div>

            {/* Category Filters */}
            {visibleDiffs.length > 0 && (
              <DiffFilters
                categories={DIFF_CATEGORIES}
                selectedCategories={selectedCategories}
                categoryCounts={categoryCounts}
                onToggleCategory={handleToggleCategory}
                onClearAll={handleClearFilters}
              />
            )}
          </div>
        </div>
      )}

      {/* Diffs by Category */}
      <div className="space-y-6 sm:space-y-8">
          {/* Starter Kit - when no diffs exist */}
          {diffs.length === 0 && (
            <DiffStarterKit workSlug={work.slug} screenSlug={screenWork.slug} />
          )}

          {/* Empty state when filters active but no matches */}
          {Object.keys(visibleDiffsByCategory).length === 0 && hasActiveFilters && (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="max-w-md mx-auto">
                <p className="text-base sm:text-lg font-medium text-foreground mb-2">
                  No diffs match your filters
                </p>
                <p className="text-sm text-muted mb-4">
                  Try adjusting your category selection or search query.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategories(new Set());
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-sm bg-surface border border-border ${RADIUS.control} hover:bg-surface2 transition-colors min-h-[40px]"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}

          {/* Visible Diffs */}
          {Object.entries(visibleDiffsByCategory).map(([category, categoryDiffs]) => {
            const isExpanded = expandedCategories.has(category);
            return (
              <div key={category} className="border-b border-border pb-4 sm:pb-6 last:border-0">
                {/* Category Header - Collapsible */}
                <button
                  onClick={() => handleToggleCategoryExpansion(category)}
                  className="w-full flex items-center justify-between mb-3 sm:mb-4 text-left group hover:text-link transition-colors"
                >
                  <h2 className="text-base sm:text-lg font-semibold capitalize flex items-center gap-2">
                    <span className="text-muted group-hover:text-link transition-colors">
                      {isExpanded ? '▾' : '▸'}
                    </span>
                    <span>{category.toLowerCase().replace('_', ' ')}</span>
                    <span className="text-sm text-muted font-normal">· {categoryDiffs.length}</span>
                  </h2>
                </button>

                {/* Category Diffs */}
                {isExpanded && (
                  <div className="space-y-3 sm:space-y-4">
                    {categoryDiffs.map((diff) => (
                      <DiffItemCard
                        key={diff.id}
                        diff={diff}
                        userSpoilerScope={currentSpoilerScope}
                        onSpoilerPreferenceChange={(pref) => {
                          scrollToDiffIdRef.current = diff.id;
                          setSpoilerPreference(pref);
                        }}
                        currentSpoilerPreference={spoilerPreference}
                        commentsExpanded={expandedComments.has(diff.id)}
                        onCommentsExpandedChange={(expanded) => {
                          setExpandedComments(prev => {
                            const next = new Set(prev);
                            if (expanded) {
                              next.add(diff.id);
                            } else {
                              next.delete(diff.id);
                            }
                            return next;
                          });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Masked Diffs - Show these after visible diffs */}
          {maskedDiffs.length > 0 && (
            <div className={`border-t ${BORDERS.medium} pt-6 sm:pt-8`}>
              {hiddenCount > 0 && (
                <div className={`mb-4 p-3 sm:p-4 bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium}`}>
                  <h2 className={`text-base sm:text-lg font-bold text-black dark:text-white mb-2 flex items-center gap-2`} style={{ fontFamily: FONTS.mono }}>
                    <LockClosedIcon className="w-6 h-6" aria-hidden="true" />
                    {hiddenCount} Hidden Difference{hiddenCount !== 1 ? 's' : ''}
                  </h2>
                  <p className={`${TEXT.body} text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>
                    The following differences contain spoilers beyond your current setting.
                    Increase your spoiler level above to reveal them, or click individual reveal buttons.
                  </p>
                </div>
              )}

              {Object.entries(maskedDiffsByCategory).map(([category, categoryDiffs]) => (
                <div key={category} className="border-b border-border pb-4 sm:pb-6 last:border-0 mb-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 capitalize text-muted">
                    {category.toLowerCase().replace('_', ' ')}
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {categoryDiffs.map((diff) => (
                      <MaskedDiffCard
                        key={diff.id}
                        diff={diff}
                        userSpoilerScope={currentSpoilerScope}
                        onReveal={() => setRevealedDiffs(prev => {
                          const next = new Set(prev);
                          next.add(diff.id);
                          return next;
                        })}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Stats Footer */}
      {diffs.length > 0 && (
        <div className={`mt-6 sm:mt-8 p-3 sm:p-4 bg-stone-100 dark:bg-stone-900 ${RADIUS.control} text-center ${TEXT.secondary} sm:text-sm ${TEXT.mutedMedium} font-bold`} style={{ fontFamily: FONTS.mono }}>
          {hasActiveFilters ? (
            <>
              Showing <span className="text-black dark:text-white">{filteredDiffs.length}</span> of{' '}
              <span className="text-black dark:text-white">{visibleDiffs.length}</span> visible difference
              {visibleDiffs.length !== 1 ? 's' : ''}
            </>
          ) : (
            <>
              Showing <span className="text-black dark:text-white">{visibleDiffs.length}</span> visible difference
              {visibleDiffs.length !== 1 ? 's' : ''}
            </>
          )}
          {hiddenCount > 0 && (
            <>
              {' '}
              + <span className="text-black dark:text-white">{hiddenCount}</span> hidden
            </>
          )}
        </div>
      )}
        </div>
        {/* End Main Content Column */}

        {/* Sidebar - Desktop Only */}
        <div className="hidden lg:block">
          <GetItNowModule work={work} screenWork={screenWork} />
        </div>
      </div>
      {/* End Grid */}
    </div>
  );
}
