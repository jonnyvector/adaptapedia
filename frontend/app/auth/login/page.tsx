'use client';

// Force dynamic rendering - page uses client components with useSearchParams
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import AuthPageWrapper from '@/components/auth/AuthPageWrapper';
import { LoadingState } from '@/components/ui/LoadingState';

function LoginPageContent(): JSX.Element {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || searchParams.get('returnUrl') || '/';

  return (
    <AuthPageWrapper
      title="Welcome back"
      subtitle="Log in to your Adaptapedia account"
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthPageWrapper>
  );
}

export default function LoginPage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
