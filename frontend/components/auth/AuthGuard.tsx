'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FONTS, TEXT } from '@/lib/brutalist-design';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({
  children,
  requireAuth = true
}: AuthGuardProps): JSX.Element | null {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      // Store the current path to redirect back after login
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?redirect=${redirectUrl}`);
    }
  }, [isAuthenticated, isLoading, requireAuth, router, pathname]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black/20 dark:border-white/20 border-t-black dark:border-t-white align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className={`mt-4 ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, don't render children
  // (redirect is handled in useEffect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
