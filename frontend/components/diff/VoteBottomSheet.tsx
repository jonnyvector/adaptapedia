'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { Work, ScreenWork } from '@/lib/types';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

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
        className={`bg-white dark:bg-black rounded-t-2xl w-full shadow-2xl transform transition-transform border-t ${BORDERS.medium}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${BORDERS.subtle}`}>
          <h2 id="vote-sheet-title" className={`text-base font-bold text-black dark:text-white uppercase tracking-wider`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.1em' }}>
            Quick Vote
          </h2>
          <button
            onClick={onClose}
            className={`p-2 hover:bg-stone-100 hover:dark:bg-stone-900 ${RADIUS.control} transition-colors`}
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pb-8">
          <p className={`${TEXT.body} ${TEXT.mutedMedium} mb-4 text-center font-bold`} style={{ fontFamily: FONTS.mono }}>
            Which did you prefer?
          </p>

          {/* Big Book / Screen buttons */}
          <div className="space-y-3 mb-4">
            <button
              onClick={() => handleVote('BOOK')}
              disabled={isSubmitting}
              className={`w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold ${RADIUS.control} hover:bg-white hover:dark:bg-black hover:text-black hover:dark:text-white border ${BORDERS.solid} transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base uppercase tracking-wider`}
              style={{ fontFamily: FONTS.mono, letterSpacing: '0.08em' }}
            >
              📖 Book
            </button>
            <button
              onClick={() => handleVote('SCREEN')}
              disabled={isSubmitting}
              className={`w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold ${RADIUS.control} hover:bg-white hover:dark:bg-black hover:text-black hover:dark:text-white border ${BORDERS.solid} transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base uppercase tracking-wider`}
              style={{ fontFamily: FONTS.mono, letterSpacing: '0.08em' }}
            >
              🎬 Screen
            </button>
            <button
              onClick={() => handleVote('TIE')}
              disabled={isSubmitting}
              className={`w-full py-3 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 hover:dark:bg-stone-800 text-black dark:text-white font-bold ${RADIUS.control} border ${BORDERS.subtle} transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider`}
              style={{ fontFamily: FONTS.mono, letterSpacing: '0.08em' }}
            >
              Both were equally good
            </button>
          </div>

          <p className={`${TEXT.secondary} text-center ${TEXT.mutedMedium} font-bold`} style={{ fontFamily: FONTS.mono }}>
            1-tap to vote. Faithfulness rating optional.
          </p>
        </div>
      </div>
    </div>
  );
}
