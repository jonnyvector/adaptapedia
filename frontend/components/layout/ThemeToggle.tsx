'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { BrutalistMoonIcon, BrutalistSunIcon } from '@/components/ui/Icons';
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
      <Button
        variant="ghost"
        size="sm"
        className={`p-2 md:p-0 md:px-1 md:py-1.5 min-h-0 h-auto md:bg-transparent`}
        aria-label="Toggle theme"
        disabled
      >
        <BrutalistMoonIcon className="w-5 h-5 opacity-0" />
      </Button>
    );
  }

  const displayTheme = getDisplayTheme(theme);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`p-2 md:p-0 md:px-1 md:py-1.5 min-h-0 h-auto md:bg-transparent opacity-70 hover:opacity-100 transition-opacity`}
      aria-label={`Switch to ${displayTheme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${displayTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {displayTheme === 'light' ? (
        <BrutalistMoonIcon className="w-5 h-5" />
      ) : (
        <BrutalistSunIcon className="w-5 h-5" />
      )}
    </Button>
  );
}
