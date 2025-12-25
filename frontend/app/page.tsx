import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';
import RandomComparisonButton from '@/components/ui/RandomComparisonButton';
import TrendingComparisons from '@/components/shared/TrendingComparisons';
import PopularComparisons from '@/components/home/PopularComparisons';

export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Dramatic */}
      <div className="relative py-16 md:py-24 mb-12 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent-violet/5 to-transparent"></div>

        <div className="container relative z-10">
          {/* Header with gradient text */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent-violet to-primary bg-clip-text text-transparent animate-gradient">
                Page to Screen
              </span>
              <br />
              <span className="text-foreground">What Changed?</span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary max-w-3xl mx-auto mb-8">
              The community-powered database documenting every difference between books and their adaptations
            </p>

            {/* Visual example - 3 popular comparisons */}
            <div className="flex justify-center gap-3 mb-8 flex-wrap">
              <div className="group relative w-20 h-28 rounded-lg overflow-hidden shadow-lg hover:scale-110 transition-transform cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 group-hover:opacity-0 transition-opacity"></div>
                <div className="text-4xl flex items-center justify-center h-full">📖</div>
              </div>
              <div className="flex items-center">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="group relative w-20 h-28 rounded-lg overflow-hidden shadow-lg hover:scale-110 transition-transform cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 group-hover:opacity-0 transition-opacity"></div>
                <div className="text-4xl flex items-center justify-center h-full">🎬</div>
              </div>
            </div>
          </div>

          {/* Hero Search - More prominent */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent-violet rounded-2xl blur-xl opacity-20"></div>
              <div className="relative card p-8 md:p-12 shadow-2xl border-2 border-primary/20">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h2 className="text-2xl font-bold">Start Exploring</h2>
                </div>
                <SearchBar placeholder="Search for books or adaptations... (Try: Dune, The Shining, Jurassic Park)" />
                <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted">
                  <span>or</span>
                  <RandomComparisonButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Counter - Big and Bold */}
      <div className="py-12 bg-gradient-to-r from-surface via-surface2 to-surface border-y border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-primary mb-2 tracking-tight">2,185</div>
              <div className="text-lg text-secondary font-semibold">Books</div>
              <div className="text-sm text-muted mt-1">Ready to compare</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-accent-violet mb-2 tracking-tight">3,417</div>
              <div className="text-lg text-secondary font-semibold">Adaptations</div>
              <div className="text-sm text-muted mt-1">Movies & TV shows</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-primary to-accent-violet bg-clip-text text-transparent mb-2 tracking-tight">12,834</div>
              <div className="text-lg text-secondary font-semibold">Differences</div>
              <div className="text-sm text-muted mt-1">Documented by our community</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 md:py-12">

        {/* Popular Comparisons */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="mb-0">Popular Comparisons</h2>
            <Link href="/browse" className="text-sm text-primary hover:text-primary-hover transition-colors">
              View all →
            </Link>
          </div>
          <PopularComparisons />
        </div>

        {/* Trending Comparisons */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="mb-0">Trending Comparisons</h2>
            <div className="group relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 text-tertiary cursor-help"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                Trending = most activity this week (new diffs + votes)
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
          </div>
          <TrendingComparisons limit={6} />
        </div>

        {/* Features - Redesigned Grid */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Why Adaptapedia?</h2>
            <p className="text-muted">Built for readers, viewers, and story lovers</p>
          </div>

          {/* Balanced grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Card 1 - Structured Comparisons */}
            <div className="card group hover:shadow-2xl hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-primary/5 to-transparent p-8">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent-violet shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="card group hover:shadow-2xl hover:border-primary/30 transition-all duration-300 p-8">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-violet to-primary shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Spoiler Control</h3>
              <p className="text-secondary mb-6">
                Choose exactly what spoilers you see based on what you've read or watched. Never get spoiled accidentally.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-accent-emerald"></div>
                  <span className="text-sm text-secondary font-medium">None - Completely safe</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-accent-amber"></div>
                  <span className="text-sm text-secondary font-medium">Book only spoilers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-accent-amber"></div>
                  <span className="text-sm text-secondary font-medium">Screen only spoilers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-accent-rose"></div>
                  <span className="text-sm text-secondary font-medium">Full spoilers</span>
                </div>
              </div>
            </div>

            {/* Card 3 - Community Driven - Full Width */}
            <div className="md:col-span-2 card group hover:shadow-2xl hover:border-primary/30 transition-all duration-300 p-8 bg-gradient-to-r from-accent-emerald/5 to-transparent">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-emerald to-accent-blue shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        {/* How adaptations change stories - Visual section */}
        <div className="my-16 py-16 -mx-4 px-4 md:-mx-8 md:px-8 bg-gradient-to-br from-accent-violet/5 via-primary/5 to-transparent">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">How Stories Transform</h2>
              <p className="text-lg text-muted max-w-2xl mx-auto">
                From casting choices to plot changes, we document every difference that makes adaptations unique
              </p>
            </div>

            {/* Example diff cards - visual showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="card hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold">
                      PLOT CHANGE
                    </span>
                    <span className="text-xs text-muted">73% agree</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    Different ending structure
                  </h3>
                  <p className="text-sm text-secondary mb-4">
                    The book's ambiguous ending was replaced with a definitive conclusion in the film adaptation.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <span className="text-green-600">✓ 145</span>
                    </span>
                    <span>•</span>
                    <span>The Shining</span>
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold">
                      CHARACTER
                    </span>
                    <span className="text-xs text-muted">91% agree</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    Age change for protagonist
                  </h3>
                  <p className="text-sm text-secondary mb-4">
                    The main character was aged up from 12 in the book to 16 in the movie to appeal to a wider audience.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <span className="text-green-600">✓ 234</span>
                    </span>
                    <span>•</span>
                    <span>The Hunger Games</span>
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
                    <svg className="w-4 h-4 text-accent-emerald flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Typo tolerant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-accent-emerald flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Genre & year filters</span>
                  </div>
                </div>
              </div>
              {/* Connector arrow - hidden on mobile */}
              <div className="hidden md:block absolute top-8 -right-4 text-muted">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    <svg className="w-4 h-4 text-accent-emerald flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Custom spoiler levels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-accent-emerald flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Categorized diffs</span>
                  </div>
                </div>
              </div>
              {/* Connector arrow */}
              <div className="hidden md:block absolute top-8 -right-4 text-muted">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    <svg className="w-4 h-4 text-accent-emerald flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Vote on accuracy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-accent-emerald flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Earn reputation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA - Dramatic */}
        <div className="relative my-16 py-16 -mx-4 px-4 md:-mx-8 md:px-8 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent-violet/10 to-primary/10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-surface/50 to-transparent"></div>

          <div className="container relative z-10 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent-violet mx-auto shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>

              <h2 className="text-3xl md:text-5xl font-black mb-4">
                Ready to Explore?
              </h2>
              <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto">
                Join thousands of readers and viewers discovering how their favorite stories changed in adaptation
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/search" className="group inline-flex items-center gap-2 justify-center text-lg px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Start Exploring
                </Link>
                <Link href="/browse" className="group inline-flex items-center gap-2 justify-center text-lg px-8 py-4 bg-surface hover:bg-surface2 text-foreground font-semibold rounded-xl border-2 border-border-strong hover:border-primary shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Browse by Genre
                </Link>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted mb-3">or try your luck</p>
                <RandomComparisonButton />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-tertiary">Adaptapedia · 2025</p>
        </div>

      </div>
    </main>
  );
}
