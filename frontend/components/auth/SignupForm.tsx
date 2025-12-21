'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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
      router.push(redirectTo);
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded text-sm sm:text-base">
          {errors.general}
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
          className={`w-full px-3 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-link/50 min-h-[44px] bg-surface text-foreground ${
            errors.username ? 'border-red-500' : 'border-border'
          }`}
          disabled={isSubmitting}
          autoComplete="username"
        />
        {errors.username && (
          <p className="mt-1 text-xs text-red-600">{errors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className={`w-full px-3 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-link/50 min-h-[44px] bg-surface text-foreground ${
            errors.email ? 'border-red-500' : 'border-border'
          }`}
          disabled={isSubmitting}
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email}</p>
        )}
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
          className={`w-full px-3 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-link/50 min-h-[44px] bg-surface text-foreground ${
            errors.password ? 'border-red-500' : 'border-border'
          }`}
          disabled={isSubmitting}
          autoComplete="new-password"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password}</p>
        )}
        <p className="mt-1 text-xs text-muted">
          Must be at least 8 characters
        </p>
      </div>

      <div>
        <label htmlFor="password_confirm" className="block text-sm font-medium mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          id="password_confirm"
          value={formData.password_confirm}
          onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
          required
          className={`w-full px-3 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-link/50 min-h-[44px] bg-surface text-foreground ${
            errors.password_confirm ? 'border-red-500' : 'border-border'
          }`}
          disabled={isSubmitting}
          autoComplete="new-password"
        />
        {errors.password_confirm && (
          <p className="mt-1 text-xs text-red-600">{errors.password_confirm}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-link text-white rounded-lg font-medium hover:bg-link/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px]"
      >
        {isSubmitting && <LoadingSpinner size="sm" />}
        {isSubmitting ? 'Creating account...' : 'Sign Up'}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-link hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
