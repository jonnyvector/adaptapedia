import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';

export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative geometric shapes */}
      <div className="geo-circle bg-yellow float" style={{ top: '100px', right: '50px' }}></div>
      <div className="geo-square bg-pink rotate-slow" style={{ top: '300px', left: '30px' }}></div>
      <div className="geo-circle bg-blue" style={{ bottom: '200px', right: '100px' }}></div>
      <div className="geo-triangle" style={{ top: '500px', right: '200px', borderBottomColor: 'var(--memphis-mint)' }}></div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="inline-block mb-3">
            <span className="bg-pink p-3">ADAPTA</span>
            <span className="bg-yellow p-3">PEDIA</span>
          </h1>
          <p className="text-lg font-semibold">
            Compare books and screen adaptations • Discover what changed
          </p>
        </div>

        <hr className="mb-4" />

        {/* Stats Grid */}
        <div className="stats-grid mb-4">
          <div className="stat-box">
            <div className="stat-number">2,185</div>
            <div className="stat-label">📚 Books</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">3,417</div>
            <div className="stat-label">🎬 Adaptations</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">12,834</div>
            <div className="stat-label">✨ Differences</div>
          </div>
        </div>

        {/* Search Section */}
        <div className="memphis-card-gray mb-4">
          <h2 className="mb-3">🔍 Search</h2>
          <SearchBar placeholder="Enter book or movie title..." />
        </div>

        {/* Sample Comparisons */}
        <div className="mb-4">
          <h2 className="mb-3">Sample Comparisons</h2>

          <div className="memphis-card mb-3">
            <h3 className="text-pink mb-2">Jurassic Park</h3>
            <p className="text-sm mb-3 opacity-75">Case Study #001</p>

            <div className="comparison-split mb-3">
              <div className="comparison-left">
                <p className="text-xs uppercase font-bold mb-1">Book</p>
                <p className="text-xl font-bold mb-1">Novel (1990)</p>
                <p className="text-sm">by Michael Crichton</p>
              </div>
              <div className="comparison-right">
                <p className="text-xs uppercase font-bold mb-1">Screen</p>
                <p className="text-xl font-bold mb-1">Film (1993)</p>
                <p className="text-sm">dir. Steven Spielberg</p>
              </div>
            </div>

            <div className="text-center">
              <p className="mb-2">
                <span className="text-pink font-bold text-lg">6 Differences Documented</span>
              </p>
              <Link href="/compare/jurassic-park/jurassic-park-1993" className="btn">
                View Comparison →
              </Link>
            </div>
          </div>

          <div className="memphis-card">
            <h3 className="text-blue mb-2">Sphere</h3>
            <p className="text-sm mb-3 opacity-75">Case Study #002</p>

            <div className="comparison-split mb-3">
              <div className="comparison-left">
                <p className="text-xs uppercase font-bold mb-1">Book</p>
                <p className="text-xl font-bold mb-1">Novel (1987)</p>
                <p className="text-sm">by Michael Crichton</p>
              </div>
              <div className="comparison-right">
                <p className="text-xs uppercase font-bold mb-1">Screen</p>
                <p className="text-xl font-bold mb-1">Film (1998)</p>
                <p className="text-sm">dir. Barry Levinson</p>
              </div>
            </div>

            <div className="text-center">
              <p className="mb-2">
                <span className="text-blue font-bold text-lg">5 Differences Documented</span>
              </p>
              <Link href="/compare/sphere-novel/sphere-1998" className="btn">
                View Comparison →
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-4">
          <h2 className="mb-3">✨ Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="memphis-card-yellow">
              <p className="text-2xl mb-2">📊</p>
              <p className="font-bold uppercase mb-2">Structured Analysis</p>
              <p className="text-sm">
                Differences organized by category: Plot, Character, Ending, Setting, Theme
              </p>
            </div>
            <div className="memphis-card-mint">
              <p className="text-2xl mb-2">🔒</p>
              <p className="font-bold uppercase mb-2">Spoiler Controls</p>
              <p className="text-sm">
                Adaptive system lets you choose exactly what spoilers you see
              </p>
            </div>
            <div className="memphis-card-blue">
              <p className="text-2xl mb-2">👥</p>
              <p className="font-bold uppercase mb-2">Community Voting</p>
              <p className="text-sm">
                Vote on accuracy to surface the most reliable information
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="memphis-card-pink mb-4">
          <h2 className="mb-3 text-white">How It Works</h2>
          <ol className="text-white">
            <li>
              <span className="font-bold">Search</span> — Find any book or adaptation in our database
            </li>
            <li>
              <span className="font-bold">Compare</span> — View structured differences with spoiler controls
            </li>
            <li>
              <span className="font-bold">Contribute</span> — Add differences and vote on accuracy
            </li>
          </ol>
        </div>

        {/* CTA */}
        <div className="memphis-card-gray text-center p-8">
          <h2 className="mb-3">Ready to Explore?</h2>
          <p className="mb-4 text-lg">
            Join the community documenting how stories transform from page to screen
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/search" className="btn primary">
              Start Searching
            </Link>
            <Link href="/about" className="btn secondary">
              Learn More
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center opacity-60">
          <p className="text-sm">Adaptapedia v1.0 • 2025</p>
        </div>

      </div>
    </main>
  );
}
