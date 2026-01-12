'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FONTS, BORDERS, TEXT, monoUppercase, RADIUS } from '@/lib/brutalist-design';
import { useAuth } from '@/lib/auth-context';
import { XMarkIcon } from '@/components/ui/Icons';

export default function OnboardingBanner(): JSX.Element | null {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage for dismissed state (user-specific)
  useEffect(() => {
    if (user?.id) {
      const dismissed = localStorage.getItem(`onboarding-banner-dismissed-${user.id}`);
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    }
  }, [user?.id]);

  // Don't show banner while loading, if not authenticated, if onboarding is complete,
  // if dismissed, or if on onboarding/auth pages
  if (
    isLoading ||
    !isAuthenticated ||
    !user ||
    user.onboarding_completed ||
    isDismissed ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/auth')
  ) {
    return null;
  }

  const handleDismiss = () => {
    if (user?.id) {
      localStorage.setItem(`onboarding-banner-dismissed-${user.id}`, 'true');
      setIsDismissed(true);
    }
  };

  return (
    <div className={`bg-black dark:bg-white text-white dark:text-black py-3 border-b ${BORDERS.solid} relative`}>
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-10 sm:pr-0">
          <p className={`${TEXT.secondary} font-bold ${monoUppercase} flex-1`} style={{ fontFamily: FONTS.mono }}>
            Complete your profile to get personalized recommendations
          </p>
          <Link
            href="/onboarding"
            className={`px-4 py-2 bg-white dark:bg-black text-black dark:text-white border ${BORDERS.medium} ${RADIUS.control} font-bold hover:bg-gray-100 hover:dark:bg-gray-900 transition-colors ${TEXT.metadata} ${monoUppercase} text-center sm:whitespace-nowrap`}
            style={{ fontFamily: FONTS.mono }}
          >
            Continue Setup →
          </Link>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-4 p-2 hover:bg-white/10 dark:hover:bg-black/10 transition-colors rounded"
          aria-label="Dismiss banner"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
