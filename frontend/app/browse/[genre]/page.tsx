import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import type { WorkWithAdaptations } from '@/lib/types';

interface GenrePageProps {
  params: {
    genre: string;
  };
  searchParams: {
    page?: string;
  };
}

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const genreName = decodeURIComponent(params.genre).replace(/-/g, ' ');
  const title = genreName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${title} Books - Browse by Genre - Adaptapedia`,
    description: `Browse ${title.toLowerCase()} books and their screen adaptations`,
  };
}

export default async function GenrePage({ params, searchParams }: GenrePageProps): Promise<JSX.Element> {
  const genreSlug = params.genre;
  const currentPage = parseInt(searchParams.page || '1', 10);

  let data: { results: WorkWithAdaptations[]; count: number; next: string | null; previous: string | null };

  try {
    data = await api.works.byGenre(genreSlug, currentPage);
  } catch (error) {
    console.error('Error fetching genre works:', error);
    notFound();
  }

  if (!data.results || data.results.length === 0) {
    notFound();
  }

  const genreName = data.results[0].genre || decodeURIComponent(genreSlug).replace(/-/g, ' ');
  const totalPages = Math.ceil(data.count / 20);

  return (
    <main className="min-h-screen">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4">
            <Link href="/browse" className="text-link hover:underline text-sm">
              &larr; All Genres
            </Link>
          </div>
          <h1 className="mb-2">{genreName}</h1>
          <p className="text-lg text-secondary">
            {data.count} {data.count === 1 ? 'book' : 'books'} with screen adaptations
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 gap-6">
          {data.results.map((work: WorkWithAdaptations) => (
            <div key={work.id} className="card">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Book Cover */}
                {work.cover_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={work.cover_url}
                      alt={`${work.title} cover`}
                      className="w-32 h-48 object-cover rounded"
                    />
                  </div>
                )}

                {/* Book Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/book/${work.slug}`} className="block group">
                    <h3 className="text-xl font-semibold mb-1 group-hover:text-link transition-colors">
                      {work.title}
                    </h3>
                  </Link>
                  {work.author && (
                    <p className="text-secondary mb-2">by {work.author}</p>
                  )}
                  {work.year && (
                    <p className="text-sm text-muted mb-2">{work.year}</p>
                  )}
                  {work.summary && (
                    <p className="text-sm text-secondary line-clamp-2 mb-4">
                      {work.summary}
                    </p>
                  )}

                  {/* Adaptations */}
                  {work.adaptations && work.adaptations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted mb-2">
                        Adaptations ({work.adaptations.length}):
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {work.adaptations.map((adaptation) => (
                          <Link
                            key={adaptation.id}
                            href={`/compare/${work.slug}/${adaptation.slug}`}
                            className="btn btn-sm"
                          >
                            {adaptation.title} ({adaptation.year})
                            {adaptation.diff_count > 0 && (
                              <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded">
                                {adaptation.diff_count} diffs
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {work.adaptations && work.adaptations.length === 0 && (
                    <p className="text-sm text-muted italic">No adaptations documented yet</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={`/browse/${genreSlug}?page=${currentPage - 1}`}
                className="btn"
              >
                Previous
              </Link>
            )}
            <span className="btn btn-disabled">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/browse/${genreSlug}?page=${currentPage + 1}`}
                className="btn"
              >
                Next
              </Link>
            )}
          </div>
        )}

        <div className="mt-8">
          <Link href="/browse" className="btn">
            Back to All Genres
          </Link>
        </div>
      </div>
    </main>
  );
}
