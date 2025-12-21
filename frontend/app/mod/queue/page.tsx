'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ModQueue from '@/components/mod/ModQueue';

export default function ModerationQueuePage(): JSX.Element {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/mod/queue');
        return;
      }

      const isModerator = user?.role === 'MOD' || user?.role === 'ADMIN';
      if (!isModerator) {
        router.push('/');
        return;
      }

      setIsAuthorized(true);
    }
  }, [user, isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <ModQueue />
    </main>
  );
}
