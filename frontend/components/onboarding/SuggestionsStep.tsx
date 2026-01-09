'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FONTS, BORDERS, TEXT, monoUppercase, RADIUS } from '@/lib/brutalist-design';
import { getSuggestedComparisons } from '@/lib/onboarding-utils';
import type { SuggestedComparison } from '@/lib/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface SuggestionsStepProps {
  onComplete: () => Promise<void>;
  intent?: 'ADD_DIFFS' | 'DISCUSS' | 'EXPLORE';
}

export default function SuggestionsStep({ onComplete, intent = 'EXPLORE' }: SuggestionsStepProps): JSX.Element {
  const [comparisons, setComparisons] = useState<SuggestedComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [completing, setCompleting] = useState(false);

  const loadSuggestions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSuggestedComparisons();
      setComparisons(data);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
      setError('Failed to load suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const getHeading = () => {
    switch (intent) {
      case 'ADD_DIFFS':
        return 'Perfect for adding differences';
      case 'DISCUSS':
        return 'Great for discussion';
      default:
        return 'Top picks for you';
    }
  };

  const handleComparisonClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Don't prevent navigation, but mark onboarding as complete first
    e.preventDefault();
    setCompleting(true);

    const href = e.currentTarget.getAttribute('href');
    await onComplete();

    // Navigate after completion
    if (href) {
      window.location.href = href;
    }
  };

  return (
    <div>
      <h2 className={`text-2xl font-bold mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono }}>
        {getHeading()}
      </h2>
      <p className={`${TEXT.body} ${TEXT.mutedMedium} mb-6`} style={{ fontFamily: FONTS.mono }}>
        Explore these comparisons to get started
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4 font-bold" role="alert" style={{ fontFamily: FONTS.mono }}>
            {error}
          </p>
          <button
            onClick={loadSuggestions}
            className={`px-6 py-3 border ${BORDERS.medium} ${RADIUS.control} font-bold hover:bg-gray-100 hover:dark:bg-gray-900 transition-colors ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono }}
          >
            Retry
          </button>
        </div>
      ) : comparisons.length === 0 ? (
        <p className={`text-center py-12 ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
          No suggestions available yet. Check back later!
        </p>
      ) : (
        <div className="space-y-4 mb-6">
          {comparisons.map((comp) => (
            <Link
              key={`${comp.work_slug}-${comp.screen_work_slug}`}
              href={`/compare/${comp.work_slug}/${comp.screen_work_slug}`}
              onClick={handleComparisonClick}
              className={`block p-4 border ${BORDERS.medium} ${RADIUS.control} hover:bg-gray-100 hover:dark:bg-gray-900 transition-colors ${completing ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold mb-1" style={{ fontFamily: FONTS.mono }}>
                    {comp.work_title} → {comp.screen_work_title}
                  </h3>
                  <p className={`text-sm ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
                    {comp.genres.join(', ')} • {comp.diff_count} differences
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <button
        onClick={onComplete}
        disabled={completing}
        className={`w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black ${RADIUS.control} font-bold hover:bg-black/90 hover:dark:bg-white/90 transition-colors border ${BORDERS.solid} ${TEXT.secondary} ${monoUppercase} ${completing ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ fontFamily: FONTS.mono }}
      >
        {completing ? 'Completing...' : 'Get Started!'}
      </button>
    </div>
  );
}
