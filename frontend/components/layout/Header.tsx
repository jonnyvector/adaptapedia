'use client';

import { Suspense } from 'react';
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
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';
import { XMarkIcon } from '@/components/ui/Icons';

function HeaderContent(): JSX.Element {
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setMobileMenuOpen(false);
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
      className={`sticky top-0 z-50 border-b ${BORDERS.medium} bg-white dark:bg-black transition-all ${
        isSticky ? 'border-black dark:border-white' : ''
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between py-1.5 sm:py-2 gap-2 sm:gap-3 min-w-0">
          {/* Logo/Home Link */}
          <Link
            href="/"
            className={`text-base sm:text-2xl font-bold text-black dark:text-white hover:text-black/70 hover:dark:text-white/70 transition-colors flex-shrink-0 ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
            aria-label="Adaptapedia Home"
          >
            Adaptapedia
          </Link>

          {/* Search Bar - Hidden on home and search pages */}
          {!isHomePage && !isSearchPage && (
            <div className="hidden md:flex flex-1 max-w-md mx-4 relative" ref={desktopSearchRef}>
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (!justSubmittedRef.current && searchQuery.length >= 2) {
                      setShowDropdown(true);
                    }
                  }}
                  placeholder="SEARCH BOOKS..."
                  className={`w-full px-3 py-2 pr-10 ${TEXT.body} bg-white dark:bg-black text-black dark:text-white border ${BORDERS.medium} ${RADIUS.control} focus:outline-none focus:ring-0 focus:border-black focus:dark:border-white placeholder:${TEXT.mutedLight} placeholder:uppercase min-h-[40px]`}
                  style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
                  aria-label="Search"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowDropdown(false);
                      setSearchResults(null);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-black/40 dark:text-white/40 hover:text-black hover:dark:text-white transition-colors"
                    aria-label="Clear search"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
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
          <nav className="hidden md:flex items-center gap-1">
            {/* Main Navigation Links */}
            <Link
              href="/browse"
              className={`${TEXT.label} px-2 py-1.5 ${TEXT.mutedStrong} hover:text-black hover:dark:text-white transition-colors flex items-center font-bold ${monoUppercase}`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
            >
              Browse
            </Link>

            {/* Catalog Link */}
            <Link
              href="/catalog"
              className={`${TEXT.label} px-2 py-1.5 ${TEXT.mutedStrong} hover:text-black hover:dark:text-white transition-colors flex items-center font-bold ${monoUppercase}`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
            >
              Catalog
            </Link>

            {/* Moderator Queue Link */}
            {isModerator && (
              <Link
                href="/mod/queue"
                className={`${TEXT.label} px-2 py-1.5 ${TEXT.mutedStrong} hover:text-black hover:dark:text-white transition-colors flex items-center font-bold ${monoUppercase}`}
                style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
                title="Moderation Queue"
              >
                Mod Queue
              </Link>
            )}

            {/* About Link */}
            <Link
              href="/about"
              className={`${TEXT.label} px-2 py-1.5 ${TEXT.mutedStrong} hover:text-black hover:dark:text-white transition-colors flex items-center font-bold ${monoUppercase}`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
            >
              About
            </Link>

            {/* Auth Section */}
            <div className="flex items-center gap-1">
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
                  className={`px-3 py-1.5 border ${BORDERS.solid} bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:dark:bg-black hover:text-black hover:dark:text-white font-bold transition-all ${TEXT.label} ${RADIUS.control} ${monoUppercase} flex items-center`}
                  style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
                >
                  Login
                </Link>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile-only: Theme toggle and hamburger menu */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 ${TEXT.primary} hover:text-black hover:dark:text-white transition-colors`}
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Show on non-home/search pages */}
        {!isHomePage && !isSearchPage && (
          <div className="md:hidden pb-3 -mt-1 relative" ref={mobileSearchRef}>
            <form onSubmit={handleSearch} className="w-full">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                placeholder="SEARCH BOOKS..."
                className={`w-full px-3 py-2 ${TEXT.body} bg-white dark:bg-black text-black dark:text-white border ${BORDERS.medium} ${RADIUS.control} focus:outline-none focus:ring-0 focus:border-black focus:dark:border-white placeholder:${TEXT.mutedLight} placeholder:uppercase min-h-[40px]`}
                style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-white dark:bg-black z-50 border-t border-black dark:border-white">
          <div className="flex flex-col h-full">
            {/* Auth Section at Top */}
            {mounted && (
              <div className="border-b border-black dark:border-white px-4 py-2.5">
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/u/${user.username}`}
                      className={`text-xs font-bold ${TEXT.primary} ${monoUppercase} hover:underline`}
                      style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}
                    >
                      {user.username}
                    </Link>
                    <NotificationBell />
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className={`block text-center px-4 py-2 border ${BORDERS.solid} bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:dark:bg-black hover:text-black hover:dark:text-white font-bold transition-all text-xs ${RADIUS.control} ${monoUppercase}`}
                    style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
                  >
                    Login
                  </Link>
                )}
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex flex-col p-4 gap-2">
              <Link
                href="/browse"
                className={`${TEXT.body} px-4 py-3 ${TEXT.primary} hover:bg-stone-100 hover:dark:bg-stone-900 transition-colors font-bold ${monoUppercase} border ${BORDERS.medium}`}
                style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
              >
                Browse
              </Link>
              <Link
                href="/catalog"
                className={`${TEXT.body} px-4 py-3 ${TEXT.primary} hover:bg-stone-100 hover:dark:bg-stone-900 transition-colors font-bold ${monoUppercase} border ${BORDERS.medium}`}
                style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
              >
                Catalog
              </Link>
              {isModerator && (
                <Link
                  href="/mod/queue"
                  className={`${TEXT.body} px-4 py-3 ${TEXT.primary} hover:bg-stone-100 hover:dark:bg-stone-900 transition-colors font-bold ${monoUppercase} border ${BORDERS.medium}`}
                  style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
                >
                  Mod Queue
                </Link>
              )}
              <Link
                href="/about"
                className={`${TEXT.body} px-4 py-3 ${TEXT.primary} hover:bg-stone-100 hover:dark:bg-stone-900 transition-colors font-bold ${monoUppercase} border ${BORDERS.medium}`}
                style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
              >
                About
              </Link>
              {isAuthenticated && user && (
                <>
                  <Link
                    href={`/u/${user.username}/bookmarks`}
                    className={`${TEXT.body} px-4 py-3 ${TEXT.primary} hover:bg-stone-100 hover:dark:bg-stone-900 transition-colors font-bold ${monoUppercase} border ${BORDERS.medium}`}
                    style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
                  >
                    My Bookmarks
                  </Link>
                  <Link
                    href={`/u/${user.username}`}
                    className={`${TEXT.body} px-4 py-3 ${TEXT.primary} hover:bg-stone-100 hover:dark:bg-stone-900 transition-colors font-bold ${monoUppercase} border ${BORDERS.medium}`}
                    style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        await api.auth.logout();
                        window.location.href = '/';
                      } catch (error) {
                        console.error('Logout failed:', error);
                      }
                    }}
                    className={`${TEXT.body} px-4 py-3 text-left bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 hover:dark:bg-white/80 transition-colors font-bold ${monoUppercase} border ${BORDERS.solid}`}
                    style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default function Header(): JSX.Element {
  return (
    <Suspense fallback={
      <header className="w-full border-b-2 border-black dark:border-white bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className={`text-xl font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>
              ADAPTAPEDIA
            </Link>
          </div>
        </div>
      </header>
    }>
      <HeaderContent />
    </Suspense>
  );
}
