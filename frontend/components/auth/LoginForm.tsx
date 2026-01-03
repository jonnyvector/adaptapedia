'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

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

      // Use window.location.href for full page reload to ensure proper hydration
      window.location.href = redirectTo;
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
        <div className={`bg-red-50 dark:bg-red-950 border ${BORDERS.medium} border-red-500/40 dark:border-red-400/40 text-red-700 dark:text-red-300 px-3 sm:px-4 py-3 rounded-md text-sm sm:text-base`} style={{ fontFamily: FONTS.sans }}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className={`block ${TEXT.secondary} font-bold mb-2 text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
          Username
        </label>
        <input
          type="text"
          id="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
          className={`w-full px-3 py-3 ${TEXT.body} border ${BORDERS.medium} rounded-md focus:outline-none focus:border-black focus:dark:border-white min-h-[44px] bg-white dark:bg-black text-black dark:text-white`}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
          disabled={isSubmitting}
          autoComplete="username"
        />
      </div>

      <div>
        <label htmlFor="password" className={`block ${TEXT.secondary} font-bold mb-2 text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
          Password
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          className={`w-full px-3 py-3 ${TEXT.body} border ${BORDERS.medium} rounded-md focus:outline-none focus:border-black focus:dark:border-white min-h-[44px] bg-white dark:bg-black text-black dark:text-white`}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
          disabled={isSubmitting}
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md font-bold hover:bg-black/90 hover:dark:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px] border ${BORDERS.solid} ${TEXT.secondary} ${monoUppercase}`}
        style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
      >
        {isSubmitting && <LoadingSpinner size="sm" />}
        {isSubmitting ? 'Logging in...' : 'Log In'}
      </button>

      <p className={`text-center ${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.sans }}>
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-black dark:text-white hover:opacity-70 transition-opacity font-bold">
          Sign up
        </Link>
      </p>
    </form>
  );
}
