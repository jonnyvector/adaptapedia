'use client';

import { FONTS, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';
import ProgressIndicator from './ProgressIndicator';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  onContinue?: () => void;
  onSkip?: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
}

export default function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  onBack,
  onContinue,
  onSkip,
  continueDisabled = false,
  continueLabel = 'Continue',
}: OnboardingLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
      <div className="w-full max-w-2xl">
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <div className={`bg-white dark:bg-black border ${BORDERS.solid} p-8 rounded-md`}>
          {children}
        </div>

        <div className="flex justify-between mt-6">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className={`px-6 py-3 border ${BORDERS.medium} rounded-md font-bold hover:bg-gray-100 hover:dark:bg-gray-900 transition-colors ${TEXT.secondary} ${monoUppercase}`}
                style={{ fontFamily: FONTS.mono }}
              >
                ← Back
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {onSkip && (
              <button
                onClick={onSkip}
                className={`px-6 py-3 border ${BORDERS.medium} rounded-md font-bold hover:bg-gray-100 hover:dark:bg-gray-900 transition-colors ${TEXT.secondary} ${monoUppercase}`}
                style={{ fontFamily: FONTS.mono }}
              >
                Skip
              </button>
            )}
            {onContinue && (
              <button
                onClick={onContinue}
                disabled={continueDisabled}
                className={`px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md font-bold hover:bg-black/90 hover:dark:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border ${BORDERS.solid} ${TEXT.secondary} ${monoUppercase}`}
                style={{ fontFamily: FONTS.mono }}
              >
                {continueLabel} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
