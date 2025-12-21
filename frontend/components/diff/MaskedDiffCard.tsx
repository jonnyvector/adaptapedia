'use client';

import { useState } from 'react';
import type { DiffItem, SpoilerScope } from '@/lib/types';
import DiffItemCard from './DiffItemCard';

interface MaskedDiffCardProps {
  diff: DiffItem;
  userSpoilerScope: SpoilerScope;
}

export default function MaskedDiffCard({
  diff,
  userSpoilerScope,
}: MaskedDiffCardProps): JSX.Element {
  const [revealed, setRevealed] = useState(false);

  const getSpoilerTypeLabel = (scope: SpoilerScope): string => {
    switch (scope) {
      case 'BOOK_ONLY':
        return 'Book Spoiler';
      case 'SCREEN_ONLY':
        return 'Screen Spoiler';
      case 'FULL':
        return 'Full Spoiler';
      default:
        return 'Spoiler';
    }
  };

  const getSpoilerIcon = (scope: SpoilerScope): string => {
    switch (scope) {
      case 'BOOK_ONLY':
        return '📖';
      case 'SCREEN_ONLY':
        return '🎬';
      case 'FULL':
        return '⚠️';
      default:
        return '🔒';
    }
  };

  if (revealed) {
    return <DiffItemCard diff={diff} userSpoilerScope={userSpoilerScope} />;
  }

  return (
    <div className="border-2 border-warn rounded-lg p-4 sm:p-5 bg-warn/5 backdrop-blur-sm">
      {/* Warning Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl" aria-hidden="true">
          {getSpoilerIcon(diff.spoiler_scope)}
        </span>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-bold text-warn flex items-center gap-2">
            {getSpoilerTypeLabel(diff.spoiler_scope)} Hidden
          </h3>
          <p className="text-sm text-muted mt-1">
            This difference contains{' '}
            <span className="font-semibold">
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
      <div className="relative mb-4 rounded-md overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-xl bg-surface/80 z-10 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="text-4xl mb-2" aria-hidden="true">
              🔒
            </div>
            <p className="text-sm font-semibold text-muted">Content Hidden</p>
          </div>
        </div>
        <div className="filter blur-md select-none pointer-events-none p-4 bg-surface2" aria-hidden="true">
          <h3 className="text-lg font-semibold mb-2">{diff.claim}</h3>
          {diff.detail && <p className="text-sm text-muted">{diff.detail.slice(0, 100)}...</p>}
        </div>
      </div>

      {/* Reveal Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <p className="text-xs text-muted">
          Category: <span className="font-semibold capitalize">{diff.category.toLowerCase()}</span>
        </p>
        <button
          onClick={() => setRevealed(true)}
          className="px-4 py-3 bg-warn text-white rounded-lg hover:bg-warn/90 transition-all font-semibold text-sm min-h-[48px] flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          aria-label={`Reveal ${getSpoilerTypeLabel(diff.spoiler_scope).toLowerCase()}`}
        >
          <span className="text-lg" aria-hidden="true">👁️</span>
          <span>Reveal Spoiler</span>
        </button>
      </div>

      {/* Warning Footer */}
      <div className="mt-3 pt-3 border-t border-warn/30 text-xs text-muted text-center">
        Clicking reveal will show spoiler content. This cannot be undone without reloading the page.
      </div>
    </div>
  );
}
