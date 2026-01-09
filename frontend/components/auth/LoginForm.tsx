'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ApiError, getBackendUrl } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';

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
        <div className={`bg-red-50 dark:bg-red-950 border ${BORDERS.medium} border-red-500/40 dark:border-red-400/40 text-red-700 dark:text-red-300 px-3 sm:px-4 py-3 ${RADIUS.control} text-sm sm:text-base`} style={{ fontFamily: FONTS.mono }}>
          {error}
        </div>
      )}

      <Input
        type="text"
        id="username"
        label="Username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        required
        disabled={isSubmitting}
        autoComplete="username"
      />

      <Input
        type="password"
        id="password"
        label="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
        disabled={isSubmitting}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        loading={isSubmitting}
        size="lg"
        fullWidth
      >
        {isSubmitting ? 'Logging in...' : 'Log In'}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className={`w-full border-t ${BORDERS.medium}`}></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className={`bg-white dark:bg-black px-2 ${TEXT.mutedMedium} font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          onClick={() => window.location.href = `${getBackendUrl()}/accounts/google/login/`}
          variant="secondary"
          size="lg"
          fullWidth
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className={monoUppercase}>Continue with Google</span>
        </Button>

        <Button
          type="button"
          onClick={() => window.location.href = `${getBackendUrl()}/accounts/facebook/login/`}
          disabled={true}
          variant="secondary"
          size="lg"
          fullWidth
          title="Facebook login coming soon"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className={monoUppercase}>Continue with Facebook</span>
        </Button>
      </div>

      <p className={`text-center ${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-black dark:text-white hover:opacity-70 transition-opacity font-bold">
          Sign up
        </Link>
      </p>
    </form>
  );
}
