'use client';

import type { DiffCategory } from '@/lib/types';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';

interface DiffFiltersProps {
  categories: DiffCategory[];
  selectedCategories: Set<DiffCategory>;
  categoryCounts: Record<DiffCategory, number>;
  onToggleCategory: (category: DiffCategory) => void;
  onClearAll: () => void;
}

const CATEGORY_LABELS: Record<DiffCategory, string> = {
  PLOT: 'Plot',
  CHARACTER: 'Character',
  ENDING: 'Ending',
  SETTING: 'Setting',
  THEME: 'Theme',
  TONE: 'Tone',
  TIMELINE: 'Timeline',
  WORLDBUILDING: 'Worldbuilding',
  OTHER: 'Other',
};

export default function DiffFilters({
  categories,
  selectedCategories,
  categoryCounts,
  onToggleCategory,
  onClearAll,
}: DiffFiltersProps): JSX.Element {
  const hasActiveFilters = selectedCategories.size > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className={`${TEXT.label} ${monoUppercase} ${TEXT.mutedMedium} font-bold`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>
          Filter by category
        </label>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className={`${TEXT.metadata} ${TEXT.mutedStrong} border ${BORDERS.subtle} px-2 py-1 ${RADIUS.control} hover:${BORDERS.solid} transition-all ${monoUppercase} font-bold`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {categories.map((category) => {
          const count = categoryCounts[category] || 0;
          const isSelected = selectedCategories.has(category);

          if (count === 0) return null;

          return (
            <button
              key={category}
              onClick={() => onToggleCategory(category)}
              className={`px-3 py-1.5 ${RADIUS.control} border ${TEXT.secondary} font-bold transition-all ${
                isSelected
                  ? `bg-black dark:bg-white ${BORDERS.solid} text-white dark:text-black`
                  : `bg-white dark:bg-black ${BORDERS.medium} text-black dark:text-white hover:border-black hover:dark:border-white`
              }`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
              aria-pressed={isSelected}
            >
              {CATEGORY_LABELS[category]}
              <span className={`ml-2 ${TEXT.metadata} ${isSelected ? 'text-white/80 dark:text-black/80' : TEXT.mutedLight}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
