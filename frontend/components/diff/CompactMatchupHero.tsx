'use client';

import Image from 'next/image';
import type { Work, ScreenWork } from '@/lib/types';
import AdaptationSwitcher from './AdaptationSwitcher';
import ScoreboardCompact from './ScoreboardCompact';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

interface CompactMatchupHeroProps {
  work: Work;
  screenWork: ScreenWork;
  diffCount?: number;
  voteCount?: number;
  onAddDiff: () => void;
  onVoteSubmitted?: () => void;
}

export default function CompactMatchupHero({
  work,
  screenWork,
  diffCount = 0,
  voteCount = 0,
  onAddDiff,
  onVoteSubmitted,
}: CompactMatchupHeroProps): JSX.Element {
  const bookAccent = work.dominant_color || 'rgba(59, 130, 246, 0.3)';
  const screenAccent = screenWork.dominant_color || 'rgba(251, 146, 60, 0.3)';

  const isEmpty = diffCount === 0;

  return (
    <div className={`relative overflow-hidden mb-6 border ${BORDERS.medium} bg-white dark:bg-black`}>
      {/* Split gradient background */}
      <div
        className="absolute inset-0 opacity-20 dark:opacity-10"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(0,0,0,.05) 0%, rgba(0,0,0,.15) 70%, rgba(0,0,0,.25) 100%),
            linear-gradient(90deg, ${bookAccent}15 0%, transparent 45%, transparent 55%, ${screenAccent}15 100%)
          `,
        }}
      />

      {/* Content */}
      <div className="relative py-4 md:py-5 px-4 md:px-6">
        {/* Desktop: 3-column matchup */}
        <div className="hidden md:grid grid-cols-[160px_1fr_160px] items-start gap-5">
          {/* Left: Book Cover */}
          <div className="flex flex-col items-center gap-2">
            {work.cover_url && (
              <div
                className={`w-[160px] h-[240px] relative overflow-hidden bg-stone-100 dark:bg-stone-900 border ${BORDERS.medium}`}
                style={{
                  boxShadow: '0 4px 8px rgba(0,0,0,.08)',
                }}
              >
                <Image
                  src={work.cover_url}
                  alt={`${work.title} cover`}
                  fill
                  className="object-contain"
                  sizes="160px"
                  unoptimized
                />
              </div>
            )}
            <div className={`${TEXT.label} ${TEXT.mutedMedium} uppercase tracking-widest font-bold`} style={{ fontFamily: FONTS.mono }}>
              Book
            </div>
            <div className={`${TEXT.label} ${TEXT.mutedLight} text-center`} style={{ fontFamily: FONTS.mono }}>
              {work.author}<br/>({work.year})
            </div>
          </div>

          {/* Center: Title + Scoreboard + CTAs */}
          <div className="flex flex-col gap-3">
            {/* Title + Meta */}
            <div className="text-center">
              <h1 className={`text-2xl font-bold ${TEXT.primary} mb-1`}>
                {work.title}
              </h1>
              <div className={`${TEXT.label} ${TEXT.mutedLight} uppercase tracking-widest font-bold`} style={{ fontFamily: FONTS.mono }}>
                {diffCount} {diffCount === 1 ? 'difference' : 'differences'} · {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
              </div>
            </div>

            {/* Scoreboard - Always visible */}
            <ScoreboardCompact
              work={work}
              screenWork={screenWork}
              onVoteSubmitted={onVoteSubmitted}
            />

            {/* Primary CTA */}
            {isEmpty ? (
              <div className="text-center">
                <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-2`} style={{ fontFamily: FONTS.mono }}>
                  No differences yet — help start this page
                </p>
                <button
                  onClick={onAddDiff}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 border ${BORDERS.solid} bg-black dark:bg-white text-white dark:text-black font-bold ${RADIUS.control} hover:bg-transparent hover:text-black hover:dark:text-white transition-all ${TEXT.body} uppercase tracking-wider`}
                  style={{ fontFamily: FONTS.mono }}
                >
                  Add the first difference
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={onAddDiff}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 border ${BORDERS.solid} bg-black dark:bg-white text-white dark:text-black font-bold ${RADIUS.control} hover:bg-transparent hover:text-black hover:dark:text-white transition-all ${TEXT.body} uppercase tracking-wider`}
                  style={{ fontFamily: FONTS.mono }}
                >
                  Add a difference
                </button>
              </div>
            )}
          </div>

          {/* Right: Screen Poster - Symmetrical with left */}
          <div className="flex flex-col items-center gap-2">
            {screenWork.poster_url && (
              <div
                className={`w-[160px] h-[240px] relative overflow-hidden bg-stone-100 dark:bg-stone-900 border ${BORDERS.medium}`}
                style={{
                  boxShadow: '0 4px 8px rgba(0,0,0,.08)',
                }}
              >
                <Image
                  src={screenWork.poster_url}
                  alt={`${screenWork.title} poster`}
                  fill
                  className="object-cover object-center"
                  sizes="160px"
                  unoptimized
                />
              </div>
            )}
            <div className={`${TEXT.label} ${TEXT.mutedMedium} uppercase tracking-widest font-bold`} style={{ fontFamily: FONTS.mono }}>
              {screenWork.type === 'MOVIE' ? 'Movie' : 'TV'}
            </div>
            <div className={`${TEXT.label} ${TEXT.mutedLight} text-center`} style={{ fontFamily: FONTS.mono }}>
              {screenWork.director || screenWork.type}<br/>({screenWork.year})
            </div>
            <div className="mt-1">
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
          </div>
        </div>

        {/* Mobile: Stacked Layout */}
        <div className="md:hidden">
          {/* 1. Title + Meta */}
          <div className="text-center mb-3">
            <h1 className={`text-xl font-bold ${TEXT.primary} mb-1`}>
              {work.title}
            </h1>
            <div className={`${TEXT.label} ${TEXT.mutedLight} uppercase tracking-widest font-bold`} style={{ fontFamily: FONTS.mono }}>
              {diffCount} {diffCount === 1 ? 'diff' : 'diffs'} · {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
            </div>
          </div>

          {/* 2. Covers side-by-side (locked height) */}
          <div className="flex items-start justify-center gap-3 mb-3">
            {/* Book */}
            <div className="flex flex-col items-center gap-1.5">
              {work.cover_url && (
                <div
                  className={`w-[100px] h-[150px] relative overflow-hidden bg-stone-100 dark:bg-stone-900 border ${BORDERS.medium}`}
                  style={{
                    boxShadow: '0 2px 4px rgba(0,0,0,.08)',
                  }}
                >
                  <Image
                    src={work.cover_url}
                    alt={`${work.title} cover`}
                    fill
                    className="object-cover"
                    sizes="100px"
                    unoptimized
                  />
                </div>
              )}
              <div className={`${TEXT.label} ${TEXT.mutedMedium} uppercase tracking-widest font-bold`} style={{ fontFamily: FONTS.mono }}>Book</div>
            </div>

            {/* Screen */}
            <div className="flex flex-col items-center gap-1.5">
              {screenWork.poster_url && (
                <div
                  className={`w-[100px] h-[150px] relative overflow-hidden bg-stone-100 dark:bg-stone-900 border ${BORDERS.medium}`}
                  style={{
                    boxShadow: '0 2px 4px rgba(0,0,0,.08)',
                  }}
                >
                  <Image
                    src={screenWork.poster_url}
                    alt={`${screenWork.title} poster`}
                    fill
                    className="object-cover object-center"
                    sizes="100px"
                    unoptimized
                  />
                </div>
              )}
              <div className={`${TEXT.label} ${TEXT.mutedMedium} uppercase tracking-widest font-bold`} style={{ fontFamily: FONTS.mono }}>
                {screenWork.type === 'MOVIE' ? 'Movie' : 'TV'}
              </div>
            </div>
          </div>

          {/* Adaptation switcher */}
          <div className="flex justify-center mb-3">
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

          {/* 3. Vote module */}
          <ScoreboardCompact
            work={work}
            screenWork={screenWork}
            onVoteSubmitted={onVoteSubmitted}
          />

          {/* 4. Primary CTA: Add difference */}
          <div className="text-center mt-3">
            {isEmpty && (
              <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-2`} style={{ fontFamily: FONTS.mono }}>
                No differences yet — help start this page
              </p>
            )}
            <button
              onClick={onAddDiff}
              className={`w-full py-2.5 px-4 border ${BORDERS.solid} bg-black dark:bg-white text-white dark:text-black font-bold ${RADIUS.control} hover:bg-transparent hover:text-black hover:dark:text-white transition-all ${TEXT.body} uppercase tracking-wider`}
              style={{ fontFamily: FONTS.mono }}
            >
              {isEmpty ? 'Add the first difference' : 'Add a difference'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
