'use client';

import { PlusIcon } from '@/components/ui/Icons';
import { FONTS, BORDERS, RADIUS } from '@/lib/brutalist-design';

interface MobileStickyActionBarProps {
  diffCount: number;
  onAddDiff: () => void;
  onVote: () => void;
}

export default function MobileStickyActionBar({
  diffCount,
  onAddDiff,
  onVote,
}: MobileStickyActionBarProps): JSX.Element {
  return (
    <div className={`fixed bottom-0 left-0 right-0 md:hidden bg-white dark:bg-black border-t ${BORDERS.medium} shadow-2xl z-40`}>
      <div className="p-4 pb-6 flex gap-3">
        {/* Primary: Add Difference */}
        <button
          onClick={onAddDiff}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-black dark:bg-white hover:bg-white hover:dark:bg-black text-white dark:text-black hover:text-black hover:dark:text-white font-bold ${RADIUS.control} border ${BORDERS.solid} transition-all shadow-lg uppercase tracking-wider`}
          style={{ fontFamily: FONTS.mono, letterSpacing: '0.08em' }}
          aria-label={diffCount === 0 ? 'Add first difference' : 'Add a difference'}
        >
          <PlusIcon className="w-5 h-5" />
          <span>{diffCount === 0 ? 'Add first diff' : 'Add diff'}</span>
        </button>

        {/* Secondary: Vote */}
        <button
          onClick={onVote}
          className={`px-5 py-3 border ${BORDERS.solid} text-black dark:text-white font-bold ${RADIUS.control} hover:bg-stone-100 hover:dark:bg-stone-900 transition-all uppercase tracking-wider`}
          style={{ fontFamily: FONTS.mono, letterSpacing: '0.08em' }}
          aria-label="Quick vote"
        >
          Vote
        </button>
      </div>
    </div>
  );
}
