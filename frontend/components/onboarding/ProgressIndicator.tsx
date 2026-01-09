'use client';

import { FONTS, TEXT, monoUppercase, RADIUS} from '@/lib/brutalist-design';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps): JSX.Element {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <div className={`${TEXT.secondary} ${TEXT.mutedMedium} font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono }}>
        Step {currentStep} of {totalSteps}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`w-8 h-1 ${
              i < currentStep ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
