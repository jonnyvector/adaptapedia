'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ThemeToggle from './ThemeToggle';

export default function Header(): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isHomePage = pathname === '/';
  const isSearchPage = pathname === '/search';
  const isModerator = user && (user.role === 'MOD' || user.role === 'ADMIN');

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md transition-shadow duration-200 ${
        isSticky ? 'shadow-md' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3 sm:py-4 gap-3 sm:gap-4">
          {/* Logo/Home Link */}
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold text-foreground hover:text-link transition-colors flex-shrink-0"
            aria-label="Adaptapedia Home"
          >
            Adaptapedia
          </Link>

          {/* Search Bar - Hidden on home and search pages */}
          {!isHomePage && !isSearchPage && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books and adaptations..."
                className="w-full px-3 py-2 text-sm bg-surface text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-link min-h-[40px]"
                aria-label="Search"
              />
            </form>
          )}

          {/* Navigation & Actions */}
          <nav className="flex items-center gap-2 sm:gap-3">
            {/* Main Navigation Links */}
            <Link
              href="/search"
              className="hidden sm:inline text-sm px-3 py-2 text-muted hover:text-link transition-colors min-h-[40px] flex items-center"
            >
              Search
            </Link>

            {/* Moderator Queue Link */}
            {isModerator && (
              <Link
                href="/mod/queue"
                className="hidden sm:inline text-sm px-3 py-2 text-muted hover:text-link transition-colors min-h-[40px] flex items-center"
                title="Moderation Queue"
              >
                Mod Queue
              </Link>
            )}

            {/* About Link */}
            <Link
              href="/about"
              className="hidden sm:inline text-sm px-3 py-2 text-muted hover:text-link transition-colors min-h-[40px] flex items-center"
            >
              About
            </Link>

            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Auth Section */}
            {!mounted ? (
              <div className="w-16 h-10" />
            ) : isAuthenticated && user ? (
              <>
                <Link
                  href={`/u/${user.username}`}
                  className="text-sm px-3 py-2 text-muted hover:text-link transition-colors hidden lg:flex items-center min-h-[40px]"
                  title={`View ${user.username}'s profile`}
                >
                  {user.username}
                </Link>
                <Link
                  href="/auth/logout"
                  className="text-sm px-3 py-2 bg-surface border border-border rounded-md hover:bg-surface2 transition-colors min-h-[40px] flex items-center"
                >
                  Logout
                </Link>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm px-3 py-2 bg-link text-white rounded-md hover:bg-link-hover transition-colors min-h-[40px] flex items-center"
              >
                Login
              </Link>
            )}

            {/* Mobile Theme Toggle */}
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
          </nav>
        </div>

        {/* Mobile Search Bar - Show on non-home/search pages */}
        {!isHomePage && !isSearchPage && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="w-full">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books and adaptations..."
                className="w-full px-3 py-2 text-sm bg-surface text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-link min-h-[40px]"
                aria-label="Search"
              />
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
