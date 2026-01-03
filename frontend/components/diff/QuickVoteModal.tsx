'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { Work, ScreenWork } from '@/lib/types';
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
        className="bg-white dark:bg-surface rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-surface border-b border-gray-200 dark:border-border p-4 flex items-center justify-between z-10">
          <h2 id="vote-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">
            Quick Vote
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
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
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Step 1 of 2</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Which did you prefer?
                </h3>
              </div>

              <button
                onClick={() => handlePreferenceSelect('BOOK')}
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <span className="text-2xl group-hover:text-white">📖</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">Book</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{work.title}</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handlePreferenceSelect('SCREEN')}
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <span className="text-2xl group-hover:text-white">🎬</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {screenWork.type === 'MOVIE' ? 'Movie' : 'TV Series'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{screenWork.title}</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handlePreferenceSelect('TIE')}
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center"
              >
                <div className="font-medium text-gray-700 dark:text-gray-300">Both were equally good</div>
              </button>
            </div>
          )}

          {/* Step 2: Faithfulness */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2"
                >
                  ← Back
                </button>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Step 2 of 2 (Optional)</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  How faithful was the adaptation?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  1 = Completely different · 5 = Nearly identical
                </p>
              </div>

              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFaithfulness(rating)}
                    className={`w-14 h-14 rounded-full font-bold text-lg transition-all ${
                      faithfulness === rating
                        ? 'bg-blue-500 text-white scale-110 shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    aria-label={`Rate faithfulness ${rating} out of 5`}
                  >
                    {rating}
                  </button>
                ))}
              </div>

              {/* Optional checkboxes */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-3">
                  Help us improve accuracy (optional)
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasReadBook}
                    onChange={(e) => setHasReadBook(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">I've read the book</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasWatchedAdaptation}
                    onChange={(e) => setHasWatchedAdaptation(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">I've watched the adaptation</span>
                </label>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Vote'}
              </button>

              <button
                onClick={handleSubmit}
                className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
