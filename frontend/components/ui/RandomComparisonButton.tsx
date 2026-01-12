'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { BoltIcon, SpinnerIcon } from '@/components/ui/Icons';
import { analytics } from '@/lib/analytics';

interface RandomComparisonButtonProps {
  className?: string;
}

export default function RandomComparisonButton({ className }: RandomComparisonButtonProps): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async (): Promise<void> => {
    setLoading(true);
    try {
      const randomComparison = await api.diffs.getRandomComparison();

      // Track random comparison click
      analytics.trackRandomComparison();

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
      className={className}
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
