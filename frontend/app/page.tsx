import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';
import RandomComparisonButton from '@/components/ui/RandomComparisonButton';
import TrendingComparisons from '@/components/shared/TrendingComparisons';
import PopularComparisons from '@/components/home/PopularComparisons';

export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Linear-inspired clean minimal */}
      <div className="relative py-24 md:py-32 mb-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            {/* Clean, focused headline */}
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
              Every difference between
              <br />
              <span className="bg-gradient-to-r from-primary via-accent-violet to-primary bg-clip-text text-transparent">
                book and screen
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
              The community-powered database documenting how stories transform in adaptation
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/search" className="btn-primary btn-lg group">
                Start exploring
                <svg className="icon-sm group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <RandomComparisonButton />
            </div>

            {/* Simplified stats - inline */}
            <div className="flex items-center justify-center gap-8 text-sm text-muted">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-black text-foreground">2,185</div>
                <span>books</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border-strong"></div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-black text-foreground">3,417</div>
                <span>adaptations</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border-strong"></div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-black text-foreground">12.8K</div>
                <span>differences</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Comparisons - Clean minimal */}
      <div className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">Trending comparisons</h2>
          <p className="text-lg text-muted">Discover what the community is exploring</p>
        </div>
        <TrendingComparisons limit={6} />
      </div>

      <div className="container py-20">

        {/* Features - Redesigned Grid */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Why Adaptapedia?</h2>
            <p className="text-muted">Built for readers, viewers, and story lovers</p>
          </div>

          {/* Balanced grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Card 1 - Structured Comparisons */}
            <div className="card card-interactive bg-gradient-to-br from-primary/5 to-transparent p-8 relative overflow-hidden group-hover:shadow-2xl">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent-violet shadow-lg group-hover:scale-110 transition-transform">
                <svg className="icon-xl text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Structured Comparisons</h3>
              <p className="text-secondary mb-6">
                Differences organized by category: plot, character, ending, setting, and theme. Each change documented with context from both versions.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">Plot</span>
                <span className="text-xs px-3 py-1 rounded-full bg-accent-violet/10 text-accent-violet font-semibold">Character</span>
                <span className="text-xs px-3 py-1 rounded-full bg-accent-emerald/10 text-accent-emerald font-semibold">Setting</span>
                <span className="text-xs px-3 py-1 rounded-full bg-accent-rose/10 text-accent-rose font-semibold">Theme</span>
              </div>
            </div>

            {/* Card 2 - Spoiler Control */}
            <div className="card card-interactive p-8 relative overflow-hidden">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-violet to-primary shadow-lg group-hover:scale-110 transition-transform">
                <svg className="icon-xl text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Spoiler Control</h3>
              <p className="text-secondary mb-6">
                Choose exactly what spoilers you see based on what you've read or watched. Never get spoiled accidentally.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="icon-xs rounded-full bg-accent-emerald"></div>
                  <span className="text-sm text-secondary font-medium">None - Completely safe</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="icon-xs rounded-full bg-accent-amber"></div>
                  <span className="text-sm text-secondary font-medium">Book only spoilers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="icon-xs rounded-full bg-accent-amber"></div>
                  <span className="text-sm text-secondary font-medium">Screen only spoilers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="icon-xs rounded-full bg-accent-rose"></div>
                  <span className="text-sm text-secondary font-medium">Full spoilers</span>
                </div>
              </div>
            </div>

            {/* Card 3 - Community Driven - Full Width */}
            <div className="md:col-span-2 card card-interactive p-8 bg-gradient-to-r from-accent-emerald/5 to-transparent relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-emerald to-accent-blue shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center">
                  <svg className="icon-xl text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Community Driven</h3>
                  <p className="text-secondary text-lg">
                    Vote on accuracy, contribute new differences, add context through comments, and help build the most comprehensive comparison database. Quality rises through community consensus.
                  </p>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-3xl font-black text-accent-emerald">12.8K</div>
                    <div className="text-xs text-muted">Contributions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-accent-blue">1.2K</div>
                    <div className="text-xs text-muted">Contributors</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works - Simplified */}
        <div className="my-16">
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
                  Find any book or screen adaptation with fuzzy search and filters
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
                <h3 className="text-2xl font-bold mb-3">Explore</h3>
                <p className="text-secondary mb-4">
                  Browse differences organized by category with spoiler protection
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
                  Vote on accuracy and add new differences to help the community
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
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
