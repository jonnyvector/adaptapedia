'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { WorkWithAdaptations } from '@/lib/types';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

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
    <div className={`border ${BORDERS.medium} rounded-md p-4 hover:border-black hover:dark:border-white transition-colors bg-white dark:bg-black`}>
      {/* Book Info */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link href={`/book/${work.slug}`} className="text-black dark:text-white hover:opacity-70">
              <h3 className={`${TEXT.body} font-bold truncate`} style={{ fontFamily: FONTS.mono }}>{work.title}</h3>
            </Link>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              {work.author && (
                <span className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>by {work.author}</span>
              )}
              {work.year && (
                <span className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>({work.year})</span>
              )}
              {work.genre && (
                <span className={`${TEXT.metadata} px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-900 ${TEXT.mutedMedium} font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
                  {work.genre}
                </span>
              )}
            </div>

            {/* Primary CTA - Best Match - moved up to be directly under title */}
            {bestMatch && (
              <div className="mt-3">
                <Link
                  href={`/compare/${work.slug}/${bestMatch.slug}`}
                  className="block w-full sm:w-auto"
                >
                  <button className={`w-full sm:w-auto px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-md border ${BORDERS.solid} hover:opacity-90 transition-opacity ${TEXT.secondary} ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}>
                    Compare with {bestMatch.title} ({bestMatch.year} {bestMatch.type === 'MOVIE' ? 'Movie' : 'TV Series'})
                  </button>
                </Link>

                {/* Secondary expand option */}
                {otherAdaptations.length > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={() => setShowAllAdaptations(!showAllAdaptations)}
                      className={`${TEXT.secondary} ${TEXT.mutedMedium} hover:text-black hover:dark:text-white transition-colors`}
                      style={{ fontFamily: FONTS.mono }}
                    >
                      or view {otherAdaptations.length} other adaptation{otherAdaptations.length !== 1 ? 's' : ''} {showAllAdaptations ? '▴' : '▾'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {work.cover_url && (
            <div className={`relative w-24 h-36 sm:w-32 sm:h-48 flex-shrink-0 border ${BORDERS.medium} rounded-md overflow-hidden`}>
              <Image
                src={work.cover_url}
                alt={`${work.title} cover`}
                fill
                sizes="(max-width: 640px) 96px, 128px"
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </div>

        {work.summary && (
          <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mt-3 line-clamp-2`} style={{ fontFamily: FONTS.mono }}>{work.summary}</p>
        )}
      </div>

      {/* Other Adaptations - Only show if multiple adaptations AND expanded */}
      {otherAdaptations.length > 0 && showAllAdaptations && (
        <div className={`border-t ${BORDERS.subtle} pt-3`}>
          <h4 className={`${TEXT.secondary} font-bold ${TEXT.mutedMedium} mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
            Other Adaptations
          </h4>

          <div className="space-y-2">
            {otherAdaptations.map((adaptation) => (
              <Link
                key={adaptation.id}
                href={`/compare/${work.slug}/${adaptation.slug}`}
                className={`flex items-center justify-between gap-3 p-3 rounded-md bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} hover:border-black hover:dark:border-white transition-colors group`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`font-bold ${TEXT.secondary} text-black dark:text-white group-hover:opacity-70 transition-opacity`} style={{ fontFamily: FONTS.mono }}>
                      {adaptation.title}
                    </span>
                    {adaptation.year && (
                      <span className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>({adaptation.year})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`${TEXT.metadata} px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-900 ${TEXT.mutedMedium} font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
                      {adaptation.type === 'MOVIE' ? 'Movie' : 'TV Series'}
                    </span>
                    <span className={TEXT.mutedMedium}>•</span>
                    {adaptation.diff_count > 0 ? (
                      <>
                        <span className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
                          <span className="font-bold">{adaptation.diff_count}</span> diffs
                        </span>
                        {adaptation.last_diff_updated && (
                          <>
                            <span className={TEXT.mutedMedium}>•</span>
                            <span className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
                              updated {getRelativeTime(adaptation.last_diff_updated)}
                            </span>
                          </>
                        )}
                      </>
                    ) : (
                      <span className={`${TEXT.metadata} ${TEXT.mutedMedium} italic`} style={{ fontFamily: FONTS.mono }}>No diffs yet</span>
                    )}
                    {adaptation.diff_count < 3 && adaptation.diff_count > 0 && (
                      <>
                        <span className={TEXT.mutedMedium}>•</span>
                        <span className={`${TEXT.metadata} px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
                          Needs work
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className={`${TEXT.secondary} font-bold text-black dark:text-white group-hover:opacity-70 flex-shrink-0`} style={{ fontFamily: FONTS.mono }}>
                  Compare →
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No adaptations fallback */}
      {work.adaptations.length === 0 && (
        <div className={`border-t ${BORDERS.subtle} pt-3`}>
          <p className={`${TEXT.secondary} ${TEXT.mutedMedium} italic`} style={{ fontFamily: FONTS.mono }}>
            No adaptations found yet.{' '}
            <Link href={`/book/${work.slug}`} className="text-black dark:text-white hover:opacity-70" style={{ fontFamily: FONTS.mono }}>
              View book page
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
