import { Metadata } from 'next';

// Force dynamic rendering - page uses client components with useSearchParams
export const dynamic = 'force-dynamic';
import { api } from '@/lib/api';
import type { SearchWithAdaptationsResponse } from '@/lib/types';
import SearchBar from '@/components/search/SearchBar';
import SearchResults from '@/components/search/SearchResults';
import Link from 'next/link';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export async function generateMetadata(
  { searchParams }: SearchPageProps
): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';

  return {
    title: query ? `Search: ${query} - Adaptapedia` : 'Search - Adaptapedia',
    description: 'Search for books and movie adaptations in the Adaptapedia database',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps): Promise<JSX.Element> {
  const params = await searchParams;
  const query = params.q || '';

  // Fetch initial results server-side using new comparison-first endpoint
  let searchData: SearchWithAdaptationsResponse | null = null;

  if (query.length >= 2) {
    try {
      searchData = await api.works.searchWithAdaptations(query, 20);
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <Link href="/" className="text-link hover:underline text-sm mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Search Adaptapedia</h1>

          {/* Search Bar */}
          <SearchBar defaultValue={query} autoFocus={true} />
        </div>

        {/* Results */}
        {query.length >= 2 ? (
          <SearchResults
            query={query}
            initialSearchData={searchData}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted">
              {query.length > 0
                ? 'Please enter at least 2 characters to search'
                : 'Enter a search term to find books and screen adaptations'}
            </p>

            {/* Popular Searches */}
            <div className="mt-8 max-w-md mx-auto">
              <h3 className="text-sm font-semibold mb-3 text-muted">Popular Searches</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Jurassic Park', 'Lord of the Rings', 'Harry Potter', 'Dune', 'Sphere'].map(
                  (term) => (
                    <Link
                      key={term}
                      href={`/search?q=${encodeURIComponent(term)}`}
                      className="px-3 py-1 rounded-full bg-muted/20 text-sm hover:bg-muted/30 transition-colors"
                    >
                      {term}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
