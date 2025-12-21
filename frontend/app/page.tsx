import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';
import RetroEasterEggs from '@/components/layout/RetroEasterEggs';

export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Adaptapedia</h1>
        <p className="text-lg sm:text-xl text-muted mb-6 sm:mb-8">
          Compare books and their screen adaptations
        </p>

        {/* Search Bar */}
        <div className="mb-8 sm:mb-12">
          <SearchBar placeholder="Search for books and adaptations..." />
        </div>

        <div className="border border-border rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Sample Comparisons</h2>
          <p className="text-muted mb-4">
            Explore detailed comparisons between books and their adaptations:
          </p>
          <div className="space-y-3">
            <Link
              href="/compare/jurassic-park/jurassic-park-1993"
              className="block p-3 sm:p-4 border border-border rounded hover:bg-muted/10 transition-colors"
            >
              <h3 className="font-semibold text-base sm:text-lg">Jurassic Park</h3>
              <p className="text-xs sm:text-sm text-muted">
                Novel (1990) → Movie (1993) • 6 differences
              </p>
            </Link>
            <Link
              href="/compare/sphere-novel/sphere-1998"
              className="block p-3 sm:p-4 border border-border rounded hover:bg-muted/10 transition-colors"
            >
              <h3 className="font-semibold text-base sm:text-lg">Sphere</h3>
              <p className="text-xs sm:text-sm text-muted">
                Novel (1987) → Movie (1998) • 5 differences
              </p>
            </Link>
          </div>
        </div>

        <div className="border border-border rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Features</h2>
          <ul className="space-y-2 text-muted">
            <li>✓ Structured difference comparisons by category</li>
            <li>✓ Spoiler-safe browsing with adjustable controls</li>
            <li>✓ Community voting on accuracy</li>
            <li>✓ 2,185+ books and 3,417+ adaptations in database</li>
          </ul>
        </div>

        {/* Retro Mode Easter Eggs - Only visible in retro mode */}
        <RetroEasterEggs />
      </div>
    </main>
  );
}
