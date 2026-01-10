import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import type { WorkWithAdaptations, ApiResponse } from '@/lib/types';

interface GenrePageProps {
  params: Promise<{
    genre: string;
  }>;
  searchParams: Promise<{
    page?: string;
    type?: 'MOVIE' | 'TV';
  }>;
}

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { genre } = await params;
  const genreName = decodeURIComponent(genre);

  return {
    title: `${genreName} Adaptations - Browse by Genre - Adaptapedia`,
    description: `Browse ${genreName.toLowerCase()} book-to-movie comparisons`,
  };
}

export default async function GenrePage({ params, searchParams }: GenrePageProps): Promise<JSX.Element> {
  const { genre } = await params;
  const { page, type } = await searchParams;

  const genreName = decodeURIComponent(genre);
  const currentPage = parseInt(page || '1', 10);

  let data: ApiResponse<WorkWithAdaptations>;

  try {
    data = await api.screen.byGenre(genreName, type, currentPage) as ApiResponse<WorkWithAdaptations>;
  } catch (error) {
    console.error('Error fetching genre comparisons:', error);
    notFound();
  }

  if (!data.results || data.results.length === 0) {
    notFound();
  }

  const totalPages = Math.ceil(data.count / 20);

  return (
    <main className="min-h-screen">
      <div className="container py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4">
            <Link href="/browse" className="text-link hover:underline text-sm">
              &larr; All Genres
            </Link>
          </div>
          <h1 className="mb-2 text-3xl sm:text-4xl font-bold">{genreName}</h1>
          <p className="text-base sm:text-lg text-muted">
            {data.count} {data.count === 1 ? 'comparison' : 'comparisons'}
            {type && ` · ${type === 'MOVIE' ? 'Movies' : 'TV Series'} only`}
          </p>
          <p className="text-sm text-muted mt-1">
            <em>Genre based on screen adaptation</em>
          </p>
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 mb-6">
          <Link
            href={`/browse/${encodeURIComponent(genreName)}`}
            className={`px-4 py-2 font-medium transition-colors ${
              !type
                ? 'bg-link text-white'
                : 'bg-surface2 text-foreground hover:bg-muted/30'
            }`}
            style={{ borderRadius: 'var(--button-radius)' }}
          >
            All
          </Link>
          <Link
            href={`/browse/${encodeURIComponent(genreName)}?type=MOVIE`}
            className={`px-4 py-2 font-medium transition-colors ${
              type === 'MOVIE'
                ? 'bg-link text-white'
                : 'bg-surface2 text-foreground hover:bg-muted/30'
            }`}
            style={{ borderRadius: 'var(--button-radius)' }}
          >
            Movies
          </Link>
          <Link
            href={`/browse/${encodeURIComponent(genreName)}?type=TV`}
            className={`px-4 py-2 font-medium transition-colors ${
              type === 'TV'
                ? 'bg-link text-white'
                : 'bg-surface2 text-foreground hover:bg-muted/30'
            }`}
            style={{ borderRadius: 'var(--button-radius)' }}
          >
            TV Series
          </Link>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 gap-6">
          {data.results.map((work: WorkWithAdaptations) => (
            <div key={work.id} className="border border-border rounded-lg p-6 bg-card">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Book Cover */}
                {work.cover_url && (
                  <div className="flex-shrink-0">
                    <Image
                      src={work.cover_url}
                      alt={`${work.title} cover`}
                      width={128}
                      height={192}
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
                    <p className="text-muted mb-2">by {work.author}</p>
                  )}
                  {work.year && (
                    <p className="text-sm text-muted mb-2">{work.year}</p>
                  )}
                  {work.summary && (
                    <p className="text-sm text-muted line-clamp-2 mb-4">
                      {work.summary}
                    </p>
                  )}

                  {/* Adaptations */}
                  {work.adaptations && work.adaptations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted mb-2">
                        {genreName} Adaptations ({work.adaptations.length}):
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {work.adaptations.map((adaptation) => (
                          <Link
                            key={adaptation.id}
                            href={`/compare/${work.slug}/${adaptation.slug}`}
                            className="px-4 py-2 bg-link text-white hover:bg-link/90 transition-colors text-sm font-medium inline-flex items-center gap-2"
                            style={{ borderRadius: 'var(--button-radius)' }}
                          >
                            {adaptation.title} ({adaptation.year})
                            {adaptation.diff_count > 0 && (
                              <span className="text-xs bg-white/20 px-2 py-0.5" style={{ borderRadius: 'var(--button-radius)' }}>
                                {adaptation.diff_count} {adaptation.diff_count === 1 ? 'diff' : 'diffs'}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {work.adaptations && work.adaptations.length === 0 && (
                    <p className="text-sm text-muted italic">No {genreName.toLowerCase()} adaptations documented yet</p>
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
                href={`/browse/${encodeURIComponent(genreName)}?page=${currentPage - 1}${type ? `&type=${type}` : ''}`}
                className="px-4 py-2 bg-link text-white hover:bg-link/90 transition-colors"
                style={{ borderRadius: 'var(--button-radius)' }}
              >
                Previous
              </Link>
            )}
            <span className="px-4 py-2 bg-surface2 text-foreground" style={{ borderRadius: 'var(--button-radius)' }}>
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/browse/${encodeURIComponent(genreName)}?page=${currentPage + 1}${type ? `&type=${type}` : ''}`}
                className="px-4 py-2 bg-link text-white hover:bg-link/90 transition-colors"
                style={{ borderRadius: 'var(--button-radius)' }}
              >
                Next
              </Link>
            )}
          </div>
        )}

        <div className="mt-8">
          <Link href="/browse" className="text-link hover:underline">
            ← Back to All Genres
          </Link>
        </div>
      </div>
    </main>
  );
}
