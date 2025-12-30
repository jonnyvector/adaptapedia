'use client';

import Image from 'next/image';
import type { Work, ScreenWork } from '@/lib/types';
import type { SpoilerPreference } from './SpoilerControl';
import AdaptationSwitcher from './AdaptationSwitcher';
import CompactVoteStrip from './CompactVoteStrip';
import { PlusIcon } from '@/components/ui/Icons';

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
    <div className="relative rounded-2xl mb-6 sm:mb-8 min-h-[400px] md:min-h-[500px] bg-white dark:bg-surface border border-gray-200 dark:border-border">

      {/* Content */}
      <div className="relative p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-stretch md:justify-between gap-6">
          {/* Book Section */}
          <div className="flex-1 flex gap-4 md:gap-5 min-w-0">

            {work.cover_url && (
              <div className="relative flex-shrink-0">
                <Image
                  src={work.cover_url}
                  alt={`${work.title} cover`}
                  width={144}
                  height={208}
                  className="w-28 h-40 sm:w-36 sm:h-52 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
            <div className="flex-1 min-w-0 flex flex-col py-2">
              <h2 className="text-xs sm:text-sm text-gray-600 dark:text-muted-foreground mb-1 sm:mb-2">Book</h2>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold break-words text-gray-900 dark:text-white mb-2">{work.title}</h1>

              {/* Author and Year */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {work.author && (
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">{work.author}</p>
                )}
                {work.author && work.year && (
                  <span className="text-gray-400 dark:text-gray-600">•</span>
                )}
                {work.year && (
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{work.year}</p>
                )}
              </div>

              {/* Genre and Rating */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {work.genre && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {work.genre}
                  </span>
                )}
                {work.average_rating && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm text-amber-700 dark:text-amber-400">
                    ⭐ {Number(work.average_rating).toFixed(1)}
                    {work.ratings_count && work.ratings_count > 0 && (
                      <span className="text-amber-600 dark:text-amber-500">({Number(work.ratings_count).toLocaleString()})</span>
                    )}
                  </span>
                )}
              </div>

              {work.summary && (
                <p className="text-sm text-gray-700 dark:text-gray-200 mt-2 line-clamp-3">{work.summary}</p>
              )}
            </div>
          </div>

          {/* VS divider - desktop */}
          <div className="hidden md:flex items-center justify-center mx-4 flex-shrink-0 relative">
            <div className="absolute inset-y-0 left-1/2 w-px bg-gray-300 dark:bg-border"></div>
            <div className="relative px-2.5 py-1 rounded-full bg-white dark:bg-surface border border-gray-300 dark:border-border">
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 tracking-wider">VS</span>
            </div>
          </div>

          {/* VS divider - mobile */}
          <div className="flex md:hidden justify-center my-4 relative w-full">
            <div className="absolute inset-x-0 top-1/2 h-px bg-gray-300 dark:bg-border"></div>
            <div className="relative px-2.5 py-1 rounded-full bg-white dark:bg-surface border border-gray-300 dark:border-border">
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 tracking-wider">VS</span>
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
                  className="w-28 h-40 sm:w-36 sm:h-52 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
            <div className="flex-1 md:text-right min-w-0 flex flex-col py-2">
              <h2 className="text-xs sm:text-sm text-gray-600 dark:text-muted-foreground mb-1 sm:mb-2">
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
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">{screenWork.director}</p>
                )}
                {screenWork.director && screenWork.year && (
                  <span className="text-gray-400 dark:text-gray-600">•</span>
                )}
                {screenWork.year && (
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{screenWork.year}</p>
                )}
              </div>

              {/* Genre and Rating */}
              <div className="flex flex-wrap items-center gap-2 mb-2 md:justify-end">
                {screenWork.primary_genre && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {screenWork.primary_genre}
                  </span>
                )}
                {screenWork.average_rating && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm text-amber-700 dark:text-amber-400">
                    ⭐ {Number(screenWork.average_rating).toFixed(1)}
                    {screenWork.ratings_count && screenWork.ratings_count > 0 && (
                      <span className="text-amber-600 dark:text-amber-500">({Number(screenWork.ratings_count).toLocaleString()})</span>
                    )}
                  </span>
                )}
              </div>

              {screenWork.summary && (
                <p className="text-sm text-gray-700 dark:text-gray-200 mt-2 line-clamp-3 md:text-right">{screenWork.summary}</p>
              )}
            </div>
          </div>
        </div>

        {/* Community Preference & Stats Section */}
        <div className="mt-8">
          <CompactVoteStrip work={work} screenWork={screenWork} />

          {/* Stats Row */}
          <div className="mt-5 px-4 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{diffCount} {diffCount === 1 ? 'difference' : 'differences'}</span>
            {diffCount > 0 && (
              <>
                <span className="text-gray-400 dark:text-gray-600">•</span>
                <span className="font-medium">{voteCount} {voteCount === 1 ? 'vote' : 'votes'} on diffs</span>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="mt-4 px-4 flex justify-start">
            <button
              onClick={handleAddDiff}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
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
