'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import AuthPageWrapper from '@/components/auth/AuthPageWrapper';

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
        <p className="text-muted">Loading...</p>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
