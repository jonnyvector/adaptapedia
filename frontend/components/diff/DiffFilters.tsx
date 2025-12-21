'use client';

import type { DiffCategory } from '@/lib/types';

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
        <label className="text-sm font-medium text-muted">
          Filter by category:
        </label>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-xs text-link hover:text-linkHover transition-colors px-2 py-1 rounded hover:bg-surface2 min-h-[32px]"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const count = categoryCounts[category] || 0;
          const isSelected = selectedCategories.has(category);

          if (count === 0) return null;

          return (
            <button
              key={category}
              onClick={() => onToggleCategory(category)}
              className={`px-3 py-2 rounded-md border text-sm font-medium transition-all min-h-[40px] ${
                isSelected
                  ? 'bg-link text-white border-link shadow-sm'
                  : 'bg-surface text-foreground border-border hover:border-link hover:bg-link/5'
              }`}
              aria-pressed={isSelected}
            >
              {CATEGORY_LABELS[category]}
              <span className={`ml-2 text-xs ${isSelected ? 'text-white/80' : 'text-muted'}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
