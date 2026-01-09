'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { TrendingComparison } from '@/lib/types';
import ComparisonCard from '@/components/browse/ComparisonCard';
import { FONTS, TEXT, RADIUS } from '@/lib/brutalist-design';

interface TrendingComparisonsProps {
  limit?: number;
}

export default function TrendingComparisons({ limit = 6 }: TrendingComparisonsProps): JSX.Element {
  const [trending, setTrending] = useState<TrendingComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const data = await api.diffs.getTrending(limit);
        setTrending(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch trending comparisons:', err);
        setError('Failed to load trending comparisons');
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className={`h-4 bg-black/10 dark:bg-white/10 ${RADIUS.control} w-3/4 mb-2`}></div>
            <div className={`h-3 bg-black/10 dark:bg-white/10 ${RADIUS.control} w-1/2`}></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || trending.length === 0) {
    return (
      <div className="text-center py-8">
        <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
          {error || 'No trending comparisons available yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {trending.map((comparison) => (
        <ComparisonCard
          key={`${comparison.work_id}-${comparison.screen_work_id}`}
          comparison={comparison}
          showTrendingBadge={true}
        />
      ))}
    </div>
  );
}
