'use client';

// Force dynamic rendering - page uses client components with useSearchParams
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';

export default function LogoutPage(): JSX.Element {
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const handleCancel = (): void => {
    router.back();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">Log out</h1>
        <p className="text-muted mb-8">
          Are you sure you want to log out of your account?
        </p>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="danger"
            size="lg"
          >
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </Button>

          <Button
            onClick={handleCancel}
            disabled={isLoggingOut}
            variant="secondary"
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
