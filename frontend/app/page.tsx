import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';

export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen">
      <div className="container py-12">

        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2">Adaptapedia</h1>
          <p className="text-lg text-secondary">
            Compare books with their screen adaptations
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid mb-6">
          <div className="stat-card">
            <div className="stat-number">2,185</div>
            <div className="stat-label">Books</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">3,417</div>
            <div className="stat-label">Adaptations</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">12,834</div>
            <div className="stat-label">Differences Documented</div>
          </div>
        </div>

        {/* Search */}
        <div className="card mb-6">
          <h2>Search</h2>
          <SearchBar placeholder="Search for books or adaptations..." />
        </div>

        {/* Featured Comparisons */}
        <div className="mb-6">
          <h2 className="mb-3">Featured Comparisons</h2>

          <div className="grid grid-cols-1 gap-4">
            {/* Jurassic Park */}
            <div className="card">
              <h3 className="mb-2">Jurassic Park</h3>
              <p className="text-secondary mb-4">
                Michael Crichton's science fiction thriller and its acclaimed film adaptation
              </p>

              <div className="comparison-grid mb-4">
                <div className="comparison-side">
                  <div className="comparison-label">Book</div>
                  <p className="font-semibold mb-1">Novel (1990)</p>
                  <p className="text-sm text-secondary">by Michael Crichton</p>
                </div>
                <div className="comparison-side">
                  <div className="comparison-label">Screen</div>
                  <p className="font-semibold mb-1">Film (1993)</p>
                  <p className="text-sm text-secondary">dir. Steven Spielberg</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-sm text-secondary">
                  <span className="font-semibold text-primary">6 differences</span> documented
                </span>
                <Link href="/compare/jurassic-park/jurassic-park-1993" className="btn">
                  View Comparison
                </Link>
              </div>
            </div>

            {/* Sphere */}
            <div className="card">
              <h3 className="mb-2">Sphere</h3>
              <p className="text-secondary mb-4">
                A deep-sea psychological thriller exploring the unknown
              </p>

              <div className="comparison-grid mb-4">
                <div className="comparison-side">
                  <div className="comparison-label">Book</div>
                  <p className="font-semibold mb-1">Novel (1987)</p>
                  <p className="text-sm text-secondary">by Michael Crichton</p>
                </div>
                <div className="comparison-side">
                  <div className="comparison-label">Screen</div>
                  <p className="font-semibold mb-1">Film (1998)</p>
                  <p className="text-sm text-secondary">dir. Barry Levinson</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-sm text-secondary">
                  <span className="font-semibold text-primary">5 differences</span> documented
                </span>
                <Link href="/compare/sphere-novel/sphere-1998" className="btn">
                  View Comparison
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h2 className="mb-3">Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-subtle">
              <h3 className="mb-2">Structured Comparisons</h3>
              <p className="text-secondary text-sm">
                Differences organized by category: plot, character, ending, setting, and theme for easy navigation.
              </p>
            </div>

            <div className="card-subtle">
              <h3 className="mb-2">Spoiler Control</h3>
              <p className="text-secondary text-sm">
                Choose what spoilers you see based on what you've read or watched. Full control over revelations.
              </p>
            </div>

            <div className="card-subtle">
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
          <div className="card-subtle">
            <ol className="space-y-2">
              <li>Search for any book or screen adaptation in our database</li>
              <li>Browse structured comparisons with spoiler controls</li>
              <li>Contribute new differences and vote on existing ones</li>
            </ol>
          </div>
        </div>

        {/* CTA */}
        <div className="card text-center">
          <p className="text-lg text-secondary mb-4">
            Join thousands exploring how stories transform from page to screen
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/search" className="btn primary">
              Start Exploring
            </Link>
            <Link href="/about" className="btn">
              Learn More
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
