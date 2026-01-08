'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UsernameStep from '@/components/onboarding/UsernameStep';
import QuizStep from '@/components/onboarding/QuizStep';
import SuggestionsStep from '@/components/onboarding/SuggestionsStep';
import { setUsername, savePreferences } from '@/lib/onboarding-utils';
import type { UserPreferences } from '@/lib/types';

export default function OnboardingPage(): JSX.Element {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({});

  const handleUsernameComplete = async (username: string) => {
    try {
      await setUsername(username);
      setCurrentStep(2);
    } catch (err) {
      console.error('Failed to set username:', err);
      alert('Failed to set username. Please try again.');
    }
  };

  const handleQuizComplete = async (prefs: Partial<UserPreferences>) => {
    setPreferences(prefs);
    try {
      await savePreferences(prefs);
      setCurrentStep(3);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      alert('Failed to save preferences. Please try again.');
    }
  };

  const handleQuizSkip = () => {
    setCurrentStep(3);
  };

  const handleComplete = () => {
    // TODO: Mark onboarding as complete via API
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
      {currentStep === 1 && <UsernameStep onComplete={handleUsernameComplete} />}
      {currentStep === 2 && <QuizStep onComplete={handleQuizComplete} onSkip={handleQuizSkip} />}
      {currentStep === 3 && (
        <SuggestionsStep
          onComplete={handleComplete}
          intent={preferences.contribution_interest}
        />
      )}
    </div>
  );
}
