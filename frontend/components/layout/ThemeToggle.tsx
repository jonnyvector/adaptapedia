'use client';

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export default function ThemeToggle(): JSX.Element {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Handle hydration - only run client-side code after mount
  useEffect(() => {
    setMounted(true);

    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('adaptapedia-theme') as Theme | null;

    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      // Default to light
      setTheme('light');
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleTheme = (): void => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Update DOM
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

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
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-2 text-sm border border-border rounded hover:bg-muted/10 transition-colors min-h-[40px] flex items-center gap-2"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
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
