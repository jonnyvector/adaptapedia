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
      className="px-6 py-3 bg-surface border-2 border-link text-link rounded-lg hover:bg-link hover:text-white transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Finding...' : "I'm Feeling Lucky"}
    </button>
  );
}
