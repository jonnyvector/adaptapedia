'use client';

import { useState } from 'react';
import type { DiffItem, SpoilerScope } from '@/lib/types';
import DiffItemCard from './DiffItemCard';
import { BookOpenIcon, FilmIcon, ExclamationTriangleIcon, LockClosedIcon, EyeIcon } from '@/components/ui/Icons';
import { getSpoilerLabel } from '@/lib/badge-utils';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

interface MaskedDiffCardProps {
  diff: DiffItem;
  userSpoilerScope: SpoilerScope;
}

export default function MaskedDiffCard({
  diff,
  userSpoilerScope,
}: MaskedDiffCardProps): JSX.Element {
  const [revealed, setRevealed] = useState(false);

  const getSpoilerIcon = (scope: SpoilerScope): JSX.Element => {
    const iconClass = "w-8 h-8";
    switch (scope) {
      case 'BOOK_ONLY':
        return <BookOpenIcon className={iconClass} />;
      case 'SCREEN_ONLY':
        return <FilmIcon className={iconClass} />;
      case 'FULL':
        return <ExclamationTriangleIcon className={iconClass} />;
      default:
        return <LockClosedIcon className={iconClass} />;
    }
  };

  if (revealed) {
    return <DiffItemCard diff={diff} userSpoilerScope={userSpoilerScope} />;
  }

  return (
    <div className={`border ${BORDERS.medium} p-4 sm:p-5 bg-stone-50 dark:bg-stone-950`}>
      {/* Warning Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl text-black dark:text-white" aria-hidden="true">
          {getSpoilerIcon(diff.spoiler_scope)}
        </span>
        <div className="flex-1">
          <h3 className={`${TEXT.body} sm:text-base font-bold text-black dark:text-white flex items-center gap-2`} style={{ fontFamily: FONTS.mono }}>
            {getSpoilerLabel(diff.spoiler_scope)} Hidden
          </h3>
          <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mt-1`} style={{ fontFamily: FONTS.mono }}>
            This difference contains{' '}
            <span className="font-bold">
              {diff.spoiler_scope === 'BOOK_ONLY'
                ? 'book plot details'
                : diff.spoiler_scope === 'SCREEN_ONLY'
                ? 'screen plot details'
                : 'major spoilers'}
            </span>
            .
          </p>
        </div>
      </div>

      {/* Blurred Preview */}
      <div className={`relative mb-4 overflow-hidden`}>
        <div className="absolute inset-0 backdrop-blur-xl bg-stone-50/95 dark:bg-stone-950/95 z-10 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="mb-2 flex justify-center" aria-hidden="true">
              <LockClosedIcon className={`w-12 h-12 ${TEXT.mutedMedium}`} />
            </div>
            <p className={`${TEXT.secondary} font-bold ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>Content Hidden</p>
          </div>
        </div>
        <div className="filter blur-md select-none pointer-events-none p-4 bg-stone-100 dark:bg-stone-900" aria-hidden="true">
          <h3 className={`text-base font-bold mb-2`} style={{ fontFamily: FONTS.mono }}>{diff.claim}</h3>
          {diff.detail && <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>{diff.detail.slice(0, 100)}...</p>}
        </div>
      </div>

      {/* Reveal Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <p className={`${TEXT.label} ${TEXT.mutedMedium} font-bold uppercase`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.1em' }}>
          Category: <span className="font-bold capitalize">{diff.category.toLowerCase()}</span>
        </p>
        <button
          onClick={() => setRevealed(true)}
          className={`px-4 py-3 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity font-bold ${TEXT.secondary} min-h-[48px] flex items-center justify-center gap-2 border ${BORDERS.solid} ${RADIUS.control}`}
          style={{ fontFamily: FONTS.mono }}
          aria-label={`Reveal ${getSpoilerLabel(diff.spoiler_scope).toLowerCase()}`}
        >
          <EyeIcon className="w-5 h-5" />
          <span>Reveal Spoiler</span>
        </button>
      </div>

      {/* Warning Footer */}
      <div className={`mt-3 pt-3 border-t ${BORDERS.subtle} ${TEXT.label} ${TEXT.mutedMedium} text-center font-bold`} style={{ fontFamily: FONTS.mono }}>
        Clicking reveal will show spoiler content. This cannot be undone without reloading the page.
      </div>
    </div>
  );
}
