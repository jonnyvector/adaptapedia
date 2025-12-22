import { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { GenreListResponse } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Browse by Genre - Adaptapedia',
  description: 'Browse books and their screen adaptations by genre',
};

export default async function BrowsePage(): Promise<JSX.Element> {
  let genres: GenreListResponse;

  try {
    genres = await api.works.genres();
  } catch (error) {
    console.error('Error fetching genres:', error);
    genres = { results: [] };
  }

  return (
    <main className="min-h-screen">
      <div className="container py-12">
        <div className="mb-6">
          <h1 className="mb-2">Browse by Genre</h1>
          <p className="text-lg text-secondary">
            Explore books and their screen adaptations organized by genre
          </p>
        </div>

        {genres.results.length === 0 ? (
          <div className="card text-center">
            <p className="text-secondary">No genres available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {genres.results.map((genre) => (
              <Link
                key={genre.slug}
                href={`/browse/${genre.slug}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{genre.genre}</h3>
                  <span className="text-sm text-secondary px-3 py-1 bg-muted rounded-full">
                    {genre.book_count} {genre.book_count === 1 ? 'book' : 'books'}
                  </span>
                </div>
                <p className="text-sm text-muted">
                  View all {genre.genre.toLowerCase()} books and adaptations
                </p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href="/" className="btn">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
