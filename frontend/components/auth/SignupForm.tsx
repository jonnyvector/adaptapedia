'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

interface SignupFormProps {
  redirectTo?: string;
}

export default function SignupForm({ redirectTo = '/' }: SignupFormProps): JSX.Element {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(formData);

      // Handle hash fragments in redirect URL
      // Use window.location for hash fragments to ensure proper scrolling
      if (redirectTo.includes('#')) {
        window.location.href = redirectTo;
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.detail && typeof err.detail === 'object') {
          const apiErrors = err.detail as Record<string, string[]>;
          const formattedErrors: Record<string, string> = {};
          Object.entries(apiErrors).forEach(([key, messages]) => {
            formattedErrors[key] = messages[0];
          });
          setErrors(formattedErrors);
        } else {
          setErrors({ general: err.message || 'Signup failed. Please try again.' });
        }
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 w-full max-w-md">
      {errors.general && (
        <div className={`bg-red-50 dark:bg-red-950 border ${BORDERS.medium} border-red-500/40 dark:border-red-400/40 text-red-700 dark:text-red-300 px-3 sm:px-4 py-3 rounded-md text-sm sm:text-base`} style={{ fontFamily: FONTS.mono }}>
          {errors.general}
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
          className={`w-full px-3 py-3 ${TEXT.body} border ${errors.username ? 'border-red-500 dark:border-red-400' : BORDERS.medium} rounded-md focus:outline-none focus:border-black focus:dark:border-white min-h-[44px] bg-white dark:bg-black text-black dark:text-white`}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
          disabled={isSubmitting}
          autoComplete="username"
        />
        {errors.username && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400" style={{ fontFamily: FONTS.mono }}>{errors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className={`block ${TEXT.secondary} font-bold mb-2 text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className={`w-full px-3 py-3 ${TEXT.body} border ${errors.email ? 'border-red-500 dark:border-red-400' : BORDERS.medium} rounded-md focus:outline-none focus:border-black focus:dark:border-white min-h-[44px] bg-white dark:bg-black text-black dark:text-white`}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
          disabled={isSubmitting}
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400" style={{ fontFamily: FONTS.mono }}>{errors.email}</p>
        )}
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
          className={`w-full px-3 py-3 ${TEXT.body} border ${errors.password ? 'border-red-500 dark:border-red-400' : BORDERS.medium} rounded-md focus:outline-none focus:border-black focus:dark:border-white min-h-[44px] bg-white dark:bg-black text-black dark:text-white`}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
          disabled={isSubmitting}
          autoComplete="new-password"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400" style={{ fontFamily: FONTS.mono }}>{errors.password}</p>
        )}
        <p className={`mt-1 ${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
          Must be at least 8 characters
        </p>
      </div>

      <div>
        <label htmlFor="password_confirm" className={`block ${TEXT.secondary} font-bold mb-2 text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
          Confirm Password
        </label>
        <input
          type="password"
          id="password_confirm"
          value={formData.password_confirm}
          onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
          required
          className={`w-full px-3 py-3 ${TEXT.body} border ${errors.password_confirm ? 'border-red-500 dark:border-red-400' : BORDERS.medium} rounded-md focus:outline-none focus:border-black focus:dark:border-white min-h-[44px] bg-white dark:bg-black text-black dark:text-white`}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
          disabled={isSubmitting}
          autoComplete="new-password"
        />
        {errors.password_confirm && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400" style={{ fontFamily: FONTS.mono }}>{errors.password_confirm}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md font-bold hover:bg-black/90 hover:dark:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px] border ${BORDERS.solid} ${TEXT.secondary} ${monoUppercase}`}
        style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
      >
        {isSubmitting && <LoadingSpinner size="sm" />}
        {isSubmitting ? 'Creating account...' : 'Sign Up'}
      </button>

      <p className={`text-center ${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
        Already have an account?{' '}
        <Link href="/auth/login" className="text-black dark:text-white hover:opacity-70 transition-opacity font-bold">
          Log in
        </Link>
      </p>
    </form>
  );
}
