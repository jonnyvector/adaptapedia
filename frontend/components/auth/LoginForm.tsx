'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface LoginFormProps {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo = '/' }: LoginFormProps): JSX.Element {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(formData);
      router.push(redirectTo);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Invalid username or password');
        } else if (err.detail && typeof err.detail === 'object') {
          const details = err.detail as Record<string, string[]>;
          const firstError = Object.values(details)[0]?.[0];
          setError(firstError || 'Login failed. Please try again.');
        } else {
          setError(err.message || 'Login failed. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 w-full max-w-md">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded text-sm sm:text-base">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
          className="w-full px-3 py-3 text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-link/50 min-h-[44px] bg-surface text-foreground"
          disabled={isSubmitting}
          autoComplete="username"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          className="w-full px-3 py-3 text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-link/50 min-h-[44px] bg-surface text-foreground"
          disabled={isSubmitting}
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-link text-white rounded-lg font-medium hover:bg-link/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px]"
      >
        {isSubmitting && <LoadingSpinner size="sm" />}
        {isSubmitting ? 'Logging in...' : 'Log In'}
      </button>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-link hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
