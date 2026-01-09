'use client';

import { useState, useEffect, useRef } from 'react';
import { FONTS, BORDERS, TEXT, monoUppercase, RADIUS } from '@/lib/brutalist-design';
import { validateUsernameFormat, checkUsername } from '@/lib/onboarding-utils';
import type { UsernameCheckResponse } from '@/lib/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface UsernameStepProps {
  onComplete: (username: string) => void;
}

export default function UsernameStep({ onComplete }: UsernameStepProps): JSX.Element {
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<UsernameCheckResponse | null>(null);
  const [error, setError] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced username check
  const debouncedCheck = (value: string): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (value.length < 3) return;

      setChecking(true);
      try {
        const result = await checkUsername(value);
        setCheckResult(result);
      } catch (err) {
        setError('Failed to check username availability');
      } finally {
        setChecking(false);
      }
    }, 300);
  };

  useEffect(() => {
    setError('');
    setCheckResult(null);

    // Client-side format validation
    const formatCheck = validateUsernameFormat(username);
    if (username && !formatCheck.valid) {
      setError(formatCheck.error || 'Invalid format');
      return;
    }

    // Server-side availability check
    if (username.length >= 3) {
      debouncedCheck(username);
    }
  }, [username]);

  const handleSuggestionClick = (suggestion: string) => {
    setUsername(suggestion);
  };

  const handleContinue = () => {
    if (checkResult?.available) {
      onComplete(username);
    }
  };

  const isValid = checkResult?.available && !error;

  return (
    <div>
      <h1 className={`text-2xl font-bold mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono }}>
        Welcome to Adaptapedia!
      </h1>
      <p className={`${TEXT.body} ${TEXT.mutedMedium} mb-6`} style={{ fontFamily: FONTS.mono }}>
        Choose your username
      </p>

      <div className="mb-4">
        <label htmlFor="username-input" className="sr-only">
          Username
        </label>
        <input
          id="username-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          aria-label="Choose your username"
          aria-describedby="username-feedback"
          aria-invalid={!!error}
          aria-required="true"
          className={`w-full px-4 py-3 ${TEXT.body} border ${
            error
              ? 'border-red-500 dark:border-red-400'
              : checkResult?.available
              ? 'border-green-500 dark:border-green-400'
              : BORDERS.medium
          } ${RADIUS.control} focus:outline-none focus:border-black focus:dark:border-white bg-white dark:bg-black text-black dark:text-white`}
          style={{ fontFamily: FONTS.mono }}
        />

        <div
          id="username-feedback"
          className="mt-2 min-h-[24px] flex items-center gap-2"
          aria-live="polite"
          aria-atomic="true"
        >
          {checking && (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm" style={{ fontFamily: FONTS.mono }}>Checking availability...</span>
            </div>
          )}
          {!checking && error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert" style={{ fontFamily: FONTS.mono }}>
              ✗ {error}
            </p>
          )}
          {!checking && checkResult?.available && (
            <p className="text-sm text-green-600 dark:text-green-400" role="status" style={{ fontFamily: FONTS.mono }}>
              ✓ Available
            </p>
          )}
          {!checking && checkResult && !checkResult.available && checkResult.message && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert" style={{ fontFamily: FONTS.mono }}>
              ✗ {checkResult.message}
            </p>
          )}
        </div>
      </div>

      {checkResult?.suggestions && checkResult.suggestions.length > 0 && (
        <div className="mb-6">
          <p className={`text-sm ${TEXT.mutedMedium} mb-2 font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono }}>
            Suggestions:
          </p>
          <div className="flex flex-wrap gap-2">
            {checkResult.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-3 py-2 border ${BORDERS.medium} ${RADIUS.control} text-sm hover:bg-gray-100 hover:dark:bg-gray-900 transition-colors`}
                style={{ fontFamily: FONTS.mono }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleContinue}
        disabled={!isValid}
        className={`w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black ${RADIUS.control} font-bold hover:bg-black/90 hover:dark:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border ${BORDERS.solid} ${TEXT.secondary} ${monoUppercase}`}
        style={{ fontFamily: FONTS.mono }}
      >
        Continue →
      </button>
    </div>
  );
}
