'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FONTS, TEXT, BORDERS, monoUppercase, LETTER_SPACING } from '@/lib/brutalist-design';

interface SortOption {
  value: string;
  label: string;
  description: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'popularity', label: 'Popular', description: 'Most popular adaptations' },
  { value: 'trending', label: 'Trending', description: 'Recently active comparisons' },
  { value: 'most_documented', label: 'Most Documented', description: 'Highest diff count' },
  { value: 'recently_updated', label: 'Recently Updated', description: 'Latest diff activity' },
  { value: 'newest', label: 'Newest', description: 'Recently added to database' },
];

export default function SortDropdown(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'popularity';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (newSort === 'popularity') {
      // Remove sort param for default
      params.delete('sort');
    } else {
      params.set('sort', newSort);
    }

    const queryString = params.toString();
    router.push(`/browse${queryString ? `?${queryString}` : ''}`);
  };

  const currentOption = SORT_OPTIONS.find(opt => opt.value === currentSort) || SORT_OPTIONS[0];

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="sort-dropdown"
        className={`${TEXT.secondary} ${TEXT.mutedMedium} font-bold ${monoUppercase}`}
        style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
      >
        Sort:
      </label>
      <div className="relative">
        <select
          id="sort-dropdown"
          value={currentSort}
          onChange={handleSortChange}
          className={`
            appearance-none
            px-3 py-2
            pr-8
            ${TEXT.primary}
            bg-white dark:bg-black
            border-2 ${BORDERS.solid}
            font-bold
            ${monoUppercase}
            cursor-pointer
            hover:bg-stone-50 dark:hover:bg-stone-950
            focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white
            transition-colors
          `}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          title={currentOption.description}
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Dropdown arrow */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
