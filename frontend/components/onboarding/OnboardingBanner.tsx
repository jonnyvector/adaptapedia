'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FONTS, BORDERS, TEXT, monoUppercase, RADIUS } from '@/lib/brutalist-design';
import { useAuth } from '@/lib/auth-context';

export default function OnboardingBanner(): JSX.Element | null {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Don't show banner while loading, if not authenticated, if onboarding is complete,
  // or if on onboarding/auth pages
  if (
    isLoading ||
    !isAuthenticated ||
    !user ||
    user.onboarding_completed ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/auth')
  ) {
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
          className={`px-4 py-2 bg-white dark:bg-black text-black dark:text-white border ${BORDERS.medium} ${RADIUS.control} font-bold hover:bg-gray-100 hover:dark:bg-gray-900 transition-colors ${TEXT.metadata} ${monoUppercase}`}
          style={{ fontFamily: FONTS.mono }}
        >
          Continue Setup →
        </Link>
      </div>
    </div>
  );
}
