'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Work, ScreenWork } from '@/lib/types';
import AdaptationSwitcher from './AdaptationSwitcher';
import { PlusIcon } from '@/components/ui/Icons';

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
    <div className="relative rounded-2xl overflow-hidden mb-6 border border-white/10">
      {/* Split gradient background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(0,0,0,.15) 0%, rgba(0,0,0,.65) 70%, rgba(0,0,0,.85) 100%),
            linear-gradient(90deg, ${bookAccent}33 0%, transparent 45%, transparent 55%, ${screenAccent}33 100%)
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
                className="w-[220px] h-[330px] relative rounded-2xl overflow-hidden bg-black/30"
                style={{
                  border: '1px solid rgba(255,255,255,.08)',
                  boxShadow: '0 20px 60px rgba(0,0,0,.55)',
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
            <div className="text-xs font-semibold text-white/50 uppercase tracking-wide">
              Book
            </div>
          </div>

          {/* Center: Title + Meta + CTA */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {work.title}
              </h1>
              <div className="text-sm text-white/60 mb-3">
                {work.author} ({work.year}) · {screenWork.director || screenWork.type} ({screenWork.year})
              </div>
              <div className="text-xs text-white/40">
                {diffCount} {diffCount === 1 ? 'diff' : 'diffs'} · {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                {diffCount === 0 && voteCount === 0 && ' · New'}
              </div>
            </div>

            {/* VS Badge */}
            <div className="inline-flex px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 tracking-widest uppercase text-xs font-bold">
              vs
            </div>

            {/* CTA Row */}
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={onAddDiff}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-white/90 hover:-translate-y-0.5 transition-all shadow-lg"
              >
                <PlusIcon className="w-4 h-4" />
                {diffCount === 0 ? 'Add first difference' : 'Add difference'}
              </button>
              <button
                onClick={onVote}
                className="px-5 py-2.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 hover:-translate-y-0.5 transition-all"
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
                  className="w-[220px] h-[330px] relative rounded-2xl overflow-hidden bg-black/30"
                  style={{
                    border: '1px solid rgba(255,255,255,.08)',
                    boxShadow: '0 20px 60px rgba(0,0,0,.55)',
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
            <div className="text-xs font-semibold text-white/50 uppercase tracking-wide">
              {screenWork.type === 'MOVIE' ? 'Movie' : 'TV Series'}
            </div>
          </div>
        </div>

        {/* Mobile: Stacked Layout */}
        <div className="md:hidden">
          {/* Title + Meta */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {work.title}
            </h1>
            <div className="text-sm text-white/60 mb-2">
              {work.author} ({work.year}) · {screenWork.director || screenWork.type} ({screenWork.year})
            </div>
            <div className="text-xs text-white/40">
              {diffCount} {diffCount === 1 ? 'diff' : 'diffs'} · {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
            </div>
          </div>

          {/* Covers Row */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Book */}
            <div className="flex flex-col items-center gap-2">
              {work.cover_url && (
                <div
                  className="w-[140px] h-[210px] relative rounded-xl overflow-hidden bg-black/30"
                  style={{
                    border: '1px solid rgba(255,255,255,.08)',
                    boxShadow: '0 15px 40px rgba(0,0,0,.55)',
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
              <div className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                Book
              </div>
            </div>

            {/* VS */}
            <div className="inline-flex px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 uppercase text-xs font-bold">
              vs
            </div>

            {/* Screen */}
            <div className="flex flex-col items-center gap-2">
              {screenWork.poster_url && (
                <>
                  <div
                    className="w-[140px] h-[210px] relative rounded-xl overflow-hidden bg-black/30"
                    style={{
                      border: '1px solid rgba(255,255,255,.08)',
                      boxShadow: '0 15px 40px rgba(0,0,0,.55)',
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
              <div className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                {screenWork.type === 'MOVIE' ? 'Movie' : 'TV'}
              </div>
            </div>
          </div>

          {/* CTA Row - Hidden on mobile (use sticky bar instead) */}
          <div className="hidden">
            <button
              onClick={onAddDiff}
              className="w-full py-3 bg-white text-gray-900 font-semibold rounded-xl mb-2"
            >
              <PlusIcon className="w-4 h-4 inline mr-2" />
              {diffCount === 0 ? 'Add first difference' : 'Add difference'}
            </button>
            <button
              onClick={onVote}
              className="w-full py-3 border-2 border-white/30 text-white font-semibold rounded-xl"
            >
              Vote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
