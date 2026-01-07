'use client';

import { useState, useEffect } from 'react';
import { BORDERS, RADIUS } from '@/lib/brutalist-design';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle(): JSX.Element {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  // Get the actual display theme (resolving 'system' to light/dark)
  const getDisplayTheme = (t: Theme): 'light' | 'dark' => {
    if (t === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return t;
  };

  // Apply theme to DOM
  const applyTheme = (newTheme: Theme) => {
    if (newTheme === 'system') {
      // Check system preference and set data-theme accordingly
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      // Explicitly set light or dark
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  // Handle hydration - only run client-side code after mount
  useEffect(() => {
    setMounted(true);

    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('adaptapedia-theme') as Theme | null;
    const initialTheme = savedTheme || 'system';

    setTheme(initialTheme);
    applyTheme(initialTheme);

    // Listen for system theme changes if using system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentTheme = localStorage.getItem('adaptapedia-theme') as Theme | null;
      if (!currentTheme || currentTheme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = (): void => {
    const currentDisplay = getDisplayTheme(theme);
    const newTheme: Theme = currentDisplay === 'light' ? 'dark' : 'light';

    setTheme(newTheme);
    applyTheme(newTheme);

    // Persist to localStorage
    localStorage.setItem('adaptapedia-theme', newTheme);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <button
        className={`px-2 py-1 sm:px-2 sm:py-1.5 flex items-center justify-center border ${BORDERS.subtle} bg-transparent ${RADIUS.control}`}
        aria-label="Toggle theme"
        disabled
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-4 h-4 opacity-0"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      </button>
    );
  }

  const displayTheme = getDisplayTheme(theme);

  return (
    <button
      onClick={toggleTheme}
      className={`px-2 py-1 sm:px-2 sm:py-1.5 text-black dark:text-white hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black transition-all flex items-center justify-center border ${BORDERS.subtle} bg-transparent ${RADIUS.control}`}
      aria-label={`Switch to ${displayTheme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${displayTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {displayTheme === 'light' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      )}
    </button>
  );
}
