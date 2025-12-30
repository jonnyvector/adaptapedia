import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';
import RandomComparisonButton from '@/components/ui/RandomComparisonButton';
import ComparisonCard from '@/components/browse/ComparisonCard';
import PopularComparisons from '@/components/home/PopularComparisons';
import type { BrowseComparison } from '@/lib/types';

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
    <main className="min-h-screen home-page-gradient">
      {/* Hero Section - Search-focused */}
      <div className="relative py-16 md:py-20 mb-12">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            {/* Clean, focused headline */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-primary via-accent-violet to-primary bg-clip-text text-transparent">
                Spot the change.
              </span>
              <br />
              Post the diff.
            </h1>

            <p className="text-xl md:text-2xl text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
              Adaptapedia is where fans log, vote on, and discuss what changed from book to screen — with spoiler controls so everyone can participate safely.
            </p>

            {/* Search Bar - Primary Action */}
            <div className="max-w-2xl mx-auto mb-2">
              <SearchBar placeholder="Search a book or adaptation (e.g., Dune, The Shining...)" />
            </div>

            {/* Helper text */}
            <p className="text-sm text-muted max-w-2xl mx-auto mb-6">
              New pages start empty — that's the point. Your diffs build the database.
            </p>

            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
              <Link href="/search" className="text-sm text-link hover:text-link-hover font-medium transition-colors">
                Browse all comparisons →
              </Link>
              <span className="text-muted hidden sm:inline">or</span>
              <RandomComparisonButton />
            </div>

            {/* Simplified stats - inline proof */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-6 text-xs text-muted">
                <div className="flex items-center gap-1.5">
                  <div className="text-lg font-black text-foreground">2,185</div>
                  <span>books</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-border"></div>
                <div className="flex items-center gap-1.5">
                  <div className="text-lg font-black text-foreground">3,417</div>
                  <span>adaptations</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-border"></div>
                <div className="flex items-center gap-1.5">
                  <div className="text-lg font-black text-foreground">12.8K</div>
                  <span>differences</span>
                </div>
              </div>
              <p className="text-xs text-muted">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Popular comparisons</h2>
            <p className="text-lg text-muted">Explore the differences between beloved books and their adaptations</p>
          </div>
          <Link href="/browse" className="text-sm text-link hover:text-link-hover font-medium transition-colors whitespace-nowrap">
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
      <div className="relative bg-surface2/30 py-12 md:py-20 mt-8">
        <div className="absolute inset-0 opacity-50 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(var(--color-border-rgb), 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--color-border-rgb), 0.015) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}></div>
        <div className="container relative">

        {/* Features - Redesigned Grid */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Why Book vs. Movie?</h2>
            <p className="text-muted">Built for fans who love to compare notes</p>
          </div>

          {/* Balanced grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Card 1 - Structured Comparisons */}
            <div className="card card-interactive p-8 relative overflow-hidden">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent-violet shadow-lg group-hover:scale-110 transition-transform">
                <svg className="icon-xl text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Structured Comparisons</h3>
              <p className="text-secondary mb-4">
                Post differences as structured claims (plot, character, ending, tone). Vote and discuss to refine them into something accurate — not just hot takes.
              </p>

              {/* Mini Diff Card Preview */}
              <div className="relative border border-border rounded bg-surface p-3 mb-4 hover:border-link/50 hover:shadow-md transition-all cursor-pointer group">
                <span className="absolute top-2 right-2 text-[9px] uppercase tracking-wide font-semibold text-muted/40 group-hover:text-muted/60 transition-colors">Preview</span>
                <div className="flex items-start gap-2 mb-2">
                  <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-purple/10 text-purple border border-purple/30">Character</span>
                  <h4 className="text-sm font-semibold flex-1">Tim and Lex ages swapped</h4>
                </div>
                <p className="text-xs text-muted mb-3">In the book Tim is 11 and tech-savvy; Lex is 8. The film reverses this...</p>

                {/* Mini consensus bar */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium text-muted">Consensus: Strong</span>
                    <span className="text-[10px] text-muted">(24 votes)</span>
                  </div>
                  <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden flex">
                    <div className="bg-green-500 dark:bg-green-400" style={{ width: '90%' }} />
                    <div className="bg-yellow-500 dark:bg-yellow-400" style={{ width: '10%' }} />
                  </div>
                </div>

                {/* Mini vote control */}
                <div className="inline-flex items-stretch rounded-md border border-border/20 overflow-hidden bg-surface2/30 text-[10px]">
                  <button className="inline-flex items-center justify-center gap-1 px-2 py-0.5 font-medium bg-link/90 text-white rounded-l-md">
                    <span>↑</span>
                    <span>Accurate</span>
                    <span className="font-semibold">(21)</span>
                  </button>
                  <div className="w-px bg-border/40"></div>
                  <button className="inline-flex items-center justify-center gap-1 px-2 py-0.5 font-medium text-muted">
                    <span className="opacity-50">~</span>
                    <span>Nuance</span>
                    <span className="font-semibold">(2)</span>
                  </button>
                  <div className="w-px bg-border/40"></div>
                  <button className="inline-flex items-center justify-center gap-1 px-2 py-0.5 font-medium text-muted rounded-r-md">
                    <span className="opacity-50">↓</span>
                    <span>Disagree</span>
                    <span className="font-semibold">(1)</span>
                  </button>
                </div>
              </div>

              <Link href="/search" className="text-sm text-link hover:text-link-hover font-medium transition-colors inline-block">
                See it in action →
              </Link>
            </div>

            {/* Card 2 - Spoiler Control */}
            <div className="card card-interactive p-8 relative overflow-hidden">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-violet to-primary shadow-lg group-hover:scale-110 transition-transform">
                <svg className="icon-xl text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Spoiler Control</h3>
              <p className="text-secondary mb-4">
                Talk about changes without ruining the story. Start spoiler-safe, then opt into Book-only, Screen-only, or Full spoilers.
              </p>

              {/* Mini Spoiler Control */}
              <div className="relative border border-border rounded bg-surface p-4 mb-4 hover:border-link/50 hover:shadow-md transition-all cursor-pointer group">
                <span className="absolute top-2 right-2 text-[9px] uppercase tracking-wide font-semibold text-muted/40 group-hover:text-muted/60 transition-colors">Preview</span>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wide">Spoiler Level</span>
                </div>
                <div className="inline-flex items-stretch rounded-lg border border-border/30 overflow-hidden bg-surface2/40 w-full">
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-success/90 text-white">
                    <span className="inline-block w-2 h-2 rounded-full bg-white"></span>
                    <span>Safe</span>
                  </button>
                  <div className="w-px bg-border/40"></div>
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-muted hover:text-foreground hover:bg-surface/80 transition-colors">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan"></span>
                    <span>Book</span>
                  </button>
                  <div className="w-px bg-border/40"></div>
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-muted hover:text-foreground hover:bg-surface/80 transition-colors">
                    <span className="inline-block w-2 h-2 rounded-full bg-purple"></span>
                    <span>Screen</span>
                  </button>
                  <div className="w-px bg-border/40"></div>
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-muted hover:text-foreground hover:bg-surface/80 transition-colors">
                    <span className="inline-block w-2 h-2 rounded-full bg-magenta"></span>
                    <span>All</span>
                  </button>
                </div>
                <div className="text-xs text-muted mt-3 space-y-1">
                  <p>
                    <span className="font-medium text-success">Safe mode</span> hides all endings and major plot twists
                  </p>
                  <p className="text-[11px] opacity-75">
                    Hides: ending changes, twist reveals, character deaths
                  </p>
                </div>
              </div>

              <Link href="/search" className="text-sm text-link hover:text-link-hover font-medium transition-colors inline-block">
                See it in action →
              </Link>
            </div>

            {/* Card 3 - Community Driven - Full Width */}
            <div className="md:col-span-2 card card-interactive p-8 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-emerald to-accent-blue shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center">
                  <svg className="icon-xl text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Community Driven</h3>
                  <p className="text-secondary text-lg mb-4">
                    Add diffs, challenge claims, and push for nuance. Consensus signals make it clear what's agreed on — and what's still debated.
                  </p>

                  {/* Recent Activity */}
                  <div className="border-t border-border/20 pt-3">
                    <span className="text-[10px] uppercase tracking-wide font-semibold text-muted/60 block mb-2">Live now</span>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="font-semibold">27 diffs</span>
                      <span className="text-xs opacity-75">today</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-link/10 text-link border border-link/20">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-semibold">8 discussions</span>
                      <span className="text-xs opacity-75">active</span>
                    </span>
                    <span className="text-xs text-muted">
                      Top contributor: <Link href="/u/filmfan" className="text-link hover:underline font-medium">@filmfan</Link>
                    </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 text-center flex-shrink-0">
                  <div>
                    <div className="text-3xl font-black text-accent-emerald">12.8K</div>
                    <div className="text-xs text-muted uppercase tracking-wide">Edits</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-accent-blue">1.2K</div>
                    <div className="text-xs text-muted uppercase tracking-wide">Editors</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-link">4.2K</div>
                    <div className="text-xs text-muted uppercase tracking-wide">Comparisons</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/needs-help" className="text-sm text-link hover:text-link-hover font-medium transition-colors inline-block">
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
          <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
          <p className="text-lg text-muted">Three simple steps to start exploring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Step 1 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent-violet flex items-center justify-center text-white text-2xl font-black shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3">Search</h3>
              <p className="text-secondary mb-4">
                Find a book + adaptation fast — even if you type it wrong
              </p>
              <div className="flex flex-col gap-2 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <svg className="icon-sm text-accent-emerald flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Typo tolerant</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="icon-sm text-accent-emerald flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Genre & year filters</span>
                </div>
              </div>
              <Link href="/search?q=dune" className="mt-4 text-xs text-link hover:text-link-hover font-medium transition-colors">
                Try searching "Dune" →
              </Link>
            </div>
            {/* Connector arrow - hidden on mobile */}
            <div className="hidden md:block absolute top-8 -right-4 text-muted">
              <svg className="icon-xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-accent-violet to-primary flex items-center justify-center text-white text-2xl font-black shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3">Compare & Discuss</h3>
              <p className="text-secondary mb-4">
                Browse diffs by category, then jump into threads where fans debate what changed (spoiler-safe)
              </p>
              <div className="flex flex-col gap-2 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <svg className="icon-sm text-accent-emerald flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Custom spoiler levels</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="icon-sm text-accent-emerald flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Categorized diffs</span>
                </div>
              </div>
              <Link href="/browse" className="mt-4 text-xs text-link hover:text-link-hover font-medium transition-colors">
                View popular comparisons →
              </Link>
            </div>
            {/* Connector arrow */}
            <div className="hidden md:block absolute top-8 -right-4 text-muted">
              <svg className="icon-xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-accent-emerald to-accent-blue flex items-center justify-center text-white text-2xl font-black shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3">Contribute</h3>
              <p className="text-secondary mb-4">
                Add the differences you noticed. Earn votes, build reputation, and help shape the consensus
              </p>
              <div className="flex flex-col gap-2 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <svg className="icon-sm text-accent-emerald flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Vote on accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="icon-sm text-accent-emerald flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Earn reputation</span>
                </div>
              </div>
              <Link href="/needs-help" className="mt-4 text-xs text-link hover:text-link-hover font-medium transition-colors">
                Add your first difference →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
