'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Work, ScreenWork, DiffItem, SpoilerScope, DiffCategory } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import DiffItemCard from './DiffItemCard';
import MaskedDiffCard from './MaskedDiffCard';
import SpoilerControl, { type SpoilerPreference } from './SpoilerControl';
import CompactVoteStrip from './CompactVoteStrip';
import ComparisonSummary from './ComparisonSummary';
import DiffFilters from './DiffFilters';
import DiffSort, { type SortOption } from './DiffSort';
import DiffSearch from './DiffSearch';
import AdaptationSwitcher from './AdaptationSwitcher';
import SkeletonCard from '@/components/ui/SkeletonCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import {
  loadSpoilerPreference,
  getMaxScopeForAPI,
  filterDiffsByPreference,
  getAllowedScopes,
} from '@/lib/spoiler-utils';

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

  // Load preference from localStorage after mount
  useEffect(() => {
    setSpoilerPreference(loadSpoilerPreference());
  }, []);

  const [ordering, setOrdering] = useState<string>('best');
  const [diffs, setDiffs] = useState<DiffItem[]>(initialDiffs);
  const [loading, setLoading] = useState(false);

  // Filter and sort state
  const [selectedCategories, setSelectedCategories] = useState<Set<DiffCategory>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>('top');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddDiff = (): void => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/compare/${work.slug}/${screenWork.slug}/add`);
      return;
    }
    router.push(`/compare/${work.slug}/${screenWork.slug}/add`);
  };

  // Fetch diffs when preference or ordering changes
  useEffect(() => {
    const fetchDiffs = async (): Promise<void> => {
      setLoading(true);
      try {
        // Always fetch FULL scope from API - we'll filter client-side
        const maxScope = getMaxScopeForAPI(spoilerPreference);
        const response = await api.compare.get(work.id, screenWork.id, maxScope, ordering);
        setDiffs((response as { results: DiffItem[] }).results);
      } catch (error) {
        console.error('Failed to fetch diffs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiffs();
  }, [spoilerPreference, ordering, work.id, screenWork.id]);

  // Filter diffs based on spoiler preference
  const { visible: visibleDiffs, masked: maskedDiffs } = useMemo(() => {
    return filterDiffsByPreference(diffs, spoilerPreference);
  }, [diffs, spoilerPreference]);

  // Get the current spoiler scope for the API (for the DiffItemCard)
  const currentSpoilerScope = useMemo(() => {
    return getMaxScopeForAPI(spoilerPreference);
  }, [spoilerPreference]);

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

  // All available categories
  const allCategories: DiffCategory[] = [
    'PLOT',
    'CHARACTER',
    'ENDING',
    'SETTING',
    'THEME',
    'TONE',
    'TIMELINE',
    'WORLDBUILDING',
    'OTHER',
  ];

  const handleToggleCategory = (category: DiffCategory): void => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleClearFilters = (): void => {
    setSelectedCategories(new Set());
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

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 sm:mb-6 gap-6">
          {/* Book Section */}
          <div className="flex-1 flex gap-4">
            {work.cover_url && (
              <img
                src={work.cover_url}
                alt={`${work.title} cover`}
                className="w-24 h-36 sm:w-32 sm:h-48 object-cover rounded-md border border-border shadow-md"
              />
            )}
            <div className="flex-1">
              <h2 className="text-xs sm:text-sm text-muted mb-1 sm:mb-2">Book</h2>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{work.title}</h1>
              {work.year && <p className="text-sm sm:text-base text-muted">({work.year})</p>}
              {work.summary && (
                <p className="text-sm text-muted mt-2 line-clamp-3">{work.summary}</p>
              )}
            </div>
          </div>

          <div className="text-3xl sm:text-4xl text-muted self-center hidden md:block mx-2">→</div>
          <div className="text-2xl text-muted self-center md:hidden">↓</div>

          {/* Movie Section */}
          <div className="flex-1 flex gap-4 md:flex-row-reverse">
            {screenWork.poster_url && (
              <img
                src={screenWork.poster_url}
                alt={`${screenWork.title} poster`}
                className="w-24 h-36 sm:w-32 sm:h-48 object-cover rounded-md border border-border shadow-md"
              />
            )}
            <div className="flex-1 md:text-right">
              <h2 className="text-xs sm:text-sm text-muted mb-1 sm:mb-2">
                {screenWork.type === 'MOVIE' ? 'Movie' : 'TV Series'}
              </h2>
              <div className="mb-1 sm:mb-2 md:flex md:justify-end">
                <AdaptationSwitcher
                  workId={work.id}
                  workSlug={work.slug}
                  currentScreenWorkId={screenWork.id}
                  currentScreenWorkTitle={screenWork.title}
                  currentScreenWorkYear={screenWork.year}
                  currentScreenWorkType={screenWork.type}
                />
              </div>
              {screenWork.year && <p className="text-sm sm:text-base text-muted">({screenWork.year})</p>}
              {screenWork.summary && (
                <p className="text-sm text-muted mt-2 line-clamp-3 md:text-right">{screenWork.summary}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Voting Strip */}
      <div className="mb-4 sm:mb-6">
        <CompactVoteStrip work={work} screenWork={screenWork} />
      </div>

      {/* Spoiler Control - Sticky at top */}
      <SpoilerControl
        currentPreference={spoilerPreference}
        onPreferenceChange={setSpoilerPreference}
      />

      {/* Comparison Summary Strip */}
      {!loading && diffs.length > 0 && (
        <ComparisonSummary
          visibleCount={visibleDiffs.length}
          maskedCount={maskedDiffs.length}
          categoryCounts={categoryCounts}
          allDiffs={diffs}
          currentPreference={spoilerPreference}
          onSpoilerLevelIncrease={handleIncreaseSpoilerLevel}
          onCategoryClick={handleToggleCategory}
        />
      )}

      {/* Filter Bar */}
      <div className="border-t border-b border-border py-4 sm:py-5 mb-6 sm:mb-8 mt-6 bg-surface2/30">
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
            <div className="flex gap-3">
              <DiffSort value={sortOption} onChange={setSortOption} />
              <button
                onClick={handleAddDiff}
                className="px-4 py-2 bg-link text-white rounded-md hover:bg-link/90 transition-colors font-medium whitespace-nowrap min-h-[40px]"
              >
                Add Difference
              </button>
            </div>
          </div>

          {/* Category Filters */}
          {visibleDiffs.length > 0 && (
            <DiffFilters
              categories={allCategories}
              selectedCategories={selectedCategories}
              categoryCounts={categoryCounts}
              onToggleCategory={handleToggleCategory}
              onClearAll={handleClearFilters}
            />
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-8" aria-live="polite" aria-busy="true">
          <div>
            <LoadingSkeleton width="w-48" height="h-7" className="mb-4" />
            <div className="space-y-4">
              <SkeletonCard variant="detailed" />
              <SkeletonCard variant="detailed" />
            </div>
          </div>
          <div>
            <LoadingSkeleton width="w-40" height="h-7" className="mb-4" />
            <div className="space-y-4">
              <SkeletonCard variant="detailed" />
            </div>
          </div>
        </div>
      )}

      {/* Diffs by Category */}
      {!loading && (
        <div className="space-y-6 sm:space-y-8">
          {/* Empty state when no diffs match filters */}
          {Object.keys(visibleDiffsByCategory).length === 0 && !hasActiveFilters && Object.keys(maskedDiffsByCategory).length === 0 && (
            <div className="text-center py-8 sm:py-12 text-muted px-4">
              <p className="text-base sm:text-lg mb-2">No differences found for this comparison.</p>
              <p className="text-sm">
                Be the first to add a difference!
              </p>
            </div>
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
                  className="px-4 py-2 text-sm bg-surface border border-border rounded-md hover:bg-surface2 transition-colors min-h-[40px]"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}

          {/* Visible Diffs */}
          {Object.entries(visibleDiffsByCategory).map(([category, categoryDiffs]) => (
            <div key={category} className="border-b border-border pb-4 sm:pb-6 last:border-0">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 capitalize">
                {category.toLowerCase().replace('_', ' ')}
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {categoryDiffs.map((diff) => (
                  <DiffItemCard key={diff.id} diff={diff} userSpoilerScope={currentSpoilerScope} />
                ))}
              </div>
            </div>
          ))}

          {/* Masked Diffs - Show these after visible diffs */}
          {maskedDiffs.length > 0 && (
            <div className="border-t-2 border-warn pt-6 sm:pt-8">
              <div className="mb-4 p-3 sm:p-4 bg-warn/10 border border-warn/30 rounded-lg">
                <h2 className="text-lg sm:text-xl font-bold text-warn mb-2 flex items-center gap-2">
                  <span aria-hidden="true">🔒</span>
                  {maskedDiffs.length} Hidden Difference{maskedDiffs.length !== 1 ? 's' : ''}
                </h2>
                <p className="text-sm text-foreground">
                  The following differences contain spoilers beyond your current setting.
                  Increase your spoiler level above to reveal them, or click individual reveal buttons.
                </p>
              </div>

              {Object.entries(maskedDiffsByCategory).map(([category, categoryDiffs]) => (
                <div key={category} className="border-b border-border pb-4 sm:pb-6 last:border-0 mb-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 capitalize text-muted">
                    {category.toLowerCase().replace('_', ' ')}
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {categoryDiffs.map((diff) => (
                      <MaskedDiffCard key={diff.id} diff={diff} userSpoilerScope={currentSpoilerScope} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Footer */}
      {!loading && diffs.length > 0 && (
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-muted/10 rounded-lg text-center text-xs sm:text-sm text-muted">
          {hasActiveFilters ? (
            <>
              Showing <span className="font-semibold">{filteredDiffs.length}</span> of{' '}
              <span className="font-semibold">{visibleDiffs.length}</span> visible difference
              {visibleDiffs.length !== 1 ? 's' : ''}
            </>
          ) : (
            <>
              Showing <span className="font-semibold">{visibleDiffs.length}</span> visible difference
              {visibleDiffs.length !== 1 ? 's' : ''}
            </>
          )}
          {maskedDiffs.length > 0 && (
            <>
              {' '}
              + <span className="font-semibold">{maskedDiffs.length}</span> hidden
            </>
          )}
        </div>
      )}
    </div>
  );
}
