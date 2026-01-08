'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FONTS, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';
import { api } from '@/lib/api';

export default function OnboardingBanner(): JSX.Element | null {
  const [showBanner, setShowBanner] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const user = await api.auth.getCurrentUser();
        // Show banner if user is authenticated and onboarding not complete
        // Don't show on onboarding page itself or auth pages
        if (user && !user.onboarding_completed && !pathname.startsWith('/onboarding') && !pathname.startsWith('/auth')) {
          setShowBanner(true);
        }
      } catch (err) {
        // User not authenticated or error - don't show banner
        setShowBanner(false);
      }
    }

    checkOnboarding();
  }, [pathname]);

  if (!showBanner) {
    return null;
  }

  return (
    <div className={`bg-black dark:bg-white text-white dark:text-black py-3 px-4 border-b ${BORDERS.solid}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
        <p className={`${TEXT.secondary} font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono }}>
          Complete your profile to get personalized recommendations
        </p>
        <Link
          href="/onboarding"
          className={`px-4 py-2 bg-white dark:bg-black text-black dark:text-white border ${BORDERS.medium} rounded-md font-bold hover:bg-gray-100 hover:dark:bg-gray-900 transition-colors ${TEXT.metadata} ${monoUppercase}`}
          style={{ fontFamily: FONTS.mono }}
        >
          Continue Setup →
        </Link>
      </div>
    </div>
  );
}
