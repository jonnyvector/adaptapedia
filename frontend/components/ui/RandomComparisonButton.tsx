'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';
import { BoltIcon, SpinnerIcon } from '@/components/ui/Icons';

export default function RandomComparisonButton(): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async (): Promise<void> => {
    setLoading(true);
    try {
      const randomComparison = await api.diffs.getRandomComparison();
      router.push(`/compare/${randomComparison.work_slug}/${randomComparison.screen_work_slug}`);
    } catch (error) {
      console.error('Failed to get random comparison:', error);
      alert('Could not find a random comparison. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 ${TEXT.secondary} font-bold border ${BORDERS.medium} bg-white dark:bg-black text-black dark:text-white hover:border-black hover:dark:border-white transition-colors ${RADIUS.control} disabled:opacity-50 ${monoUppercase}`}
      style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
    >
      {loading ? (
        <>
          <SpinnerIcon className="w-4 h-4 animate-spin" />
          Finding...
        </>
      ) : (
        <>
          <BoltIcon className="w-4 h-4" />
          Random comparison
        </>
      )}
    </button>
  );
}
