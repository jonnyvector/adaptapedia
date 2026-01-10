import Link from 'next/link';

export default function ComparisonNotFound(): JSX.Element {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-6xl font-bold">404</h1>
          <h2 className="text-3xl font-semibold">Comparison not found</h2>
          <p className="text-lg text-muted">
            We couldn&apos;t find the book or screen work you&apos;re trying to compare.
          </p>
        </div>

        <div className="border-t border-b border-border py-6 space-y-4">
          <p className="text-muted">
            One or both works may not exist, or the link might be incorrect.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            <Link
              href="/search"
              className="p-4 border border-border rounded-lg hover:bg-muted/10 transition-colors text-left group"
            >
              <div className="font-semibold mb-1 group-hover:text-link">
                Search
              </div>
              <div className="text-sm text-muted">
                Find books and adaptations
              </div>
            </Link>
            <Link
              href="/"
              className="p-4 border border-border rounded-lg hover:bg-muted/10 transition-colors text-left group"
            >
              <div className="font-semibold mb-1 group-hover:text-link">
                Browse
              </div>
              <div className="text-sm text-muted">
                Explore comparisons
              </div>
            </Link>
          </div>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-link text-white hover:opacity-90 transition-opacity font-semibold"
            style={{ borderRadius: 'var(--button-radius)' }}
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
