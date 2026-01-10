'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ComparisonVote } from '@/lib/types';
import { FONTS, BORDERS, TEXT, RADIUS, COLORS } from '@/lib/brutalist-design';

interface ComparisonVoteCardProps {
  vote: ComparisonVote;
}

export default function ComparisonVoteCard({ vote }: ComparisonVoteCardProps): JSX.Element {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPreferenceDisplay = (preference: string): string => {
    switch (preference) {
      case 'BOOK':
        return 'Book';
      case 'SCREEN':
        return vote.screen_work_type === 'TV' ? 'Series' : 'Movie';
      case 'TIE':
        return 'Equal/Tie';
      case 'DIDNT_FINISH':
        return "Didn't finish";
      default:
        return preference;
    }
  };

  const getPreferenceColor = (preference: string): string => {
    switch (preference) {
      case 'BOOK':
        return COLORS.book;
      case 'SCREEN':
        return COLORS.screen;
      default:
        return 'rgb(100, 100, 100)';
    }
  };

  return (
    <div className={`border ${BORDERS.medium} ${RADIUS.control} overflow-hidden hover:border-black hover:dark:border-white transition-colors bg-white dark:bg-black`}>
      <div className="flex gap-4 p-4">
        {/* Book Cover */}
        <Link
          href={`/compare/${vote.work_slug}/${vote.screen_work_slug}`}
          className="flex-shrink-0 group"
        >
          {vote.cover_url ? (
            <div className="relative w-20 h-28 sm:w-24 sm:h-32">
              <Image
                src={vote.cover_url}
                alt={vote.work_title || 'Book cover'}
                fill
                className={`object-cover ${RADIUS.control} border ${BORDERS.subtle} group-hover:opacity-90 transition-opacity`}
              />
            </div>
          ) : (
            <div className={`w-20 h-28 sm:w-24 sm:h-32 bg-stone-200 dark:bg-stone-800 ${RADIUS.control} border ${BORDERS.subtle} flex items-center justify-center`}>
              <span className={`${TEXT.metadata} ${TEXT.mutedMedium} text-center px-2`} style={{ fontFamily: FONTS.mono }}>
                No cover
              </span>
            </div>
          )}
        </Link>

        {/* Vote Details */}
        <div className="flex-1 min-w-0">
          {/* Title & Author */}
          <Link
            href={`/compare/${vote.work_slug}/${vote.screen_work_slug}`}
            className="block group"
          >
            <h3 className={`${TEXT.body} font-bold text-black dark:text-white mb-0.5 group-hover:underline`} style={{ fontFamily: FONTS.mono }}>
              {vote.work_title}
            </h3>
            {vote.work_author && (
              <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-2`} style={{ fontFamily: FONTS.mono }}>
                by {vote.work_author}
              </p>
            )}
          </Link>

          {/* Comparison */}
          <div className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-3`} style={{ fontFamily: FONTS.mono }}>
            <span className="uppercase tracking-wider">vs</span>{' '}
            <span className="text-black dark:text-white">{vote.screen_work_title}</span>
          </div>

          {/* Vote Badge and Faithfulness */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Preference Badge */}
            <div
              className={`inline-flex items-center px-3 py-1.5 border border-transparent ${RADIUS.control} ${TEXT.secondary} font-bold text-white uppercase tracking-wider`}
              style={{
                backgroundColor: getPreferenceColor(vote.preference),
                fontFamily: FONTS.mono,
              }}
            >
              {getPreferenceDisplay(vote.preference)}
            </div>

            {/* Faithfulness Rating */}
            {vote.faithfulness_rating && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-900 border ${BORDERS.medium} ${RADIUS.control} ${TEXT.secondary} font-bold`} style={{ fontFamily: FONTS.mono }}>
                <span className={`${TEXT.mutedMedium} uppercase tracking-wider`}>
                  Faithfulness:
                </span>
                <span className="text-black dark:text-white">
                  {vote.faithfulness_rating}/5
                </span>
              </div>
            )}
          </div>

          {/* Date */}
          <div className={`${TEXT.metadata} ${TEXT.mutedMedium} mt-3 uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
            {formatDate(vote.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}
