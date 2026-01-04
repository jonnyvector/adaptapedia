import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';
import RandomComparisonButton from '@/components/ui/RandomComparisonButton';
import ComparisonCard from '@/components/browse/ComparisonCard';
import PopularComparisons from '@/components/home/PopularComparisons';
import type { BrowseComparison } from '@/lib/types';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

async function getFeaturedComparisons(): Promise<BrowseComparison[]> {
  try {
    const res = await fetch('http://backend:8000/api/diffs/items/browse/', {
      next: { revalidate: 900 }, // Cache for 15 minutes
    });

    if (!res.ok) {
      throw new Error('Failed to fetch comparisons');
    }

    const data = await res.json();

    // Return the featured comparisons from the API (backend handles curation)
    return data.featured || [];
  } catch (error) {
    console.error('Error fetching featured comparisons:', error);
    return [];
  }
}

export default async function Home(): Promise<JSX.Element> {
  const featuredComparisons = await getFeaturedComparisons();
  return (
    <main className="flex-1 bg-white dark:bg-black">
      {/* Hero Section - Search-focused */}
      <div className="relative py-16 md:py-20 mb-12">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            {/* Clean, focused headline */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: FONTS.mono }}>
              <span className={TEXT.primary}>
                Spot the change.
              </span>
              <br />
              Post the diff.
            </h1>

            <p className={`text-xl md:text-2xl ${TEXT.mutedMedium} max-w-2xl mx-auto mb-8 leading-relaxed`} style={{ fontFamily: FONTS.mono }}>
              Adaptapedia is where fans log, vote on, and discuss what changed from book to screen — with spoiler controls so everyone can participate safely.
            </p>

            {/* Search Bar - Primary Action */}
            <div className="max-w-2xl mx-auto mb-2">
              <SearchBar placeholder="Search a book or adaptation (e.g., Dune, The Shining...)" />
            </div>

            {/* Helper text */}
            <p className={`${TEXT.secondary} ${TEXT.mutedMedium} max-w-2xl mx-auto mb-6`} style={{ fontFamily: FONTS.mono }}>
              New pages start empty — that's the point. Your diffs build the database.
            </p>

            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
              <Link href="/search" className={`${TEXT.secondary} ${TEXT.primary} hover:underline font-bold transition-colors uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
                Browse all comparisons →
              </Link>
              <span className={`${TEXT.mutedMedium} hidden sm:inline`} style={{ fontFamily: FONTS.mono }}>or</span>
              <RandomComparisonButton />
            </div>

            {/* Simplified stats - inline proof */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className={`flex items-center gap-6 ${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
                <div className="flex items-center gap-1.5">
                  <div className={`text-lg font-black ${TEXT.primary}`}>2,185</div>
                  <span className="uppercase tracking-wider">books</span>
                </div>
                <div className="w-1 h-1 bg-black/20 dark:bg-white/20"></div>
                <div className="flex items-center gap-1.5">
                  <div className={`text-lg font-black ${TEXT.primary}`}>3,417</div>
                  <span className="uppercase tracking-wider">adaptations</span>
                </div>
                <div className="w-1 h-1 bg-black/20 dark:bg-white/20"></div>
                <div className="flex items-center gap-1.5">
                  <div className={`text-lg font-black ${TEXT.primary}`}>12.8K</div>
                  <span className="uppercase tracking-wider">differences</span>
                </div>
              </div>
              <p className={`${TEXT.secondary} ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
                Thousands of works are indexed — the community fills in the diffs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Comparisons */}
      <div className="container py-12 md:py-16">
        <div className="mb-8 md:mb-12 flex items-end justify-between">
          <div className="text-center flex-1">
            <h2 className={`text-3xl md:text-4xl font-bold mb-3 tracking-tight ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>Popular comparisons</h2>
            <p className={`text-lg ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Explore the differences between beloved books and their adaptations</p>
          </div>
          <Link href="/browse" className={`${TEXT.secondary} ${TEXT.primary} hover:underline font-bold transition-colors whitespace-nowrap uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
            Browse all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredComparisons.length > 0 ? (
            featuredComparisons.map((comparison) => (
              <ComparisonCard
                key={`${comparison.work_id}-${comparison.screen_work_id}`}
                comparison={comparison}
                showTrendingBadge={false}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted">
              <p>No comparisons available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Why Book vs. Movie - With separator */}
      <div className={`relative bg-white dark:bg-black py-12 md:py-20 mt-8 border-y ${BORDERS.medium}`}>
        <div className="container relative">

        {/* Features - Redesigned Grid */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-2 ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>Why Book vs. Movie?</h2>
            <p className={`${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Built for fans who love to compare notes</p>
          </div>

          {/* Balanced grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Card 1 - Structured Comparisons */}
            <div className={`bg-white dark:bg-black border ${BORDERS.medium} p-8 relative overflow-hidden hover:border-black/50 hover:dark:border-white/50 transition-colors`}>
              <div className={`mb-6 inline-flex items-center justify-center w-16 h-16 bg-black dark:bg-white border ${BORDERS.medium} transition-transform`}>
                <svg className="w-8 h-8 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>Structured Comparisons</h3>
              <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-4`} style={{ fontFamily: FONTS.mono }}>
                Post differences as structured claims (plot, character, ending, tone). Vote and discuss to refine them into something accurate — not just hot takes.
              </p>

              {/* Mini Diff Card Preview */}
              <div className={`relative border ${BORDERS.medium} bg-stone-50 dark:bg-stone-950 p-3 mb-4 hover:border-black/50 hover:dark:border-white/50 transition-all cursor-pointer group`}>
                <span className={`absolute top-2 right-2 ${TEXT.metadata} uppercase tracking-wide font-semibold ${TEXT.mutedLight} group-hover:opacity-100 transition-opacity`} style={{ fontFamily: FONTS.mono }}>Preview</span>
                <div className="flex items-start gap-2 mb-2">
                  <span className={`px-1.5 py-0.5 ${TEXT.metadata} font-bold bg-black/10 dark:bg-white/10 ${TEXT.primary} border ${BORDERS.medium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Character</span>
                  <h4 className={`${TEXT.secondary} font-bold flex-1 ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>Tim and Lex ages swapped</h4>
                </div>
                <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-3`} style={{ fontFamily: FONTS.mono }}>In the book Tim is 11 and tech-savvy; Lex is 8. The film reverses this...</p>

                {/* Mini consensus bar */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${TEXT.metadata} font-bold ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Consensus: Strong</span>
                    <span className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>(24 votes)</span>
                  </div>
                  <div className={`h-1 bg-stone-200 dark:bg-stone-800 border ${BORDERS.medium} overflow-hidden flex`}>
                    <div className="bg-black dark:bg-white" style={{ width: '90%' }} />
                    <div className="bg-black/30 dark:bg-white/30" style={{ width: '10%' }} />
                  </div>
                </div>

                {/* Mini vote control */}
                <div className={`inline-flex items-center gap-2 text-[8px]`}>
                  <button className={`inline-flex items-center justify-center gap-0.5 px-1 py-0.5 font-bold bg-black dark:bg-white text-white dark:text-black border ${BORDERS.solid} rounded uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                    <span>↑</span>
                    <span>Accurate</span>
                    <span className="font-black">(21)</span>
                  </button>
                  <button className={`inline-flex items-center justify-center gap-0.5 px-1 py-0.5 font-bold ${TEXT.mutedStrong} border ${BORDERS.medium} rounded uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                    <span>~</span>
                    <span>Nuance</span>
                    <span className="font-black">(2)</span>
                  </button>
                  <button className={`inline-flex items-center justify-center gap-0.5 px-1 py-0.5 font-bold ${TEXT.mutedStrong} border ${BORDERS.medium} rounded uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                    <span>↓</span>
                    <span>Disagree</span>
                    <span className="font-black">(1)</span>
                  </button>
                </div>
              </div>

              <Link href="/search" className={`${TEXT.secondary} ${TEXT.primary} hover:underline font-bold transition-colors inline-block uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
                See it in action →
              </Link>
            </div>

            {/* Card 2 - Spoiler Control */}
            <div className={`bg-white dark:bg-black border ${BORDERS.medium} p-8 relative overflow-hidden hover:border-black/50 hover:dark:border-white/50 transition-colors`}>
              <div className={`mb-6 inline-flex items-center justify-center w-16 h-16 bg-black dark:bg-white border ${BORDERS.medium} transition-transform`}>
                <svg className="w-8 h-8 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>Spoiler Control</h3>
              <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-4`} style={{ fontFamily: FONTS.mono }}>
                Talk about changes without ruining the story. Start spoiler-safe, then opt into Book-only, Screen-only, or Full spoilers.
              </p>

              {/* Mini Spoiler Control */}
              <div className={`relative border ${BORDERS.medium} bg-stone-50 dark:bg-stone-950 p-4 mb-4 hover:border-black/50 hover:dark:border-white/50 transition-all cursor-pointer group`}>
                <span className={`absolute top-2 right-2 ${TEXT.metadata} uppercase tracking-wide font-semibold ${TEXT.mutedLight} group-hover:opacity-100 transition-opacity`} style={{ fontFamily: FONTS.mono }}>Preview</span>
                <div className="flex items-center justify-between mb-3">
                  <span className={`${TEXT.metadata} font-bold ${TEXT.mutedMedium} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>Spoiler Level</span>
                </div>
                <div className={`inline-flex items-center gap-2 w-full text-[8px]`}>
                  <button className={`flex-1 inline-flex items-center justify-center gap-1 px-1 py-0.5 font-bold bg-black dark:bg-white text-white dark:text-black border ${BORDERS.solid} rounded uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                    <span className={`inline-block w-1.5 h-1.5 border ${BORDERS.medium} bg-white dark:bg-black`}></span>
                    <span>Safe</span>
                  </button>
                  <button className={`flex-1 inline-flex items-center justify-center gap-1 px-1 py-0.5 font-bold ${TEXT.mutedStrong} border ${BORDERS.medium} rounded uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                    <span className={`inline-block w-1.5 h-1.5 border ${BORDERS.medium} bg-black/20 dark:bg-white/20`}></span>
                    <span>Book</span>
                  </button>
                  <button className={`flex-1 inline-flex items-center justify-center gap-1 px-1 py-0.5 font-bold ${TEXT.mutedStrong} border ${BORDERS.medium} rounded uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                    <span className={`inline-block w-1.5 h-1.5 border ${BORDERS.medium} bg-black/20 dark:bg-white/20`}></span>
                    <span>Screen</span>
                  </button>
                  <button className={`flex-1 inline-flex items-center justify-center gap-1 px-1 py-0.5 font-bold ${TEXT.mutedStrong} border ${BORDERS.medium} rounded uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                    <span className={`inline-block w-1.5 h-1.5 border ${BORDERS.medium} bg-black/20 dark:bg-white/20`}></span>
                    <span>All</span>
                  </button>
                </div>
                <div className={`${TEXT.metadata} ${TEXT.mutedMedium} mt-3 space-y-1`} style={{ fontFamily: FONTS.mono }}>
                  <p>
                    <span className={`font-bold ${TEXT.primary} uppercase tracking-wider`}>Safe mode</span> hides all endings and major plot twists
                  </p>
                  <p className="opacity-75">
                    Hides: ending changes, twist reveals, character deaths
                  </p>
                </div>
              </div>

              <Link href="/search" className={`${TEXT.secondary} ${TEXT.primary} hover:underline font-bold transition-colors inline-block uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
                See it in action →
              </Link>
            </div>

            {/* Card 3 - Community Driven - Full Width */}
            <div className={`md:col-span-2 bg-white dark:bg-black border ${BORDERS.medium} p-8 relative overflow-hidden hover:border-black/50 hover:dark:border-white/50 transition-colors`}>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className={`flex-shrink-0 w-16 h-16 bg-black dark:bg-white border ${BORDERS.medium} transition-transform flex items-center justify-center`}>
                  <svg className="w-8 h-8 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold mb-3 ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>Community Driven</h3>
                  <p className={`${TEXT.secondary} text-lg mb-4 ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
                    Add diffs, challenge claims, and push for nuance. Consensus signals make it clear what's agreed on — and what's still debated.
                  </p>

                  {/* Recent Activity */}
                  <div className={`border-t ${BORDERS.medium} pt-3`}>
                    <span className={`${TEXT.metadata} uppercase tracking-wide font-semibold ${TEXT.mutedMedium} block mb-2`} style={{ fontFamily: FONTS.mono }}>Live now</span>
                    <div className={`flex flex-wrap items-center gap-3 ${TEXT.secondary}`}>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/10 dark:bg-white/10 ${TEXT.primary} border ${BORDERS.medium} font-bold uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="font-black">27 diffs</span>
                      <span className={`${TEXT.metadata} ${TEXT.mutedMedium}`}>today</span>
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/10 dark:bg-white/10 ${TEXT.primary} border ${BORDERS.medium} font-bold uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-black">8 discussions</span>
                      <span className={`${TEXT.metadata} ${TEXT.mutedMedium}`}>active</span>
                    </span>
                    <span className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
                      Top contributor: <Link href="/u/filmfan" className={`${TEXT.primary} hover:underline font-bold`}>@filmfan</Link>
                    </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 text-center flex-shrink-0">
                  <div>
                    <div className={`text-3xl font-black ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>12.8K</div>
                    <div className={`${TEXT.metadata} ${TEXT.mutedMedium} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>Edits</div>
                  </div>
                  <div>
                    <div className={`text-3xl font-black ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>1.2K</div>
                    <div className={`${TEXT.metadata} ${TEXT.mutedMedium} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>Editors</div>
                  </div>
                  <div>
                    <div className={`text-3xl font-black ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>4.2K</div>
                    <div className={`${TEXT.metadata} ${TEXT.mutedMedium} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>Comparisons</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/needs-help" className={`${TEXT.secondary} ${TEXT.primary} hover:underline font-bold transition-colors inline-block uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
                  Join the community →
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* How It Works - Simplified */}
      <div className="container py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>How It Works</h2>
          <p className={`text-lg ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Three simple steps to start exploring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Step 1 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className={`mb-6 w-16 h-16 bg-black dark:bg-white border ${BORDERS.medium} flex items-center justify-center text-white dark:text-black text-2xl font-black`} style={{ fontFamily: FONTS.mono }}>
                1
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>Search</h3>
              <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-4`} style={{ fontFamily: FONTS.mono }}>
                Find a book + adaptation fast — even if you type it wrong
              </p>
              <div className={`flex flex-col gap-2 ${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
                <div className="flex items-center gap-2">
                  <svg className={`w-4 h-4 ${TEXT.primary} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="uppercase tracking-wider">Typo tolerant</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className={`w-4 h-4 ${TEXT.primary} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="uppercase tracking-wider">Genre & year filters</span>
                </div>
              </div>
              <div className="mt-4 w-full">
                <SearchBar placeholder="Try it: Dune, The Shining..." />
              </div>
            </div>
            {/* Connector arrow - hidden on mobile */}
            <div className={`hidden md:block absolute top-8 -right-4 ${TEXT.mutedMedium}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className={`mb-6 w-16 h-16 bg-black dark:bg-white border ${BORDERS.medium} flex items-center justify-center text-white dark:text-black text-2xl font-black`} style={{ fontFamily: FONTS.mono }}>
                2
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>Compare & Discuss</h3>
              <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-4`} style={{ fontFamily: FONTS.mono }}>
                Browse diffs by category, then jump into threads where fans debate what changed (spoiler-safe)
              </p>
              <div className={`flex flex-col gap-2 ${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
                <div className="flex items-center gap-2">
                  <svg className={`w-4 h-4 ${TEXT.primary} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="uppercase tracking-wider">Custom spoiler levels</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className={`w-4 h-4 ${TEXT.primary} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="uppercase tracking-wider">Categorized diffs</span>
                </div>
              </div>
              <Link href="/browse" className={`mt-4 ${TEXT.secondary} ${TEXT.mutedMedium} hover:${TEXT.primary} hover:underline transition-colors uppercase tracking-wider text-sm`} style={{ fontFamily: FONTS.mono }}>
                Browse comparisons →
              </Link>
            </div>
            {/* Connector arrow */}
            <div className={`hidden md:block absolute top-8 -right-4 ${TEXT.mutedMedium}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className={`mb-6 w-16 h-16 bg-black dark:bg-white border ${BORDERS.medium} flex items-center justify-center text-white dark:text-black text-2xl font-black`} style={{ fontFamily: FONTS.mono }}>
                3
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>Contribute</h3>
              <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-4`} style={{ fontFamily: FONTS.mono }}>
                Add the differences you noticed. Earn votes, build reputation, and help shape the consensus
              </p>
              <div className={`flex flex-col gap-2 ${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
                <div className="flex items-center gap-2">
                  <svg className={`w-4 h-4 ${TEXT.primary} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="uppercase tracking-wider">Vote on accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className={`w-4 h-4 ${TEXT.primary} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="uppercase tracking-wider">Earn reputation</span>
                </div>
              </div>
              <Link href="/needs-help" className={`mt-4 ${TEXT.secondary} ${TEXT.mutedMedium} hover:${TEXT.primary} hover:underline transition-colors uppercase tracking-wider text-sm`} style={{ fontFamily: FONTS.mono }}>
                Start contributing →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
