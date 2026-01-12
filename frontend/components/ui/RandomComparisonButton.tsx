'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
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
    <Button
      onClick={handleClick}
      disabled={loading}
      variant="ghost"
      size="lg"
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
    </Button>
  );
}
