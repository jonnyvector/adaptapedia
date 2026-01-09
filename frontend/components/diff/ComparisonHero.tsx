'use client';

import Image from 'next/image';
import type { Work, ScreenWork } from '@/lib/types';
import type { SpoilerPreference } from './SpoilerControl';
import AdaptationSwitcher from './AdaptationSwitcher';
import CompactVoteStrip from './CompactVoteStrip';
import { PlusIcon } from '@/components/ui/Icons';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

interface ComparisonHeroProps {
  work: Work;
  screenWork: ScreenWork;
  spoilerPreference: SpoilerPreference;
  diffCount?: number;
  voteCount?: number;
}

export default function ComparisonHero({
  work,
  screenWork,
  spoilerPreference,
  diffCount = 0,
  voteCount = 0,
}: ComparisonHeroProps): JSX.Element {
  // Always show the backdrop if available
  const showBackdrop = screenWork.backdrop_path;

  // Use dominant color from API (extracted server-side)
  // Fallback to static blue-gray if not available
  const backdropColor = screenWork.dominant_color || '#e8f0f8';

  const handleAddDiff = () => {
    // Scroll to the add diff section or open modal
    const addDiffButton = document.querySelector('[data-add-diff-button]');
    if (addDiffButton) {
      addDiffButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (addDiffButton as HTMLElement).focus();
    }
  };

  return (
    <div className={`relative ${RADIUS.control} mb-6 sm:mb-8 min-h-[400px] md:min-h-[500px] bg-white dark:bg-black border ${BORDERS.medium}`}>

      {/* Content */}
      <div className="relative p-6 md:p-6 lg:p-10">
        <div className="flex flex-col md:flex-row md:items-stretch gap-4 md:gap-6">
          {/* Book Section */}
          <div className="flex-1 flex gap-4 md:gap-5 min-w-0">

            {work.cover_url && (
              <div className="relative flex-shrink-0">
                <Image
                  src={work.cover_url}
                  alt={`${work.title} cover`}
                  width={144}
                  height={208}
                  className="w-24 h-36 md:w-28 md:h-40 lg:w-36 lg:h-52 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
            <div className="flex-1 min-w-0 flex flex-col py-2 overflow-hidden">
              <h2 className={`${TEXT.label} ${TEXT.mutedMedium} mb-1 sm:mb-2 font-bold uppercase tracking-wider`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.1em' }}>Book</h2>
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold break-words text-black dark:text-white mb-2`} style={{ fontFamily: FONTS.mono }}>{work.title}</h1>

              {/* Author and Year */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {work.author && (
                  <p className={`${TEXT.body} sm:text-base text-black dark:text-white font-bold`} style={{ fontFamily: FONTS.mono }}>{work.author}</p>
                )}
                {work.author && work.year && (
                  <span className={TEXT.mutedMedium}>•</span>
                )}
                {work.year && (
                  <p className={`${TEXT.body} sm:text-base ${TEXT.mutedMedium} font-bold`} style={{ fontFamily: FONTS.mono }}>{work.year}</p>
                )}
              </div>

              {/* Genre and Rating */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {work.genre && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${RADIUS.control} bg-stone-100 dark:bg-stone-900 border ${BORDERS.subtle} ${TEXT.secondary} text-black dark:text-white font-bold uppercase`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.05em' }}>
                    {work.genre}
                  </span>
                )}
                {work.average_rating && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${RADIUS.control} bg-amber-50 dark:bg-amber-950/30 border border-amber-600 dark:border-amber-400 ${TEXT.secondary} text-amber-700 dark:text-amber-400 font-bold`} style={{ fontFamily: FONTS.mono }}>
                    ⭐ {Number(work.average_rating).toFixed(1)}
                    {work.ratings_count && work.ratings_count > 0 && (
                      <span className="text-amber-600 dark:text-amber-500">({Number(work.ratings_count).toLocaleString()})</span>
                    )}
                  </span>
                )}
              </div>

              {work.summary && (
                <p className={`${TEXT.body} text-black dark:text-white mt-2 line-clamp-3`} style={{ fontFamily: FONTS.mono }}>{work.summary}</p>
              )}
            </div>
          </div>

          {/* VS divider - desktop */}
          <div className="hidden md:flex items-center justify-center mx-1 lg:mx-4 flex-shrink-0 relative">
            <div className={`absolute inset-y-0 left-1/2 w-px ${BORDERS.subtle.replace('border-', 'bg-')}`}></div>
            <div className={`relative px-2.5 py-1 ${RADIUS.control} bg-white dark:bg-black border ${BORDERS.solid}`}>
              <span className={`${TEXT.label} font-bold ${TEXT.mutedMedium} tracking-wider uppercase`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.15em' }}>VS</span>
            </div>
          </div>

          {/* VS divider - mobile */}
          <div className="flex md:hidden justify-center my-4 relative w-full">
            <div className={`absolute inset-x-0 top-1/2 h-px ${BORDERS.subtle.replace('border-', 'bg-')}`}></div>
            <div className={`relative px-2.5 py-1 ${RADIUS.control} bg-white dark:bg-black border ${BORDERS.solid}`}>
              <span className={`${TEXT.label} font-bold ${TEXT.mutedMedium} tracking-wider uppercase`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.15em' }}>VS</span>
            </div>
          </div>

          {/* Screen Work Section */}
          <div className="flex-1 flex gap-4 md:gap-5 md:flex-row-reverse min-w-0 relative">
            {screenWork.poster_url && (
              <div className="relative flex-shrink-0">
                <Image
                  src={screenWork.poster_url}
                  alt={`${screenWork.title} poster`}
                  width={144}
                  height={208}
                  className="w-24 h-36 md:w-28 md:h-40 lg:w-36 lg:h-52 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
            <div className="flex-1 md:text-right min-w-0 flex flex-col py-2 overflow-hidden">
              <h2 className={`${TEXT.label} ${TEXT.mutedMedium} mb-1 sm:mb-2 font-bold uppercase tracking-wider`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.1em' }}>
                {screenWork.type === 'MOVIE' ? 'Movie' : 'TV Series'}
              </h2>
              <div className="mb-1 min-w-0">
                <AdaptationSwitcher
                  workId={work.id}
                  workSlug={work.slug}
                  currentScreenWorkId={screenWork.id}
                  currentScreenWorkTitle={screenWork.title}
                  currentScreenWorkYear={screenWork.year}
                  currentScreenWorkType={screenWork.type}
                  currentScreenWorkPosterUrl={screenWork.poster_url}
                />
              </div>

              {/* Director and Year */}
              <div className="flex flex-wrap items-center gap-2 mb-2 md:justify-end">
                {screenWork.director && (
                  <p className={`${TEXT.body} sm:text-base text-black dark:text-white font-bold`} style={{ fontFamily: FONTS.mono }}>{screenWork.director}</p>
                )}
                {screenWork.director && screenWork.year && (
                  <span className={TEXT.mutedMedium}>•</span>
                )}
                {screenWork.year && (
                  <p className={`${TEXT.body} sm:text-base ${TEXT.mutedMedium} font-bold`} style={{ fontFamily: FONTS.mono }}>{screenWork.year}</p>
                )}
              </div>

              {/* Genre and Rating */}
              <div className="flex flex-wrap items-center gap-2 mb-2 md:justify-end">
                {screenWork.primary_genre && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${RADIUS.control} bg-stone-100 dark:bg-stone-900 border ${BORDERS.subtle} ${TEXT.secondary} text-black dark:text-white font-bold uppercase`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.05em' }}>
                    {screenWork.primary_genre}
                  </span>
                )}
                {screenWork.average_rating && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${RADIUS.control} bg-amber-50 dark:bg-amber-950/30 border border-amber-600 dark:border-amber-400 ${TEXT.secondary} text-amber-700 dark:text-amber-400 font-bold`} style={{ fontFamily: FONTS.mono }}>
                    ⭐ {Number(screenWork.average_rating).toFixed(1)}
                    {screenWork.ratings_count && screenWork.ratings_count > 0 && (
                      <span className="text-amber-600 dark:text-amber-500">({Number(screenWork.ratings_count).toLocaleString()})</span>
                    )}
                  </span>
                )}
              </div>

              {screenWork.summary && (
                <p className={`${TEXT.body} text-black dark:text-white mt-2 line-clamp-3 md:text-right`} style={{ fontFamily: FONTS.mono }}>{screenWork.summary}</p>
              )}
            </div>
          </div>
        </div>

        {/* Community Preference & Stats Section */}
        <div className="mt-8">
          <CompactVoteStrip work={work} screenWork={screenWork} />

          {/* Stats Row */}
          <div className={`mt-5 px-4 flex items-center gap-6 ${TEXT.body} ${TEXT.mutedMedium} font-bold`} style={{ fontFamily: FONTS.mono }}>
            <span>{diffCount} {diffCount === 1 ? 'difference' : 'differences'}</span>
            {diffCount > 0 && (
              <>
                <span className={TEXT.mutedLight}>•</span>
                <span>{voteCount} {voteCount === 1 ? 'vote' : 'votes'} on diffs</span>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="mt-4 px-4 flex justify-start">
            <button
              onClick={handleAddDiff}
              className={`inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold ${RADIUS.control} hover:bg-white hover:dark:bg-black hover:text-black hover:dark:text-white border ${BORDERS.solid} transition-all shadow-sm uppercase tracking-wider`}
              style={{ fontFamily: FONTS.mono, letterSpacing: '0.08em' }}
            >
              <PlusIcon className="w-4 h-4" />
              {diffCount === 0 ? 'Add first difference' : 'Add difference'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
