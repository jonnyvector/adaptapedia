'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  mobile?: boolean;
  className?: string;
  onClick?: () => void;
}

export function NavLink({ href, children, mobile = false, className, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          `${TEXT.body} px-4 py-3 hover:bg-stone-100 hover:dark:bg-stone-900 transition-colors font-bold ${monoUppercase} border ${BORDERS.medium}`,
          isActive ? 'bg-stone-100 dark:bg-stone-900 text-black dark:text-white' : `${TEXT.primary}`,
          className
        )}
        style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        `${TEXT.label} px-2 py-1.5 ${TEXT.mutedStrong} hover:text-black hover:dark:text-white transition-colors flex items-center font-bold ${monoUppercase}`,
        isActive && 'text-black dark:text-white',
        className
      )}
      style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
    >
      {children}
    </Link>
  );
}
