'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SignupForm from '@/components/auth/SignupForm';
import AuthPageWrapper from '@/components/auth/AuthPageWrapper';

function SignupPageContent(): JSX.Element {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  return (
    <AuthPageWrapper
      title="Create an account"
      subtitle="Join the Adaptapedia community"
    >
      <SignupForm redirectTo={redirectTo} />
    </AuthPageWrapper>
  );
}

export default function SignupPage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  );
}
