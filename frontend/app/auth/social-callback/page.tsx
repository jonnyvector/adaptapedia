'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { api, tokenManager } from '@/lib/api';

function SocialCallbackContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const access = searchParams.get('access');
      const refresh = searchParams.get('refresh');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(errorParam === 'auth_failed' ? 'Authentication failed. Please try again.' : 'An error occurred during login.');
        setTimeout(() => router.push('/auth/login'), 3000);
        return;
      }

      if (access && refresh) {
        try {
          // Store tokens with correct key names
          tokenManager.setToken(access);
          localStorage.setItem('refreshToken', refresh);

          // Set auth cookie for server actions
          const { setAuthCookie } = await import('@/app/actions/auth');
          await setAuthCookie(access);

          // Fetch and store user data
          const user = await api.auth.getCurrentUser();
          localStorage.setItem('user', JSON.stringify(user));

          // Redirect to home page with full reload to trigger auth context
          window.location.href = '/';
        } catch (err) {
          console.error('Error completing social login:', err);
          setError('Failed to complete login. Please try again.');
          setTimeout(() => router.push('/auth/login'), 3000);
        }
      } else {
        setError('Missing authentication tokens');
        setTimeout(() => router.push('/auth/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-950 border-2 border-red-500/40 text-red-700 dark:text-red-300 px-6 py-4 rounded-md max-w-md text-center">
          <p className="font-bold mb-2">Login Error</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-3 opacity-75">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-muted">Completing login...</p>
    </div>
  );
}

export default function SocialCallbackPage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <SocialCallbackContent />
    </Suspense>
  );
}
