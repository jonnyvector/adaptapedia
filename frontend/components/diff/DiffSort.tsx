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
      <div className="relative">
        <select
          id="diff-sort"
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="pl-3 pr-10 text-sm bg-surface text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-link h-[40px] cursor-pointer appearance-none w-full box-border"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 7L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
