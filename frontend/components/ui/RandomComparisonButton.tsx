'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

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
      className="btn-outline btn-lg"
    >
      {loading ? (
        <>
          <svg className="icon-sm animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Finding...
        </>
      ) : (
        <>
          <svg className="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          I'm Feeling Lucky
        </>
      )}
    </button>
  );
}
