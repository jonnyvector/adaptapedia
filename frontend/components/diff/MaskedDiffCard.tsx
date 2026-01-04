'use client';

import { useState } from 'react';
import type { DiffItem, SpoilerScope } from '@/lib/types';
import DiffItemCard from './DiffItemCard';
import { BookOpenIcon, FilmIcon, ExclamationTriangleIcon, LockClosedIcon } from '@/components/ui/Icons';
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
    <div className={`border-2 border-amber-600 dark:border-amber-400 ${RADIUS.control} p-4 sm:p-5 bg-amber-50 dark:bg-amber-950/30 backdrop-blur-sm`}>
      {/* Warning Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl text-amber-700 dark:text-amber-400" aria-hidden="true">
          {getSpoilerIcon(diff.spoiler_scope)}
        </span>
        <div className="flex-1">
          <h3 className={`${TEXT.body} sm:text-base font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2`} style={{ fontFamily: FONTS.mono }}>
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
      <div className={`relative mb-4 ${RADIUS.control} overflow-hidden`}>
        <div className="absolute inset-0 backdrop-blur-xl bg-white/80 dark:bg-black/80 z-10 flex items-center justify-center">
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
          className={`px-4 py-3 bg-amber-600 dark:bg-amber-500 text-white ${RADIUS.control} hover:bg-amber-700 hover:dark:bg-amber-600 transition-all font-bold ${TEXT.secondary} min-h-[48px] flex items-center justify-center gap-2 border ${BORDERS.solid}`}
          style={{ fontFamily: FONTS.mono }}
          aria-label={`Reveal ${getSpoilerLabel(diff.spoiler_scope).toLowerCase()}`}
        >
          <span className="text-lg" aria-hidden="true">👁️</span>
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
