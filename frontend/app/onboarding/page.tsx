'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UsernameStep from '@/components/onboarding/UsernameStep';
import QuizStep from '@/components/onboarding/QuizStep';
import SuggestionsStep from '@/components/onboarding/SuggestionsStep';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { setUsername, savePreferences, completeOnboarding } from '@/lib/onboarding-utils';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/useToast';
import type { UserPreferences } from '@/lib/types';
import { analytics } from '@/lib/analytics';

export default function OnboardingPage(): JSX.Element {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({});

  // Check current user and determine starting step
  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) {
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    // If onboarding already completed, redirect home
    if (user.onboarding_completed) {
      router.push('/');
      return;
    }

    // Determine starting step based on onboarding_step
    // If username is temp (starts with provider name), need step 1
    if (user.username.startsWith('google_') || user.username.startsWith('facebook_')) {
      setCurrentStep(1);
    } else {
      // Username already set, start at step 2
      setCurrentStep(Math.max(2, user.onboarding_step || 2));
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleUsernameComplete = async (username: string) => {
    try {
      await setUsername(username);
      // Refresh user data to get updated username
      await refreshUser();
      setCurrentStep(2);
    } catch (err) {
      console.error('Failed to set username:', err);
      showToast('Failed to set username. Please try again.', 'error');
    }
  };

  const handleQuizComplete = async (prefs: Partial<UserPreferences>) => {
    setPreferences(prefs);
    try {
      await savePreferences(prefs);
      setCurrentStep(3);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      showToast('Failed to save preferences. Please try again.', 'error');
    }
  };

  const handleQuizSkip = () => {
    setCurrentStep(3);
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding();

      // Track onboarding completion
      analytics.trackOnboardingComplete({
        stepsCompleted: 3,
      });

      // Refresh user data to update onboarding status
      await refreshUser();
      router.push('/');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      showToast('Failed to complete onboarding. Please try again.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
      <ToastContainer />
    </div>
  );
}
