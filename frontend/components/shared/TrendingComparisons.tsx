'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import type { TrendingComparison } from '@/lib/types';
import { BookOpenIcon, FilmIcon } from '@/components/ui/Icons';

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
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-muted/20 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted/20 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || trending.length === 0) {
    return (
      <div className="card-subtle text-center py-8">
        <p className="text-secondary">
          {error || 'No trending comparisons available yet'}
        </p>
      </div>
    );
  }

  const getActivityText = (comparison: TrendingComparison): string => {
    const parts: string[] = [];

    if (comparison.recent_diffs > 0) {
      parts.push(`${comparison.recent_diffs} new ${comparison.recent_diffs === 1 ? 'diff' : 'diffs'}`);
    }

    if (comparison.recent_votes > 0) {
      parts.push(`${comparison.recent_votes} ${comparison.recent_votes === 1 ? 'vote' : 'votes'}`);
    }

    return parts.join(' · ') + ' this week';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {trending.map((comparison, index) => {
        const compareUrl = `/compare/${comparison.work_slug}/${comparison.screen_work_slug}`;

        return (
          <Link
            key={`${comparison.work_id}-${comparison.screen_work_id}`}
            href={compareUrl}
            className="card hover:shadow-lg hover:border-link/30 transition-all group overflow-hidden p-0"
            style={{
              animation: `fadeIn 0.3s ease-out ${index * 0.1}s backwards`,
            }}
          >
            {/* Split Image Header */}
            <div className="relative h-40 flex gap-1.5 bg-gray-100 dark:bg-gray-800 p-1.5">
              {/* Book Cover - Left Half */}
              <div className="w-1/2 relative rounded-l overflow-hidden bg-gray-200 dark:bg-gray-700">
                {comparison.cover_url ? (
                  <Image
                    src={comparison.cover_url}
                    alt={comparison.work_title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpenIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {/* Book label */}
                <div className="absolute top-1 left-1">
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 bg-black/60 text-white rounded backdrop-blur-sm">
                    BOOK
                  </span>
                </div>
              </div>

              {/* Movie Poster - Right Half */}
              <div className="w-1/2 relative rounded-r overflow-hidden bg-gray-200 dark:bg-gray-700">
                {comparison.poster_url ? (
                  <Image
                    src={comparison.poster_url}
                    alt={comparison.screen_work_title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FilmIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {/* Screen label */}
                <div className="absolute top-1 right-1">
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 bg-black/60 text-white rounded backdrop-blur-sm">
                    SCREEN
                  </span>
                </div>
              </div>

              {/* Trending Badge Overlay */}
              <div className="absolute top-3.5 left-3.5">
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-primary text-white shadow-lg">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Trending
                </span>
              </div>

              {/* Year Badge */}
              {comparison.screen_work_year && (
                <div className="absolute top-3.5 right-3.5">
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-black/60 text-white backdrop-blur-sm">
                    {comparison.screen_work_year}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Book Title */}
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-link transition-colors line-clamp-2">
                {comparison.work_title}
              </h3>

              {/* Screen Title */}
              <p className="text-sm text-secondary mb-3 line-clamp-1">
                vs. {comparison.screen_work_title}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted">
                  {getActivityText(comparison)}
                </span>
                <span className="text-xs font-semibold text-primary">
                  {comparison.total_diffs} {comparison.total_diffs === 1 ? 'diff' : 'diffs'}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
