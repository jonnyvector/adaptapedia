'use client';

import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';

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
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <label htmlFor="diff-sort" className={`${TEXT.label} ${monoUppercase} ${TEXT.mutedMedium} font-bold whitespace-nowrap`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>
        Sort by
      </label>
      <div className="relative flex-1 sm:flex-initial">
        <select
          id="diff-sort"
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className={`pl-3 pr-10 ${TEXT.body} bg-white dark:bg-black text-black dark:text-white border ${BORDERS.medium} ${RADIUS.input} focus:outline-none focus:border-black focus:dark:border-white min-h-[44px] cursor-pointer appearance-none w-full box-border font-bold`}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${TEXT.mutedMedium}`}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 7L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
