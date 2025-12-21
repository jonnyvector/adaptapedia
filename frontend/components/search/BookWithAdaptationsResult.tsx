'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { WorkWithAdaptations } from '@/lib/types';

interface BookWithAdaptationsResultProps {
  work: WorkWithAdaptations;
}

/**
 * Format a date string as relative time (e.g., "2h ago", "5d ago")
 */
function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

export default function BookWithAdaptationsResult({ work }: BookWithAdaptationsResultProps): JSX.Element {
  const [showAllAdaptations, setShowAllAdaptations] = useState(false);
  const bestMatch = work.adaptations.length > 0 ? work.adaptations[0] : null;
  const otherAdaptations = work.adaptations.slice(1);

  return (
    <div className="border border-border rounded-lg p-4 hover:border-link/50 transition-colors bg-card">
      {/* Book Info */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link href={`/book/${work.slug}`} className="text-link hover:underline">
              <h3 className="text-lg font-semibold truncate">{work.title}</h3>
            </Link>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              {work.author && (
                <span className="text-sm text-muted">by {work.author}</span>
              )}
              {work.year && (
                <span className="text-sm text-muted">({work.year})</span>
              )}
              {work.genre && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted/30 text-muted">
                  {work.genre}
                </span>
              )}
            </div>
          </div>
          {work.cover_url && (
            <div className="relative w-16 h-24 flex-shrink-0">
              <Image
                src={work.cover_url}
                alt={`${work.title} cover`}
                fill
                sizes="64px"
                className="object-cover rounded"
                unoptimized
              />
            </div>
          )}
        </div>

        {/* Primary CTA - Best Match */}
        {bestMatch && (
          <div className="mt-3">
            <Link
              href={`/compare/${work.slug}/${bestMatch.slug}`}
              className="block w-full sm:w-auto"
            >
              <button className="w-full sm:w-auto px-6 py-3 bg-link text-white font-medium rounded-lg hover:bg-link/90 transition-colors shadow-sm">
                Compare with {bestMatch.title} ({bestMatch.year} {bestMatch.type === 'MOVIE' ? 'Movie' : 'TV Series'})
              </button>
            </Link>

            {/* Secondary expand option */}
            {otherAdaptations.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setShowAllAdaptations(!showAllAdaptations)}
                  className="text-sm text-muted hover:text-link transition-colors"
                >
                  or view {otherAdaptations.length} other adaptation{otherAdaptations.length !== 1 ? 's' : ''} {showAllAdaptations ? '▴' : '▾'}
                </button>
              </div>
            )}
          </div>
        )}

        {work.summary && (
          <p className="text-sm text-muted mt-3 line-clamp-2">{work.summary}</p>
        )}
      </div>

      {/* Other Adaptations - Only show if multiple adaptations AND expanded */}
      {otherAdaptations.length > 0 && showAllAdaptations && (
        <div className="border-t border-border pt-3">
          <h4 className="text-sm font-medium text-muted mb-2">
            Other Adaptations
          </h4>

          <div className="space-y-2">
            {otherAdaptations.map((adaptation) => (
              <Link
                key={adaptation.id}
                href={`/compare/${work.slug}/${adaptation.slug}`}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/10 hover:bg-muted/20 border border-transparent hover:border-link/30 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-foreground group-hover:text-link transition-colors">
                      {adaptation.title}
                    </span>
                    {adaptation.year && (
                      <span className="text-sm text-muted">({adaptation.year})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted/30 text-muted">
                      {adaptation.type === 'MOVIE' ? 'Movie' : 'TV Series'}
                    </span>
                    <span className="text-muted">•</span>
                    {adaptation.diff_count > 0 ? (
                      <>
                        <span className="text-xs text-muted">
                          <span className="font-mono font-semibold">{adaptation.diff_count}</span> diffs
                        </span>
                        {adaptation.last_diff_updated && (
                          <>
                            <span className="text-muted">•</span>
                            <span className="text-xs text-muted">
                              updated {getRelativeTime(adaptation.last_diff_updated)}
                            </span>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted/70 italic">No diffs yet</span>
                    )}
                    {adaptation.diff_count < 3 && adaptation.diff_count > 0 && (
                      <>
                        <span className="text-muted">•</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-warn/20 text-warn">
                          Needs work
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-sm font-medium text-link group-hover:underline flex-shrink-0">
                  Compare →
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No adaptations fallback */}
      {work.adaptations.length === 0 && (
        <div className="border-t border-border pt-3">
          <p className="text-sm text-muted italic">
            No adaptations found yet.{' '}
            <Link href={`/book/${work.slug}`} className="text-link hover:underline">
              View book page
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
