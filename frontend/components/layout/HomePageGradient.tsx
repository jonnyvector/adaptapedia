'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePageGradient(): null {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    if (isHomePage) {
      document.body.classList.add('home-page-gradient');
    } else {
      document.body.classList.remove('home-page-gradient');
    }

    return () => {
      document.body.classList.remove('home-page-gradient');
    };
  }, [isHomePage]);

  return null;
}
