'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { Work, ScreenWork } from '@/lib/types';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';
// Simple X icon component
const XIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface QuickVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  work: Work;
  screenWork: ScreenWork;
  onVoteSubmitted?: () => void;
}

type PreferenceChoice = 'BOOK' | 'SCREEN' | 'TIE';

export default function QuickVoteModal({
  isOpen,
  onClose,
  work,
  screenWork,
  onVoteSubmitted,
}: QuickVoteModalProps): JSX.Element | null {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [preference, setPreference] = useState<PreferenceChoice | null>(null);
  const [faithfulness, setFaithfulness] = useState<number | null>(null);
  const [hasReadBook, setHasReadBook] = useState(false);
  const [hasWatchedAdaptation, setHasWatchedAdaptation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPreference(null);
      setFaithfulness(null);
      setHasReadBook(false);
      setHasWatchedAdaptation(false);
    }
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

  const handlePreferenceSelect = (choice: PreferenceChoice) => {
    setPreference(choice);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!preference) return;

    setIsSubmitting(true);
    try {
      // Import the server action
      const { submitComparisonVote } = await import('@/app/actions/comparison-votes');

      const result = await submitComparisonVote(
        work.id,
        screenWork.id,
        preference,
        faithfulness || undefined
      );

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vote-modal-title"
    >
      <div
        className={`bg-white dark:bg-black rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border ${BORDERS.medium}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 bg-white dark:bg-black border-b ${BORDERS.subtle} p-4 flex items-center justify-between z-10`}>
          <h2 id="vote-modal-title" className={`text-base font-bold text-black dark:text-white uppercase tracking-wider`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.1em' }}>
            Quick Vote
          </h2>
          <button
            onClick={onClose}
            className={`p-2 hover:bg-stone-100 hover:dark:bg-stone-900 ${RADIUS.control} transition-colors`}
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Preference */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className={`${TEXT.body} ${TEXT.mutedMedium} mb-2 font-bold`} style={{ fontFamily: FONTS.mono }}>Step 1 of 2</p>
                <h3 className={`text-lg font-bold text-black dark:text-white uppercase tracking-wider`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.08em' }}>
                  Which did you prefer?
                </h3>
              </div>

              <button
                onClick={() => handlePreferenceSelect('BOOK')}
                className={`w-full p-4 border ${BORDERS.medium} ${RADIUS.control} hover:bg-stone-100 hover:dark:bg-stone-900 transition-all text-left group`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${RADIUS.control} bg-stone-200 dark:bg-stone-800 flex items-center justify-center group-hover:bg-black group-hover:dark:bg-white transition-colors`}>
                    <span className="text-2xl group-hover:text-white group-hover:dark:text-black">📖</span>
                  </div>
                  <div>
                    <div className={`font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>Book</div>
                    <div className={`${TEXT.body} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>{work.title}</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handlePreferenceSelect('SCREEN')}
                className={`w-full p-4 border ${BORDERS.medium} ${RADIUS.control} hover:bg-stone-100 hover:dark:bg-stone-900 transition-all text-left group`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${RADIUS.control} bg-stone-200 dark:bg-stone-800 flex items-center justify-center group-hover:bg-black group-hover:dark:bg-white transition-colors`}>
                    <span className="text-2xl group-hover:text-white group-hover:dark:text-black">🎬</span>
                  </div>
                  <div>
                    <div className={`font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>
                      {screenWork.type === 'MOVIE' ? 'Movie' : 'TV Series'}
                    </div>
                    <div className={`${TEXT.body} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>{screenWork.title}</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handlePreferenceSelect('TIE')}
                className={`w-full p-4 border ${BORDERS.medium} ${RADIUS.control} hover:bg-stone-100 hover:dark:bg-stone-900 transition-all text-center`}
              >
                <div className={`font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>Both were equally good</div>
              </button>
            </div>
          )}

          {/* Step 2: Faithfulness */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <button
                  onClick={() => setStep(1)}
                  className={`${TEXT.body} text-black dark:text-white hover:underline mb-2 font-bold`}
                  style={{ fontFamily: FONTS.mono }}
                >
                  ← Back
                </button>
                <p className={`${TEXT.body} ${TEXT.mutedMedium} mb-2 font-bold`} style={{ fontFamily: FONTS.mono }}>Step 2 of 2 (Optional)</p>
                <h3 className={`text-lg font-bold text-black dark:text-white uppercase tracking-wider`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.08em' }}>
                  How faithful was the adaptation?
                </h3>
                <p className={`${TEXT.body} ${TEXT.mutedMedium} mt-2 font-bold`} style={{ fontFamily: FONTS.mono }}>
                  1 = Completely different · 5 = Nearly identical
                </p>
              </div>

              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFaithfulness(rating)}
                    className={`w-14 h-14 ${RADIUS.control} font-bold text-base transition-all ${
                      faithfulness === rating
                        ? `bg-black dark:bg-white text-white dark:text-black scale-110 border ${BORDERS.solid}`
                        : `bg-stone-200 dark:bg-stone-800 text-black dark:text-white hover:bg-stone-300 hover:dark:bg-stone-700 border ${BORDERS.subtle}`
                    }`}
                    style={{ fontFamily: FONTS.mono }}
                    aria-label={`Rate faithfulness ${rating} out of 5`}
                  >
                    {rating}
                  </button>
                ))}
              </div>

              {/* Optional checkboxes */}
              <div className={`space-y-3 pt-4 border-t ${BORDERS.subtle}`}>
                <p className={`${TEXT.secondary} ${TEXT.mutedMedium} text-center mb-3 font-bold`} style={{ fontFamily: FONTS.mono }}>
                  Help us improve accuracy (optional)
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasReadBook}
                    onChange={(e) => setHasReadBook(e.target.checked)}
                    className={`w-4 h-4 ${RADIUS.control} border ${BORDERS.subtle}`}
                  />
                  <span className={`${TEXT.body} text-black dark:text-white font-bold`} style={{ fontFamily: FONTS.mono }}>I've read the book</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasWatchedAdaptation}
                    onChange={(e) => setHasWatchedAdaptation(e.target.checked)}
                    className={`w-4 h-4 ${RADIUS.control} border ${BORDERS.subtle}`}
                  />
                  <span className={`${TEXT.body} text-black dark:text-white font-bold`} style={{ fontFamily: FONTS.mono }}>I've watched the adaptation</span>
                </label>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:dark:bg-black hover:text-black hover:dark:text-white border ${BORDERS.solid} font-bold ${RADIUS.control} transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider`}
                style={{ fontFamily: FONTS.mono, letterSpacing: '0.08em' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Vote'}
              </button>

              <button
                onClick={handleSubmit}
                className={`w-full ${TEXT.body} ${TEXT.mutedMedium} hover:text-black hover:dark:text-white transition-colors font-bold`}
                style={{ fontFamily: FONTS.mono }}
              >
                Skip faithfulness rating →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
