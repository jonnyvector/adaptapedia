'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { Work, ScreenWork } from '@/lib/types';

// Simple X icon
const XIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface VoteBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  work: Work;
  screenWork: ScreenWork;
  onVoteSubmitted?: () => void;
}

type PreferenceChoice = 'BOOK' | 'SCREEN' | 'TIE';

export default function VoteBottomSheet({
  isOpen,
  onClose,
  work,
  screenWork,
  onVoteSubmitted,
}: VoteBottomSheetProps): JSX.Element | null {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleVote = async (preference: PreferenceChoice) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const { submitComparisonVote } = await import('@/app/actions/comparison-votes');
      const result = await submitComparisonVote(work.id, screenWork.id, preference, null);

      if (result.success) {
        onVoteSubmitted?.();
        onClose();
      }
    } catch (error) {
      console.error('Vote submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm md:hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vote-sheet-title"
    >
      <div
        className="bg-white dark:bg-surface rounded-t-2xl w-full shadow-2xl transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="vote-sheet-title" className="text-lg font-bold text-gray-900 dark:text-white">
            Quick Vote
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pb-8">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
            Which did you prefer?
          </p>

          {/* Big Book / Screen buttons */}
          <div className="space-y-3 mb-4">
            <button
              onClick={() => handleVote('BOOK')}
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              📖 Book
            </button>
            <button
              onClick={() => handleVote('SCREEN')}
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              🎬 Screen
            </button>
            <button
              onClick={() => handleVote('TIE')}
              disabled={isSubmitting}
              className="w-full py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Both were equally good
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-500">
            1-tap to vote. Faithfulness rating optional.
          </p>
        </div>
      </div>
    </div>
  );
}
