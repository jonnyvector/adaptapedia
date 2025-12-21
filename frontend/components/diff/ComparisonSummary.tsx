'use client';

import type { DiffItem, DiffCategory } from '@/lib/types';
import type { SpoilerPreference } from './SpoilerControl';

interface ComparisonSummaryProps {
  visibleCount: number;
  maskedCount: number;
  categoryCounts: Record<DiffCategory, number>;
  allDiffs: DiffItem[];
  currentPreference: SpoilerPreference;
  onSpoilerLevelIncrease: () => void;
  onCategoryClick: (category: DiffCategory) => void;
}

const CATEGORY_LABELS: Record<DiffCategory, string> = {
  PLOT: 'Plot',
  CHARACTER: 'Characters',
  ENDING: 'Ending',
  SETTING: 'Setting',
  THEME: 'Theme',
  TONE: 'Tone',
  TIMELINE: 'Timeline',
  WORLDBUILDING: 'Worldbuilding',
  OTHER: 'Other',
};

/**
 * Calculate consensus statistics for visible diffs
 */
function calculateConsensus(diffs: DiffItem[]): {
  averageAccuracy: number;
  disputedCount: number;
} {
  if (diffs.length === 0) {
    return { averageAccuracy: 0, disputedCount: 0 };
  }

  let totalAccuracyPercentage = 0;
  let diffsWithVotes = 0;
  let disputedCount = 0;

  diffs.forEach((diff) => {
    const { accurate, needs_nuance, disagree } = diff.vote_counts;
    const totalVotes = accurate + needs_nuance + disagree;

    if (totalVotes > 0) {
      const accuracyPercent = (accurate / totalVotes) * 100;
      totalAccuracyPercentage += accuracyPercent;
      diffsWithVotes++;

      // Consider disputed if >40% disagree
      const disagreePercent = (disagree / totalVotes) * 100;
      if (disagreePercent > 40) {
        disputedCount++;
      }
    }
  });

  const averageAccuracy = diffsWithVotes > 0 ? totalAccuracyPercentage / diffsWithVotes : 0;

  return { averageAccuracy, disputedCount };
}

/**
 * Get the next spoiler preference level
 */
function getNextPreference(current: SpoilerPreference): SpoilerPreference {
  switch (current) {
    case 'SAFE':
      return 'BOOK_ALLOWED';
    case 'BOOK_ALLOWED':
      return 'SCREEN_ALLOWED';
    case 'SCREEN_ALLOWED':
      return 'FULL';
    case 'FULL':
      return 'FULL';
    default:
      return 'SAFE';
  }
}

export default function ComparisonSummary({
  visibleCount,
  maskedCount,
  categoryCounts,
  allDiffs,
  currentPreference,
  onSpoilerLevelIncrease,
  onCategoryClick,
}: ComparisonSummaryProps): JSX.Element {
  // Get top 3 categories by count
  const topCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .filter(([, count]) => count > 0);

  // Calculate consensus from visible diffs only
  const visibleDiffs = allDiffs.filter(
    (diff) => !maskedCount || allDiffs.indexOf(diff) < visibleCount
  );
  const { averageAccuracy, disputedCount } = calculateConsensus(allDiffs);

  const nextPreference = getNextPreference(currentPreference);
  const canIncrease = currentPreference !== 'FULL' && maskedCount > 0;

  return (
    <div className="border-t border-b border-border bg-surface2/30 py-3 px-4 mb-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted font-mono">
          {/* Visible/Hidden counts */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">
              Visible diffs: {visibleCount}
            </span>
            {maskedCount > 0 && (
              <>
                <span aria-hidden="true">•</span>
                <span className="font-semibold text-warn">Hidden: {maskedCount}</span>
                {canIncrease && (
                  <>
                    <span className="hidden sm:inline">(</span>
                    <button
                      onClick={onSpoilerLevelIncrease}
                      className="text-link hover:text-linkHover underline transition-colors"
                      aria-label={`Increase spoiler level to ${nextPreference.toLowerCase().replace('_', ' ')}`}
                    >
                      increase spoiler level
                    </button>
                    <span className="hidden sm:inline">to see)</span>
                  </>
                )}
              </>
            )}
          </div>

          {/* Top categories */}
          {topCategories.length > 0 && (
            <>
              <span aria-hidden="true" className="hidden sm:inline">
                •
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span>Most common:</span>
                {topCategories.map(([category, count], index) => (
                  <span key={category} className="inline-flex items-center gap-1">
                    {index > 0 && <span aria-hidden="true">,</span>}
                    <button
                      onClick={() => onCategoryClick(category as DiffCategory)}
                      className="text-link hover:text-linkHover transition-colors hover:underline"
                      aria-label={`Filter by ${CATEGORY_LABELS[category as DiffCategory]}`}
                    >
                      {CATEGORY_LABELS[category as DiffCategory]}
                    </button>
                    <span className="text-muted">({count})</span>
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Consensus stats */}
          {allDiffs.length > 0 && (
            <>
              <span aria-hidden="true" className="hidden sm:inline">
                •
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  Consensus: {averageAccuracy > 0 ? Math.round(averageAccuracy) : 0}% accurate
                </span>
                {disputedCount > 0 && (
                  <>
                    <span aria-hidden="true">•</span>
                    <span className="text-warn font-semibold">
                      {disputedCount} disputed
                    </span>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
