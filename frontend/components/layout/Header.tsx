'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';
import NotificationBell from './NotificationBell';
import { NavLink } from './NavLink';
import SearchInput from '@/components/search/SearchInput';
import { BrutalistBookmarkIcon } from '@/components/ui/Icons';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';

function HeaderContent(): JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, logout } = useAuth();
  const [isSticky, setIsSticky] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHomePage = pathname === '/';
  const isSearchPage = pathname === '/search';
  const isModerator = user && (user.role === 'MOD' || user.role === 'ADMIN');

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu when pathname changes (navigation occurred)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
            className={`text-base sm:text-2xl font-bold text-black dark:text-white hover:text-black/70 hover:dark:text-white/70 transition-colors flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
            aria-label="Adaptapedia Home"
          >
            Adaptapedia
          </Link>

          {/* Search Bar - Hidden on home and search pages */}
          {!isHomePage && !isSearchPage && (
            <SearchInput className="hidden md:flex flex-1 max-w-md mx-4" />
          )}

          {/* Navigation & Actions */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Main Navigation Links */}
            <NavLink href="/browse">Browse</NavLink>
            <NavLink href="/catalog">Catalog</NavLink>

            {/* Moderator Queue Link */}
            {isModerator && (
              <NavLink href="/mod/queue" title="Moderation Queue">
                Mod Queue
              </NavLink>
            )}

            <NavLink href="/about">About</NavLink>

            {/* Auth Section */}
            <div className="flex items-center gap-1">
              {!mounted ? (
                <div className="w-16 h-10" />
              ) : isAuthenticated && user ? (
                <>
                  {/* Bookmarks Icon (Desktop only) */}
                  <Link
                    href={`/u/${user.username}/bookmarks`}
                    className={`group relative px-1 py-1.5 transition-opacity hidden md:flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white opacity-70 hover:opacity-100`}
                    title="My Bookmarks"
                    aria-label="My Bookmarks"
                  >
                    <BrutalistBookmarkIcon className="w-5 h-5" />
                  </Link>

                  {/* Notifications */}
                  <NotificationBell />

                  {/* User Dropdown */}
                  <UserDropdown user={user} />
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className={`px-3 py-1.5 border ${BORDERS.solid} bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:dark:bg-black hover:text-black hover:dark:text-white font-bold transition-all ${TEXT.label} ${RADIUS.control} ${monoUppercase} flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white`}
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
              className={`p-2 ${TEXT.primary} hover:text-black hover:dark:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white`}
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
          <SearchInput mobile className="md:hidden pb-3 -mt-1" />
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-white dark:bg-black z-50">
          <div className="flex flex-col h-full">
            {/* Auth Section at Top */}
            {mounted && !isAuthenticated && !user && (
              <div className="px-4 pt-4 pb-3">
                <Link
                  href="/auth/login"
                  className={`flex items-center justify-center px-4 py-3 border ${BORDERS.solid} bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:dark:bg-black hover:text-black hover:dark:text-white font-bold transition-all ${TEXT.body} ${RADIUS.control} ${monoUppercase}`}
                  style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
                >
                  Login
                </Link>
              </div>
            )}

            {/* User Info for Authenticated Users */}
            {mounted && isAuthenticated && user && (
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`/u/${user.username}`}
                    className={`${TEXT.body} font-bold ${TEXT.primary} ${monoUppercase} hover:underline`}
                    style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}
                  >
                    {user.username}
                  </Link>
                  <NotificationBell />
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex flex-col px-4 pb-4 gap-2">
              <NavLink href="/browse" mobile onClick={() => setMobileMenuOpen(false)}>
                Browse
              </NavLink>
              <NavLink href="/catalog" mobile onClick={() => setMobileMenuOpen(false)}>
                Catalog
              </NavLink>
              {isModerator && (
                <NavLink href="/mod/queue" mobile onClick={() => setMobileMenuOpen(false)}>
                  Mod Queue
                </NavLink>
              )}
              <NavLink href="/about" mobile onClick={() => setMobileMenuOpen(false)}>
                About
              </NavLink>
              {isAuthenticated && user && (
                <>
                  <NavLink href={`/u/${user.username}/bookmarks`} mobile onClick={() => setMobileMenuOpen(false)}>
                    My Bookmarks
                  </NavLink>
                  <NavLink href={`/u/${user.username}`} mobile onClick={() => setMobileMenuOpen(false)}>
                    My Profile
                  </NavLink>
                  <button
                    onClick={async () => {
                      try {
                        await logout();
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
