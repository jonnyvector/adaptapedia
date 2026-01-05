import { Metadata } from 'next';
import { api } from '@/lib/api';
import type { BrowseSections } from '@/lib/types';
import ComparisonCard from '@/components/browse/ComparisonCard';
import EmptyState from '@/components/ui/EmptyState';
import { FONTS } from '@/lib/brutalist-design';

export const metadata: Metadata = {
  title: 'Browse Comparisons - Adaptapedia',
  description: 'Explore book-to-movie comparisons with documented differences',
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
      all_comparisons: [],
    };
  }

  const hasAnyContent =
    sections.featured.length > 0 ||
    sections.recently_updated.length > 0 ||
    sections.most_documented.length > 0 ||
    sections.trending.length > 0 ||
    sections.all_comparisons.length > 0;

  return (
    <main className="min-h-screen">
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-3 text-4xl md:text-5xl font-bold" style={{ fontFamily: FONTS.mono }}>
            Browse Comparisons
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-2xl" style={{ fontFamily: FONTS.mono }}>
            Explore book-to-screen adaptations with community-documented differences.
            Click any comparison to see what changed.
          </p>
        </div>

        {!hasAnyContent ? (
          <EmptyState
            message="No comparisons available yet. Be the first to document differences!"
            action={{ label: "← Back to Home", href: "/" }}
          />
        ) : (
          <div className="space-y-12 sm:space-y-16">
            {/* Featured Section */}
            {sections.featured.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: FONTS.mono }}>Featured</h2>
                  <p className="text-muted" style={{ fontFamily: FONTS.mono }}>
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
                  <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: FONTS.mono }}>Recently Updated</h2>
                  <p className="text-muted" style={{ fontFamily: FONTS.mono }}>
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
                  <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: FONTS.mono }}>Most Documented</h2>
                  <p className="text-muted" style={{ fontFamily: FONTS.mono }}>
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
                  <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: FONTS.mono }}>Trending This Week</h2>
                  <p className="text-muted" style={{ fontFamily: FONTS.mono }}>
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

            {/* All Comparisons */}
            {sections.all_comparisons.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: FONTS.mono }}>All Comparisons</h2>
                  <p className="text-muted" style={{ fontFamily: FONTS.mono }}>
                    Browse all available book-to-screen adaptations
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {sections.all_comparisons.map((comparison) => (
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
