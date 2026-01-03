'use client';

import { PlusIcon } from '@/components/ui/Icons';

interface StickyMobileCTAProps {
  diffCount: number;
  onAddDiff: () => void;
  onVote: () => void;
}

export default function StickyMobileCTA({
  diffCount,
  onAddDiff,
  onVote,
}: StickyMobileCTAProps): JSX.Element {
  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white dark:bg-surface border-t border-gray-200 dark:border-border shadow-2xl z-40 safe-area-inset-bottom">
      <div className="p-4 flex gap-3">
        {/* Primary: Add Difference */}
        <button
          onClick={onAddDiff}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
          aria-label={diffCount === 0 ? 'Add first difference' : 'Add a difference'}
        >
          <PlusIcon className="w-5 h-5" />
          <span>{diffCount === 0 ? 'Add first diff' : 'Add diff'}</span>
        </button>

        {/* Secondary: Vote */}
        <button
          onClick={onVote}
          className="px-5 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          aria-label="Quick vote"
        >
          Vote
        </button>
      </div>
    </div>
  );
}
