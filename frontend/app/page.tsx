import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';

export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen py-16">
      <div className="container-zen">

        {/* Header */}
        <div className="text-center mb-4">
          <h1>Adaptapedia</h1>
          <p className="text-muted">
            A thoughtful database comparing literary works with their screen adaptations
          </p>
        </div>

        <div className="zen-divider"></div>

        {/* Stats */}
        <div className="zen-stats mb-4">
          <div className="zen-stat">
            <div className="zen-stat-number">2,185</div>
            <div className="zen-stat-label">Books</div>
          </div>
          <div className="zen-stat">
            <div className="zen-stat-number">3,417</div>
            <div className="zen-stat-label">Adaptations</div>
          </div>
          <div className="zen-stat">
            <div className="zen-stat-number">12,834</div>
            <div className="zen-stat-label">Differences</div>
          </div>
        </div>

        {/* Search */}
        <div className="zen-card mb-4">
          <h2>Search</h2>
          <SearchBar placeholder="Search for a book or adaptation..." />
        </div>

        {/* Sample Comparisons */}
        <div className="mb-4">
          <h2 className="text-center">Featured Comparisons</h2>

          <div className="zen-card mb-3">
            <h3>Jurassic Park</h3>
            <p className="text-muted mb-3">Michael Crichton's scientific thriller</p>

            <div className="zen-comparison">
              <div className="zen-comparison-left">
                <p className="uppercase text-muted mb-1">Book</p>
                <p className="mb-1"><strong>Novel</strong></p>
                <p className="text-muted">Published 1990</p>
                <p className="text-muted">Michael Crichton</p>
              </div>
              <div className="zen-comparison-right">
                <p className="uppercase text-muted mb-1">Screen</p>
                <p className="mb-1"><strong>Film</strong></p>
                <p className="text-muted">Released 1993</p>
                <p className="text-muted">Dir. Steven Spielberg</p>
              </div>
            </div>

            <div className="zen-divider-accent"></div>

            <div className="text-center">
              <p className="text-muted mb-2">6 differences documented</p>
              <Link href="/compare/jurassic-park/jurassic-park-1993" className="btn">
                View comparison
              </Link>
            </div>
          </div>

          <div className="zen-card">
            <h3>Sphere</h3>
            <p className="text-muted mb-3">Deep-sea psychological thriller</p>

            <div className="zen-comparison">
              <div className="zen-comparison-left">
                <p className="uppercase text-muted mb-1">Book</p>
                <p className="mb-1"><strong>Novel</strong></p>
                <p className="text-muted">Published 1987</p>
                <p className="text-muted">Michael Crichton</p>
              </div>
              <div className="zen-comparison-right">
                <p className="uppercase text-muted mb-1">Screen</p>
                <p className="mb-1"><strong>Film</strong></p>
                <p className="text-muted">Released 1998</p>
                <p className="text-muted">Dir. Barry Levinson</p>
              </div>
            </div>

            <div className="zen-divider-accent"></div>

            <div className="text-center">
              <p className="text-muted mb-2">5 differences documented</p>
              <Link href="/compare/sphere-novel/sphere-1998" className="btn">
                View comparison
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-4">
          <h2 className="text-center">Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="mb-2">Structured Analysis</h3>
              <p className="text-muted">
                Differences organized by category—plot, character, ending, setting, and theme—for clear comparison.
              </p>
            </div>
            <div>
              <h3 className="mb-2">Spoiler Control</h3>
              <p className="text-muted">
                Adaptive system lets you choose exactly what information you see based on your reading and viewing progress.
              </p>
            </div>
            <div>
              <h3 className="mb-2">Community Voting</h3>
              <p className="text-muted">
                Vote on accuracy to surface the most reliable information and maintain quality through consensus.
              </p>
            </div>
          </div>
        </div>

        <div className="zen-divider"></div>

        {/* How It Works */}
        <div className="zen-card-raised mb-4">
          <h2>How It Works</h2>
          <ol>
            <li>
              Search for any book or screen adaptation in the database
            </li>
            <li>
              View structured differences with customizable spoiler controls
            </li>
            <li>
              Contribute by adding differences and voting on accuracy
            </li>
          </ol>
        </div>

        {/* CTA */}
        <div className="text-center mb-4">
          <p className="text-muted mb-3">
            Join the community documenting how stories transform from page to screen
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/search" className="btn primary">
              Start exploring
            </Link>
            <Link href="/about" className="btn">
              Learn more
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-muted" style={{ fontSize: '13px' }}>Adaptapedia v1.0 · 2025</p>
        </div>

      </div>
    </main>
  );
}
