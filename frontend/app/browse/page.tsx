import { Metadata } from 'next';
import { api } from '@/lib/api';
import type { BrowseSections } from '@/lib/types';
import ComparisonCard from '@/components/browse/ComparisonCard';

export const metadata: Metadata = {
  title: 'Browse Comparisons - Adaptapedia',
  description: 'Explore book-to-screen comparisons with documented differences',
};

export default async function BrowsePage(): Promise<JSX.Element> {
  let sections: BrowseSections;

  try {
    sections = await api.diffs.browse() as BrowseSections;
  } catch (error) {
    console.error('Error fetching browse sections:', error);
    sections = {
      featured: [],
      recently_updated: [],
      most_documented: [],
      trending: [],
    };
  }

  const hasAnyContent =
    sections.featured.length > 0 ||
    sections.recently_updated.length > 0 ||
    sections.most_documented.length > 0 ||
    sections.trending.length > 0;

  return (
    <main className="min-h-screen">
      <div className="container py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="mb-3 text-3xl sm:text-4xl font-bold">
            Browse Comparisons
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-2xl">
            Explore book-to-screen adaptations with community-documented differences.
            Click any comparison to see what changed.
          </p>
        </div>

        {!hasAnyContent ? (
          <div className="border border-border rounded-lg p-12 text-center">
            <p className="text-muted mb-4">
              No comparisons available yet. Be the first to document differences!
            </p>
            <a href="/" className="text-link hover:underline">
              ← Back to Home
            </a>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16">
            {/* Featured Section */}
            {sections.featured.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Featured</h2>
                  <p className="text-muted">
                    Top comparisons with the most engagement
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {sections.featured.map((comparison) => (
                    <ComparisonCard key={`${comparison.work_id}-${comparison.screen_work_id}`} comparison={comparison} />
                  ))}
                </div>
              </section>
            )}

            {/* Recently Updated */}
            {sections.recently_updated.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Recently Updated</h2>
                  <p className="text-muted">
                    Fresh activity in the last 48 hours
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {sections.recently_updated.map((comparison) => (
                    <ComparisonCard key={`${comparison.work_id}-${comparison.screen_work_id}`} comparison={comparison} />
                  ))}
                </div>
              </section>
            )}

            {/* Most Documented */}
            {sections.most_documented.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Most Documented</h2>
                  <p className="text-muted">
                    Comprehensive coverage with the most differences
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {sections.most_documented.map((comparison) => (
                    <ComparisonCard key={`${comparison.work_id}-${comparison.screen_work_id}`} comparison={comparison} />
                  ))}
                </div>
              </section>
            )}

            {/* Trending */}
            {sections.trending.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Trending This Week</h2>
                  <p className="text-muted">
                    Most active comparisons in the last 7 days
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {sections.trending.map((comparison) => (
                    <ComparisonCard key={`${comparison.work_id}-${comparison.screen_work_id}`} comparison={comparison} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className="mt-12 text-center">
          <a href="/" className="text-link hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
