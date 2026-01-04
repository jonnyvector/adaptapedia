'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Work, ScreenWork } from '@/lib/types';
import AdaptationSwitcher from './AdaptationSwitcher';
import { PlusIcon } from '@/components/ui/Icons';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

interface ComparisonIdentityHeroProps {
  work: Work;
  screenWork: ScreenWork;
  diffCount?: number;
  voteCount?: number;
  onAddDiff: () => void;
  onVote: () => void;
}

export default function ComparisonIdentityHero({
  work,
  screenWork,
  diffCount = 0,
  voteCount = 0,
  onAddDiff,
  onVote,
}: ComparisonIdentityHeroProps): JSX.Element {
  // Extract dominant colors (fallback to neutral if not available)
  const bookAccent = work.dominant_color || 'rgba(59, 130, 246, 0.3)';
  const screenAccent = screenWork.dominant_color || 'rgba(139, 92, 246, 0.3)';

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
      <div className="relative py-10 md:py-12 px-6 md:px-8">
        {/* Desktop: Split Matchup Grid */}
        <div className="hidden md:grid grid-cols-[260px_1fr_260px] items-center gap-8">
          {/* Left: Book Cover */}
          <div className="flex flex-col items-center gap-3">
            {work.cover_url && (
              <div
                className={`w-[220px] h-[330px] relative overflow-hidden bg-stone-100 dark:bg-stone-900 border ${BORDERS.medium}`}
                style={{
                  boxShadow: '0 6px 12px rgba(0,0,0,.08)',
                }}
              >
                <Image
                  src={work.cover_url}
                  alt={`${work.title} cover`}
                  fill
                  className="object-contain"
                  sizes="220px"
                  unoptimized
                />
              </div>
            )}
            <div className={`${TEXT.label} font-bold ${TEXT.mutedMedium} uppercase tracking-widest`} style={{ fontFamily: FONTS.mono }}>
              Book
            </div>
          </div>

          {/* Center: Title + Meta + CTA */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div>
              <h1 className={`text-4xl font-bold ${TEXT.primary} mb-2`}>
                {work.title}
              </h1>
              <div className={`${TEXT.body} ${TEXT.mutedMedium} mb-3`} style={{ fontFamily: FONTS.mono }}>
                {work.author} ({work.year}) · {screenWork.director || screenWork.type} ({screenWork.year})
              </div>
              <div className={`${TEXT.label} ${TEXT.mutedLight} uppercase tracking-widest font-bold`} style={{ fontFamily: FONTS.mono }}>
                {diffCount} {diffCount === 1 ? 'diff' : 'diffs'} · {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                {diffCount === 0 && voteCount === 0 && ' · New'}
              </div>
            </div>

            {/* VS Badge */}
            <div className={`inline-flex px-3 py-1 ${RADIUS.control} bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} ${TEXT.mutedMedium} tracking-widest uppercase ${TEXT.label} font-bold`} style={{ fontFamily: FONTS.mono }}>
              vs
            </div>

            {/* CTA Row */}
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={onAddDiff}
                className={`inline-flex items-center gap-2 px-5 py-2.5 border ${BORDERS.solid} bg-black dark:bg-white text-white dark:text-black font-bold ${RADIUS.control} hover:bg-transparent hover:text-black hover:dark:text-white transition-all ${TEXT.body} uppercase tracking-wider`}
                style={{ fontFamily: FONTS.mono }}
              >
                <PlusIcon className="w-4 h-4" />
                {diffCount === 0 ? 'Add first difference' : 'Add difference'}
              </button>
              <button
                onClick={onVote}
                className={`px-5 py-2.5 border ${BORDERS.solid} ${TEXT.primary} font-bold ${RADIUS.control} hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black transition-all ${TEXT.body} uppercase tracking-wider`}
                style={{ fontFamily: FONTS.mono }}
              >
                Vote
              </button>
            </div>
          </div>

          {/* Right: Screen Poster */}
          <div className="flex flex-col items-center gap-3">
            {screenWork.poster_url && (
              <>
                <div
                  className={`w-[220px] h-[330px] relative overflow-hidden bg-stone-100 dark:bg-stone-900 border ${BORDERS.medium}`}
                  style={{
                    boxShadow: '0 6px 12px rgba(0,0,0,.08)',
                  }}
                >
                  <Image
                    src={screenWork.poster_url}
                    alt={`${screenWork.title} poster`}
                    fill
                    className="object-cover object-center"
                    sizes="220px"
                    unoptimized
                  />
                </div>
                {/* Adaptation Switcher */}
                <div className="mt-2">
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
              </>
            )}
            <div className={`${TEXT.label} font-bold ${TEXT.mutedMedium} uppercase tracking-widest`} style={{ fontFamily: FONTS.mono }}>
              {screenWork.type === 'MOVIE' ? 'Movie' : 'TV Series'}
            </div>
          </div>
        </div>

        {/* Mobile: Stacked Layout */}
        <div className="md:hidden">
          {/* Title + Meta */}
          <div className="text-center mb-6">
            <h1 className={`text-2xl font-bold ${TEXT.primary} mb-2`}>
              {work.title}
            </h1>
            <div className={`${TEXT.body} ${TEXT.mutedMedium} mb-2`} style={{ fontFamily: FONTS.mono }}>
              {work.author} ({work.year}) · {screenWork.director || screenWork.type} ({screenWork.year})
            </div>
            <div className={`${TEXT.label} ${TEXT.mutedLight} uppercase tracking-widest font-bold`} style={{ fontFamily: FONTS.mono }}>
              {diffCount} {diffCount === 1 ? 'diff' : 'diffs'} · {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
            </div>
          </div>

          {/* Covers Row */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Book */}
            <div className="flex flex-col items-center gap-2">
              {work.cover_url && (
                <div
                  className={`w-[140px] h-[210px] relative overflow-hidden bg-stone-100 dark:bg-stone-900 border ${BORDERS.medium}`}
                  style={{
                    boxShadow: '0 4px 8px rgba(0,0,0,.08)',
                  }}
                >
                  <Image
                    src={work.cover_url}
                    alt={`${work.title} cover`}
                    fill
                    className="object-contain"
                    sizes="140px"
                    unoptimized
                  />
                </div>
              )}
              <div className={`${TEXT.label} font-bold ${TEXT.mutedMedium} uppercase tracking-widest`} style={{ fontFamily: FONTS.mono }}>
                Book
              </div>
            </div>

            {/* VS */}
            <div className={`inline-flex px-2 py-1 ${RADIUS.control} bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} ${TEXT.mutedMedium} uppercase ${TEXT.label} font-bold tracking-widest`} style={{ fontFamily: FONTS.mono }}>
              vs
            </div>

            {/* Screen */}
            <div className="flex flex-col items-center gap-2">
              {screenWork.poster_url && (
                <>
                  <div
                    className={`w-[140px] h-[210px] relative overflow-hidden bg-stone-100 dark:bg-stone-900 border ${BORDERS.medium}`}
                    style={{
                      boxShadow: '0 4px 8px rgba(0,0,0,.08)',
                    }}
                  >
                    <Image
                      src={screenWork.poster_url}
                      alt={`${screenWork.title} poster`}
                      fill
                      className="object-cover object-center"
                      sizes="140px"
                      unoptimized
                    />
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
                </>
              )}
              <div className={`${TEXT.label} font-bold ${TEXT.mutedMedium} uppercase tracking-widest`} style={{ fontFamily: FONTS.mono }}>
                {screenWork.type === 'MOVIE' ? 'Movie' : 'TV'}
              </div>
            </div>
          </div>

          {/* CTA Row - Hidden on mobile (use sticky bar instead) */}
          <div className="hidden">
            <button
              onClick={onAddDiff}
              className={`w-full py-3 border ${BORDERS.solid} bg-black dark:bg-white text-white dark:text-black font-bold ${RADIUS.control} mb-2 ${TEXT.body} uppercase tracking-wider`}
              style={{ fontFamily: FONTS.mono }}
            >
              <PlusIcon className="w-4 h-4 inline mr-2" />
              {diffCount === 0 ? 'Add first difference' : 'Add difference'}
            </button>
            <button
              onClick={onVote}
              className={`w-full py-3 border ${BORDERS.solid} ${TEXT.primary} font-bold ${RADIUS.control} hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black ${TEXT.body} uppercase tracking-wider`}
              style={{ fontFamily: FONTS.mono }}
            >
              Vote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
