'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';
import NotificationBell from './NotificationBell';
import SearchDropdown from '@/components/search/SearchDropdown';
import { api } from '@/lib/api';
import type { SearchWithAdaptationsResponse } from '@/lib/types';

export default function Header(): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchWithAdaptationsResponse | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const justSubmittedRef = useRef(false);
  const isHomePage = pathname === '/';
  const isSearchPage = pathname === '/search';
  const isModerator = user && (user.role === 'MOD' || user.role === 'ADMIN');

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch search results for dropdown (debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const results = await api.works.searchWithAdaptations(searchQuery, 5);
          setSearchResults(results);
          setShowDropdown(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults(null);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const isOutsideDesktop = desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node);
      const isOutsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node);

      // Only close if click is outside both search refs
      if (isOutsideDesktop && isOutsideMobile) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown when pathname changes (navigation occurred)
  useEffect(() => {
    setShowDropdown(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      setShowDropdown(false);
      justSubmittedRef.current = true;

      // Reset the flag after a short delay
      setTimeout(() => {
        justSubmittedRef.current = false;
      }, 500);

      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleResultClick = (): void => {
    // Don't close immediately - let navigation happen first
    // Dropdown will close when component unmounts on page change
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
      className={`sticky top-0 z-50 border-b border-border backdrop-blur-md transition-shadow duration-200 ${
        isSticky ? 'shadow-md' : ''
      } ${
        isHomePage ? 'bg-transparent' : 'bg-surface/80'
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between py-2 gap-2 sm:gap-3">
          {/* Logo/Home Link */}
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold text-foreground hover:text-link transition-colors flex-shrink-0"
            aria-label="Book vs. Movie Home"
          >
            Book vs. Movie
          </Link>

          {/* Search Bar - Hidden on home and search pages */}
          {!isHomePage && !isSearchPage && (
            <div className="hidden md:flex flex-1 max-w-md mx-4 relative" ref={desktopSearchRef}>
              <form onSubmit={handleSearch} className="w-full">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (!justSubmittedRef.current && searchQuery.length >= 2) {
                      setShowDropdown(true);
                    }
                  }}
                  placeholder="Search books and adaptations..."
                  className="w-full px-3 py-2 text-sm bg-surface text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-link min-h-[40px]"
                  aria-label="Search"
                />
              </form>

              {/* Dropdown results */}
              {showDropdown && (
                <SearchDropdown
                  results={searchResults}
                  isLoading={isSearching}
                  query={searchQuery}
                  onResultClick={handleResultClick}
                />
              )}
            </div>
          )}

          {/* Navigation & Actions */}
          <nav className="flex items-center gap-1">
            {/* Main Navigation Links */}
            <Link
              href="/browse"
              className="hidden sm:inline text-sm px-2 py-2 text-muted hover:text-foreground transition-colors min-h-[40px] flex items-center"
            >
              Browse
            </Link>

            {/* Catalog Link */}
            <Link
              href="/catalog"
              className="hidden sm:inline text-sm px-2 py-2 text-muted hover:text-foreground transition-colors min-h-[40px] flex items-center"
            >
              Catalog
            </Link>

            {/* Contribute Link */}
            <Link
              href="/contribute"
              className="hidden sm:inline text-sm px-2 py-2 text-muted hover:text-foreground transition-colors min-h-[40px] flex items-center"
            >
              Contribute
            </Link>

            {/* Needs Help Link */}
            <Link
              href="/needs-help"
              className="hidden sm:inline text-sm px-2 py-2 text-muted hover:text-foreground transition-colors min-h-[40px] flex items-center"
            >
              Needs Help
            </Link>

            {/* Moderator Queue Link */}
            {isModerator && (
              <Link
                href="/mod/queue"
                className="hidden sm:inline text-sm px-2 py-2 text-muted hover:text-foreground transition-colors min-h-[40px] flex items-center"
                title="Moderation Queue"
              >
                Mod Queue
              </Link>
            )}

            {/* About Link */}
            <Link
              href="/about"
              className="hidden sm:inline text-sm px-2 py-2 text-muted hover:text-foreground transition-colors min-h-[40px] flex items-center"
            >
              About
            </Link>

            {/* Auth Section */}
            {!mounted ? (
              <div className="w-16 h-10" />
            ) : isAuthenticated && user ? (
              <>
                {/* Bookmarks Icon (Desktop only) */}
                <Link
                  href={`/u/${user.username}/bookmarks`}
                  className="icon-btn hidden md:flex"
                  title="My Bookmarks"
                  aria-label="My Bookmarks"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="icon-md"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                    />
                  </svg>
                </Link>

                {/* Notifications */}
                <NotificationBell />

                {/* User Dropdown */}
                <UserDropdown user={user} />
              </>
            ) : (
              <Link
                href="/auth/login"
                className="btn-primary btn-sm"
              >
                Login
              </Link>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
          </nav>
        </div>

        {/* Mobile Search Bar - Show on non-home/search pages */}
        {!isHomePage && !isSearchPage && (
          <div className="md:hidden pb-2 relative" ref={mobileSearchRef}>
            <form onSubmit={handleSearch} className="w-full">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                placeholder="Search books and adaptations..."
                className="w-full px-3 py-2 text-sm bg-surface text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-link min-h-[40px]"
                aria-label="Search"
              />
            </form>

            {/* Dropdown results */}
            {showDropdown && (
              <SearchDropdown
                results={searchResults}
                isLoading={isSearching}
                query={searchQuery}
                onResultClick={handleResultClick}
              />
            )}
          </div>
        )}
      </div>
    </header>
  );
}
