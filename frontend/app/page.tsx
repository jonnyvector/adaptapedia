import Link from 'next/link';
import Image from 'next/image';
import SearchBar from '@/components/search/SearchBar';
import RandomComparisonButton from '@/components/ui/RandomComparisonButton';
import ComparisonCard from '@/components/browse/ComparisonCard';
import PopularComparisons from '@/components/home/PopularComparisons';
import { Button } from '@/components/ui/Button';
import type { BrowseComparison } from '@/lib/types';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';
import { ClipboardDocumentListIcon, UserGroupIcon, ShieldCheckIcon, ChartBarIcon, EyeSlashIcon, PlusIcon, ChatBubbleIcon } from '@/components/ui/Icons';

// Force dynamic rendering - page uses client components with useSearchParams
export const dynamic = 'force-dynamic';

async function getFeaturedComparisons(): Promise<BrowseComparison[]> {
  try {
    const API_URL = process.env.API_URL || 'http://localhost:8000/api';
    const res = await fetch(`${API_URL}/diffs/items/browse/`, {
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
      <div className="relative py-12 md:py-20 mb-8 md:mb-12">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            {/* Clean, focused headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 md:mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: FONTS.mono }}>
              <span className={TEXT.primary}>
                Spot the change.
              </span>
              <br />
              Post the diff.
            </h1>

            <p className={`text-lg sm:text-xl md:text-2xl ${TEXT.mutedMedium} max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed px-4`} style={{ fontFamily: FONTS.mono }}>
              Log differences. Vote for accuracy. Debate what changed — spoiler-safe by default.
            </p>

            {/* Search Bar - Primary Action */}
            <div className="max-w-2xl mx-auto mb-2">
              <SearchBar placeholder="Search a book or adaptation (e.g., Dune, The Shining...)" />
            </div>

            {/* Helper text */}
            <p className={`${TEXT.secondary} ${TEXT.mutedMedium} max-w-2xl mx-auto mb-6`} style={{ fontFamily: FONTS.mono }}>
              New pages start empty — that&apos;s the point. <span className="font-bold text-black dark:text-white">Your diffs build the database.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
              {/* Primary: Browse */}
              <Link href="/browse">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Browse comparisons
                </Button>
              </Link>

              {/* Secondary: Add a diff */}
              <Link href="/search">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  + Add a diff
                </Button>
              </Link>

              {/* Tertiary: Random */}
              <RandomComparisonButton className="w-full sm:w-auto" />
            </div>

            {/* Live activity signals - shows community is active */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className={`flex flex-wrap items-center justify-center gap-3 sm:gap-6 ${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
                <div className="flex items-center gap-1">
                  <div className={`text-lg font-black ${TEXT.primary}`}>2,185</div>
                  <span className="uppercase tracking-wider text-xs sm:text-sm">books</span>
                </div>
                <div className="w-1 h-1 bg-black/20 dark:bg-white/20 hidden sm:block"></div>
                <div className="flex items-center gap-1">
                  <div className={`text-lg font-black ${TEXT.primary}`}>3,417</div>
                  <span className="uppercase tracking-wider text-xs sm:text-sm">adaptations</span>
                </div>
                <div className="w-1 h-1 bg-black/20 dark:bg-white/20 hidden sm:block"></div>
                <div className="flex items-center gap-1">
                  <div className={`text-lg font-black ${TEXT.primary}`}>12.8K</div>
                  <span className="uppercase tracking-wider text-xs sm:text-sm">differences</span>
                </div>
                <div className="w-1 h-1 bg-black/20 dark:bg-white/20 hidden sm:block"></div>
                <div className="flex items-center gap-1">
                  <div className={`text-lg font-black ${TEXT.primary}`}>+27</div>
                  <span className="uppercase tracking-wider text-xs sm:text-sm">today</span>
                </div>
              </div>
              <p className={`${TEXT.secondary} ${TEXT.mutedMedium} uppercase tracking-wider text-center px-4`} style={{ fontFamily: FONTS.mono }}>
                Thousands of works are indexed — the community fills in the diffs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Comparisons */}
      <div className="container py-8 md:py-16">
        <div className="mb-6 md:mb-12">
          <div className="text-center mb-4">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3 tracking-tight ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>Popular comparisons</h2>
            <p className={`text-sm sm:text-base md:text-lg ${TEXT.mutedMedium} uppercase tracking-wider px-4`} style={{ fontFamily: FONTS.mono }}>Explore the differences between beloved books and their adaptations</p>
          </div>
          <div className="text-center md:text-right">
            <Link href="/browse" className={`${TEXT.secondary} ${TEXT.primary} hover:underline font-bold transition-colors uppercase tracking-wider text-sm sm:text-base`} style={{ fontFamily: FONTS.mono }}>
              Browse all →
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

      {/* Why Adaptapedia - With separator */}
      <div className={`relative bg-white dark:bg-black py-8 md:py-20 mt-6 md:mt-8 border-y ${BORDERS.medium}`}>
        <div className="container relative">

        {/* Features - Redesigned Grid */}
        <div className="mb-8 md:mb-16">
          <div className="text-center mb-6 md:mb-8">
            <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>Why Adaptapedia?</h2>
            <p className={`${TEXT.mutedMedium} uppercase tracking-wider text-sm sm:text-base px-4`} style={{ fontFamily: FONTS.mono }}>Built for fans who love to compare notes</p>
          </div>

          {/* Balanced grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {/* Card 1 - Structured Comparisons */}
            <div className={`bg-white dark:bg-black border ${BORDERS.medium} p-4 sm:p-6 md:p-8 relative overflow-hidden hover:border-black/50 hover:dark:border-white/50 transition-colors`}>
              <div className={`mb-6 inline-flex items-center justify-center w-16 h-16 bg-black dark:bg-white border ${BORDERS.medium} transition-transform p-1 text-white dark:text-black`}>
                <Image src="/icon-structured.svg" alt="" width={56} height={56} className="invert dark:invert-0" />
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
                <div className={`flex items-center gap-1 ${TEXT.micro}`}>
                  <button className={`inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 font-bold bg-black dark:bg-white text-white dark:text-black border ${BORDERS.solid} ${RADIUS.control} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                    <span>↑ Acc</span>
                    <span className="hidden md:inline">urate</span>
                  </button>
                  <button className={`inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 font-bold ${TEXT.mutedStrong} border ${BORDERS.medium} ${RADIUS.control} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                    <span>~ Nua</span>
                    <span className="hidden md:inline">nce</span>
                  </button>
                  <button className={`inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 font-bold ${TEXT.mutedStrong} border ${BORDERS.medium} ${RADIUS.control} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                    <span>↓ Dis</span>
                    <span className="hidden md:inline">agree</span>
                  </button>
                </div>
              </div>

              <Link href="/search" className={`${TEXT.secondary} ${TEXT.primary} hover:underline font-bold transition-colors inline-block uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
                See it in action →
              </Link>
            </div>

            {/* Card 2 - Spoiler Control */}
            <div className={`bg-white dark:bg-black border ${BORDERS.medium} p-4 sm:p-6 md:p-8 relative overflow-hidden hover:border-black/50 hover:dark:border-white/50 transition-colors`}>
              <div className={`mb-6 inline-flex items-center justify-center w-16 h-16 bg-black dark:bg-white border ${BORDERS.medium} transition-transform p-1 text-white dark:text-black`}>
                <Image src="/icon-spoiler.svg" alt="" width={56} height={56} className="invert dark:invert-0" />
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>Spoiler Control</h3>
              <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-4`} style={{ fontFamily: FONTS.mono }}>
                Talk about changes without ruining the story. Start spoiler-safe, then opt into Book-only, Screen-only, or Full spoilers.
              </p>

              {/* Mini Spoiler Control */}
              <div className={`relative border ${BORDERS.medium} bg-stone-50 dark:bg-stone-950 p-3 sm:p-4 mb-4 hover:border-black/50 hover:dark:border-white/50 transition-all cursor-pointer group`}>
                <span className={`absolute top-2 right-2 ${TEXT.metadata} uppercase tracking-wide font-semibold ${TEXT.mutedLight} group-hover:opacity-100 transition-opacity`} style={{ fontFamily: FONTS.mono }}>Preview</span>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className={`${TEXT.metadata} font-bold ${TEXT.mutedMedium} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>Spoiler Level</span>
                </div>
                <div className={`grid grid-cols-4 gap-1 w-full ${TEXT.micro}`}>
                  <button className={`inline-flex items-center justify-center px-1 py-1 font-bold bg-black dark:bg-white text-white dark:text-black border ${BORDERS.solid} ${RADIUS.control} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                    Safe
                  </button>
                  <button className={`inline-flex items-center justify-center px-1 py-1 font-bold ${TEXT.mutedStrong} border ${BORDERS.medium} ${RADIUS.control} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                    Book
                  </button>
                  <button className={`inline-flex items-center justify-center px-1 py-1 font-bold ${TEXT.mutedStrong} border ${BORDERS.medium} ${RADIUS.control} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                    Scrn
                  </button>
                  <button className={`inline-flex items-center justify-center px-1 py-1 font-bold ${TEXT.mutedStrong} border ${BORDERS.medium} ${RADIUS.control} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                    All
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
            <div className={`lg:col-span-2 bg-white dark:bg-black border ${BORDERS.medium} p-4 sm:p-6 md:p-8 relative overflow-hidden hover:border-black/50 hover:dark:border-white/50 transition-colors`}>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className={`flex-shrink-0 w-16 h-16 bg-black dark:bg-white border ${BORDERS.medium} transition-transform flex items-center justify-center p-1 text-white dark:text-black`}>
                  <Image src="/icon-community.svg" alt="" width={56} height={56} className="invert dark:invert-0" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold mb-3 ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>Community Driven</h3>
                  <p className={`${TEXT.secondary} text-lg mb-4 ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
                    Add diffs, challenge claims, and push for nuance. Consensus signals make it clear what&apos;s agreed on — and what&apos;s still debated.
                  </p>

                  {/* Recent Activity */}
                  <div className={`border-t ${BORDERS.medium} pt-3`}>
                    <span className={`${TEXT.metadata} uppercase tracking-wide font-semibold ${TEXT.mutedMedium} block mb-2`} style={{ fontFamily: FONTS.mono }}>Live now</span>
                    <div className={`flex flex-wrap items-center gap-3 ${TEXT.secondary}`}>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/10 dark:bg-white/10 ${TEXT.primary} border ${BORDERS.medium} font-bold uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span className="font-black">27 diffs</span>
                      <span className={`${TEXT.metadata} ${TEXT.mutedMedium}`}>today</span>
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/10 dark:bg-white/10 ${TEXT.primary} border ${BORDERS.medium} font-bold uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
                      <ChatBubbleIcon className="w-3.5 h-3.5" />
                      <span className="font-black">8 discussions</span>
                      <span className={`${TEXT.metadata} ${TEXT.mutedMedium}`}>active</span>
                    </span>
                    <span className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
                      Top contributor: <Link href="/u/filmfan" className={`${TEXT.primary} hover:underline font-bold`}>@filmfan</Link>
                    </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-6 text-center flex-shrink-0">
                  <div>
                    <div className={`text-2xl sm:text-3xl font-black ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>12.8K</div>
                    <div className={`${TEXT.metadata} ${TEXT.mutedMedium} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>Edits</div>
                  </div>
                  <div>
                    <div className={`text-2xl sm:text-3xl font-black ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>1.2K</div>
                    <div className={`${TEXT.metadata} ${TEXT.mutedMedium} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>Editors</div>
                  </div>
                  <div>
                    <div className={`text-2xl sm:text-3xl font-black ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>4.2K</div>
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
    </main>
  );
}
