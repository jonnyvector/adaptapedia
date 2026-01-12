'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

if (typeof window !== 'undefined') {
  console.log('[PostHog Debug] Window available, checking env vars...');
  console.log('[PostHog Debug] NEXT_PUBLIC_POSTHOG_KEY:', process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'Present' : 'Missing');
  console.log('[PostHog Debug] NEXT_PUBLIC_POSTHOG_HOST:', process.env.NEXT_PUBLIC_POSTHOG_HOST);

  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.log('[PostHog Debug] Initializing PostHog...');
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false,
      capture_pageleave: true,
      loaded: (ph) => {
        console.log('[PostHog Debug] ✅ PostHog loaded successfully');
        console.log('[PostHog Debug] __loaded:', ph.__loaded);
        // Make PostHog available globally for debugging
        (window as any).posthog = ph;
      },
    });
  } else {
    console.warn('[PostHog Debug] ❌ PostHog not initialized: Missing NEXT_PUBLIC_POSTHOG_KEY');
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}

// Hook to track pageviews
export function PostHogPageView(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthog && posthog.__loaded) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export { posthog };
