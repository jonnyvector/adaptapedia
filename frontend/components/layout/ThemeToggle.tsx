'use client';

import { useState, useEffect } from 'react';

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
    const displayTheme = newTheme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : newTheme;

    if (displayTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
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
        className="px-3 py-2 text-sm border border-border rounded hover:bg-muted/10 transition-colors min-h-[44px]"
        aria-label="Toggle theme"
        disabled
      >
        <span className="opacity-0">🌙</span>
      </button>
    );
  }

  const displayTheme = getDisplayTheme(theme);

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-2 text-sm border border-border rounded hover:bg-muted/10 transition-colors min-h-[40px] flex items-center gap-2"
      aria-label={`Switch to ${displayTheme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${displayTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {displayTheme === 'light' ? (
        <>
          <span className="text-base" aria-hidden="true">🌙</span>
          <span className="hidden lg:inline">Dark</span>
        </>
      ) : (
        <>
          <span className="text-base" aria-hidden="true">☀️</span>
          <span className="hidden lg:inline">Light</span>
        </>
      )}
    </button>
  );
}
