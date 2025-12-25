import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';
import RandomComparisonButton from '@/components/ui/RandomComparisonButton';
import TrendingComparisons from '@/components/shared/TrendingComparisons';
import PopularComparisons from '@/components/home/PopularComparisons';

export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="py-12 md:py-16 mb-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8 text-center pt-4">
            <p className="text-2xl font-semibold text-foreground mb-2">
              Compare books with their screen adaptations
            </p>
            <p className="text-secondary">
              Discover what changed from page to screen
            </p>
          </div>

          {/* Hero Search */}
          <div className="mb-8 max-w-3xl mx-auto">
            <div className="card p-8 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">Find a comparison</h2>
              <SearchBar placeholder="Search for books or adaptations... (Try: Dune, The Shining, Jurassic Park)" />
              <p className="text-xs text-muted text-center mt-3">Press Enter to search</p>
            </div>
          </div>

          {/* Stats - Compact one line */}
          <div className="mb-8 text-center">
            <p className="text-sm text-secondary">
              2,185 books · 3,417 adaptations · 12,834 differences documented
            </p>
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

        {/* Features */}
        <div className="mb-6">
          <h2 className="mb-3">Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-subtle">
              <div className="mb-3 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="mb-2">Structured Comparisons</h3>
              <p className="text-secondary text-sm">
                Differences organized by category: plot, character, ending, setting, and theme for easy navigation.
              </p>
            </div>

            <div className="card-subtle">
              <div className="mb-3 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </div>
              <h3 className="mb-2">Spoiler Control</h3>
              <p className="text-secondary text-sm">
                Choose what spoilers you see based on what you've read or watched. Full control over revelations.
              </p>
            </div>

            <div className="card-subtle">
              <div className="mb-3 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mb-2">Community Driven</h3>
              <p className="text-secondary text-sm">
                Vote on accuracy and contribute new comparisons. Quality surfaces through community consensus.
              </p>
            </div>
          </div>
        </div>

        <hr />

        {/* How It Works */}
        <div className="mb-6">
          <h2 className="mb-3">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-subtle">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Search</h3>
                  <p className="text-secondary text-sm">
                    Find any book or screen adaptation in our database
                  </p>
                </div>
              </div>
            </div>

            <div className="card-subtle">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Explore</h3>
                  <p className="text-secondary text-sm">
                    Browse structured comparisons with full spoiler controls
                  </p>
                </div>
              </div>
            </div>

            <div className="card-subtle">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Contribute</h3>
                  <p className="text-secondary text-sm">
                    Add new differences and vote on existing ones
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="card text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent-violet mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-lg text-secondary mb-4">
            Join thousands exploring how stories transform from page to screen
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/search" className="btn primary inline-flex items-center gap-2 justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Start Exploring
            </Link>
            <RandomComparisonButton />
            <Link href="/browse" className="btn inline-flex items-center gap-2 justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Browse Genres
            </Link>
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
