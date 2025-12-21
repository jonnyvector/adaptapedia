import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';

export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 spotlight">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-4">
          <h1>Adaptapedia</h1>
          <p className="mt-3 text-lg text-muted">
            The Case Files: Book vs. Screen
          </p>
        </div>

        <hr />

        {/* Stats - Evidence Tags */}
        <div className="noir-stats">
          <div className="noir-stat">
            <div className="noir-stat-number">2,185</div>
            <div className="noir-stat-label">Books</div>
          </div>
          <div className="noir-stat">
            <div className="noir-stat-number">3,417</div>
            <div className="noir-stat-label">Adaptations</div>
          </div>
          <div className="noir-stat">
            <div className="noir-stat-number">12,834</div>
            <div className="noir-stat-label">Differences</div>
          </div>
        </div>

        {/* Search */}
        <div className="noir-card mb-3" style={{ position: 'relative', marginTop: '32px' }}>
          <div className="case-tab">INVESTIGATION</div>
          <h2>Search the Archives</h2>
          <SearchBar placeholder="Enter title to investigate..." />
        </div>

        {/* Sample Comparisons */}
        <div className="mb-4">
          <h2 className="text-center">Active Cases</h2>

          {/* Jurassic Park */}
          <div className="noir-card mb-3" style={{ position: 'relative', marginTop: '32px' }}>
            <div className="case-tab">CASE #001</div>

            <h3 className="mb-2">Jurassic Park</h3>
            <p className="text-muted mb-3" style={{ fontSize: '14px', color: 'var(--noir-gray)' }}>
              Subject: Michael Crichton's scientific thriller
            </p>

            <div className="noir-comparison mb-3">
              <div className="noir-comparison-left" style={{ color: 'var(--noir-black)' }}>
                <p className="mb-1" style={{ fontSize: '13px', marginTop: '16px' }}>
                  <strong>Format:</strong> Novel
                </p>
                <p className="mb-1" style={{ fontSize: '13px' }}>
                  <strong>Date:</strong> 1990
                </p>
                <p style={{ fontSize: '13px' }}>
                  <strong>Author:</strong> Michael Crichton
                </p>
              </div>
              <div className="noir-comparison-right" style={{ color: 'var(--noir-black)' }}>
                <p className="mb-1" style={{ fontSize: '13px', marginTop: '16px' }}>
                  <strong>Format:</strong> Film
                </p>
                <p className="mb-1" style={{ fontSize: '13px' }}>
                  <strong>Date:</strong> 1993
                </p>
                <p style={{ fontSize: '13px' }}>
                  <strong>Director:</strong> Steven Spielberg
                </p>
              </div>
            </div>

            <div className="text-center pt-3" style={{ borderTop: '2px dashed var(--noir-red)' }}>
              <p className="mb-2" style={{ fontSize: '14px', color: 'var(--noir-gray)' }}>
                Status: <span className="text-red" style={{ fontWeight: 700 }}>6 DIFFERENCES DOCUMENTED</span>
              </p>
              <Link href="/compare/jurassic-park/jurassic-park-1993" className="btn">
                Open Case File
              </Link>
            </div>
          </div>

          {/* Sphere */}
          <div className="noir-card" style={{ position: 'relative', marginTop: '32px' }}>
            <div className="case-tab">CASE #002</div>

            <h3 className="mb-2">Sphere</h3>
            <p className="text-muted mb-3" style={{ fontSize: '14px', color: 'var(--noir-gray)' }}>
              Subject: Deep-sea psychological thriller
            </p>

            <div className="noir-comparison mb-3">
              <div className="noir-comparison-left" style={{ color: 'var(--noir-black)' }}>
                <p className="mb-1" style={{ fontSize: '13px', marginTop: '16px' }}>
                  <strong>Format:</strong> Novel
                </p>
                <p className="mb-1" style={{ fontSize: '13px' }}>
                  <strong>Date:</strong> 1987
                </p>
                <p style={{ fontSize: '13px' }}>
                  <strong>Author:</strong> Michael Crichton
                </p>
              </div>
              <div className="noir-comparison-right" style={{ color: 'var(--noir-black)' }}>
                <p className="mb-1" style={{ fontSize: '13px', marginTop: '16px' }}>
                  <strong>Format:</strong> Film
                </p>
                <p className="mb-1" style={{ fontSize: '13px' }}>
                  <strong>Date:</strong> 1998
                </p>
                <p style={{ fontSize: '13px' }}>
                  <strong>Director:</strong> Barry Levinson
                </p>
              </div>
            </div>

            <div className="text-center pt-3" style={{ borderTop: '2px dashed var(--noir-red)' }}>
              <p className="mb-2" style={{ fontSize: '14px', color: 'var(--noir-gray)' }}>
                Status: <span className="text-red" style={{ fontWeight: 700 }}>5 DIFFERENCES DOCUMENTED</span>
              </p>
              <Link href="/compare/sphere-novel/sphere-1998" className="btn">
                Open Case File
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-4">
          <h2 className="text-center">Our Methods</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="noir-card-dark">
              <h3 className="mb-2" style={{ fontSize: '18px' }}>Structured Analysis</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Evidence categorized by: Plot, Character, Ending, Setting, Theme
              </p>
            </div>

            <div className="noir-card-dark">
              <h3 className="mb-2" style={{ fontSize: '18px' }}>Spoiler Protection</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Redacted information system—reveal only what you're ready to see
              </p>
            </div>

            <div className="noir-card-dark">
              <h3 className="mb-2" style={{ fontSize: '18px' }}>Witness Testimony</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Community voting surfaces the most credible evidence
              </p>
            </div>
          </div>
        </div>

        <hr />

        {/* How It Works */}
        <div className="noir-card-spotlight mb-4">
          <h2>Standard Operating Procedure</h2>
          <ol>
            <li>
              Search the archives for any book or screen adaptation
            </li>
            <li>
              Review documented differences with spoiler controls
            </li>
            <li>
              Submit new evidence and vote on existing testimony
            </li>
          </ol>
        </div>

        {/* CTA */}
        <div className="text-center mb-4">
          <p className="text-muted mb-3" style={{ fontSize: '16px' }}>
            Join the investigation. Document how stories change from page to screen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search" className="btn primary">
              Begin Investigation
            </Link>
            <Link href="/about" className="btn secondary">
              Case Background
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-muted" style={{ fontSize: '11px', letterSpacing: '0.15em' }}>
            ADAPTAPEDIA DETECTIVE AGENCY • EST. 2025
          </p>
        </div>

      </div>
    </main>
  );
}
