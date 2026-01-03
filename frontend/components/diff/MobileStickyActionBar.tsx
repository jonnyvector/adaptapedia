'use client';

import { PlusIcon } from '@/components/ui/Icons';

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
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white dark:bg-surface border-t border-gray-200 dark:border-border shadow-2xl z-40">
      <div className="p-4 pb-6 flex gap-3">
        {/* Primary: Add Difference */}
        <button
          onClick={onAddDiff}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold rounded-lg transition-colors shadow-lg"
          aria-label={diffCount === 0 ? 'Add first difference' : 'Add a difference'}
        >
          <PlusIcon className="w-5 h-5" />
          <span>{diffCount === 0 ? 'Add first diff' : 'Add diff'}</span>
        </button>

        {/* Secondary: Vote */}
        <button
          onClick={onVote}
          className="px-5 py-3 border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          aria-label="Quick vote"
        >
          Vote
        </button>
      </div>
    </div>
  );
}
