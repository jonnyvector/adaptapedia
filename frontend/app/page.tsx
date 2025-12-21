import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';

export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header - Art Deco Title */}
        <div className="text-center mb-4">
          <h1>Adaptapedia</h1>
          <p className="mt-3 text-lg text-muted">
            Comparing Literary Works with Their Screen Adaptations
          </p>
        </div>

        <hr />

        {/* Stats - Geometric Tiles */}
        <div className="deco-stats">
          <div className="deco-stat">
            <div className="deco-stat-number">2,185</div>
            <div className="deco-stat-label">Books</div>
          </div>
          <div className="deco-stat">
            <div className="deco-stat-number">3,417</div>
            <div className="deco-stat-label">Adaptations</div>
          </div>
          <div className="deco-stat">
            <div className="deco-stat-number">12,834</div>
            <div className="deco-stat-label">Differences</div>
          </div>
        </div>

        {/* Search */}
        <div className="deco-card deco-corners mb-3">
          <h2>Search the Archive</h2>
          <SearchBar placeholder="Enter book or film title..." />
        </div>

        {/* Sample Comparisons */}
        <div className="mb-4">
          <h2 className="text-center">Featured Comparisons</h2>

          {/* Jurassic Park */}
          <div className="deco-card mb-3">
            <h3 className="text-gold mb-2">Jurassic Park</h3>
            <p className="text-muted mb-3">Michael Crichton's scientific thriller brought to life</p>

            <div className="deco-comparison">
              <div>
                <p className="uppercase text-muted mb-1" style={{ fontSize: '11px', letterSpacing: '0.15em' }}>
                  Literary Work
                </p>
                <h3 className="mb-1">Novel</h3>
                <p className="text-muted">Published 1990</p>
                <p className="text-muted">by Michael Crichton</p>
              </div>

              <div className="deco-comparison-divider"></div>

              <div>
                <p className="uppercase text-muted mb-1" style={{ fontSize: '11px', letterSpacing: '0.15em' }}>
                  Screen Adaptation
                </p>
                <h3 className="mb-1">Film</h3>
                <p className="text-muted">Released 1993</p>
                <p className="text-muted">dir. Steven Spielberg</p>
              </div>
            </div>

            <div className="mt-3 pt-3" style={{ borderTop: '2px solid var(--deco-gold)' }}>
              <div className="text-center">
                <p className="text-muted mb-2" style={{ fontSize: '14px' }}>
                  <span className="text-gold" style={{ fontWeight: 600 }}>6 differences</span> documented
                </p>
                <Link href="/compare/jurassic-park/jurassic-park-1993" className="btn">
                  View Comparison
                </Link>
              </div>
            </div>
          </div>

          {/* Sphere */}
          <div className="deco-card">
            <h3 className="text-teal mb-2">Sphere</h3>
            <p className="text-muted mb-3">Deep-sea psychological thriller</p>

            <div className="deco-comparison">
              <div>
                <p className="uppercase text-muted mb-1" style={{ fontSize: '11px', letterSpacing: '0.15em' }}>
                  Literary Work
                </p>
                <h3 className="mb-1">Novel</h3>
                <p className="text-muted">Published 1987</p>
                <p className="text-muted">by Michael Crichton</p>
              </div>

              <div className="deco-comparison-divider"></div>

              <div>
                <p className="uppercase text-muted mb-1" style={{ fontSize: '11px', letterSpacing: '0.15em' }}>
                  Screen Adaptation
                </p>
                <h3 className="mb-1">Film</h3>
                <p className="text-muted">Released 1998</p>
                <p className="text-muted">dir. Barry Levinson</p>
              </div>
            </div>

            <div className="mt-3 pt-3" style={{ borderTop: '2px solid var(--deco-gold)' }}>
              <div className="text-center">
                <p className="text-muted mb-2" style={{ fontSize: '14px' }}>
                  <span className="text-gold" style={{ fontWeight: 600 }}>5 differences</span> documented
                </p>
                <Link href="/compare/sphere-novel/sphere-1998" className="btn">
                  View Comparison
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-4">
          <h2 className="text-center">Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="deco-card-gold">
              <h3 className="mb-2">Structured Analysis</h3>
              <p style={{ fontSize: '15px' }}>
                Differences organized by category—plot, character, ending, setting, and theme.
              </p>
            </div>

            <div className="deco-card-teal">
              <h3 className="mb-2">Spoiler Control</h3>
              <p style={{ fontSize: '15px' }}>
                Adaptive system lets you choose exactly what spoilers you see based on your progress.
              </p>
            </div>

            <div className="deco-card-navy">
              <h3 className="mb-2">Community Voting</h3>
              <p style={{ fontSize: '15px' }}>
                Vote on accuracy to surface the most reliable information through consensus.
              </p>
            </div>
          </div>
        </div>

        <hr />

        {/* How It Works */}
        <div className="deco-card mb-4">
          <h2>How It Works</h2>
          <ol>
            <li>
              Search for any book or screen adaptation in our comprehensive database
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
          <p className="text-muted mb-3" style={{ fontSize: '17px' }}>
            Join the community documenting how stories transform from page to screen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search" className="btn primary">
              Start Exploring
            </Link>
            <Link href="/about" className="btn secondary">
              Learn More
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-muted" style={{ fontSize: '13px', letterSpacing: '0.05em' }}>
            ADAPTAPEDIA v1.0 · 2025
          </p>
        </div>

      </div>
    </main>
  );
}
