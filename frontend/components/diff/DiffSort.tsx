'use client';

export type SortOption = 'top' | 'newest' | 'disputed' | 'commented';

interface DiffSortProps {
  value: SortOption;
  onChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'top', label: 'Top voted' },
  { value: 'newest', label: 'Newest' },
  { value: 'disputed', label: 'Most disputed' },
  { value: 'commented', label: 'Most commented' },
];

export default function DiffSort({ value, onChange }: DiffSortProps): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="diff-sort" className="text-sm font-medium text-muted whitespace-nowrap">
        Sort by:
      </label>
      <select
        id="diff-sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="px-3 py-2 text-sm bg-surface text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-link min-h-[40px] cursor-pointer"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
