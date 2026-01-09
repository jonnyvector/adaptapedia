'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FONTS, LETTER_SPACING, TEXT, monoUppercase, RADIUS} from '@/lib/brutalist-design';
import { LoadingState } from '@/components/ui/LoadingState';

interface AuthPageWrapperProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function AuthPageContent({ title, subtitle, children }: AuthPageWrapperProps): JSX.Element {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const redirectTo = searchParams.get('redirect') || searchParams.get('returnUrl') || '/';

  // If user is already authenticated, show message
  // LoginForm/SignupForm will handle the actual redirect after authentication
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={`${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>Already logged in...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>{title}</h1>
          <p className={`${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AuthPageWrapper(props: AuthPageWrapperProps): JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState />
      </div>
    }>
      <AuthPageContent {...props} />
    </Suspense>
  );
}
