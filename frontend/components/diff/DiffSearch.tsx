'use client';

import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

interface DiffSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultsCount?: number;
}

export default function DiffSearch({ value, onChange, resultsCount }: DiffSearchProps): JSX.Element {
  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="SEARCH DIFFS..."
          className={`w-full px-4 pr-10 ${TEXT.body} bg-white dark:bg-black text-black dark:text-white border ${BORDERS.medium} ${RADIUS.control} focus:outline-none focus:border-black focus:dark:border-white placeholder:${TEXT.mutedLight} placeholder:uppercase h-[40px]`}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
          aria-label="Search diffs"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className={`absolute right-2 top-1/2 -translate-y-1/2 ${TEXT.mutedMedium} hover:text-black hover:dark:text-white transition-colors p-1 min-h-[32px] min-w-[32px] font-bold`}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      {value && resultsCount !== undefined && (
        <p className={`${TEXT.metadata} ${TEXT.mutedMedium} px-1 uppercase`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
          {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
        </p>
      )}
    </div>
  );
}
