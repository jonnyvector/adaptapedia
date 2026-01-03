'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { User } from '@/lib/types';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

interface UserDropdownProps {
  user: User;
}

export default function UserDropdown({ user }: UserDropdownProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2 py-2 ${TEXT.label} ${TEXT.mutedStrong} hover:text-black hover:dark:text-white transition-colors min-h-[40px] flex items-center border-0 bg-transparent font-bold ${monoUppercase}`}
        style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {user.username}
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-full mt-1 w-48 bg-white dark:bg-black border ${BORDERS.solid} py-1 z-50`}>
          <Link
            href={`/u/${user.username}`}
            className={`block px-4 py-2 ${TEXT.label} text-black dark:text-white hover:bg-stone-100 hover:dark:bg-stone-900 transition-colors font-bold ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          <Link
            href={`/u/${user.username}/bookmarks`}
            className={`block px-4 py-2 ${TEXT.label} text-black dark:text-white hover:bg-stone-100 hover:dark:bg-stone-900 transition-colors md:hidden font-bold ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
            onClick={() => setIsOpen(false)}
          >
            Bookmarks
          </Link>
          <hr className={`my-1 border ${BORDERS.subtle}`} />
          <Link
            href="/auth/logout"
            className={`block px-4 py-2 ${TEXT.label} text-black dark:text-white hover:bg-stone-100 hover:dark:bg-stone-900 transition-colors font-bold ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
            onClick={() => setIsOpen(false)}
          >
            Logout
          </Link>
        </div>
      )}
    </div>
  );
}
